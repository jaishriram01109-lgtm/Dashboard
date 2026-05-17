"""
Pydantic models for the AI Luxury Male Model Ecosystem (ZEPHYR VALE)
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class ContentType(str, Enum):
    photo   = "photo"
    reel    = "reel"
    story   = "story"
    caption = "caption"


class ContentStatus(str, Enum):
    generating = "generating"
    ready      = "ready"
    pending    = "pending"
    approved   = "approved"
    rejected   = "rejected"
    scheduled  = "scheduled"
    posted     = "posted"


class AgentStatus(str, Enum):
    active  = "active"
    idle    = "idle"
    waiting = "waiting"
    error   = "error"


# ─── Prompt Generation ────────────────────────────────────────────────────

class PromptRequest(BaseModel):
    content_type: ContentType = ContentType.photo
    location: str = "Monaco Yacht Club"
    outfit: str = "Dior Homme SS25 Suit"
    mood: str = "Mysterious & Brooding"
    lighting: str = "Golden hour natural"
    brand_focus: Optional[str] = None
    campaign_id: Optional[str] = None


class GeneratedPrompt(BaseModel):
    prompt_id: str
    content_type: ContentType
    image_prompt: str
    negative_prompt: str
    caption: str
    hashtags: str
    hook: Optional[str] = None
    quality_score: float
    engagement_prediction: str
    reach_prediction: str
    generated_at: datetime
    agent: str = "Cinematic Prompt Engineer"


# ─── Content Item ─────────────────────────────────────────────────────────

class ContentItem(BaseModel):
    id: str
    type: ContentType
    title: str
    prompt: str
    negative_prompt: str
    caption: str
    hashtags: str
    hook: Optional[str] = None
    brand: str
    scheduled_for: Optional[datetime] = None
    status: ContentStatus = ContentStatus.pending
    quality_score: float = 0.0
    engagement_prediction: str = ""
    reach_prediction: str = ""
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    instagram_post_id: Optional[str] = None
    likes: int = 0
    comments: int = 0
    saved: int = 0
    reach: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    posted_at: Optional[datetime] = None


class ApprovalAction(BaseModel):
    content_id: str
    action: Literal["approve", "reject", "edit"]
    edited_caption: Optional[str] = None
    edited_hashtags: Optional[str] = None
    reschedule_to: Optional[datetime] = None


# ─── Instagram ────────────────────────────────────────────────────────────

class InstagramPost(BaseModel):
    media_type: Literal["IMAGE", "REELS", "STORIES"]
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    caption: str
    share_to_feed: bool = True
    thumb_offset: int = 0


class InstagramAnalytics(BaseModel):
    followers: int
    following: int
    media_count: int
    profile_views: int
    reach_7d: int
    impressions_7d: int
    engagement_rate: float
    avg_likes: float
    avg_comments: float
    avg_saved: float
    best_time_to_post: List[str]
    top_hashtags: List[dict]
    follower_growth_7d: int
    fetched_at: datetime


# ─── Agent System ─────────────────────────────────────────────────────────

class AgentTask(BaseModel):
    task_id: str
    agent_name: str
    task_type: str
    description: str
    status: AgentStatus = AgentStatus.active
    progress: int = 0
    output: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    error: Optional[str] = None


class AgentRunRequest(BaseModel):
    agent_name: str
    task: str
    context: Optional[dict] = None


class AgentRunResult(BaseModel):
    task_id: str
    agent_name: str
    output: str
    tokens_used: int
    duration_ms: int
    success: bool
    error: Optional[str] = None


# ─── Campaign ─────────────────────────────────────────────────────────────

class Campaign(BaseModel):
    id: str
    name: str
    brand: str
    theme: str
    narrative: str
    locations: List[str]
    start_date: datetime
    end_date: datetime
    total_posts: int
    completed_posts: int = 0
    content_mix: dict
    status: Literal["active", "upcoming", "completed", "paused"] = "upcoming"
    tags: List[str] = []


class CampaignBrief(BaseModel):
    campaign_id: str
    brand: str
    theme: str
    target_aesthetic: str
    key_messages: List[str]
    do_list: List[str]
    dont_list: List[str]
    content_schedule: List[dict]
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Growth & Analytics ───────────────────────────────────────────────────

class GrowthMetrics(BaseModel):
    period: str
    followers_start: int
    followers_end: int
    gained: int
    growth_pct: float
    avg_engagement: float
    total_reach: int
    total_impressions: int
    best_content_id: Optional[str] = None
    best_content_title: Optional[str] = None
    best_engagement: float = 0.0


class TrendSignal(BaseModel):
    signal_type: Literal["audio", "hashtag", "aesthetic", "format"]
    name: str
    relevance_score: float
    estimated_boost: str
    detected_at: datetime


# ─── Face Consistency ─────────────────────────────────────────────────────

class ConsistencyCheck(BaseModel):
    image_url: str
    score: float
    passed: bool
    issues: List[str] = []
    checked_at: datetime = Field(default_factory=datetime.utcnow)


class ModelIdentityConfig(BaseModel):
    model_name: str = "ZEPHYR VALE"
    base_lora: str = "ZephyrBase-v4.lora"
    consistency_threshold: float = 95.0
    style_lora: Optional[str] = None
    lora_strength: float = 0.85
    cfg_scale: float = 7.5
    steps: int = 35
    sampler: str = "DPM++ 2M Karras"
    seed: int = -1
