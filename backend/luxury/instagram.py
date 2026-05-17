"""
Instagram Graph API integration for ZEPHYR VALE auto-posting system.

Requirements:
- Instagram Business or Creator Account
- Facebook App with instagram_basic, instagram_content_publish permissions
- Long-lived access token (60 days, auto-refresh)

API Reference: https://developers.facebook.com/docs/instagram-api
"""
import os
import logging
import asyncio
from typing import Optional
from datetime import datetime

import httpx

logger = logging.getLogger(__name__)

INSTAGRAM_USER_ID    = os.getenv("INSTAGRAM_USER_ID", "")
INSTAGRAM_TOKEN      = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
GRAPH_BASE           = "https://graph.facebook.com/v21.0"


# ─── HTTP client ──────────────────────────────────────────────────────────

async def _get(endpoint: str, params: dict = {}) -> dict:
    params["access_token"] = INSTAGRAM_TOKEN
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(f"{GRAPH_BASE}{endpoint}", params=params)
        r.raise_for_status()
        return r.json()


async def _post(endpoint: str, data: dict = {}) -> dict:
    data["access_token"] = INSTAGRAM_TOKEN
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(f"{GRAPH_BASE}{endpoint}", data=data)
        r.raise_for_status()
        return r.json()


# ─── Account info ─────────────────────────────────────────────────────────

async def get_account_info() -> dict:
    """Fetch basic account metrics."""
    if not INSTAGRAM_TOKEN or not INSTAGRAM_USER_ID:
        return _mock_account_info()
    try:
        fields = "followers_count,follows_count,media_count,name,username,biography,profile_picture_url"
        return await _get(f"/{INSTAGRAM_USER_ID}", {"fields": fields})
    except Exception as e:
        logger.warning(f"Instagram API unavailable: {e}")
        return _mock_account_info()


async def get_insights(period: str = "day", metric: str = "reach,impressions,follower_count") -> dict:
    """Fetch account-level insights."""
    if not INSTAGRAM_TOKEN:
        return _mock_insights()
    try:
        return await _get(
            f"/{INSTAGRAM_USER_ID}/insights",
            {"metric": metric, "period": period},
        )
    except Exception as e:
        logger.warning(f"Insights fetch failed: {e}")
        return _mock_insights()


async def get_media_list(limit: int = 20) -> list:
    """Fetch recent media with engagement stats."""
    if not INSTAGRAM_TOKEN:
        return _mock_media_list()
    try:
        fields = "id,caption,media_type,timestamp,like_count,comments_count,reach,impressions,saved"
        data = await _get(
            f"/{INSTAGRAM_USER_ID}/media",
            {"fields": fields, "limit": limit},
        )
        return data.get("data", [])
    except Exception as e:
        logger.warning(f"Media list fetch failed: {e}")
        return _mock_media_list()


# ─── Publishing ───────────────────────────────────────────────────────────

async def create_image_container(
    image_url: str,
    caption: str,
) -> Optional[str]:
    """
    Step 1: Upload image and create media container.
    image_url must be a public URL (CDN, S3, etc).
    Returns container ID.
    """
    if not INSTAGRAM_TOKEN:
        logger.info("[MOCK] Would create image container for: " + image_url[:60])
        return "mock_container_id_12345"
    try:
        result = await _post(
            f"/{INSTAGRAM_USER_ID}/media",
            {"image_url": image_url, "caption": caption},
        )
        return result.get("id")
    except Exception as e:
        logger.error(f"Container creation failed: {e}")
        return None


async def create_reel_container(
    video_url: str,
    caption: str,
    thumb_offset: int = 0,
    share_to_feed: bool = True,
) -> Optional[str]:
    """Create a Reel media container. video_url must be public MP4."""
    if not INSTAGRAM_TOKEN:
        logger.info("[MOCK] Would create reel container")
        return "mock_reel_container_67890"
    try:
        result = await _post(
            f"/{INSTAGRAM_USER_ID}/media",
            {
                "media_type": "REELS",
                "video_url": video_url,
                "caption": caption,
                "share_to_feed": str(share_to_feed).lower(),
                "thumb_offset": thumb_offset,
            },
        )
        return result.get("id")
    except Exception as e:
        logger.error(f"Reel container creation failed: {e}")
        return None


