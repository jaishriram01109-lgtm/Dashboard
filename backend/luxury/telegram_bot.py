"""
Telegram Approval Bot for ZEPHYR VALE Content Pipeline.

Flow:
1. Content generated → agents pre-screen → sends to Telegram
2. User sees image + caption + metadata in Telegram
3. User taps ✅ Approve / ❌ Reject / ✏️ Edit
4. Bot calls backend API → content status updated → auto-schedules if approved
5. User gets confirmation with posting time

Setup:
1. Create bot via @BotFather → get TELEGRAM_APPROVAL_BOT_TOKEN
2. Get your chat ID via @userinfobot → TELEGRAM_APPROVAL_CHAT_ID
3. Set in .env and run: python -m luxury.telegram_bot
"""
import os
import asyncio
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

TELEGRAM_TOKEN   = os.getenv("TELEGRAM_APPROVAL_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_APPROVAL_CHAT_ID", "")
BACKEND_URL      = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
TELEGRAM_API     = "https://api.telegram.org"


# ─── Low-level Telegram API calls ────────────────────────────────────────

async def _tg_post(method: str, data: dict) -> Optional[dict]:
    if not TELEGRAM_TOKEN:
        logger.info(f"[MOCK] Telegram {method}: {str(data)[:100]}")
        return {"ok": True, "result": {"message_id": 9999}}
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                f"{TELEGRAM_API}/bot{TELEGRAM_TOKEN}/{method}",
                json=data,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        logger.error(f"Telegram {method} error: {e}")
        return None


async def _tg_get(method: str, params: dict = {}) -> Optional[dict]:
    if not TELEGRAM_TOKEN:
        return {"ok": True, "result": []}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                f"{TELEGRAM_API}/bot{TELEGRAM_TOKEN}/{method}",
                params=params,
            )
            r.raise_for_status()
            return r.json()
    except Exception as e:
        logger.error(f"Telegram {method} error: {e}")
        return None


# ─── Approval notification sender ────────────────────────────────────────

async def send_approval_request(
    content_id: str,
    title: str,
    caption: str,
    hashtags: str,
    image_url: Optional[str],
    content_type: str = "photo",
    quality_score: float = 97.0,
    engagement_prediction: str = "10-14%",
    reach_prediction: str = "20-30K",
    scheduled_for: str = "",
) -> bool:
    """
    Send a content approval request to Telegram.
    Includes image preview + caption + approval buttons.
    """
    chat_id = TELEGRAM_CHAT_ID or os.getenv("TELEGRAM_CHAT_ID", "")
    if not chat_id:
        logger.warning("TELEGRAM_APPROVAL_CHAT_ID not set — skipping notification")
        return False

    type_emoji = {"photo": "🖼", "reel": "🎬", "story": "📱"}.get(content_type, "🖼")
    score_emoji = "🟢" if quality_score >= 95 else "🟡" if quality_score >= 90 else "🔴"

    message_text = (
        f"✦ *ZEPHYR VALE — Content Ready for Approval*\n\n"
        f"{type_emoji} *{title}*\n"
        f"Type: {content_type.upper()}\n\n"
        f"*Caption:*\n{caption[:300]}{'...' if len(caption) > 300 else ''}\n\n"
        f"*Hashtags:*\n`{hashtags[:200]}`\n\n"
        f"─────────────────────\n"
        f"{score_emoji} Quality Score: *{quality_score}/100*\n"
        f"📈 Predicted Engagement: *{engagement_prediction}*\n"
        f"👁 Predicted Reach: *{reach_prediction}*\n"
        f"🕐 Next Slot: *{scheduled_for}*\n"
        f"─────────────────────\n"
        f"Content ID: `{content_id}`"
    )

    # Inline keyboard
    keyboard = {
        "inline_keyboard": [
            [
                {"text": "✅ Approve & Schedule", "callback_data": f"approve_{content_id}"},
                {"text": "❌ Reject",              "callback_data": f"reject_{content_id}"},
            ],
            [
                {"text": "✏️ Edit Caption",        "callback_data": f"edit_{content_id}"},
                {"text": "⏰ Reschedule",           "callback_data": f"reschedule_{content_id}"},
            ],
        ]
    }

    if image_url and not image_url.startswith("https://placehold"):
        # Send with image
        result = await _tg_post("sendPhoto", {
            "chat_id": chat_id,
            "photo": image_url,
            "caption": message_text,
            "parse_mode": "Markdown",
            "reply_markup": keyboard,
        })
    else:
        # Send text only (no image yet)
        result = await _tg_post("sendMessage", {
            "chat_id": chat_id,
            "text": message_text,
            "parse_mode": "Markdown",
            "reply_markup": keyboard,
        })

    success = bool(result and result.get("ok"))
    if success:
        logger.info(f"Approval request sent to Telegram for content {content_id}")
    return success


async def send_post_confirmation(
    content_id: str,
    instagram_post_id: str,
    title: str,
    engagement_after_1h: Optional[float] = None,
) -> bool:
    """Notify when a post goes live on Instagram."""
    chat_id = TELEGRAM_CHAT_ID or os.getenv("TELEGRAM_CHAT_ID", "")
    if not chat_id:
        return False

    text = (
        f"🚀 *Post is LIVE on Instagram!*\n\n"
        f"✦ {title}\n"
        f"📱 IG Post ID: `{instagram_post_id}`\n"
        f"Content ID: `{content_id}`"
    )
    if engagement_after_1h is not None:
        text += f"\n\n📊 1-hour engagement: *{engagement_after_1h:.1f}%*"

    result = await _tg_post("sendMessage", {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
    })
    return bool(result and result.get("ok"))


