"use client";

import { useState, useEffect } from "react";
import {
  Cpu, Crown, Palette, Wand2, ScanFace, TrendingUp,
  BarChart3, Type, Calendar, CheckCircle, Activity,
  Zap, Clock, Play, Pause, RefreshCw, ChevronRight,
  MessageSquare, AlertCircle, Terminal,
} from "lucide-react";

// ─── Agent definitions ─────────────────────────────────────────────────────
const AGENTS = [
  {
    id: "creative",
    name: "Creative Director",
    icon: Crown,
    color: "text-gold-400",
    bg: "bg-gold-500/10 border-gold-700/30",
    status: "active",
    model: "Claude Opus 4",
    tasksDone: 42,
    currentTask: "Planning Dior SS25 editorial campaign brief",
    lastOutput: "Generated 3-week campaign: Monaco → Paris → Milan narrative arc with 18 content pieces",
    uptime: "99.2%",
  },
  {
    id: "stylist",
    name: "Fashion Stylist Agent",
    icon: Palette,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-700/30",
    status: "active",
    model: "GPT-4o",
    tasksDone: 38,
    currentTask: "Selecting outfits for next 7 posts based on seasonal trend analysis",
    lastOutput: "Recommended: Dior navy suit, Tom Ford ivory linen, Saint Laurent all-black for this week",
    uptime: "97.8%",
  },
  {
    id: "prompt",
    name: "Cinematic Prompt Engineer",
    icon: Wand2,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-700/30",
    status: "active",
    model: "Claude Sonnet 4",
    tasksDone: 156,
    currentTask: "Writing ultra-realistic FLUX prompts for 6 pending shoots",
    lastOutput: "Generated prompts: Monaco Yacht (97.2 quality score), Paris Rooftop (98.4), Milan BTS (96.1)",
    uptime: "99.8%",
  },
  {
    id: "face",
    name: "Face Consistency Agent",
    icon: ScanFace,
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-700/30",
    status: "active",
    model: "FLUX LoRA Engine",
    tasksDone: 156,
    currentTask: "Running consistency verification pass on 12 pending images",
    lastOutput: "All 12 images verified: avg consistency 99.1%. 1 image re-generated (score was 94.2 < threshold)",
    uptime: "100%",
  },
  {
    id: "growth",
    name: "Instagram Growth Agent",
    icon: TrendingUp,
    color: "text-signal-bull",
    bg: "bg-signal-bull/10 border-signal-bull/30",
    status: "active",
    model: "Claude Sonnet 4",
    tasksDone: 89,
    currentTask: "Analyzing 3 viral luxury reels from @tomford @dior @brunellocucinelli",
    lastOutput: "Best posting times: Mon/Wed/Fri 7-8 PM IST. Trending audio: 'Unforgettable' remix. +2,140 followers this week.",
    uptime: "98.4%",
  },
  {
    id: "analytics",
    name: "Analytics Agent",
    icon: BarChart3,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-700/30",
    status: "active",
    model: "Claude Haiku 4",
    tasksDone: 214,
    currentTask: "Processing last 7-day engagement data and generating weekly strategy report",
    lastOutput: "Reel: 14.7% avg eng. Photo: 9.2%. Best content: Monaco Midnight (11.2%, 3.4K likes). Optimize: more reels",
    uptime: "99.9%",
  },
  {
    id: "caption",
    name: "Caption & Storytelling",
    icon: Type,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-700/30",
    status: "active",
    model: "GPT-4o",
    tasksDone: 156,
    currentTask: "Writing 4 luxury captions with premium hooks for approval queue",
    lastOutput: "Captions generated with avg luxury tone score 94.2/100. All passed editorial review.",
    uptime: "98.1%",
  },
  {
    id: "automation",
    name: "Automation Agent",
    icon: Calendar,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-700/30",
    status: "active",
    model: "n8n + Python",
    tasksDone: 312,
    currentTask: "Scheduling approved posts + prepping Friday 8 PM reel upload",
    lastOutput: "Scheduled 5 posts this week. DM auto-reply sent: 318 messages. 0 errors in last 24h.",
    uptime: "99.7%",
  },
  {
    id: "approval",
    name: "Approval Agent",
    icon: CheckCircle,
    color: "text-gold-400",
    bg: "bg-gold-500/10 border-gold-700/30",
    status: "waiting",
    model: "Claude Sonnet 4",
    tasksDone: 128,
    currentTask: "2 content pieces ready for final user review before posting",
    lastOutput: "Approval request sent: 'Monaco Midnight' photo + 'Tom Ford Morning' reel. Awaiting user decision.",
    uptime: "99.5%",
  },
];

