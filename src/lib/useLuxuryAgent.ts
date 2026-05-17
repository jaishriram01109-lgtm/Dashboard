"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  luxuryApi,
  type PromptRequest,
  type GeneratedPrompt,
  type ContentItem,
  type AgentStatus,
  type GrowthMetrics,
  type ApprovalAction,
} from "./luxuryApi";

// ─── Prompt Generation Hook ───────────────────────────────────────────────────

export function useLuxuryPrompt() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<{
    locations: string[];
    outfits: string[];
    moods: string[];
    lighting: string[];
  } | null>(null);

  useEffect(() => {
    luxuryApi
      .getPromptOptions()
      .then(setOptions)
      .catch(() => {});
  }, []);

  const generate = useCallback(async (req: PromptRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await luxuryApi.generatePrompt(req);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, result, error, options, generate };
}

// ─── Agent Hub Hook ───────────────────────────────────────────────────────────

interface AgentLogEntry {
  id: number;
  agent: string;
  message: string;
  log_type: "success" | "info" | "warning" | "error";
  timestamp: string;
}

export function useAgentHub(pollIntervalMs = 30_000) {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [taskOutput, setTaskOutput] = useState<string>("");
  const [wsLogs, setWsLogs] = useState<AgentLogEntry[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const logIdRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  // Poll agent statuses
  useEffect(() => {
    const fetch = () =>
      luxuryApi
        .getAgentsStatus()
        .then((d) => setAgents(d.agents))
        .catch(() => {});
    fetch();
    const t = setInterval(fetch, pollIntervalMs);
    return () => clearInterval(t);
  }, [pollIntervalMs]);

  // WebSocket live logs
  useEffect(() => {
    const wsBase =
      (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000").replace(
        /^http/,
        "ws"
      );
    const url = `${wsBase}/api/luxury/ws`;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connect, 5000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === "agent_log") {
            setWsLogs((prev) => {
              const entry: AgentLogEntry = {
                id: ++logIdRef.current,
                agent: data.agent,
                message: data.message,
                log_type: data.log_type ?? "info",
                timestamp: data.timestamp,
              };
              return [entry, ...prev].slice(0, 100);
            });
          }
        } catch {
          // ignore parse errors
        }
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, []);

  const runAgent = useCallback(async (agentName: string, task: string) => {
    setTaskOutput("Running agent...");
    try {
      const res = await luxuryApi.runAgent(agentName, task);
      setTaskOutput(res.output);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Agent error";
      setTaskOutput(`Error: ${msg}`);
      throw e;
    }
  }, []);

  const runPipeline = useCallback(async (req: PromptRequest) => {
    setTaskOutput("Running full pipeline...");
    try {
      const res = await luxuryApi.runPipeline(req);
      setTaskOutput(JSON.stringify(res, null, 2));
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Pipeline error";
      setTaskOutput(`Error: ${msg}`);
      throw e;
    }
  }, []);

  return { agents, taskOutput, wsLogs, wsConnected, runAgent, runPipeline };
}

// ─── Content Queue Hook ───────────────────────────────────────────────────────

export function useContentQueue(statusFilter?: string) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, posted: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    luxuryApi
      .getContentQueue(statusFilter)
      .then((d) => {
        setItems(d.items);
        setStats({ total: d.total, pending: d.pending, approved: d.approved, posted: d.posted });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15_000);
    return () => clearInterval(t);
  }, [refresh]);

  const approve = useCallback(
    async (contentId: string) => {
      await luxuryApi.approveContent({ content_id: contentId, action: "approve" });
      refresh();
    },
    [refresh]
  );

  const reject = useCallback(
    async (contentId: string) => {
      await luxuryApi.approveContent({ content_id: contentId, action: "reject" });
      refresh();
    },
    [refresh]
  );

  const edit = useCallback(
    async (action: ApprovalAction) => {
      await luxuryApi.approveContent(action);
      refresh();
    },
    [refresh]
  );

  return { items, stats, loading, approve, reject, edit, refresh };
}

// ─── Instagram Growth Hook ────────────────────────────────────────────────────

export function useInstagramGrowth() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [trends, setTrends] = useState<Record<string, unknown>[]>([]);
  const [account, setAccount] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      luxuryApi.getGrowthAnalytics().then(setMetrics),
      luxuryApi
        .getTrendSignals()
        .then((d) => setTrends((d.trending_hashtags ?? []) as Record<string, unknown>[])),
      luxuryApi.getInstagramAccount().then(setAccount),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { metrics, trends, account, loading };
}

// ─── System Health Hook ───────────────────────────────────────────────────────

export interface SystemHealth {
  status: "ok" | "degraded" | "error";
  anthropic_connected: boolean;
  instagram_connected: boolean;
  content_in_queue: number;
}

export function useSystemHealth(pollMs = 30_000) {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    const fetch = () =>
      luxuryApi
        .getSystemHealth()
        .then((h) => setHealth(h as SystemHealth))
        .catch(() => {});
    fetch();
    const t = setInterval(fetch, pollMs);
    return () => clearInterval(t);
  }, [pollMs]);

  return health;
}
