"use client";

import { useState, useEffect } from "react";
import {
  Crown, Camera, Instagram, Users, TrendingUp, CheckCircle,
  Clock, Zap, Heart, MessageCircle, Play, Image, Film,
  Shield, Cpu, ArrowUpRight, Activity, Layers, Wand2,
  Eye, Star, Sparkles, BarChart3, Calendar, Flame,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";
import { useSystemHealth } from "@/lib/useLuxuryAgent";
import SystemStatusBar from "./SystemStatusBar";

// ─── Mock data ─────────────────────────────────────────────────────────────
const FOLLOWER_DATA = [
  { day: "May 1",  v: 8200  },
  { day: "May 3",  v: 9800  },
  { day: "May 5",  v: 11400 },
  { day: "May 7",  v: 13900 },
  { day: "May 9",  v: 16200 },
  { day: "May 11", v: 19700 },
  { day: "May 13", v: 23100 },
  { day: "May 15", v: 27600 },
  { day: "May 17", v: 32400 },
  { day: "May 19", v: 36800 },
  { day: "May 21", v: 39500 },
  { day: "May 23", v: 42800 },
];

const CONTENT_TYPES = [
  { type: "Luxury Portraits",   count: 48,  engagement: "9.2%",  color: "#DAA520" },
  { type: "Fashion Editorials", count: 34,  engagement: "11.4%", color: "#B8860B" },
  { type: "Lifestyle Reels",    count: 29,  engagement: "14.7%", color: "#FFD700" },
  { type: "Story Series",       count: 45,  engagement: "7.8%",  color: "#8B6914" },
];

const RECENT_CONTENT = [
  { id: 1, type: "photo",  title: "Midnight Dior",      status: "live",     eng: "11.2%", likes: 3420, bg: "from-slate-900 to-gray-800" },
  { id: 2, type: "reel",   title: "Tom Ford Moments",   status: "live",     eng: "16.8%", likes: 8910, bg: "from-zinc-900 to-stone-900" },
  { id: 3, type: "photo",  title: "Monaco Escape",      status: "live",     eng: "9.4%",  likes: 2870, bg: "from-neutral-900 to-gray-900" },
  { id: 4, type: "story",  title: "Armani Suite",       status: "live",     eng: "8.1%",  likes: 1240, bg: "from-stone-900 to-zinc-900" },
  { id: 5, type: "photo",  title: "Paris Rooftop",      status: "pending",  eng: "—",     likes: 0,    bg: "from-gray-900 to-slate-900" },
  { id: 6, type: "reel",   title: "Saint Laurent FW",   status: "pending",  eng: "—",     likes: 0,    bg: "from-zinc-800 to-gray-900" },
];

const AGENTS = [
  { name: "Creative Director",    status: "active",  task: "Planning SS25 campaign" },
  { name: "Prompt Engineer",      status: "active",  task: "Generating 6 new prompts" },
  { name: "Face Consistency",     status: "active",  task: "Embedding anchor at 99.2%" },
  { name: "Instagram Growth",     status: "active",  task: "Analyzing 3 viral reels" },
  { name: "Caption Storytelling", status: "active",  task: "Writing 4 luxury captions" },
  { name: "Fashion Stylist",      status: "idle",    task: "Ready for next brief" },
  { name: "Analytics",            status: "active",  task: "Reporting engagement peaks" },
  { name: "Automation",           status: "active",  task: "Scheduling Fri 8 PM post" },
  { name: "Approval",             status: "waiting", task: "2 items awaiting your review" },
];

const UPCOMING = [
  { time: "Today 8:00 PM",  type: "Reel",  title: "Tom Ford Eyewear — Close-Up",   priority: "high" },
  { time: "Tomorrow 7:00 AM",type:"Photo", title: "Morning Ritual — Luxury Hotel",  priority: "high" },
  { time: "Tomorrow 12:00 PM",type:"Story","title": "BTS Milan Fashion Week",       priority: "med"  },
  { time: "Fri 8:00 PM",    type: "Photo", title: "Midnight Rolls Royce Edit",      priority: "high" },
  { time: "Sat 11:00 AM",   type: "Reel",  title: "Gucci Spring Campaign Teaser",   priority: "med"  },
];

const KPI = [
  { label: "Followers",    value: "42.8K",  delta: "+2.1K",  positive: true,  icon: Users,      color: "text-gold-400" },
  { label: "Avg Eng Rate", value: "8.4%",   delta: "+1.2%",  positive: true,  icon: Heart,      color: "text-rose-400" },
  { label: "Content Live", value: "156",    delta: "+12",    positive: true,  icon: Image,      color: "text-blue-400" },
  { label: "Reel Views",   value: "284K",   delta: "+41K",   positive: true,  icon: Eye,        color: "text-purple-400" },
  { label: "Queue Ready",  value: "12",     delta: "2 urgent", positive: null, icon: Clock,     color: "text-gold-500" },
  { label: "DMs / Day",    value: "318",    delta: "+89",    positive: true,  icon: MessageCircle, color: "text-teal-400" },
];

// ─── Sub-components ────────────────────────────────────────────────────────
function AgentStatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-signal-bull live-dot",
    idle: "bg-ivory-600",
    waiting: "bg-gold-500 animate-pulse-fast",
  };
  return <span className={`w-2 h-2 rounded-full inline-block ${map[status] ?? "bg-gray-600"}`} />;
}