// Live activity log entries
const ACTIVITY_LOG = [
  { time: "12:34:22", agent: "Prompt Engineer",   msg: "Generated Monaco Yacht prompt (quality: 97.2)",   type: "success" },
  { time: "12:33:15", agent: "Face Consistency",  msg: "Consistency check passed: 12/12 images",         type: "success" },
  { time: "12:32:08", agent: "Growth Agent",      msg: "Trending audio detected: +2.3% reel boost expected", type: "info" },
  { time: "12:31:44", agent: "Analytics",         msg: "Weekly report: avg eng 8.4%, +422% follower growth", type: "success" },
  { time: "12:30:12", agent: "Automation",        msg: "DM replies sent: 318 | 0 failed",                type: "success" },
  { time: "12:28:55", agent: "Creative Director", msg: "Campaign brief: Monaco→Paris→Milan arc created",  type: "success" },
  { time: "12:27:30", agent: "Caption Agent",     msg: "4 captions written, avg tone score 94.2/100",    type: "success" },
  { time: "12:26:14", agent: "Approval Agent",    msg: "⚠ 2 items queued for user approval",             type: "warning" },
  { time: "12:25:02", agent: "Fashion Stylist",   msg: "7-day outfit plan generated (3 brands featured)", type: "success" },
  { time: "12:23:47", agent: "Growth Agent",      msg: "Hashtag optimization: #QuietLuxury +34% reach",  type: "info"    },
  { time: "12:22:11", agent: "Analytics",         msg: "A/B test result: Photo B caption outperforms A by 18%", type: "success" },
  { time: "12:20:39", agent: "Automation",        msg: "Scheduled post: Fri 8 PM reel (Tom Ford)",       type: "success" },
];

