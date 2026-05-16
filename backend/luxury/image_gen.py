"""
AI Image Generation Engine for ZEPHYR VALE
Priority: Replicate (FLUX.1-dev) → Stability AI (SDXL) → ComfyUI (local)
Falls back gracefully to placeholder when no API key is set.
"""
import os
import asyncio
import logging
import httpx
import json
import uuid
from typing import Optional

logger = logging.getLogger(__name__)

REPLICATE_TOKEN  = os.getenv("REPLICATE_API_TOKEN", "")
STABILITY_KEY    = os.getenv("STABILITY_API_KEY", "")
COMFYUI_URL      = os.getenv("COMFYUI_URL", "http://localhost:8188")
R2_PUBLIC_URL    = os.getenv("R2_PUBLIC_URL", "")

# Replicate model IDs
FLUX_DEV_MODEL   = "black-forest-labs/flux-dev"
FLUX_SCHNELL     = "black-forest-labs/flux-schnell"   # faster, less quality
SDXL_MODEL       = "stability-ai/sdxl:39ed52f2319f9cc82ea7f6c8af96647b5cbdaab7e7e55e67b82b5f0adf09"


# ─── Replicate FLUX.1-dev ─────────────────────────────────────────────────

async def generate_flux(
    prompt: str,
    negative_prompt: str = "",
    width: int = 1024,
    height: int = 1280,
    steps: int = 35,
    guidance: float = 3.5,
    fast: bool = False,
) -> Optional[str]:
    """
    Generate image via Replicate FLUX.1-dev (or flux-schnell for speed).
    Returns public image URL or None on failure.
    """
    if not REPLICATE_TOKEN:
        logger.info("[MOCK] FLUX generation — no REPLICATE_API_TOKEN set")
        return _placeholder_url("flux", width, height)

    model = FLUX_SCHNELL if fast else FLUX_DEV_MODEL
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Kick off prediction
            r = await client.post(
                f"https://api.replicate.com/v1/models/{model}/predictions",
                headers={
                    "Authorization": f"Bearer {REPLICATE_TOKEN}",
                    "Content-Type": "application/json",
                },
                json={
                    "input": {
                        "prompt": prompt,
                        "width": width,
                        "height": height,
                        "num_inference_steps": steps if not fast else 4,
                        "guidance": guidance,
                        "output_format": "webp",
                        "output_quality": 92,
                        "disable_safety_checker": True,
                    }
                },
            )
            r.raise_for_status()
            prediction = r.json()
            pred_id = prediction["id"]

            # Poll for result
            for _ in range(120):
                await asyncio.sleep(3)
                poll = await client.get(
                    f"https://api.replicate.com/v1/predictions/{pred_id}",
                    headers={"Authorization": f"Bearer {REPLICATE_TOKEN}"},
                )
                poll.raise_for_status()
                data = poll.json()

                if data["status"] == "succeeded":
                    urls = data.get("output", [])
                    url = urls[0] if isinstance(urls, list) and urls else urls
                    logger.info(f"FLUX generation complete: {str(url)[:80]}")
                    return str(url)

                if data["status"] in ("failed", "canceled"):
                    logger.error(f"FLUX prediction failed: {data.get('error')}")
                    return None

            logger.error("FLUX prediction timed out")
            return None

    except Exception as e:
        logger.error(f"FLUX generation error: {e}")
        return None


# ─── SDXL + LoRA via Replicate ────────────────────────────────────────────

