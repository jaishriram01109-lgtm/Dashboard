"use client";

import { useState } from "react";
import {
  Instagram, TrendingUp, Users, Heart, Eye, MessageCircle,
  Hash, Clock, BarChart3, Zap, Star, Target, Globe,
  ArrowUpRight, ArrowDownRight, Play, Image, Layers,
} from "lucide-react";
import { useInstagramGrowth } from "@/lib/useLuxuryAgent";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

// ─── Mock data ─────────────────────────────────────────────────────────────
const FOLLOWER_GROWTH = [
  { week: "W1",  followers: 8200,  gained: 1200 },
  { week: "W2",  followers: 11400, gained: 3200 },
  { week: "W3",  followers: 16200, gained: 4800 },
  { week: "W4",  followers: 23100, gained: 6900 },
  { week: "W5",  followers: 32400, gained: 9300 },
  { week: "W6",  followers: 42800, gained: 10400 },
];

const DAILY_ENGAGEMENT = [
  { day: "Mon", eng: 7.2, reach: 12400 },
  { day: "Tue", eng: 8.1, reach: 14200 },
  { day: "Wed", eng: 11.4, reach: 19800 },
  { day: "Thu", eng: 7.8, reach: 13100 },
  { day: "Fri", eng: 14.7, reach: 28600 },
  { day: "Sat", eng: 9.2, reach: 16400 },
  { day: "Sun", eng: 8.4, reach: 14900 },
];

const CONTENT_PERFORMANCE = [
  { type: "Reels",  eng: 14.7, reach: 284000, posts: 29,  color: "#9B59D0" },
  { type: "Photos", eng: 9.2,  reach: 186000, posts: 82,  color: "#DAA520" },
  { type: "Stories",eng: 7.8,  reach: 124000, posts: 45,  color: "#3B82F6" },
  { type: "Carousels",eng:11.4,reach: 214000, posts: 18,  color: "#10B981" },
];

const TOP_POSTS = [
  { title: "Tom Ford Morning Ritual",  type: "reel",  likes: 8910,  comments: 342,  saved: 1240, reach: "42.1K", eng: "16.8%" },
  { title: "Monaco Midnight",          type: "photo", likes: 3420,  comments: 187,  saved: 890,  reach: "18.4K", eng: "11.2%" },
  { title: "Paris Rooftop Saint Laurent", type:"photo",likes: 2870, comments: 142,  saved: 720,  reach: "15.2K", eng: "9.4%"  },
  { title: "Milan Fashion Week BTS",   type: "reel",  likes: 6240,  comments: 298,  saved: 1680, reach: "36.8K", eng: "14.2%" },
  { title: "Armani Suite Morning",     type: "story", likes: 1240,  comments: 68,   saved: 340,  reach: "8.4K",  eng: "8.1%"  },
];

const HASHTAG_PERFORMANCE = [
  { tag: "#QuietLuxury",       posts: 2.1,  reach: "+34%",  tier: "top"   },
  { tag: "#OldMoney",          posts: 4.8,  reach: "+28%",  tier: "top"   },
  { tag: "#LuxuryFashion",     posts: 8.2,  reach: "+21%",  tier: "high"  },
  { tag: "#MensFashion",       posts: 12.4, reach: "+18%",  tier: "high"  },
  { tag: "#FashionEditorial",  posts: 3.6,  reach: "+16%",  tier: "high"  },
  { tag: "#DiorHomme",         posts: 1.2,  reach: "+44%",  tier: "brand" },
  { tag: "#TomFord",           posts: 0.8,  reach: "+51%",  tier: "brand" },
  { tag: "#GQ",                posts: 2.4,  reach: "+22%",  tier: "media" },
];

