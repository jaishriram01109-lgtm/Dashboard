/**
 * Frontend API client for the AI Luxury Model System (ZEPHYR VALE)
 * Connects to FastAPI backend at NEXT_PUBLIC_API_URL
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface PromptRequest {
  content_type?: "photo" | "reel" | "story" | "caption";
  location?: string;
  outfit?: string;
  mood?: string;
  lighting?: string;
  brand_focus?: string;
}

export interface GeneratedPrompt {
  prompt_id: string;
  content_type: string;
  image_prompt: string;
  negative_prompt: string;
  caption: string;
  hashtags: string;
  hook?: string;
  quality_score: number;
  engagement_prediction: string;
  reach_prediction: string;
  generated_at: string;
  agent: string;
}

export interface ContentItem {
  id: string;
  type: string;
  title: string;
  prompt: string;
  caption: string;
  hashtags: string;
  hook?: string;
  brand: string;
  status: string;
  quality_score: number;
  engagement_prediction: string;
  reach_prediction: string;
  scheduled_for?: string;
  image_url?: string;
  likes: number;
  comments: number;
  saved: number;
  reach: number;
  created_at: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  model: string;
  status: "active" | "idle" | "waiting" | "error";
  tasks_done: number;
  uptime: string;
}

export interface GrowthMetrics {
  follower_snapshot: {
    current: number;
    last_week: number;
    gained_7d: number;
    growth_pct: number;
  };
  engagement: {
    avg_likes: number;
    avg_comments: number;
    avg_saved: number;
    avg_reach: number;
    avg_eng_rate: number;
  };
  top_posts: Array<Record<string, unknown>>;
  content_mix: { photos: number; reels: number; stories: number };
}

export interface SchedulePost {
  post_id: string;
  content_id: string;
  content_type: string;
  caption: string;
  scheduled_for: string;
  status: string;
  instagram_post_id?: string;
}

export interface ApprovalAction {
  content_id: string;
  action: "approve" | "reject" | "edit";
  edited_caption?: string;
  edited_hashtags?: string;
}

// ─── Prompt & Content Generation ─────────────────────────────────────────

export const luxuryApi = {

  /** Generate a luxury image prompt with all parameters */
  async generatePrompt(req: PromptRequest): Promise<GeneratedPrompt> {
    return apiFetch("/api/luxury/generate-prompt", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  /** Generate just a caption for given context */
  async generateCaption(params: {
    mood?: string;
    brand?: string;
    location?: string;
    content_type?: string;
  }): Promise<{ caption: string; hashtags: string; hook?: string; tone_score: number }> {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null) as [string, string][]
    ).toString();
    return apiFetch(`/api/luxury/generate-caption?${qs}`, { method: "POST" });
  },

  /** Get all dropdown options for prompt builder */
  async getPromptOptions(): Promise<{
    locations: string[];
    outfits: string[];
    moods: string[];
    lighting: string[];
  }> {
    return apiFetch("/api/luxury/prompt-options");
  },

  // ─── Content Queue ──────────────────────────────────────────────────

  /** List content items, optionally filtered by status */
  async getContentQueue(status?: string): Promise<{
    items: ContentItem[];
    total: number;
    pending: number;
    approved: number;
    posted: number;
  }> {
    const qs = status ? `?status=${status}` : "";
    return apiFetch(`/api/luxury/content-queue${qs}`);
  },

  /** Create a new content item (triggers agent pipeline) */
  async createContent(req: PromptRequest): Promise<{ item_id: string; status: string }> {
    return apiFetch("/api/luxury/content/create", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  /** Approve, reject, or edit a content item */
  async approveContent(action: ApprovalAction): Promise<Record<string, unknown>> {
    return apiFetch("/api/luxury/content/approve", {
      method: "POST",
      body: JSON.stringify(action),
    });
  },

  // ─── Agent System ────────────────────────────────────────────────────

  /** Get all 9 agent statuses */
  async getAgentsStatus(): Promise<{ agents: AgentStatus[]; total: number; active: number }> {
    return apiFetch("/api/luxury/agents/status");
  },

  /** Run a specific agent with a task */
  async runAgent(agentName: string, task: string): Promise<{
    task_id: string;
    agent_name: string;
    output: string;
    duration_ms: number;
    success: boolean;
  }> {
    return apiFetch("/api/luxury/agents/run", {
      method: "POST",
      body: JSON.stringify({ agent_name: agentName, task }),
    });
  },

  /** Run full 5-agent content creation pipeline */
  async runPipeline(req: PromptRequest): Promise<Record<string, unknown>> {
    return apiFetch("/api/luxury/agents/pipeline", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // ─── Instagram ───────────────────────────────────────────────────────

  async getInstagramAccount(): Promise<Record<string, unknown>> {
    return apiFetch("/api/luxury/instagram/account");
  },

  async getInstagramMedia(limit?: number): Promise<{ posts: unknown[]; count: number }> {
    return apiFetch(`/api/luxury/instagram/media${limit ? `?limit=${limit}` : ""}`);
  },

  async getInstagramInsights(): Promise<Record<string, unknown>> {
    return apiFetch("/api/luxury/instagram/insights");
  },

  async getInstagramMessages(): Promise<Record<string, unknown>> {
    return apiFetch("/api/luxury/instagram/messages");
  },

  // ─── Schedule ────────────────────────────────────────────────────────

  async getSchedule(): Promise<{
    scheduled_posts: SchedulePost[];
    weekly_plan: unknown[];
    next_slot: string;
  }> {
    return apiFetch("/api/luxury/schedule");
  },

  async cancelPost(postId: string): Promise<{ cancelled: boolean }> {
    return apiFetch(`/api/luxury/schedule/${postId}`, { method: "DELETE" });
  },

  // ─── Analytics ───────────────────────────────────────────────────────

  async getGrowthAnalytics(): Promise<GrowthMetrics> {
    return apiFetch("/api/luxury/analytics/growth");
  },

  async getTrendSignals(): Promise<{
    trending_audio: unknown[];
    trending_hashtags: unknown[];
    viral_formats: unknown[];
    best_posting_times: string[];
  }> {
    return apiFetch("/api/luxury/analytics/trends");
  },

  // ─── Model Identity ──────────────────────────────────────────────────

  async getModelIdentity(): Promise<Record<string, unknown>> {
    return apiFetch("/api/luxury/model/identity");
  },

  // ─── Health ──────────────────────────────────────────────────────────

  async getSystemHealth(): Promise<{
    status: string;
    anthropic_connected: boolean;
    instagram_connected: boolean;
    content_in_queue: number;
  }> {
    return apiFetch("/api/luxury/health");
  },
};

export default luxuryApi;