async def generate_sdxl_lora(
    prompt: str,
    negative_prompt: str = "",
    lora_url: str = "",
    lora_scale: float = 0.85,
    width: int = 1024,
    height: int = 1280,
    steps: int = 35,
    cfg: float = 7.5,
) -> Optional[str]:
    """Generate via SDXL + custom LoRA. lora_url = Replicate-hosted .safetensors URL."""
    if not REPLICATE_TOKEN:
        return _placeholder_url("sdxl", width, height)

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            payload: dict = {
                "input": {
                    "prompt": prompt,
                    "negative_prompt": negative_prompt,
                    "width": width,
                    "height": height,
                    "num_inference_steps": steps,
                    "guidance_scale": cfg,
                    "num_outputs": 1,
                    "output_format": "webp",
                    "output_quality": 90,
                }
            }
            if lora_url:
                payload["input"]["hf_lora"] = lora_url
                payload["input"]["lora_scale"] = lora_scale

            r = await client.post(
                f"https://api.replicate.com/v1/models/{SDXL_MODEL}/predictions",
                headers={
                    "Authorization": f"Bearer {REPLICATE_TOKEN}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            r.raise_for_status()
            prediction = r.json()
            pred_id = prediction["id"]

            for _ in range(90):
                await asyncio.sleep(3)
                poll = await client.get(
                    f"https://api.replicate.com/v1/predictions/{pred_id}",
                    headers={"Authorization": f"Bearer {REPLICATE_TOKEN}"},
                )
                data = poll.json()
                if data["status"] == "succeeded":
                    urls = data.get("output", [])
                    return str(urls[0] if isinstance(urls, list) else urls)
                if data["status"] in ("failed", "canceled"):
                    return None

            return None
    except Exception as e:
        logger.error(f"SDXL generation error: {e}")
        return None


# ─── Stability AI (SDXL alternative) ─────────────────────────────────────

async def generate_stability(
    prompt: str,
    negative_prompt: str = "",
    width: int = 1024,
    height: int = 1280,
    steps: int = 35,
    cfg: float = 7.5,
) -> Optional[str]:
    """Generate via Stability AI API."""
    if not STABILITY_KEY:
        return _placeholder_url("stability", width, height)
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                headers={
                    "Authorization": f"Bearer {STABILITY_KEY}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                json={
                    "text_prompts": [
                        {"text": prompt, "weight": 1.0},
                        {"text": negative_prompt, "weight": -1.0},
                    ],
                    "cfg_scale": cfg,
                    "height": height,
                    "width": width,
                    "samples": 1,
                    "steps": steps,
                    "style_preset": "photographic",
                },
            )
            r.raise_for_status()
            data = r.json()
            # Returns base64 — would need upload to CDN
            b64 = data["artifacts"][0]["base64"]
            return await _upload_base64_to_r2(b64, "stability")
    except Exception as e:
        logger.error(f"Stability AI error: {e}")
        return None


# ─── ComfyUI (local) ─────────────────────────────────────────────────────

async def generate_comfyui(
    prompt: str,
    negative_prompt: str = "",
    width: int = 1024,
    height: int = 1280,
    steps: int = 35,
    cfg: float = 3.5,
    lora_name: str = "ZephyrBase-v4.safetensors",
    lora_strength: float = 0.85,
) -> Optional[str]:
    """Generate via local ComfyUI API (FLUX + LoRA workflow)."""
    try:
        # Build ComfyUI workflow with parameters
        with open("comfyui-workflows/zephyr-vale-flux-v1.json") as f:
            workflow = json.load(f)

        # Inject parameters
        if "4" in workflow:
            workflow["4"]["inputs"]["text"] = prompt
        if "5" in workflow:
            workflow["5"]["inputs"]["text"] = negative_prompt
        if "6" in workflow:
            workflow["6"]["inputs"]["width"]  = width
            workflow["6"]["inputs"]["height"] = height
        if "7" in workflow:
            workflow["7"]["inputs"]["steps"] = steps
            workflow["7"]["inputs"]["cfg"]   = cfg
        if "2" in workflow:
            workflow["2"]["inputs"]["lora_name"]       = lora_name
            workflow["2"]["inputs"]["strength_model"]  = lora_strength
            workflow["2"]["inputs"]["strength_clip"]   = lora_strength

        client_id = str(uuid.uuid4())
        async with httpx.AsyncClient(timeout=300.0) as client:
            # Queue prompt
            r = await client.post(
                f"{COMFYUI_URL}/prompt",
                json={"prompt": workflow, "client_id": client_id},
            )
            r.raise_for_status()
            prompt_id = r.json()["prompt_id"]

            # Poll for completion
            for _ in range(200):
                await asyncio.sleep(2)
                hist = await client.get(f"{COMFYUI_URL}/history/{prompt_id}")
                hist_data = hist.json()
                if prompt_id in hist_data:
                    outputs = hist_data[prompt_id].get("outputs", {})
                    for node_id, node_out in outputs.items():
                        images = node_out.get("images", [])
                        if images:
                            img_info = images[0]
                            # Fetch the image
                            img_resp = await client.get(
                                f"{COMFYUI_URL}/view",
                                params={
                                    "filename": img_info["filename"],
                                    "subfolder": img_info.get("subfolder", ""),
                                    "type": img_info.get("type", "output"),
                                }
                            )
                            img_resp.raise_for_status()
                            return await _upload_bytes_to_r2(img_resp.content, "comfyui")
            return None

    except Exception as e:
        logger.error(f"ComfyUI generation error: {e}")
        return None


# ─── Main generate entrypoint ────────────────────────────────────────────

async def generate_image(
    prompt: str,
    negative_prompt: str = "",
    width: int = 1024,
    height: int = 1280,
    provider: str = "auto",
    fast: bool = False,
) -> dict:
    """
    Main image generation entrypoint.
    provider: "auto" | "flux" | "sdxl" | "stability" | "comfyui"
    Returns: {"url": str, "provider": str, "success": bool}
    """
    image_url = None
    used_provider = provider

    if provider == "auto" or provider == "flux":
        image_url = await generate_flux(prompt, negative_prompt, width, height, fast=fast)
        used_provider = "flux"

    if not image_url and (provider == "auto" or provider == "comfyui"):
        image_url = await generate_comfyui(prompt, negative_prompt, width, height)
        used_provider = "comfyui"

    if not image_url and (provider == "auto" or provider == "stability"):
        image_url = await generate_stability(prompt, negative_prompt, width, height)
        used_provider = "stability"

    if not image_url:
        image_url = _placeholder_url("fallback", width, height)
        used_provider = "placeholder"

    return {
        "url": image_url,
        "provider": used_provider,
        "success": used_provider != "placeholder",
        "width": width,
        "height": height,
    }


# ─── Video generation (Reel) via Runway / Kling ───────────────────────────

async def generate_reel_video(
    image_url: str,
    motion_prompt: str = "slow cinematic zoom, luxury editorial camera movement",
    duration_seconds: int = 5,
) -> Optional[str]:
    """
    Generate a short video from image using Replicate (Stable Video Diffusion).
    image_url = starting frame (ZEPHYR VALE photo).
    Returns video URL.
    """
    if not REPLICATE_TOKEN:
        logger.info("[MOCK] Reel video generation skipped — no API key")
        return None

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            r = await client.post(
                "https://api.replicate.com/v1/models/stability-ai/stable-video-diffusion/predictions",
                headers={
                    "Authorization": f"Bearer {REPLICATE_TOKEN}",
                    "Content-Type": "application/json",
                },
                json={
                    "input": {
                        "input_image": image_url,
                        "sizing_strategy": "maintain_aspect_ratio",
                        "frames_per_second": 24,
                        "motion_bucket_id": 40,
                        "cond_aug": 0.02,
                    }
                },
            )
            r.raise_for_status()
            pred_id = r.json()["id"]

            for _ in range(120):
                await asyncio.sleep(5)
                poll = await client.get(
                    f"https://api.replicate.com/v1/predictions/{pred_id}",
                    headers={"Authorization": f"Bearer {REPLICATE_TOKEN}"},
                )
                data = poll.json()
                if data["status"] == "succeeded":
                    outputs = data.get("output", [])
                    return str(outputs[0] if isinstance(outputs, list) else outputs)
                if data["status"] in ("failed", "canceled"):
                    return None

        return None
    except Exception as e:
        logger.error(f"Reel generation error: {e}")
        return None


# ─── R2 / S3 upload helpers ──────────────────────────────────────────────

async def _upload_base64_to_r2(b64_data: str, prefix: str = "img") -> Optional[str]:
    """Upload base64 image to Cloudflare R2. Returns public URL."""
    import base64
    try:
        import boto3
        r2 = boto3.client(
            "s3",
            endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
            aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
        )
        filename = f"{prefix}/{uuid.uuid4().hex}.webp"
        r2.put_object(
            Bucket=os.getenv("R2_BUCKET", "zephyrvale-content"),
            Key=filename,
            Body=base64.b64decode(b64_data),
            ContentType="image/webp",
        )
        return f"{R2_PUBLIC_URL}/{filename}"
    except Exception as e:
        logger.error(f"R2 upload error: {e}")
        return None


async def _upload_bytes_to_r2(data: bytes, prefix: str = "img") -> Optional[str]:
    """Upload raw bytes to Cloudflare R2."""
    try:
        import boto3
        r2 = boto3.client(
            "s3",
            endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
            aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
        )
        filename = f"{prefix}/{uuid.uuid4().hex}.webp"
        r2.put_object(
            Bucket=os.getenv("R2_BUCKET", "zephyrvale-content"),
            Key=filename,
            Body=data,
            ContentType="image/webp",
        )
        return f"{R2_PUBLIC_URL}/{filename}"
    except Exception as e:
        logger.error(f"R2 bytes upload error: {e}")
        return None


def _placeholder_url(provider: str, width: int, height: int) -> str:
    """Return a placeholder image URL for development/testing."""
    return f"https://placehold.co/{width}x{height}/0a0a08/DAA520?text=ZEPHYR+VALE+%E2%9C%A6&font=montserrat"
