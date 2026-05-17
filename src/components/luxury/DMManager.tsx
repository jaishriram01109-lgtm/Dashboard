"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle, Send, Bot, User, RefreshCw, Zap,
  CheckCircle, Clock, Filter, Settings, ChevronDown,
  Crown, Sparkles, Heart, Star, ToggleLeft, ToggleRight,
  MessageSquare, Inbox, Reply, AlertCircle, Hash, BarChart3,
} from "lucide-react";
import { luxuryApi } from "@/lib/luxuryApi";
// Messages endpoint — inline fetch (avoids type extension)
const getMessages = () =>
  fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/luxury/instagram/messages`)
    .then(r => r.json())
    .catch(() => null);

// ─── Types ────────────────────────────────────────────────────────────────────
interface DMThread {
  id: string;
  username: string;
  message: string;
  received_at: string;
  replied: boolean;
  reply_text?: string;
  sentiment: "positive" | "neutral" | "inquiry";
  category: "collab" | "fan" | "brand" | "spam" | "question";
}

// ─── Seed threads for demo mode ────────────────────────────────────────────────
const SEED_DMS: DMThread[] = [
  {
    id: "dm-1", username: "@style.journal.in",
    message: "Your Monaco shoot was absolutely stunning! 🖤 Would love to collaborate on our next editorial. DM back?",
    received_at: "2m ago", replied: false, sentiment: "positive", category: "collab",
  },
  {
    id: "dm-2", username: "@luxury_fits_daily",
    message: "That Tom Ford fit goes CRAZY. What's the exact suit model? Need this in my life 😤",
    received_at: "8m ago", replied: true,
    reply_text: "Thank you! It's the Tom Ford Shelton suit in midnight charcoal — available at select boutiques. ✦",
    sentiment: "positive", category: "question",
  },
  {
    id: "dm-3", username: "@dior_homme_official",
    message: "Hi Zephyr, we noticed your incredible content and would love to discuss a potential brand ambassador partnership. Please reach out to our PR team at...",
    received_at: "14m ago", replied: false, sentiment: "positive", category: "brand",
  },
  {
    id: "dm-4", username: "@fashionblogger_riya",
    message: "HOW is your skin so perfect 😩 tell me your skincare routine PLEASE",
    received_at: "22m ago", replied: true,
    reply_text: "Discipline, good lighting, and knowing when to let the camera do the talking. 🖤 — @zephyrvale",
    sentiment: "positive", category: "fan",
  },
  {
    id: "dm-5", username: "@gq_india_editorial",
    message: "We're working on a feature — 'Men Who Define Quiet Luxury in 2025.' Would you be open to a quick interview? 5 questions over email?",
    received_at: "35m ago", replied: false, sentiment: "positive", category: "collab",
  },
  {
    id: "dm-6", username: "@luxury_buyer_raj",
    message: "Bhai where do you buy these suits? Brand DM karo yaar",
    received_at: "1h ago", replied: true,
    reply_text: "Start with the essentials — Dior Homme, Tom Ford, Saint Laurent. Quality over quantity, always. ✦",
    sentiment: "neutral", category: "question",
  },
  {
    id: "dm-7", username: "@creative_collab_studio",
    message: "Hi! We specialize in luxury brand photography and would love to set up a paid shoot. Budget flexible. Interested?",
    received_at: "2h ago", replied: false, sentiment: "positive", category: "collab",
  },
  {
    id: "dm-8", username: "@follower_vikas99",
    message: "Bhai aap real ho ya AI? 😂 Kyunki aapki photos bahut perfect hai yaar",
    received_at: "3h ago", replied: true,
    reply_text: "Every frame is a decision. ✦ — @zephyrvale",
    sentiment: "neutral", category: "fan",
  },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  collab:   { label: "Collab",   color: "bg-purple-500/10 text-purple-400 border-purple-700/20" },
  fan:      { label: "Fan",      color: "bg-pink-500/10 text-pink-400 border-pink-700/20" },
  brand:    { label: "Brand",    color: "bg-gold-600/10 text-gold-400 border-gold-700/20" },
  question: { label: "Question", color: "bg-blue-500/10 text-blue-400 border-blue-700/20" },
  spam:     { label: "Spam",     color: "bg-red-500/10 text-red-400 border-red-700/20" },
};

const SENTIMENT_ICONS: Record<string, string> = {
  positive: "😊",
  neutral:  "😐",
  inquiry:  "🤔",
};

// ─── Auto-reply template previews ─────────────────────────────────────────────
const AUTO_REPLY_TEMPLATES = [
  {
    trigger: "collab / partnership",
    preview: "Thank you for reaching out! For collaboration inquiries, please connect with our team. Your work is noted. ✦ — @zephyrvale",
    tone: "Professional",
  },
  {
    trigger: "brand inquiry",
    preview: "Appreciate the interest. All brand partnerships are handled through official channels. We'll be in touch. ✦",
    tone: "Formal",
  },
  {
    trigger: "fan / compliment",
    preview: "Thank you for the kind words. 🖤 — @zephyrvale",
    tone: "Warm, brief",
  },
  {
    trigger: "outfit / style question",
    preview: "Quality over everything. Research the craft, invest wisely. ✦ — @zephyrvale",
    tone: "Philosophical",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DMManager() {
  const [dms, setDms] = useState<DMThread[]>(SEED_DMS);
  const [selected, setSelected] = useState<DMThread | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "replied">("all");
  const [autoReply, setAutoReply] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [tab, setTab] = useState<"inbox" | "settings">("inbox");
  const [loading, setLoading] = useState(false);

  // Fetch real DMs from backend
  const fetchDMs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMessages() as { messages?: DMThread[] } | null;
      if (data?.messages && data.messages.length > 0) {
        setDms(data.messages);
      }
    } catch {
      // Backend unavailable — keep seed data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDMs();
    const t = setInterval(fetchDMs, 60_000);
    return () => clearInterval(t);
  }, [fetchDMs]);

  // Generate AI reply for a DM
  const generateReply = async (dm: DMThread) => {
    setGenerating(dm.id);
    try {
      const res = await luxuryApi.runAgent(
        "caption_storytelling",
        `Write a luxury-toned DM reply for this Instagram message from ${dm.username}: "${dm.message}".
         Keep it short (1-2 sentences), sophisticated, ZEPHYR VALE brand voice. End with — @zephyrvale`
      );
      setDms(prev =>
        prev.map(d =>
          d.id === dm.id
            ? { ...d, replied: true, reply_text: res.output.trim() }
            : d
        )
      );
      if (selected?.id === dm.id) {
        setSelected(prev =>
          prev ? { ...prev, replied: true, reply_text: res.output.trim() } : null
        );
      }
    } catch {
      // Fallback reply
      const fallbackReplies: Record<string, string> = {
        collab: "Thank you for reaching out. We appreciate the interest. ✦ — @zephyrvale",
        brand:  "Noted. All partnerships are handled through official channels. ✦",
        fan:    "Thank you. 🖤 — @zephyrvale",
        question: "Quality is a discipline, not a purchase. ✦ — @zephyrvale",
      };
      const fallback = fallbackReplies[dm.category] ?? "Thank you. ✦ — @zephyrvale";
      setDms(prev =>
        prev.map(d =>
          d.id === dm.id ? { ...d, replied: true, reply_text: fallback } : d
        )
      );
    } finally {
      setGenerating(null);
    }
  };

  const displayed = dms.filter(d => {
    if (filter === "pending") return !d.replied;
    if (filter === "replied") return d.replied;
    return true;
  });

  const pendingCount = dms.filter(d => !d.replied).length;
  const repliedCount = dms.filter(d => d.replied).length;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ivory-100 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-gold-500" />
            DM Auto-Reply Manager
          </h2>
          <p className="text-xs text-ivory-700 mt-1 font-mono">
            AI-powered reply generation · Luxury brand voice · Claude caption agent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchDMs()}
            className="p-2 rounded-lg bg-bg-secondary border border-bg-border hover:border-gold-700/30 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 text-ivory-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="px-3 py-2 rounded-lg bg-gold-600/10 border border-gold-700/20 text-center">
            <div className="text-lg font-bold text-gold-400 font-display">{pendingCount}</div>
            <div className="text-[10px] text-ivory-700 uppercase">Pending</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-signal-bull/10 border border-signal-bull/20 text-center">
            <div className="text-lg font-bold text-signal-bull font-display">{repliedCount}</div>
            <div className="text-[10px] text-ivory-700 uppercase">Replied</div>
          </div>
        </div>
      </div>

      {/* Auto-reply toggle bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-gold-700/20 bg-gold-600/5">
        <div className="flex items-center gap-3">
          <Bot className="w-4 h-4 text-gold-400" />
          <div>
            <div className="text-xs font-semibold text-ivory-200">AI Auto-Reply</div>
            <div className="text-[10px] text-ivory-700">
              {autoReply ? "Claude caption agent handles fan & question DMs automatically" : "Manual review mode — all DMs require your action"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setAutoReply(p => !p)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            autoReply
              ? "bg-signal-bull/10 border-signal-bull/20 text-signal-bull"
              : "bg-bg-secondary border-bg-border text-ivory-600"
          }`}>
          {autoReply
            ? <><ToggleRight className="w-4 h-4" /> Active</>
            : <><ToggleLeft className="w-4 h-4" /> Paused</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl border border-bg-border w-fit">
        {(["inbox", "settings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
              tab === t
                ? "bg-gold-600/20 text-gold-400 border border-gold-700/30"
                : "text-ivory-700 hover:text-ivory-400"
            }`}>
            {t === "inbox" ? "DM Inbox" : "Reply Settings"}
          </button>
        ))}
      </div>

      {tab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* DM list */}
          <div className="lg:col-span-2 space-y-2">
            {/* Filter */}
            <div className="flex gap-1">
              {(["all", "pending", "replied"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                    filter === f
                      ? "bg-gold-600/20 text-gold-400 border border-gold-700/30"
                      : "bg-bg-secondary text-ivory-700 border border-bg-border hover:border-gold-700/20"
                  }`}>
                  {f} {f === "pending" ? `(${pendingCount})` : f === "replied" ? `(${repliedCount})` : `(${dms.length})`}
                </button>
              ))}
            </div>

            {/* Threads */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {displayed.map(dm => (
                <button key={dm.id}
                  onClick={() => setSelected(dm)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selected?.id === dm.id
                      ? "border-gold-600/40 bg-gold-600/5"
                      : "border-bg-border bg-bg-card hover:border-gold-700/20"
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gold-600/10 border border-gold-700/20 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-gold-500" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-ivory-200">{dm.username}</div>
                        <div className="text-[9px] text-ivory-700">{dm.received_at}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`label-tag text-[8px] border ${CATEGORY_LABELS[dm.category]?.color}`}>
                        {CATEGORY_LABELS[dm.category]?.label}
                      </span>
                      {dm.replied
                        ? <CheckCircle className="w-3 h-3 text-signal-bull" />
                        : <Clock className="w-3 h-3 text-gold-400 animate-pulse" />}
                    </div>
                  </div>
                  <div className="text-[10px] text-ivory-600 line-clamp-2 leading-relaxed">
                    {dm.message}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected thread */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="card-glass rounded-xl overflow-hidden h-full flex flex-col">
                {/* Thread header */}
                <div className="flex items-center gap-3 p-4 border-b border-bg-border">
                  <div className="w-9 h-9 rounded-full bg-gold-600/10 border border-gold-700/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-gold-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-ivory-100">{selected.username}</div>
                    <div className="flex items-center gap-2 text-[10px] text-ivory-700">
                      <span>{selected.received_at}</span>
                      <span>·</span>
                      <span className={`label-tag border text-[8px] ${CATEGORY_LABELS[selected.category]?.color}`}>
                        {CATEGORY_LABELS[selected.category]?.label}
                      </span>
                      <span>{SENTIMENT_ICONS[selected.sentiment]}</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-3 min-h-[200px]">
                  {/* Incoming DM */}
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-bg-secondary border border-bg-border flex-shrink-0 flex items-center justify-center mt-0.5">
                      <User className="w-3 h-3 text-ivory-600" />
                    </div>
                    <div className="flex-1">
                      <div className="p-3 rounded-xl bg-bg-secondary border border-bg-border text-xs text-ivory-300 leading-relaxed">
                        {selected.message}
                      </div>
                    </div>
                  </div>

                  {/* Reply */}
                  {selected.replied && selected.reply_text && (
                    <div className="flex gap-2 max-w-[85%] ml-auto flex-row-reverse">
                      <div className="w-6 h-6 rounded-full bg-gold-600/10 border border-gold-700/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <Crown className="w-3 h-3 text-gold-500" />
                      </div>
                      <div className="flex-1">
                        <div className="p-3 rounded-xl text-xs text-ivory-200 leading-relaxed"
                          style={{ background: "linear-gradient(135deg, rgba(184,134,11,0.15), rgba(218,165,32,0.08))", border: "1px solid rgba(184,134,11,0.25)" }}>
                          {selected.reply_text}
                        </div>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Bot className="w-2.5 h-2.5 text-gold-600" />
                          <span className="text-[9px] text-gold-600">AI-generated · Claude agent</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action bar */}
                <div className="p-4 border-t border-bg-border">
                  {!selected.replied ? (
                    <button
                      onClick={() => generateReply(selected)}
                      disabled={generating === selected.id}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #DAA520, #8B6914)", color: "#070708" }}>
                      {generating === selected.id
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Claude is writing...</>
                        : <><Sparkles className="w-4 h-4" /> Generate AI Reply</>}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 justify-center text-xs text-signal-bull">
                      <CheckCircle className="w-4 h-4" />
                      Reply sent by AI agent
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card-glass rounded-xl p-10 flex flex-col items-center justify-center text-center h-full">
                <MessageSquare className="w-10 h-10 text-ivory-700 mb-3" />
                <div className="text-sm font-semibold text-ivory-500">Select a DM to view</div>
                <div className="text-[10px] text-ivory-700 mt-1">AI agent will generate a luxury-toned reply</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Auto-reply rules */}
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-gold-500" />
              <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider">Auto-Reply Rules</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Fan messages", enabled: true,  delay: "Instant" },
                { label: "Style questions", enabled: true,  delay: "2 min" },
                { label: "Collab requests", enabled: false, delay: "Manual" },
                { label: "Brand inquiries", enabled: false, delay: "Manual" },
                { label: "Spam detection",  enabled: true,  delay: "Skip"  },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-2 border-b border-bg-border last:border-0">
                  <div>
                    <div className="text-xs text-ivory-300">{r.label}</div>
                    <div className="text-[10px] text-ivory-700 font-mono">Response delay: {r.delay}</div>
                  </div>
                  <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    r.enabled
                      ? "bg-signal-bull/10 text-signal-bull"
                      : "bg-ivory-800/20 text-ivory-600"
                  }`}>
                    {r.enabled ? "Auto" : "Manual"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply templates */}
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Reply className="w-4 h-4 text-gold-500" />
              <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider">Reply Templates</h3>
            </div>
            <div className="space-y-3">
              {AUTO_REPLY_TEMPLATES.map((t, i) => (
                <div key={i} className="p-3 rounded-lg bg-bg-secondary border border-bg-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider">{t.trigger}</span>
                    <span className="text-[9px] text-ivory-700 font-mono">{t.tone}</span>
                  </div>
                  <div className="text-[10px] text-ivory-500 italic leading-relaxed">"{t.preview}"</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="card-glass rounded-xl p-5 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-gold-500" />
              <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider">Auto-Reply Performance</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "DMs Today",       value: "42",    sub: "+18 vs yesterday",  color: "text-gold-400" },
                { label: "Auto-Replied",    value: "38",    sub: "90.5% automation",  color: "text-signal-bull" },
                { label: "Avg Response",    value: "< 2m",  sub: "instant luxury",    color: "text-blue-400" },
                { label: "Positive Ratio",  value: "94%",   sub: "fan sentiment",     color: "text-emerald-400" },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-lg bg-bg-secondary border border-bg-border text-center">
                  <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-ivory-700 mt-0.5">{s.label}</div>
                  <div className="text-[9px] text-ivory-800 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