const BEST_TIMES = [
  { time: "6 AM",  mon: 4, tue: 3, wed: 5, thu: 3, fri: 6, sat: 4, sun: 3 },
  { time: "9 AM",  mon: 5, tue: 5, wed: 6, thu: 4, fri: 7, sat: 5, sun: 4 },
  { time: "12 PM", mon: 6, tue: 6, wed: 7, thu: 6, fri: 8, sat: 7, sun: 5 },
  { time: "3 PM",  mon: 5, tue: 6, wed: 6, thu: 6, fri: 7, sat: 7, sun: 6 },
  { time: "6 PM",  mon: 7, tue: 7, wed: 8, thu: 7, fri: 9, sat: 8, sun: 7 },
  { time: "9 PM",  mon: 6, tue: 7, wed: 7, thu: 6, fri: 8, sat: 9, sun: 8 },
  { time: "11 PM", mon: 4, tue: 4, wed: 5, thu: 4, fri: 6, sat: 7, sun: 6 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function heatColor(v: number) {
  if (v >= 9) return "bg-gold-400/90 text-black";
  if (v >= 8) return "bg-gold-500/70 text-black";
  if (v >= 7) return "bg-gold-600/50 text-gold-200";
  if (v >= 6) return "bg-gold-700/30 text-gold-400";
  if (v >= 5) return "bg-gold-800/20 text-gold-500";
  return "bg-bg-secondary text-ivory-700";
}

const KPI = [
  { label: "Followers",      value: "42.8K", delta: "+2,140",  positive: true,  icon: Users          },
  { label: "Avg Eng Rate",   value: "8.4%",  delta: "+1.2%",   positive: true,  icon: Heart          },
  { label: "Weekly Reach",   value: "284K",  delta: "+41K",    positive: true,  icon: Eye            },
  { label: "Profile Visits", value: "18.4K", delta: "+3.2K",   positive: true,  icon: Globe          },
  { label: "Link Clicks",    value: "2,840", delta: "+612",    positive: true,  icon: ArrowUpRight   },
  { label: "DMs Received",   value: "318",   delta: "+89",     positive: true,  icon: MessageCircle  },
];

// ─── Main ─────────────────────────────────────────────────────────────────
export default function InstagramGrowth() {
  const [tab, setTab] = useState<"overview" | "content" | "hashtags" | "timing">("overview");
  const { metrics, loading: metricsLoading } = useInstagramGrowth();

  // Build KPI from real metrics when available, else mock
  const liveKPI = metrics
    ? [
        { label: "Followers",      value: `${(metrics.follower_snapshot.current / 1000).toFixed(1)}K`, delta: `+${metrics.follower_snapshot.gained_7d.toLocaleString()}`, positive: true, icon: Users },
        { label: "Avg Eng Rate",   value: `${metrics.engagement.avg_eng_rate.toFixed(1)}%`,  delta: "+1.2%",  positive: true, icon: Heart },
        { label: "Avg Reach",      value: `${Math.round(metrics.engagement.avg_reach / 1000)}K`,    delta: "+41K",   positive: true, icon: Eye },
        { label: "Avg Likes",      value: metrics.engagement.avg_likes.toFixed(0),          delta: "+124",   positive: true, icon: Star },
        { label: "Avg Comments",   value: metrics.engagement.avg_comments.toFixed(0),       delta: "+18",    positive: true, icon: MessageCircle },
        { label: "Growth %",       value: `+${metrics.follower_snapshot.growth_pct.toFixed(1)}%`, delta: "7 days", positive: true, icon: TrendingUp },
      ]
    : KPI;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ivory-100 flex items-center gap-2">
            <Instagram className="w-6 h-6 text-gold-500" />
            Instagram Growth Analytics
          </h2>
          <p className="text-xs text-ivory-700 mt-1 font-mono">Organic growth engine · Viral pattern analysis · Engagement optimization · Trend detection</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xl font-bold font-display text-gold-400">+422%</div>
            <div className="text-[10px] text-ivory-700">30-day growth</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-signal-bull live-dot" />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {liveKPI.map(k => (
          <div key={k.label} className="card-glass rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <k.icon className="w-3.5 h-3.5 text-gold-500" />
              <span className="text-[10px] font-mono text-signal-bull">↑{k.delta}</span>
            </div>
            <div className="text-lg font-bold font-display text-ivory-100">{k.value}</div>
            <div className="text-[9px] text-ivory-700 uppercase tracking-wider">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl border border-bg-border w-fit">
        {[
          { id: "overview",  label: "Growth Overview" },
          { id: "content",   label: "Content Analytics" },
          { id: "hashtags",  label: "Hashtags" },
          { id: "timing",    label: "Best Times" },
        ].map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id
                ? "bg-gold-600/20 text-gold-400 border border-gold-700/30"
                : "text-ivory-700 hover:text-ivory-400"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Follower growth chart */}
          <div className="lg:col-span-2 card-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold-500" />
                <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Follower Growth</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-gold-400">● Followers</span>
                <span className="text-signal-bull">● Gained</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={FOLLOWER_GROWTH} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gfoll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DAA520" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#DAA520" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ggain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#7A6E42" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#7A6E42" }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "#111114", border: "1px solid #B8860B40", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#B8A870" }} />
                <Area type="monotone" dataKey="followers" stroke="#DAA520" strokeWidth={2} fill="url(#gfoll)" dot={false} />
                <Area type="monotone" dataKey="gained" stroke="#00E676" strokeWidth={1.5} fill="url(#ggain)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Daily engagement */}
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Daily Engagement</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DAILY_ENGAGEMENT} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#7A6E42" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#7A6E42" }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background: "#111114", border: "1px solid #B8860B40", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#B8A870" }}
                  formatter={(v: number) => [`${v}%`, "Engagement"]} />
                <Bar dataKey="eng" radius={[3, 3, 0, 0]}>
                  {DAILY_ENGAGEMENT.map((d, i) => (
                    <Cell key={i} fill={d.eng >= 10 ? "#DAA520" : d.eng >= 8 ? "#8B6914" : "#4a3800"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top posts */}
          <div className="lg:col-span-3 card-glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-bg-border flex items-center gap-2">
              <Star className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Top Performing Posts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border">
                    {["Content", "Type", "Likes", "Comments", "Saved", "Reach", "Eng Rate"].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-[10px] text-ivory-700 uppercase tracking-wider font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {TOP_POSTS.map((p, i) => (
                    <tr key={i} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-ivory-200">{p.title}</td>
                      <td className="px-4 py-3">
                        <span className={`label-tag text-[9px] ${
                          p.type === "reel" ? "bg-purple-500/10 text-purple-400 border-purple-700/20" :
                          p.type === "story" ? "bg-blue-500/10 text-blue-400 border-blue-700/20" :
                          "bg-gold-500/10 text-gold-400 border-gold-700/20"
                        }`}>{p.type.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-ivory-400">{p.likes.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-ivory-400">{p.comments}</td>
                      <td className="px-4 py-3 font-mono text-ivory-400">{p.saved}</td>
                      <td className="px-4 py-3 font-mono text-ivory-400">{p.reach}</td>
                      <td className="px-4 py-3 font-mono font-bold text-signal-bull">{p.eng}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Content Analytics */}
      {tab === "content" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTENT_PERFORMANCE.map(cp => (
            <div key={cp.type} className="card-glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {cp.type === "Reels" ? <Play className="w-4 h-4" style={{ color: cp.color }} /> :
                   cp.type === "Stories" ? <Layers className="w-4 h-4" style={{ color: cp.color }} /> :
                   <Image className="w-4 h-4" style={{ color: cp.color }} />}
                  <span className="text-sm font-bold text-ivory-200">{cp.type}</span>
                </div>
                <span className="label-tag text-[10px]" style={{ color: cp.color, borderColor: `${cp.color}40`, backgroundColor: `${cp.color}15` }}>
                  {cp.posts} posts
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold font-display" style={{ color: cp.color }}>{cp.eng}%</div>
                  <div className="text-[9px] text-ivory-700 uppercase">Avg Engagement</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-display text-ivory-200">
                    {cp.reach >= 1000000 ? `${(cp.reach/1000000).toFixed(1)}M` : `${(cp.reach/1000).toFixed(0)}K`}
                  </div>
                  <div className="text-[9px] text-ivory-700 uppercase">Total Reach</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-display text-signal-bull">+{cp.posts}</div>
                  <div className="text-[9px] text-ivory-700 uppercase">Posts Made</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Hashtags */}
      {tab === "hashtags" && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-bg-border flex items-center gap-2">
            <Hash className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Hashtag Performance</span>
          </div>
          <div className="divide-y divide-bg-border">
            {HASHTAG_PERFORMANCE.map(h => (
              <div key={h.tag} className="flex items-center gap-4 px-4 py-3 hover:bg-bg-secondary/40 transition-colors">
                <span className="text-xs font-mono text-gold-400 flex-1">{h.tag}</span>
                <span className="text-[10px] text-ivory-700 font-mono w-16">{h.posts}M posts</span>
                <span className="text-[10px] font-mono text-signal-bull">{h.reach} reach</span>
                <span className={`label-tag text-[9px] ${
                  h.tier === "top" ? "bg-gold-500/10 text-gold-400 border-gold-700/20" :
                  h.tier === "brand" ? "bg-purple-500/10 text-purple-400 border-purple-700/20" :
                  h.tier === "media" ? "bg-blue-500/10 text-blue-400 border-blue-700/20" :
                  "bg-bg-secondary text-ivory-600 border-bg-border"
                }`}>{h.tier.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Best Times heatmap */}
      {tab === "timing" && (
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Optimal Posting Times (Engagement Score)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-ivory-700 uppercase tracking-wider font-semibold w-16">Time</th>
                  {DAYS.map(d => (
                    <th key={d} className="text-center px-2 py-2 text-ivory-600 uppercase tracking-wider font-semibold">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BEST_TIMES.map(row => (
                  <tr key={row.time}>
                    <td className="px-3 py-1.5 font-mono text-ivory-700">{row.time}</td>
                    {DAYS.map(d => {
                      const val = row[d.toLowerCase() as keyof typeof row] as number;
                      return (
                        <td key={d} className="px-1 py-1 text-center">
                          <div className={`mx-auto w-10 h-8 rounded-md flex items-center justify-center font-bold text-[11px] transition-all ${heatColor(val)}`}>
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-3 mt-4 text-[9px] text-ivory-700">
              <span>Scale:</span>
              {[3,5,6,7,8,9].map(v => (
                <div key={v} className={`w-7 h-5 rounded flex items-center justify-center text-[9px] font-mono ${heatColor(v)}`}>{v}</div>
              ))}
              <span>= engagement intensity</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