async def wait_for_container(container_id: str, max_wait_s: int = 120) -> bool:
    """Poll until container status is FINISHED (video processing)."""
    if container_id.startswith("mock_"):
        await asyncio.sleep(1)
        return True
    waited = 0
    while waited < max_wait_s:
        try:
            result = await _get(f"/{container_id}", {"fields": "status_code,status"})
            code = result.get("status_code", "")
            if code == "FINISHED":
                return True
            if code in ("ERROR", "EXPIRED"):
                logger.error(f"Container failed: {result}")
                return False
        except Exception as e:
            logger.warning(f"Container poll error: {e}")
        await asyncio.sleep(5)
        waited += 5
    return False


async def publish_container(container_id: str) -> Optional[str]:
    """
    Step 2: Publish media container to Instagram feed.
    Returns the Instagram post ID.
    """
    if container_id.startswith("mock_"):
        logger.info("[MOCK] Post published successfully")
        return f"mock_post_{container_id}"
    try:
        result = await _post(
            f"/{INSTAGRAM_USER_ID}/media_publish",
            {"creation_id": container_id},
        )
        return result.get("id")
    except Exception as e:
        logger.error(f"Publish failed: {e}")
        return None


async def post_story(image_url: str) -> Optional[str]:
    """Post an image story."""
    if not INSTAGRAM_TOKEN:
        logger.info("[MOCK] Story posted")
        return "mock_story_id_99999"
    try:
        result = await _post(
            f"/{INSTAGRAM_USER_ID}/media",
            {"image_url": image_url, "media_type": "STORIES"},
        )
        cid = result.get("id")
        if cid:
            return await publish_container(cid)
        return None
    except Exception as e:
        logger.error(f"Story post failed: {e}")
        return None


# ─── DM Auto-Reply ────────────────────────────────────────────────────────

async def get_recent_messages(limit: int = 20) -> list:
    """
    Fetch recent DM conversations.
    Requires 'instagram_manage_messages' permission.
    """
    if not INSTAGRAM_TOKEN:
        return _mock_messages()
    try:
        data = await _get(
            f"/{INSTAGRAM_USER_ID}/conversations",
            {"platform": "instagram", "limit": limit},
        )
        return data.get("data", [])
    except Exception as e:
        logger.warning(f"Messages fetch failed: {e}")
        return _mock_messages()


async def send_dm(recipient_id: str, message: str) -> bool:
    """Send a DM reply."""
    if not INSTAGRAM_TOKEN:
        logger.info(f"[MOCK] Would send DM to {recipient_id}: {message[:50]}")
        return True
    try:
        await _post(
            f"/{INSTAGRAM_USER_ID}/messages",
            {
                "recipient": f'{{"id":"{recipient_id}"}}',
                "message": f'{{"text":"{message}"}}',
            },
        )
        return True
    except Exception as e:
        logger.error(f"DM send failed: {e}")
        return False


# ─── Comment management ───────────────────────────────────────────────────

async def get_media_comments(media_id: str, limit: int = 50) -> list:
    if not INSTAGRAM_TOKEN:
        return _mock_comments()
    try:
        data = await _get(
            f"/{media_id}/comments",
            {"fields": "id,text,username,timestamp", "limit": limit},
        )
        return data.get("data", [])
    except Exception as e:
        logger.warning(f"Comments fetch failed: {e}")
        return _mock_comments()


async def reply_to_comment(comment_id: str, reply_text: str) -> bool:
    if not INSTAGRAM_TOKEN:
        logger.info(f"[MOCK] Replying to comment {comment_id}")
        return True
    try:
        await _post(f"/{comment_id}/replies", {"message": reply_text})
        return True
    except Exception as e:
        logger.error(f"Comment reply failed: {e}")
        return False


