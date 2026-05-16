"use client";

import { useState } from "react";
import {
  CheckCircle, XCircle, Edit3, Clock, Calendar, Send,
  Image, Film, Layers, Heart, Eye, Hash, MessageSquare,
  ArrowRight, Crown, Sparkles, AlertCircle, ChevronDown,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
type ContentItem = {
  id: number;
  type: "photo" | "reel" | "story";
  title: string;
  caption: string;
  hashtags: string;
  hook: string;
  scheduledFor: string;
  generatedBy: string;
  qualityScore: number;
  engPrediction: string;
  reachPrediction: string;
  brand: string;
  bgGrad: string;
  status: "pending" | "approved" | "rejected" | "editing";
};

// ─── Mock queue ─────────────────────────────────────────────────────────────
const INITIAL_QUEUE: ContentItem[] = [
  {
    id: 1,
    type: "reel",
    title: "Tom Ford Black Orchid Morning",
    caption: `The morning belongs to those who move in silence. 🖤\n\nEverything intentional. Nothing explained.\n\n— @zephyrvale`,
    hashtags: "#TomFord #QuietLuxury #OldMoney #MorningRoutine #LuxuryLifestyle #MensFashion #FashionReel",
    hook: "POV: Your morning routine costs more than most people's rent 👀",
    scheduledFor: "Today 8:00 PM IST",
    generatedBy: "Creative Director + Caption Agent",
    qualityScore: 97,
    engPrediction: "14–18%",
    reachPrediction: "38–52K",
    brand: "Tom Ford",
    bgGrad: "from-zinc-900 via-stone-900 to-zinc-900",
    status: "pending",
  },
  {
    id: 2,
    type: "photo",
    title: "Monaco Midnight — Dior",
    caption: `Some nights the city lights are just background noise for what you're building. 🌙\n\n#DiorHomme`,
    hashtags: "#DiorHomme #Monaco #LuxuryFashion #OldMoney #MensFashion #GQ #FashionEditorial #QuietLuxury",
    hook: "",
    scheduledFor: "Tomorrow 7:00 AM IST",
    generatedBy: "Prompt Engineer + Caption Agent",
    qualityScore: 98,
    engPrediction: "10–13%",
    reachPrediction: "22–30K",
    brand: "Dior",
    bgGrad: "from-slate-900 via-gray-900 to-slate-900",
    status: "pending",
  },
  {
    id: 3,
    type: "story",
    title: "Behind The Scenes — Milan",
    caption: "Behind every curated frame is 4 AM discipline. — Story Series",
    hashtags: "#MilanFashionWeek #BTS #FashionWeek #LuxuryFashion",
    hook: "",
    scheduledFor: "Tomorrow 12:00 PM IST",
    generatedBy: "Creative Director + Automation Agent",
    qualityScore: 92,
    engPrediction: "7–10%",
    reachPrediction: "12–18K",
    brand: "Mixed Editorial",
    bgGrad: "from-neutral-900 via-stone-900 to-neutral-900",
    status: "approved",
  },
  {
    id: 4,
    type: "photo",
    title: "Rolls Royce Midnight Edit",
    caption: `Not loud. Not flashy. Just unmistakably right. ✦\n\n— @zephyrvale`,
    hashtags: "#RollsRoyce #LuxuryLifestyle #OldMoney #QuietLuxury #LuxuryCar #MensFashion",
    hook: "The car that whispers more than it roars 🖤",
    scheduledFor: "Fri 8:00 PM IST",
    generatedBy: "Creative Director + Stylist Agent",
    qualityScore: 95,
    engPrediction: "9–12%",
    reachPrediction: "24–34K",
    brand: "Rolls Royce x Fashion",
    bgGrad: "from-gray-900 via-zinc-900 to-gray-900",
    status: "pending",
  },
  {
    id: 5,
    type: "reel",
    title: "Gucci Spring Campaign Teaser",
    caption: `Spring 2025. No explanation needed. 🌿\n\n@Gucci`,
    hashtags: "#Gucci #GucciSS25 #LuxuryFashion #FashionWeek #MensFashion #SpringFashion",
    hook: "When @gucci says 'wear this' — you wear it 🐍",
    scheduledFor: "Sat 11:00 AM IST",
    generatedBy: "Creative Director + Fashion Stylist",
    qualityScore: 96,
    engPrediction: "13–17%",
    reachPrediction: "30–45K",
    brand: "Gucci",
    bgGrad: "from-stone-900 via-neutral-900 to-stone-900",
    status: "pending",
  },
];

function ContentTypeIcon({ type }: { type: string }) {
  if (type === "reel") return <Film className="w-4 h-4 text-purple-400" />;
  if (type === "story") return <Layers className="w-4 h-4 text-blue-400" />;
  return <Image className="w-4 h-4 text-gold-400" />;
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 96 ? "bg-signal-bull/10 text-signal-bull border-signal-bull/20"
    : score >= 90 ? "bg-gold-500/10 text-gold-400 border-gold-700/20"
    : "bg-ivory-800/20 text-ivory-500 border-ivory-800/20";
  return (
    <span className={`label-tag text-[10px] ${color}`}>{score}/100</span>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function ApprovalQueue() {
  const [items, setItems] = useState<ContentItem[]>(INITIAL_QUEUE);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState("");

  const pending = items.filter(i => i.status === "pending");
  const approved = items.filter(i => i.status === "approved");
  const rejected = items.filter(i => i.status === "rejected");

  const approve = (id: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "approved" } : i));

  const reject = (id: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "rejected" } : i));

  const startEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setEditCaption(item.caption);
  };

  const saveEdit = (id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, caption: editCaption } : i));
    setEditingId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ivory-100 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-gold-500" />
            Content Approval Queue
          </h2>
          <p className="text-xs text-ivory-700 mt-1 font-mono">Final review before posting · Your approval is the only human step required</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-gold-600/10 border border-gold-700/20 text-center">
            <div className="text-lg font-bold text-gold-400 font-display">{pending.length}</div>
            <div className="text-[10px] text-ivory-700 uppercase">Awaiting</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-signal-bull/10 border border-signal-bull/20 text-center">
            <div className="text-lg font-bold text-signal-bull font-display">{approved.length}</div>
            <div className="text-[10px] text-ivory-700 uppercase">Approved</div>
          </div>
        </div>
      </div>

      {/* Pending alert banner */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gold-700/30 bg-gold-600/5">
          <AlertCircle className="w-4 h-4 text-gold-400 shrink-0" />
          <span className="text-xs text-gold-300">
            <strong>{pending.length} content pieces</strong> are ready and waiting for your approval before they go live.
            Review and approve to maintain your posting schedule.
          </span>
        </div>
      )}

      {/* Content cards */}
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id}
            className={`card-glass rounded-xl overflow-hidden border transition-all ${
              item.status === "approved" ? "border-signal-bull/30 opacity-80" :
              item.status === "rejected" ? "border-signal-bear/20 opacity-50" :
              item.status === "pending" ? "border-gold-700/30" : "border-bg-border"
            }`}>

            {/* Card header */}
            <div className="flex items-center gap-4 p-4 border-b border-bg-border/60">
              {/* Content preview swatch */}
              <div className={`shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${item.bgGrad} flex items-center justify-center border border-white/5`}>
                <ContentTypeIcon type={item.type} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-ivory-100">{item.title}</span>
                  <ScorePill score={item.qualityScore} />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-ivory-700">
                  <span className="font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.scheduledFor}
                  </span>
                  <span>·</span>
                  <span>{item.brand}</span>
                  <span>·</span>
                  <span className="text-signal-bull">↑{item.engPrediction} predicted</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.status === "pending" && (
                  <>
                    <button
                      onClick={() => startEdit(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-secondary border border-bg-border hover:border-gold-700/30 text-xs text-ivory-500 hover:text-ivory-200 transition-all">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => reject(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-signal-bear/10 border border-signal-bear/20 hover:bg-signal-bear/20 text-xs text-signal-bear transition-all">
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                    <button
                      onClick={() => approve(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: "linear-gradient(135deg, #DAA520, #8B6914)", color: "#070708" }}>
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                  </>
                )}
                {item.status === "approved" && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-signal-bull/10 border border-signal-bull/20 text-xs text-signal-bull">
                    <CheckCircle className="w-3 h-3" /> Approved
                  </span>
                )}
                {item.status === "rejected" && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-signal-bear/10 border border-signal-bear/20 text-xs text-signal-bear">
                    <XCircle className="w-3 h-3" /> Rejected
                  </span>
                )}
                <button
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="p-1.5 rounded-lg bg-bg-secondary border border-bg-border hover:border-gold-700/20 transition-colors">
                  <ChevronDown className={`w-3.5 h-3.5 text-ivory-600 transition-transform ${expanded === item.id ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === item.id && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-bg-border/40 animate-slide-in">
                {/* Caption */}
                <div>
                  <div className="text-[10px] text-ivory-700 uppercase tracking-wider mb-2">Caption</div>
                  {editingId === item.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editCaption}
                        onChange={e => setEditCaption(e.target.value)}
                        rows={4}
                        className="w-full bg-bg-secondary border border-gold-700/30 rounded-lg px-3 py-2 text-xs text-ivory-300 font-mono resize-none focus:outline-none focus:border-gold-600/50" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-gold-600/20 border border-gold-700/30 text-[10px] text-gold-400 hover:bg-gold-600/30 transition-colors">
                          Save Edit
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg bg-bg-secondary border border-bg-border text-[10px] text-ivory-600 hover:text-ivory-300 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-bg-secondary border border-bg-border text-xs text-ivory-400 leading-relaxed whitespace-pre-wrap">
                      {item.caption}
                    </div>
                  )}

                  {item.hook && (
                    <div className="mt-3">
                      <div className="text-[10px] text-ivory-700 uppercase tracking-wider mb-1">Reel Hook</div>
                      <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-700/20 text-xs text-purple-300 italic">
                        "{item.hook}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] text-ivory-700 uppercase tracking-wider mb-1.5">Hashtags</div>
                    <div className="p-2.5 rounded-lg bg-bg-secondary border border-bg-border text-[10px] text-gold-600/80 font-mono leading-relaxed">
                      {item.hashtags}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Quality Score",     value: `${item.qualityScore}/100`, color: "text-signal-bull" },
                      { label: "Eng Prediction",    value: item.engPrediction,         color: "text-gold-400"    },
                      { label: "Reach Prediction",  value: item.reachPrediction,       color: "text-blue-400"    },
                      { label: "Generated By",      value: "AI Agents",               color: "text-ivory-500"   },
                    ].map(m => (
                      <div key={m.label} className="p-2 rounded-lg bg-bg-secondary border border-bg-border">
                        <div className="text-[9px] text-ivory-700 uppercase tracking-wider">{m.label}</div>
                        <div className={`text-xs font-semibold font-mono mt-0.5 ${m.color}`}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] text-ivory-700 uppercase tracking-wider mb-1.5">Scheduled For</div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-secondary border border-bg-border">
                      <Calendar className="w-3.5 h-3.5 text-gold-500" />
                      <span className="text-xs font-mono text-gold-400">{item.scheduledFor}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: "Total in Queue",  value: items.length,    color: "text-ivory-300" },
          { label: "Approved",        value: approved.length, color: "text-signal-bull" },
          { label: "Rejected",        value: rejected.length, color: "text-signal-bear" },
        ].map(s => (
          <div key={s.label} className="card-glass rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-ivory-700 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