function ContentTypeIcon({ type }: { type: string }) {
  if (type === "reel") return <Film className="w-3 h-3 text-purple-400" />;
  if (type === "story") return <Layers className="w-3 h-3 text-blue-400" />;
  return <Image className="w-3 h-3 text-gold-400" />;
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function LuxuryModelHub() {
  const [tick, setTick] = useState(0);
  const health = useSystemHealth(30_000);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <SystemStatusBar />

      {/* ── Hero Banner ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-gold-700/30"
        style={{ background: "linear-gradient(135deg, #070708 0%, #0f0d08 40%, #1a1200 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(ellipse at 20% 50%, #DAA520 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #8B6914 0%, transparent 50%)" }} />
        <div className="relative flex items-center gap-6 p-6 md:p-8">
          {/* Model avatar placeholder */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-gold-600/60 overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1a1200, #0a0a08)" }}>
              <div className="w-full h-full flex items-center justify-center">
                <Crown className="w-10 h-10 text-gold-500 opacity-60" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-signal-bull rounded-full border-2 border-bg-primary live-dot" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gold-500">AI Luxury Male Model</span>
              <span className="label-tag bg-gold-600/20 text-gold-400 border border-gold-700/30">LIVE</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ivory-50 mb-1">
              ZEPHYR VALE
            </h1>
            <p className="text-xs text-ivory-700 font-mono">Autonomous Luxury Fashion Influencer · European–Indian Aesthetic · Old Money Energy</p>
          </div>

          <div className="hidden md:grid grid-cols-2 gap-3">
            <div className="bg-black/40 border border-gold-700/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold font-display text-gold-400">99.2%</div>
              <div className="text-[10px] text-ivory-700 tracking-wider uppercase">Face Consistency</div>
            </div>
            <div className="bg-black/40 border border-gold-700/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold font-display text-signal-bull">ACTIVE</div>
              <div className="text-[10px] text-ivory-700 tracking-wider uppercase">9 Agents Running</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI.map(k => (
          <div key={k.label} className="card-glass rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <k.icon className={`w-4 h-4 ${k.color}`} />
              <span className={`text-[10px] font-mono ${k.positive === true ? "text-signal-bull" : k.positive === false ? "text-signal-bear" : "text-gold-400"}`}>
                {k.delta}
              </span>
            </div>
            <div className="text-xl font-bold font-display text-ivory-100">{k.value}</div>
            <div className="text-[10px] text-ivory-700 uppercase tracking-wider">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main 3-col layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── LEFT: Agent Status ─────────────────────────────────────── */}
        <div className="card-glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Agent Network</span>
            </div>
            <span className="label-tag bg-signal-bull/10 text-signal-bull border border-signal-bull/20">9 ACTIVE</span>
          </div>
          {AGENTS.map(ag => (
            <div key={ag.name}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-secondary/50 border border-bg-border/50 hover:border-gold-700/30 transition-colors">
              <AgentStatusDot status={ag.status} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-ivory-200 truncate">{ag.name}</div>
                <div className="text-[10px] text-ivory-700 truncate">{ag.task}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CENTER: Growth Chart + Content Grid ───────────────────── */}
        <div className="space-y-4">
          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold-500" />
                <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Follower Growth</span>
              </div>
              <span className="text-xs font-mono text-signal-bull">+422% this month</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={FOLLOWER_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fgold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DAA520" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DAA520" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#7A6E42" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 9, fill: "#7A6E42" }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: "#111114", border: "1px solid #B8860B40", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#B8A870" }}
                  formatter={(v: number) => [`${v.toLocaleString()} followers`, ""]}
                />
                <Area type="monotone" dataKey="v" stroke="#DAA520" strokeWidth={2}
                  fill="url(#fgold)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent content grid */}
          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Recent Content</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {RECENT_CONTENT.map(c => (
                <div key={c.id} className={`relative aspect-square rounded-lg bg-gradient-to-br ${c.bg} border border-white/5 overflow-hidden group cursor-pointer`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
                    {c.type === "reel" ? <Play className="w-5 h-5 text-white" /> : <Image className="w-4 h-4 text-white" />}
                  </div>
                  {c.status === "pending" && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-gold-400 rounded-full animate-pulse-fast" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur-sm">
                    <div className="text-[9px] text-ivory-300 font-semibold truncate">{c.title}</div>
                    {c.likes > 0 && (
                      <div className="text-[9px] text-gold-400 font-mono">{c.likes.toLocaleString()} ❤</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Upcoming + Content Types ───────────────────────── */}
        <div className="space-y-4">
          {/* Upcoming posts */}
          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Upcoming Posts</span>
            </div>
            <div className="space-y-2">
              {UPCOMING.map((u, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-bg-secondary/40 border border-bg-border/40 hover:border-gold-700/30 transition-colors">
                  <div className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${u.priority === "high" ? "bg-gold-400" : "bg-ivory-700"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-ivory-200 truncate">{u.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <ContentTypeIcon type={u.type.toLowerCase()} />
                      <span className="text-[10px] text-ivory-700 font-mono">{u.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content type performance */}
          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Content Performance</span>
            </div>
            <div className="space-y-3">
              {CONTENT_TYPES.map(ct => (
                <div key={ct.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-ivory-400">{ct.type}</span>
                    <span className="text-[10px] font-mono text-signal-bull">{ct.engagement}</span>
                  </div>
                  <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(ct.count / 48) * 100}%`, background: ct.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System health */}
          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">System Health</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              {[
                { label: "Identity Lock",  value: "99.2%", ok: true  },
                { label: "Content Queue",  value: "12 Ready", ok: true },
                { label: "Auto-Post",      value: "ON",      ok: true  },
                { label: "DM Replies",     value: "AUTO",    ok: true  },
              ].map(h => (
                <div key={h.label} className={`rounded-lg p-2 border ${h.ok ? "border-signal-bull/20 bg-signal-bull/5" : "border-signal-bear/20 bg-signal-bear/5"}`}>
                  <div className={`text-xs font-bold ${h.ok ? "text-signal-bull" : "text-signal-bear"}`}>{h.value}</div>
                  <div className="text-[9px] text-ivory-700 uppercase tracking-wider">{h.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
