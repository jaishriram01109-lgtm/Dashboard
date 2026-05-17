"""
WebSocket Manager for real-time agent activity streaming.
Frontend connects to /ws/luxury and receives live agent logs,
content status updates, and system notifications.
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import List, Optional
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class LuxuryWSManager:
    """Manages WebSocket connections for the luxury model system."""

    def __init__(self):
        self.connections: List[WebSocket] = []
        self._activity_queue: asyncio.Queue = asyncio.Queue(maxsize=500)

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)
        logger.info(f"Luxury WS connected. Total: {len(self.connections)}")
        # Send initial state
        await ws.send_json({
            "type": "connected",
            "message": "ZEPHYR VALE agent stream connected",
            "agents_online": 9,
            "timestamp": datetime.utcnow().isoformat(),
        })

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)
        logger.info(f"Luxury WS disconnected. Remaining: {len(self.connections)}")

    async def broadcast(self, event: dict):
        """Broadcast event to all connected clients."""
        if not self.connections:
            return
        dead = []
        for ws in self.connections:
            try:
                await ws.send_json(event)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    async def send_agent_log(
        self,
        agent: str,
        message: str,
        log_type: str = "success",
        task_id: Optional[str] = None,
    ):
        """Push an agent activity log entry to all clients."""
        await self.broadcast({
            "type": "agent_log",
            "agent": agent,
            "message": message,
            "log_type": log_type,
            "task_id": task_id,
            "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        })

    async def send_content_update(self, content_id: str, status: str, title: str = ""):
        """Notify clients of content status change."""
        await self.broadcast({
            "type": "content_update",
            "content_id": content_id,
            "status": status,
            "title": title,
            "timestamp": datetime.utcnow().isoformat(),
        })

    async def send_instagram_event(self, event_type: str, data: dict):
        """Send Instagram event (post live, new follower milestone, etc)."""
        await self.broadcast({
            "type": "instagram_event",
            "event_type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        })

    async def send_approval_needed(self, content_id: str, title: str, content_type: str):
        """Alert that content needs human approval."""
        await self.broadcast({
            "type": "approval_needed",
            "content_id": content_id,
            "title": title,
            "content_type": content_type,
            "message": f"Content ready for your approval: {title}",
            "timestamp": datetime.utcnow().isoformat(),
        })

    async def send_system_status(self, agents_active: int = 9, queue_depth: int = 0):
        """Periodic system status ping."""
        await self.broadcast({
            "type": "system_status",
            "agents_active": agents_active,
            "queue_depth": queue_depth,
            "model_name": "ZEPHYR VALE",
            "timestamp": datetime.utcnow().isoformat(),
        })


# Global instance
luxury_ws = LuxuryWSManager()


async def simulate_agent_activity():
    """
    Background task: sends periodic simulated agent log entries.
    Replace with real agent event hooks in production.
    """
    import random
    AGENT_EVENTS = [
        ("Creative Director",    "Planning next campaign brief — Amalfi Coast editorial",     "info"),
        ("Prompt Engineer",      "Generated Monaco Yacht prompt — quality score 97.4",         "success"),
        ("Face Consistency",     "Consistency check passed: 12/12 images at 99.1%",            "success"),
        ("Instagram Growth",     "Trending audio detected: +18% reel boost expected",          "info"),
        ("Analytics",            "Engagement spike: Tom Ford Reel hit 16.8% (+2.1% above avg)","success"),
        ("Caption Storytelling", "Caption written — luxury tone score 94.8/100",               "success"),
        ("Fashion Stylist",      "Outfit selection for next 5 posts: Loro Piana + Tom Ford",   "info"),
        ("Automation",           "DM auto-replies sent: 42 messages — 0 errors",              "success"),
        ("Approval",             "Content pre-screened: 1 item ready for your review",         "warning"),
        ("Instagram Growth",     "Best posting window detected: Fri 8 PM (score 10/10)",       "info"),
        ("Analytics",            "Weekly report: avg eng 8.4%, followers +3,300 this week",   "success"),
        ("Prompt Engineer",      "Paris Rooftop prompt generated (98.1 quality)",              "success"),
        ("Face Consistency",     "Anchor lock verified — ZephyrBase-v4 at 0.85 strength",      "success"),
        ("Automation",           "Post scheduled: Tomorrow 7:00 AM IST — Monaco Midnight",     "success"),
    ]

    while True:
        await asyncio.sleep(random.uniform(4, 12))
        if luxury_ws.connections:
            agent, msg, log_type = random.choice(AGENT_EVENTS)
            await luxury_ws.send_agent_log(agent, msg, log_type)