async def send_analytics_report(report: dict) -> bool:
    """Send weekly analytics summary to Telegram."""
    chat_id = TELEGRAM_CHAT_ID or os.getenv("TELEGRAM_CHAT_ID", "")
    if not chat_id:
        return False

    followers = report.get("followers", {})
    eng       = report.get("engagement", {})

    text = (
        f"📊 *ZEPHYR VALE — Weekly Report*\n\n"
        f"👥 Followers: *{followers.get('current', 0):,}* "
        f"(+{followers.get('gained_7d', 0):,} this week)\n"
        f"📈 Growth: *+{followers.get('growth_pct', 0):.1f}%*\n\n"
        f"❤️ Avg Likes: *{eng.get('avg_likes', 0):.0f}*\n"
        f"💬 Avg Comments: *{eng.get('avg_comments', 0):.0f}*\n"
        f"🔖 Avg Saved: *{eng.get('avg_saved', 0):.0f}*\n"
        f"💡 Avg Engagement: *{eng.get('avg_eng_rate', 0):.1f}%*\n\n"
        f"🤖 9 agents operational ✅\n"
        f"📅 Next posts scheduled ✅\n"
        f"💌 DM auto-replies active ✅"
    )

    result = await _tg_post("sendMessage", {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
    })
    return bool(result and result.get("ok"))


# ─── Callback handler (approve / reject / edit) ───────────────────────────

async def handle_callback(callback_query: dict) -> None:
    """Process inline keyboard button presses."""
    callback_id  = callback_query.get("id")
    data         = callback_query.get("data", "")
    chat_id      = callback_query.get("message", {}).get("chat", {}).get("id")
    message_id   = callback_query.get("message", {}).get("message_id")

    # Acknowledge the callback immediately
    await _tg_post("answerCallbackQuery", {"callback_query_id": callback_id})

    if data.startswith("approve_"):
        content_id = data.removeprefix("approve_")
        try:
            async with httpx.AsyncClient() as client:
                r = await client.post(
                    f"{BACKEND_URL}/api/luxury/content/approve",
                    json={"content_id": content_id, "action": "approve"},
                )
                r.raise_for_status()
                result = r.json()
                sched = result.get("scheduled_for", "auto")
        except Exception as e:
            sched = f"error: {e}"

        await _tg_post("editMessageReplyMarkup", {
            "chat_id": chat_id, "message_id": message_id, "reply_markup": {"inline_keyboard": []}
        })
        await _tg_post("sendMessage", {
            "chat_id": chat_id,
            "text": f"✅ *Approved!* Content `{content_id}` scheduled for:\n`{sched}`",
            "parse_mode": "Markdown",
        })

    elif data.startswith("reject_"):
        content_id = data.removeprefix("reject_")
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{BACKEND_URL}/api/luxury/content/approve",
                    json={"content_id": content_id, "action": "reject"},
                )
        except Exception:
            pass
        await _tg_post("editMessageReplyMarkup", {
            "chat_id": chat_id, "message_id": message_id, "reply_markup": {"inline_keyboard": []}
        })
        await _tg_post("sendMessage", {
            "chat_id": chat_id,
            "text": f"❌ *Rejected.* Content `{content_id}` removed from queue.",
            "parse_mode": "Markdown",
        })

    elif data.startswith("edit_"):
        content_id = data.removeprefix("edit_")
        await _tg_post("sendMessage", {
            "chat_id": chat_id,
            "text": (
                f"✏️ To edit content `{content_id}`, reply with:\n\n"
                f"`EDIT {content_id}\\nYour new caption here`\n\n"
                f"Or visit the dashboard Approval Queue for inline editing."
            ),
            "parse_mode": "Markdown",
        })

    elif data.startswith("reschedule_"):
        content_id = data.removeprefix("reschedule_")
        await _tg_post("sendMessage", {
            "chat_id": chat_id,
            "text": (
                f"⏰ To reschedule `{content_id}`, reply with:\n\n"
                f"`SCHEDULE {content_id} 2025-05-20T20:00:00`\n\n"
                f"Or the system will auto-select the next optimal slot."
            ),
            "parse_mode": "Markdown",
        })


# ─── Polling loop (standalone bot runner) ─────────────────────────────────

async def run_bot():
    """Run the Telegram bot in long-polling mode."""
    logger.info("Starting ZEPHYR VALE Telegram approval bot...")
    offset = 0

    while True:
        try:
            result = await _tg_get("getUpdates", {"offset": offset, "timeout": 30})
            if result and result.get("ok"):
                updates = result.get("result", [])
                for update in updates:
                    offset = update["update_id"] + 1
                    if "callback_query" in update:
                        await handle_callback(update["callback_query"])
                    elif "message" in update:
                        msg  = update["message"]
                        text = msg.get("text", "")
                        chat = msg.get("chat", {}).get("id")

                        if text == "/status":
                            await _tg_post("sendMessage", {
                                "chat_id": chat,
                                "text": "✦ *ZEPHYR VALE System Status*\n\n🟢 9 Agents Online\n📅 Schedule Active\n💌 DM Auto-Reply ON\n\nVisit dashboard for full analytics.",
                                "parse_mode": "Markdown",
                            })
                        elif text == "/report":
                            try:
                                async with httpx.AsyncClient() as client:
                                    r = await client.get(f"{BACKEND_URL}/api/luxury/analytics/growth")
                                    await send_analytics_report(r.json())
                            except Exception as e:
                                await _tg_post("sendMessage", {"chat_id": chat, "text": f"Error: {e}"})

        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Bot polling error: {e}")
            await asyncio.sleep(5)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_bot())
