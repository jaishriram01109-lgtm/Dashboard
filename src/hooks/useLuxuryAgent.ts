/**
 * React hook for interacting with the ZEPHYR VALE agent system.
 * Provides real-time agent runs, content generation, and approval workflow.
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import luxuryApi, {
  GeneratedPrompt, ContentItem, AgentStatus,
  GrowthMetrics, PromptRequest,
} from "@/lib/luxuryApi";

// ─── useLuxuryPrompt ──────────────────────────────────────────────────────

export function useLuxuryPrompt() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<{
    locations: string[]; outfits: string[]; moods: string[]; lighting: string[];
  } | null>(null);

  const fetchOptions = useCallback(async () => {
    try {
      const data = await luxuryApi.getPromptOptions();
      setOptions(data);
    } catch (e) {
      // silently fail — use hardcoded fallbacks in UI
    }
  }, []);

  const generate = useCallback(async (req: PromptRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await luxuryApi.generatePrompt(req);
      setResult(data);
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  return { loading, result, error, options, generate };
}

// ─── useAgentHub ──────────────────────────────────────────────────────────

export function useAgentHub(pollIntervalMs = 10000) {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskOutput, setTaskOutput] = useState<Record<string, string>>({});

  const fetchAgents = useCallback(async () => {
    try {
      const data = await luxuryApi.getAgentsStatus();
      setAgents(data.agents);
    } catch {
      // keep previous data on error
    }
  }, []);

  const runAgent = useCallback(async (agentName: string, task: string) => {
    setLoading(true);
    try {
      const result = await luxuryApi.runAgent(agentName, task);
      setTaskOutput(prev => ({ ...prev, [agentName]: result.output }));
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Agent failed";
      setTaskOutput(prev => ({ ...prev, [agentName]: `Error: ${msg}` }));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const runPipeline = useCallback(async (req: PromptRequest) => {
    setLoading(true);
    try {
      return await luxuryApi.runPipeline(req);
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    const id = setInterval(fetchAgents, pollIntervalMs);
    return () => clearInterval(id);
  }, [fetchAgents, pollIntervalMs]);

  return { agents, loading, taskOutput, runAgent, runPipeline, refetch: fetchAgents };
}

// ─── useContentQueue ──────────────────────────────────────────────────────

export function useContentQueue(statusFilter?: string) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, posted: 0 });
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await luxuryApi.getContentQueue(statusFilter);
      setItems(data.items);
      setSummary({ total: data.total, pending: data.pending, approved: data.approved, posted: data.posted });
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const approve = useCallback(async (contentId: string) => {
    await luxuryApi.approveContent({ content_id: contentId, action: "approve" });
    await fetch();
  }, [fetch]);

  const reject = useCallback(async (contentId: string) => {
    await luxuryApi.approveContent({ content_id: contentId, action: "reject" });
    await fetch();
  }, [fetch]);

  const edit = useCallback(async (contentId: string, caption: string, hashtags?: string) => {
    await luxuryApi.approveContent({
      content_id: contentId,
      action: "edit",
      edited_caption: caption,
      edited_hashtags: hashtags,
    });
    await fetch();
  }, [fetch]);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, summary, loading, approve, reject, edit, refetch: fetch };
}

// ─── useInstagramGrowth ───────────────────────────────────────────────────

export function useInstagramGrowth() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [trends, setTrends] = useState<{
    trending_audio: unknown[];
    trending_hashtags: unknown[];
    viral_formats: unknown[];
    best_posting_times: string[];
  } | null>(null);
  const [account, setAccount] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t, a] = await Promise.allSettled([
        luxuryApi.getGrowthAnalytics(),
        luxuryApi.getTrendSignals(),
        luxuryApi.getInstagramAccount(),
      ]);
      if (m.status === "fulfilled") setMetrics(m.value);
      if (t.status === "fulfilled") setTrends(t.value);
      if (a.status === "fulfilled") setAccount(a.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { metrics, trends, account, loading, refetch: fetchAll };
}

// ─── useSystemHealth ─────────────────────────────────────────────────────

export function useSystemHealth() {
  const [health, setHealth] = useState<{
    status: string;
    anthropic_connected: boolean;
    instagram_connected: boolean;
    content_in_queue: number;
  } | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await luxuryApi.getSystemHealth();
        setHealth(data);
      } catch {
        setHealth({
          status: "backend_offline",
          anthropic_connected: false,
          instagram_connected: false,
          content_in_queue: 0,
        });
      }
    };
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, []);

  return health;
}
