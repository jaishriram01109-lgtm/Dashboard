"""
Intelligent post scheduler for ZEPHYR VALE.
Uses APScheduler + analytics data to find optimal posting windows.
Auto-posts approved content at the right time.
"""
import os
import uuid
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, List
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

# Try importing APScheduler
try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from apscheduler.triggers.cron import CronTrigger
    from apscheduler.triggers.date import DateTrigger
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    logger.warning("APScheduler not available — scheduler running in mock mode")

from .instagram import post_image, post_reel, post_story


# ─── Optimal posting windows (from analytics) ────────────────────────────
# Rows: [hour, weekday_score, weekend_score]
# High score = high engagement window
POSTING_WINDOWS = [
    {"hour": 7,  "weekday": 8,  "weekend": 6},
    {"hour": 12, "weekday": 7,  "weekend": 8},
    {"hour": 18, "weekday": 9,  "weekend": 9},
    {"hour": 20, "weekday": 10, "weekend": 9},
    {"hour": 21, "weekday": 8,  "weekend": 10},
]

DM_REPLY_TEMPLATES = [
    "Thank you 🖤 Means everything.",
    "Appreciate it. Stay elegant. ✦",
    "Grateful 🤍 More coming soon.",
    "Thank you — this is only the beginning. 🖤",
    "Appreciate the love. Follow along for more ✦",
]

COMMENT_REPLY_TEMPLATES = {
    "brand_question": "DM me for details 🖤",
    "compliment":     "Thank you 🤍",
    "location":       "DM for details ✦",
    "collab":         "DM for business enquiries 🖤",
}


# ─── Scheduled post store (in-memory, swap for Redis/DB in production) ───

@dataclass
class ScheduledPost:
    post_id: str
    content_id: str
    content_type: str  # photo / reel / story
    media_url: str
    caption: str
    scheduled_for: datetime
    status: str = "scheduled"  # scheduled / posted / failed
    instagram_post_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)


_scheduled_posts: List[ScheduledPost] = []
_scheduler: Optional[object] = None


# ─── Scheduler lifecycle ─────────────────────────────────────────────────

def get_scheduler():
    global _scheduler
    if _scheduler is None and SCHEDULER_AVAILABLE:
        _scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")
    return _scheduler


def start_scheduler():
    sched = get_scheduler()
    if sched and not sched.running:
        # Add recurring jobs
        sched.add_job(
            _process_pending_posts,
            trigger="interval",
            minutes=1,
            id="post_checker",
            replace_existing=True,
        )
        sched.add_job(
            _auto_reply_comments,
            trigger="interval",
            minutes=15,
            id="comment_reply",
            replace_existing=True,
        )
        sched.start()
        logger.info("Post scheduler started")


def stop_scheduler():
    sched = get_scheduler()
    if sched and sched.running:
        sched.shutdown(wait=False)


# ─── Core scheduling functions ────────────────────────────────────────────

def find_next_optimal_slot(
    content_type: str = "photo",
    min_gap_hours: int = 8,
) -> datetime:
    """
    Find the next optimal posting slot based on analytics.
    Ensures posts are spaced at least min_gap_hours apart.
    """
    now = datetime.utcnow()
    # Add 5.5h for IST offset
    ist_now = now + timedelta(hours=5, minutes=30)

    # Find last scheduled post time
    last_post = max(
        (p.scheduled_for for p in _scheduled_posts if p.status == "scheduled"),
        default=ist_now - timedelta(hours=min_gap_hours + 1),
    )

    candidate = max(ist_now, last_post + timedelta(hours=min_gap_hours))

    # Find best window on or after candidate
    for days_ahead in range(7):
        check_date = candidate.date() + timedelta(days=days_ahead)
        is_weekend = check_date.weekday() >= 5

        best_window = max(
            POSTING_WINDOWS,
            key=lambda w: w["weekend"] if is_weekend else w["weekday"],
        )

        slot = datetime(
            check_date.year, check_date.month, check_date.day,
            best_window["hour"], 0, 0
        )

        if slot > candidate:
            return slot

    return candidate + timedelta(hours=12)


def schedule_post(
    content_id: str,
    content_type: str,
    media_url: str,
    caption: str,
    scheduled_for: Optional[datetime] = None,
) -> ScheduledPost:
    """Add a post to the schedule queue."""
    if scheduled_for is None:
        scheduled_for = find_next_optimal_slot(content_type)

    post = ScheduledPost(
        post_id=str(uuid.uuid4())[:8],
        content_id=content_id,
        content_type=content_type,
        media_url=media_url,
        caption=caption,
        scheduled_for=scheduled_for,
    )
    _scheduled_posts.append(post)

    # Register with APScheduler if available
    sched = get_scheduler()
    if sched and SCHEDULER_AVAILABLE:
        try:
            sched.add_job(
                _execute_post,
                trigger=DateTrigger(run_date=scheduled_for),
                args=[post.post_id],
                id=f"post_{post.post_id}",
                replace_existing=True,
            )
        except Exception as e:
            logger.error(f"Failed to register APScheduler job: {e}")

    logger.info(f"Scheduled {content_type} post {post.post_id} for {scheduled_for.isoformat()}")
    return post


