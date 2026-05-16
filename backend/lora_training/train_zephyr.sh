#!/bin/bash
# ══════════════════════════════════════════════════════════════════════
# ZEPHYR VALE — LoRA Face Training Pipeline
# Base model: FLUX.1-dev (for best realism)
# Tool: SimpleTuner (best for FLUX LoRA training)
# ══════════════════════════════════════════════════════════════════════

set -e

# ── Config ────────────────────────────────────────────────────────────
MODEL_NAME="zephyr-vale-v4"
BASE_MODEL="black-forest-labs/FLUX.1-dev"    # or "stabilityai/stable-diffusion-xl-base-1.0"
DATASET_DIR="./datasets/zephyr_vale"
OUTPUT_DIR="./lora_models"
TRIGGER_WORD="ZEPHYR VALE"

TRAIN_STEPS=8000        # Increase to 12000 for sharper identity
LEARNING_RATE=0.00005   # For FLUX. Use 0.0001 for SDXL
BATCH_SIZE=1
RESOLUTION=1024
SAVE_EVERY=500

# ── Step 1: Dataset preparation ───────────────────────────────────────
echo "═══════════════════════════════════════"
echo "STEP 1: Preparing training dataset"
echo "═══════════════════════════════════════"

mkdir -p "$DATASET_DIR/images"
mkdir -p "$DATASET_DIR/captions"
mkdir -p "$OUTPUT_DIR"

echo "
DATASET REQUIREMENTS:
─────────────────────
✓ Minimum 100 images, recommended 200-500
✓ Resolution: 1024x1024 minimum
✓ Facial coverage:
  - 40% close-up portraits (face fill 60-80% of frame)
  - 30% half-body shots
  - 20% full-body editorial
  - 10% side/3/4 profile angles

✓ Lighting variety: natural, studio, dramatic
✓ Expression variety: brooding, confident, relaxed, editorial
✓ NO sunglasses (they break face consistency training)
✓ NO heavy motion blur
✓ NO extreme angles beyond 45 degrees

CAPTION FORMAT for each image:
───────────────────────────────
${TRIGGER_WORD}, luxury male model, sharp jawline, deep-set hunter eyes,
high cheekbones, European-Indian masculine blend, natural skin texture,
[specific expression], [specific lighting], [specific outfit if visible]

Example caption file (image_001.txt):
${TRIGGER_WORD}, luxury male model, sharp jawline, hunter eyes,
confident expression, natural window light, wearing black turtleneck
"

read -p "Press ENTER when your dataset is ready in $DATASET_DIR/images/"

# ── Step 2: Auto-captioning (optional, using BLIP-2) ─────────────────
echo ""
echo "═══════════════════════════════════════"
echo "STEP 2: Auto-captioning with BLIP-2"
echo "═══════════════════════════════════════"

python3 - <<'PYTHON'
import os
import sys

dataset_dir = "./datasets/zephyr_vale"
img_dir = os.path.join(dataset_dir, "images")
cap_dir = os.path.join(dataset_dir, "captions")
trigger = "ZEPHYR VALE"

