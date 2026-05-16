"use client";

import { useSystemHealth } from "@/lib/useLuxuryAgent";
import { Cpu, Brain, Instagram, Wifi, WifiOff, Crown } from "lucide-react";

export default function SystemStatusBar() {
  const health = useSystemHealth(30_000);

  const dot = (ok: boolean | undefined) =>
    ok
      ? "inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
      : "inline-block w-1.5 h-1.5 rounded-full bg-red-500";

  const pill = (label: string, ok: boolean | undefined, icon: React.ReactNode) => (
    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
      {icon}
      <span className={dot(ok)} />
      {label}
    </span>
  );

  if (!health) return null;

  const allOk = health.anthropic_connected && health.instagram_connected;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-amber-900/20 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Crown className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-semibold tracking-widest text-amber-500/80 uppercase">
          ZEPHYR VALE
        </span>
        <span className="text-xs text-zinc-600 mx-1">·</span>
        <span
          className={`text-xs font-medium ${allOk ? "text-emerald-400" : "text-amber-400"}`}
        >
          {allOk ? "All Systems Operational" : "Demo Mode"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {pill(
          "Claude API",
          health.anthropic_connected,
          <Brain className="w-3 h-3 text-violet-400" />
        )}
        {pill(
          "Instagram",
          health.instagram_connected,
          <Instagram className="w-3 h-3 text-pink-400" />
        )}
        {pill(
          `${health.content_in_queue} In Queue`,
          true,
          <Cpu className="w-3 h-3 text-amber-400" />
        )}
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          {allOk ? (
            <Wifi className="w-3 h-3 text-emerald-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-zinc-600" />
          )}
        </span>
      </div>
    </div>
  );
}