def get_schedule() -> List[dict]:
    return [
        {
            "post_id":       p.post_id,
            "content_id":    p.content_id,
            "content_type":  p.content_type,
            "caption":       p.caption[:60] + "..." if len(p.caption) > 60 else p.caption,
            "scheduled_for": p.scheduled_for.isoformat(),
            "status":        p.status,
            "instagram_post_id": p.instagram_post_id,
        }
        for p in sorted(_scheduled_posts, key=lambda x: x.scheduled_for)
    ]


def cancel_post(post_id: str) -> bool:
    for post in _scheduled_posts:
        if post.post_id == post_id:
            post.status = "cancelled"
            sched = get_scheduler()
            if sched and SCHEDULER_AVAILABLE:
                try:
                    sched.remove_job(f"post_{post_id}")
                except Exception:
                    pass
            return True
    return False


# ─── Execution ────────────────────────────────────────────────────────────

async def _execute_post(post_id: str):
    """Called by APScheduler at scheduled time."""
    post = next((p for p in _scheduled_posts if p.post_id == post_id), None)
    if not post or post.status != "scheduled":
        return

    logger.info(f"Executing post {post_id} ({post.content_type})")

    try:
        if post.content_type == "reel":
            ig_id = await post_reel(post.media_url, post.caption)
        elif post.content_type == "story":
            ig_id = await post_story(post.media_url)
        else:
            ig_id = await post_image(post.media_url, post.caption)

        if ig_id:
            post.status = "posted"
            post.instagram_post_id = ig_id
            logger.info(f"Post {post_id} published → IG ID: {ig_id}")
        else:
            post.status = "failed"
            logger.error(f"Post {post_id} failed — no IG ID returned")

    except Exception as e:
        post.status = "failed"
        logger.error(f"Post {post_id} exception: {e}")


async def _process_pending_posts():
    """Fallback: check for any overdue posts and execute them."""
    now_ist = datetime.utcnow() + timedelta(hours=5, minutes=30)
    for post in _scheduled_posts:
        if post.status == "scheduled" and post.scheduled_for <= now_ist:
            await _execute_post(post.post_id)


async def _auto_reply_comments():
    """Auto-reply to new comments on recent posts using luxury tone."""
    from .instagram import get_media_list, get_media_comments, reply_to_comment
    import random

    try:
        media = await get_media_list(limit=3)
        for m in media:
            comments = await get_media_comments(m["id"], limit=10)
            for c in comments:
                text = c.get("text", "").lower()
                if any(kw in text for kw in ["brand", "outfit", "where", "what are you wearing", "from"]):
                    reply = COMMENT_REPLY_TEMPLATES["brand_question"]
                elif any(kw in text for kw in ["beautiful", "stunning", "amazing", "fire", "love"]):
                    reply = COMMENT_REPLY_TEMPLATES["compliment"]
                elif any(kw in text for kw in ["location", "where is this", "place"]):
                    reply = COMMENT_REPLY_TEMPLATES["location"]
                elif any(kw in text for kw in ["collab", "collaboration", "business", "work"]):
                    reply = COMMENT_REPLY_TEMPLATES["collab"]
                else:
                    continue

                await reply_to_comment(c["id"], reply)
                logger.info(f"Replied to comment {c['id']}: {reply}")
    except Exception as e:
        logger.error(f"Auto-reply job error: {e}")


# ─── Weekly plan generator ────────────────────────────────────────────────

def generate_weekly_plan() -> List[dict]:
    """Generate a 7-day optimal posting schedule."""
    plan = []
    content_rotation = ["photo", "reel", "photo", "story", "photo", "reel", "story"]
    now = datetime.utcnow() + timedelta(hours=5, minutes=30)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    for i, ctype in enumerate(content_rotation):
        is_weekend = (day_start + timedelta(days=i)).weekday() >= 5
        best = max(POSTING_WINDOWS, key=lambda w: w["weekend"] if is_weekend else w["weekday"])
        post_dt = day_start + timedelta(days=i, hours=best["hour"])
        plan.append({
            "day":          (day_start + timedelta(days=i)).strftime("%A %d %b"),
            "time":         f"{best['hour']:02d}:00 IST",
            "content_type": ctype,
            "optimal_score": best["weekend"] if is_weekend else best["weekday"],
            "datetime":     post_dt.isoformat(),
        })

    return plan