// ─── Main ─────────────────────────────────────────────────────────────────
export default function AgentHub() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [logPaused, setLogPaused] = useState(false);
  const [logLines, setLogLines] = useState(ACTIVITY_LOG);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (logPaused) return;
    const id = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(id);
  }, [logPaused]);

  const selected = AGENTS.find(a => a.id === selectedAgent);

  const statusColor: Record<string, string> = {
    active: "text-signal-bull",
    waiting: "text-gold-400",
    idle: "text-ivory-600",
  };

  const logColor: Record<string, string> = {
    success: "text-signal-bull",
    warning: "text-gold-400",
    info: "text-blue-400",
    error: "text-signal-bear",
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ivory-100 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-gold-500" />
            Multi-Agent Control Center
          </h2>
          <p className="text-xs text-ivory-700 mt-1 font-mono">9 specialized AI agents · Autonomous orchestration · Real-time task pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-signal-bull/10 border border-signal-bull/20 text-center">
            <div className="text-base font-bold text-signal-bull font-display">9 / 9</div>
            <div className="text-[10px] text-ivory-700 uppercase">Agents Online</div>
          </div>
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {AGENTS.map(ag => (
          <button key={ag.id}
            onClick={() => setSelectedAgent(selectedAgent === ag.id ? null : ag.id)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selectedAgent === ag.id
                ? "border-gold-600/50 bg-gold-600/5"
                : `${ag.bg} hover:border-gold-700/40`
            }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ag.bg}`}>
                  <ag.icon className={`w-4 h-4 ${ag.color}`} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-ivory-200 leading-tight">{ag.name}</div>
                  <div className="text-[9px] text-ivory-700 font-mono">{ag.model}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  ag.status === "active" ? "bg-signal-bull live-dot" :
                  ag.status === "waiting" ? "bg-gold-400 animate-pulse-fast" : "bg-ivory-700"
                }`} />
                <span className={`text-[10px] font-semibold ${statusColor[ag.status]}`}>
                  {ag.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-ivory-600 leading-relaxed line-clamp-2 mb-3">
              {ag.currentTask}
            </div>

            <div className="flex items-center justify-between text-[9px] text-ivory-700">
              <span className="font-mono">{ag.tasksDone} tasks done</span>
              <span className="font-mono text-signal-bull">↑ {ag.uptime}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded agent detail */}
      {selected && (
        <div className="card-glass rounded-xl p-5 border border-gold-700/30 animate-slide-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected.bg}`}>
                <selected.icon className={`w-5 h-5 ${selected.color}`} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ivory-100">{selected.name}</h3>
                <div className="text-[10px] text-ivory-700 font-mono">{selected.model}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg bg-bg-secondary border border-bg-border hover:border-gold-700/30 transition-colors">
                <Pause className="w-3.5 h-3.5 text-ivory-600" />
              </button>
              <button className="p-1.5 rounded-lg bg-bg-secondary border border-bg-border hover:border-gold-700/30 transition-colors">
                <RefreshCw className="w-3.5 h-3.5 text-ivory-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-ivory-700 uppercase tracking-wider mb-2">Current Task</div>
              <div className="p-3 rounded-lg bg-bg-secondary border border-bg-border text-xs text-ivory-300 leading-relaxed">
                {selected.currentTask}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-ivory-700 uppercase tracking-wider mb-2">Last Output</div>
              <div className="p-3 rounded-lg bg-signal-bull/5 border border-signal-bull/20 text-xs text-ivory-300 leading-relaxed">
                {selected.lastOutput}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity log */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-bg-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Live Activity Log</span>
            <span className="w-2 h-2 rounded-full bg-signal-bull live-dot" />
          </div>
          <button
            onClick={() => setLogPaused(p => !p)}
            className="flex items-center gap-1.5 text-[10px] text-ivory-600 hover:text-ivory-300 transition-colors">
            {logPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {logPaused ? "Resume" : "Pause"}
          </button>
        </div>
        <div className="divide-y divide-bg-border max-h-64 overflow-y-auto font-mono">
          {logLines.map((l, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-2 hover:bg-bg-secondary/40 transition-colors text-[10px]">
              <span className="text-ivory-800 shrink-0">{l.time}</span>
              <span className="text-ivory-700 shrink-0 w-28 truncate">[{l.agent}]</span>
              <span className={logColor[l.type]}>{l.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="card-glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-gold-500" />
          <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Content Pipeline</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Brief",      count: 2, color: "bg-crown-400 bg-gold-600/20 text-gold-400 border-gold-700/30"    },
            { label: "→ Style",    count: 2, color: "bg-purple-600/20 text-purple-400 border-purple-700/30"             },
            { label: "→ Prompt",   count: 2, color: "bg-blue-600/20 text-blue-400 border-blue-700/30"                  },
            { label: "→ Generate", count: 2, color: "bg-teal-600/20 text-teal-400 border-teal-700/30"                  },
            { label: "→ Caption",  count: 2, color: "bg-pink-600/20 text-pink-400 border-pink-700/30"                  },
            { label: "→ Approve",  count: 2, color: "bg-gold-600/20 text-gold-300 border-gold-700/30 animate-pulse-fast"},
            { label: "→ Schedule", count: 5, color: "bg-cyan-600/20 text-cyan-400 border-cyan-700/30"                  },
            { label: "→ Posted",   count: 156,color: "bg-signal-bull/10 text-signal-bull border-signal-bull/30"         },
          ].map(stage => (
            <div key={stage.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-semibold ${stage.color}`}>
              {stage.label}
              <span className="font-mono">{stage.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