# ─── Token management ─────────────────────────────────────────────────────

async def refresh_long_lived_token(short_lived_token: str) -> Optional[str]:
    """Exchange short-lived (1h) token for long-lived (60 day) token."""
    app_id = os.getenv("FACEBOOK_APP_ID", "")
    app_secret = os.getenv("FACEBOOK_APP_SECRET", "")
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                f"{GRAPH_BASE}/oauth/access_token",
                params={
                    "grant_type": "fb_exchange_token",
                    "client_id": app_id,
                    "client_secret": app_secret,
                    "fb_exchange_token": short_lived_token,
                }
            )
            r.raise_for_status()
            data = r.json()
            return data.get("access_token")
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        return None


# ─── Convenience: full post pipeline ─────────────────────────────────────

async def post_image(image_url: str, caption: str) -> Optional[str]:
    """
    Full pipeline: create container → wait if needed → publish.
    Returns Instagram post ID or None on failure.
    """
    container_id = await create_image_container(image_url, caption)
    if not container_id:
        return None
    return await publish_container(container_id)


async def post_reel(video_url: str, caption: str) -> Optional[str]:
    """Full reel posting pipeline."""
    container_id = await create_reel_container(video_url, caption)
    if not container_id:
        return None
    ready = await wait_for_container(container_id)
    if not ready:
        return None
    return await publish_container(container_id)


# ─── Mock data (when no API token configured) ─────────────────────────────

def _mock_account_info() -> dict:
    return {
        "username": "zephyr.vale",
        "name": "ZEPHYR VALE",
        "followers_count": 42800,
        "follows_count": 142,
        "media_count": 156,
        "biography": "Luxury. Elegance. Precision. ✦",
        "_mock": True,
    }


def _mock_insights() -> dict:
    return {
        "data": [
            {"name": "reach",          "period": "day", "values": [{"value": 8420}, {"value": 9840}]},
            {"name": "impressions",    "period": "day", "values": [{"value": 12600}, {"value": 14200}]},
            {"name": "follower_count", "period": "day", "values": [{"value": 42800}]},
        ],
        "_mock": True,
    }


def _mock_media_list() -> list:
    return [
        {"id": "m1", "caption": "The morning belongs to those who move in silence. 🖤", "media_type": "REELS",
         "like_count": 8910, "comments_count": 342, "reach": 42100, "saved": 1240,
         "timestamp": "2025-05-13T20:00:00+0000"},
        {"id": "m2", "caption": "Some nights, the city belongs to those who refuse to be ordinary. 🥂",
         "media_type": "IMAGE", "like_count": 3420, "comments_count": 187, "reach": 18400, "saved": 890,
         "timestamp": "2025-05-11T07:00:00+0000"},
        {"id": "m3", "caption": "Paris doesn't impress everyone. Only those who've earned it. ✦",
         "media_type": "IMAGE", "like_count": 2870, "comments_count": 142, "reach": 15200, "saved": 720,
         "timestamp": "2025-05-10T19:00:00+0000"},
    ]


def _mock_messages() -> list:
    return [
        {"id": "conv1", "participants": {"data": [{"username": "fashionlover_ig"}]}, "updated_time": "2025-05-16T10:00:00+0000"},
        {"id": "conv2", "participants": {"data": [{"username": "luxurylifestyles"}]}, "updated_time": "2025-05-16T09:30:00+0000"},
    ]


def _mock_comments() -> list:
    return [
        {"id": "c1", "text": "This is absolutely stunning 🔥", "username": "fashionista_22", "timestamp": "2025-05-16T08:00:00+0000"},
        {"id": "c2", "text": "Where is this suit from?? 😍", "username": "mensstyle_daily", "timestamp": "2025-05-16T07:30:00+0000"},
        {"id": "c3", "text": "Real life art 🖤", "username": "luxury.aesthetics", "timestamp": "2025-05-16T07:00:00+0000"},
    ]