try:
    from PIL import Image
    import torch
    from transformers import Blip2Processor, Blip2ForConditionalGeneration

    print("Loading BLIP-2 model...")
    processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b")
    model = Blip2ForConditionalGeneration.from_pretrained(
        "Salesforce/blip2-opt-2.7b", torch_dtype=torch.float16
    )
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)

    images = [f for f in os.listdir(img_dir) if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
    print(f"Processing {len(images)} images...")

    for img_name in images:
        img_path = os.path.join(img_dir, img_name)
        cap_path = os.path.join(cap_dir, os.path.splitext(img_name)[0] + ".txt")

        if os.path.exists(cap_path):
            continue

        image = Image.open(img_path).convert("RGB")
        inputs = processor(image, return_tensors="pt").to(device, torch.float16)
        generated = model.generate(**inputs, max_new_tokens=50)
        blip_caption = processor.batch_decode(generated, skip_special_tokens=True)[0].strip()

        full_caption = f"{trigger}, luxury male model, {blip_caption}"
        with open(cap_path, "w") as f:
            f.write(full_caption)
        print(f"  ✓ {img_name}: {full_caption[:80]}...")

    print(f"\nCaptioning complete. {len(images)} captions written.")

except ImportError:
    print("BLIP-2 not available. Writing basic captions...")
    images = [f for f in os.listdir(img_dir) if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
    for img_name in images:
        cap_path = os.path.join(cap_dir, os.path.splitext(img_name)[0] + ".txt")
        if not os.path.exists(cap_path):
            with open(cap_path, "w") as f:
                f.write(f"{trigger}, luxury male model, sharp jawline, hunter eyes, masculine expression, editorial fashion photography")
    print(f"Basic captions written for {len(images)} images.")
PYTHON

# ── Step 3: Install SimpleTuner for FLUX training ─────────────────────
echo ""
echo "═══════════════════════════════════════"
echo "STEP 3: SimpleTuner Setup (FLUX LoRA)"
echo "═══════════════════════════════════════"

if [ ! -d "SimpleTuner" ]; then
    echo "Cloning SimpleTuner..."
    git clone https://github.com/bghira/SimpleTuner.git
    cd SimpleTuner
    pip install -r requirements.txt
    cd ..
fi

# ── Step 4: Create training config ────────────────────────────────────
cat > SimpleTuner/config/zephyr_vale.json <<CONFIG
{
  "model_type": "lora",
  "pretrained_model_name_or_path": "${BASE_MODEL}",
  "output_dir": "${OUTPUT_DIR}/${MODEL_NAME}",
  "dataset_name": "${DATASET_DIR}",
  "caption_column": "text",
  "image_column": "image",

  "resolution": ${RESOLUTION},
  "train_batch_size": ${BATCH_SIZE},
  "gradient_accumulation_steps": 4,
  "max_train_steps": ${TRAIN_STEPS},
  "learning_rate": ${LEARNING_RATE},
  "lr_scheduler": "cosine_with_restarts",
  "lr_warmup_steps": 100,

  "lora_rank": 16,
  "lora_alpha": 16,
  "lora_target_modules": "all-linear",

  "mixed_precision": "bf16",
  "gradient_checkpointing": true,
  "use_8bit_adam": false,
  "enable_xformers_memory_efficient_attention": false,

  "validation_prompt": "${TRIGGER_WORD}, luxury male model, sharp jawline, hunter eyes, editorial portrait, cinematic lighting",
  "validation_epochs": 1,
  "num_validation_images": 4,

  "checkpointing_steps": ${SAVE_EVERY},
  "resume_from_checkpoint": "latest",

  "seed": 42,
  "dataloader_num_workers": 4
}
CONFIG

echo "Training config written to SimpleTuner/config/zephyr_vale.json"

# ── Step 5: Run training ───────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════"
echo "STEP 4: Starting LoRA Training"
echo "Model: ${MODEL_NAME}"
echo "Steps: ${TRAIN_STEPS}"
echo "═══════════════════════════════════════"
echo ""
echo "⚠ SYSTEM REQUIREMENTS:"
echo "  - GPU: NVIDIA RTX 3090+ (24GB VRAM) or A100"
echo "  - RAM: 32GB minimum"
echo "  - Storage: 50GB free"
echo "  - CUDA 11.8+"
echo ""

read -p "Start training? (y/N): " confirm
if [[ "$confirm" != "y" ]]; then
    echo "Training cancelled. Run again when ready."
    exit 0
fi

cd SimpleTuner
python train.py --config_file config/zephyr_vale.json

echo ""
echo "═══════════════════════════════════════"
echo "✓ Training complete!"
echo "LoRA saved to: ${OUTPUT_DIR}/${MODEL_NAME}/"
echo ""
echo "NEXT STEPS:"
echo "  1. Copy .safetensors file to ComfyUI/models/loras/"
echo "  2. Load zephyr-vale-flux-v1.json workflow in ComfyUI"
echo "  3. Set lora_name to your trained file"
echo "  4. Run consistency check (target: >95%)"
echo "═══════════════════════════════════════"
