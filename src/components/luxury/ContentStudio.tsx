"use client";

import { useState } from "react";
import {
  Wand2, Camera, Film, Layers, Type, Copy, RefreshCw,
  Sparkles, Image, Play, ChevronDown, Plus, CheckCircle,
  Clock, Zap, Star, Crown, Hash, Send, Loader2,
} from "lucide-react";
import { useLuxuryPrompt } from "@/lib/useLuxuryAgent";

// ─── Mock data ─────────────────────────────────────────────────────────────
const CONTENT_TYPES = [
  { id: "photo",   label: "Luxury Photo",   icon: Camera, color: "text-gold-400"   },
  { id: "reel",    label: "Cinematic Reel", icon: Film,   color: "text-purple-400" },
  { id: "story",   label: "Story Series",  icon: Layers, color: "text-blue-400"   },
  { id: "caption", label: "Caption + Hook",icon: Type,   color: "text-teal-400"   },
];

const LOCATIONS = [
  "Monaco Yacht Club", "Paris Rooftop", "Milan Fashion District",
  "Amalfi Coast Villa", "Swiss Alpine Chalet", "Dubai Penthouse",
  "Tokyo Luxury Hotel", "London Private Club", "NYC Soho Studio",
];

const OUTFITS = [
  "Dior Homme SS25 Suit", "Tom Ford Tuxedo", "Saint Laurent All-Black",
  "Gucci Heritage Blazer", "Brunello Cucinelli Cashmere", "Armani Linen",
  "Loro Piana Weekend", "Off-White Streetwear", "Prada Nylon Collection",
];

const MOODS = [
  "Mysterious & Brooding", "Confident & Powerful", "Relaxed Elegance",
  "Fashion Week Intensity", "Old Money Leisure", "Editorial Cinematic",
  "Raw Masculine Energy", "Quiet Contemplation",
];

const LIGHTING = [
  "Golden hour natural", "Studio Rembrandt", "Moonlit cinematic",
  "Morning window light", "Harsh editorial flash", "Cloudy diffused",
  "Neon ambient luxury", "Fireplace warm glow",
];

const GENERATED_PROMPTS: Array<{
  id: number; type: string; title: string; prompt: string;
  caption: string; hashtags: string; hook: string; status: string;
}> = [
  {
    id: 1,
    type: "photo",
    title: "Monaco Midnight",
    prompt: "Hyper realistic luxury male model ZEPHYR VALE, same consistent face, sharp jawline, deep-set hunter eyes, natural skin texture with visible pores, wearing Dior Homme SS25 charcoal suit, standing on Monaco yacht deck at midnight, golden ambient lighting from city below, cinematic depth of field, Sony A7R V realism, Vogue editorial composition, premium masculine aura, 8K ultra detail, GQ fashion magazine quality, old money energy, mysterious expression.",
    caption: "Some nights, the city belongs to those who refuse to be ordinary. 🥂\n\n— @zephyrvale",
    hashtags: "#LuxuryFashion #MonacoLife #DiorHomme #OldMoney #FashionEditorial #LuxuryMenStyle #GQ #MensFashion #QuietLuxury #FashionWeek",
    hook: "POV: You built an empire before 30 🖤",
    status: "ready",
  },
  {
    id: 2,
    type: "reel",
    title: "Tom Ford Morning",
    prompt: "Cinematic 4K video style, ZEPHYR VALE luxury male model, same face identity, morning hotel suite, golden sunrise through floor-to-ceiling windows, slow motion grooming ritual, Tom Ford Black Orchid fragrance on marble counter, steam from espresso, black silk robe, hyper realistic skin, editorial close-up cuts, luxury lifestyle, cinematic color grading, GQ video editorial quality.",
    caption: "Morning routines of the disciplined. Every detail intentional. 🖤\n\n#TomFord @TomFord",
    hashtags: "#TomFord #LuxuryLifestyle #MorningRoutine #MenOfStyle #LuxuryFashion #QuietLuxury #OldMoney #FashionReel #Viral",
    hook: "The morning routine that costs ₹0 but looks like it costs ₹10L 👀",
    status: "ready",
  },
  {
    id: 3,
    type: "photo",
    title: "Paris Rooftop Saint Laurent",
    prompt: "Hyper realistic editorial photograph, ZEPHYR VALE, same consistent masculine face, Saint Laurent all-black structured jacket, Paris skyline golden hour, Eiffel Tower blurred background, RAW DSLR depth of field, Hasselblad medium format quality, natural shadow casting, authentic luxury, GQ France editorial composition, mysterious confident gaze, ultra detailed fabric texture, premium color grading.",
    caption: "Paris doesn't impress everyone. Only those who've earned it. ✦\n\n— @zephyrvale",
    hashtags: "#SaintLaurent #ParisFashion #LuxuryFashion #MensFashion #FashionEditorial #OldMoney #FashionWeek #GQ #QuietLuxury",
    hook: "When you blend into Paris like you were born there 🗼",
    status: "generating",
  },
];

const QUEUE = [
  { title: "Dior SS25 Portrait",    type: "photo",   eta: "Ready",    priority: "high" },
  { title: "Monaco Reel",           type: "reel",    eta: "3 min",    priority: "high" },
  { title: "Armani Story Series",   type: "story",   eta: "6 min",    priority: "med"  },
  { title: "LV Travel Editorial",   type: "photo",   eta: "8 min",    priority: "med"  },
  { title: "Gucci Streetwear BTS",  type: "reel",    eta: "12 min",   priority: "low"  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────
function Select({ label, options, value, onChange }: {
  label: string; options: string[]; value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] text-ivory-700 uppercase tracking-wider mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-bg-secondary border border-bg-border rounded-lg px-3 py-2 text-xs text-ivory-300 focus:outline-none focus:border-gold-700/50 cursor-pointer">
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-2 w-3.5 h-3.5 text-ivory-700 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function ContentStudio() {
  const [activeType, setActiveType] = useState("photo");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [outfit, setOutfit] = useState(OUTFITS[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [lighting, setLighting] = useState(LIGHTING[0]);
  const [tab, setTab] = useState<"builder" | "queue" | "library">("builder");
  const [copied, setCopied] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgGenLoading, setImgGenLoading] = useState(false);
  const [sentToQueue, setSentToQueue] = useState(false);

  const { loading: genLoading, result: genResult, generate } = useLuxuryPrompt();

  // Effective options: backend result when available, else first static item
  const previewPrompt = genResult?.image_prompt ?? GENERATED_PROMPTS[0].prompt;
  const previewCaption = genResult?.caption ?? GENERATED_PROMPTS[0].caption;
  const previewHashtags = genResult?.hashtags ?? GENERATED_PROMPTS[0].hashtags;
  const previewHook = genResult?.hook ?? GENERATED_PROMPTS[0].hook;
  const qualityScore = genResult?.quality_score;

  const handleGenerate = () => {
    setImageUrl(null);
    setSentToQueue(false);
    generate({
      content_type: activeType as "photo" | "reel" | "story" | "caption",
      location,
      outfit,
      mood,
      lighting,
    });
  };

  // Full pipeline: generate image via backend
  const handleFullGenerate = async () => {
    setImgGenLoading(true);
    setSentToQueue(false);
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${BASE}/api/luxury/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: previewPrompt,
          negative_prompt: "cartoon, anime, artificial, plastic face, low quality",
          width: 1024, height: 1280,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) setImageUrl(data.url);
      }
    } catch {
      // Backend unavailable — show placeholder
      setImageUrl(`https://placehold.co/1024x1280/0d0b06/DAA520?text=ZEPHYR+VALE%0AFLUX+Generation`);
    } finally {
      setImgGenLoading(false);
    }
  };

  const handleSendToQueue = async () => {
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${BASE}/api/luxury/content/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_type: activeType,
          location, outfit, mood, lighting,
        }),
      });
    } catch { /* ignore */ }
    setSentToQueue(true);
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ivory-100 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-gold-500" />
            AI Content Studio
          </h2>
          <p className="text-xs text-ivory-700 mt-1 font-mono">Prompt engineering · Image & reel generation · Caption intelligence · Viral hook writer</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-mono text-signal-bull">156 assets generated</div>
            <div className="text-[10px] text-ivory-700">All face-consistent</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-signal-bull/10 border border-signal-bull/20 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-signal-bull" />
          </div>
        </div>
      </div>

      {/* Content type selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CONTENT_TYPES.map(ct => (
          <button key={ct.id}
            onClick={() => setActiveType(ct.id)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
              activeType === ct.id
                ? "border-gold-600/50 bg-gold-600/10"
                : "border-bg-border bg-bg-card hover:border-gold-700/30"
            }`}>
            <ct.icon className={`w-5 h-5 ${ct.color}`} />
            <div className="text-left">
              <div className="text-xs font-semibold text-ivory-200">{ct.label}</div>
              <div className="text-[10px] text-ivory-700">{ct.id === "photo" ? "FLUX · SDXL" : ct.id === "reel" ? "Runway · Kling" : ct.id === "story" ? "Multi-frame" : "GPT-4o"}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl border border-bg-border w-fit">
        {[
          { id: "builder", label: "Prompt Builder" },
          { id: "queue",   label: "Generation Queue" },
          { id: "library", label: "Generated Library" },
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

      {/* Tab: Prompt Builder */}
      {tab === "builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Controls */}
          <div className="space-y-4">
            <div className="card-glass rounded-xl p-5">
              <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-500" /> Scene Parameters
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Location" options={LOCATIONS} value={location} onChange={setLocation} />
                <Select label="Outfit" options={OUTFITS} value={outfit} onChange={setOutfit} />
                <Select label="Mood / Expression" options={MOODS} value={mood} onChange={setMood} />
                <Select label="Lighting" options={LIGHTING} value={lighting} onChange={setLighting} />
              </div>
            </div>

            <div className="card-glass rounded-xl p-5">
              <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold-500" /> Quality Parameters
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Realism Level",      value: "Hyper-Realistic", active: true  },
                  { label: "Camera Style",        value: "Sony A7R V RAW",  active: true  },
                  { label: "Face Consistency",    value: "LoRA-Locked",     active: true  },
                  { label: "Skin Detail",         value: "Pore-Level",      active: true  },
                  { label: "Background Blur",     value: "f/1.4 Bokeh",     active: true  },
                  { label: "Color Grade",         value: "Luxury Editorial", active: true  },
                  { label: "Anti-AI Detection",   value: "Noise Injection",  active: true  },
                ].map(p => (
                  <div key={p.label} className="flex items-center justify-between">
                    <span className="text-xs text-ivory-600">{p.label}</span>
                    <span className={`text-xs font-mono font-semibold ${p.active ? "text-signal-bull" : "text-ivory-700"}`}>
                      {p.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={genLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #DAA520, #8B6914)", color: "#070708" }}>
              {genLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Prompt...</>
                : <><Wand2 className="w-4 h-4" /> Generate Prompt + Caption</>}
            </button>

            <button
              onClick={handleFullGenerate}
              disabled={imgGenLoading || !previewPrompt}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed border border-gold-700/30 bg-gold-600/5 text-gold-400 hover:bg-gold-600/10">
              {imgGenLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> FLUX Generating Image...</>
                : <><Image className="w-4 h-4" /> Generate Image (FLUX.1-dev)</>}
            </button>
          </div>

          {/* Live prompt preview */}
          <div className="card-glass rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-500" /> Live Prompt Preview
              </h3>
              <button className="flex items-center gap-1.5 text-[10px] text-gold-400 hover:text-gold-300 transition-colors"
                onClick={() => handleCopy(0, previewPrompt)}>
                {copied === 0 ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === 0 ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="p-4 rounded-lg bg-bg-secondary border border-bg-border font-mono text-[11px] text-ivory-400 leading-relaxed min-h-32">
              {genResult
                ? previewPrompt
                : <>Hyper realistic luxury male model <span className="text-gold-400">ZEPHYR VALE</span>, same consistent face, sharp jawline, deep-set hunter eyes, natural skin texture with visible pores, wearing <span className="text-blue-400">{outfit}</span>, at <span className="text-purple-400">{location}</span>, <span className="text-teal-400">{lighting}</span>, {mood.toLowerCase()} expression, cinematic depth of field, Sony A7R V realism, Vogue editorial composition, premium masculine aura, 8K ultra detail, GQ fashion magazine quality.</>}
              {qualityScore && (
                <div className="mt-2 text-[10px] text-signal-bull font-sans">Quality Score: {qualityScore}/100</div>
              )}
            </div>

            {/* Negative prompt */}
            <div>
              <div className="text-[10px] text-ivory-700 uppercase tracking-wider mb-2">Negative Prompt</div>
              <div className="p-3 rounded-lg bg-signal-bear/5 border border-signal-bear/10 font-mono text-[10px] text-ivory-700 leading-relaxed">
                cartoon, anime, AI-looking skin, plastic face, over-symmetry, unreal lighting, low quality, blurry, watermark, signature, fake luxury, generic model, cheap fashion, distorted face, wrong hands
              </div>
            </div>

            {/* Caption + Hook */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] text-ivory-700 uppercase tracking-wider flex items-center gap-1">
                    <Type className="w-3 h-3" /> Caption
                  </div>
                  <button onClick={() => handleCopy(1, previewCaption)}
                    className="flex items-center gap-1 text-[9px] text-gold-500 hover:text-gold-300">
                    {copied === 1 ? <CheckCircle className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                    {copied === 1 ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-bg-secondary border border-bg-border text-xs text-ivory-400 leading-relaxed">
                  {previewCaption}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] text-ivory-700 uppercase tracking-wider flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Hashtags
                  </div>
                  <button onClick={() => handleCopy(2, previewHashtags)}
                    className="flex items-center gap-1 text-[9px] text-gold-500 hover:text-gold-300">
                    {copied === 2 ? <CheckCircle className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                    {copied === 2 ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-bg-secondary border border-bg-border text-[10px] text-gold-600/80 font-mono leading-relaxed">
                  {previewHashtags}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated image display panel */}
      {(imageUrl || imgGenLoading) && tab === "builder" && (
        <div className="card-glass rounded-xl p-5 border border-gold-700/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              Generated Image — FLUX.1-dev
            </h3>
            {!sentToQueue ? (
              <button
                onClick={handleSendToQueue}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "linear-gradient(135deg, #DAA520, #8B6914)", color: "#070708" }}>
                <Send className="w-3.5 h-3.5" />
                Send to Approval Queue
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-signal-bull">
                <CheckCircle className="w-3.5 h-3.5" /> Added to queue
              </span>
            )}
          </div>
          {imgGenLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              <div className="text-xs text-ivory-600 font-mono">FLUX.1-dev generating · ~30s</div>
              <div className="text-[10px] text-ivory-700">ZephyrBase-v4 LoRA · 35 steps · cfg 3.5</div>
            </div>
          ) : imageUrl ? (
            <div className="flex gap-5 flex-col md:flex-row">
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="ZEPHYR VALE generated"
                  className="w-full md:w-64 rounded-xl border border-gold-700/20 object-cover"
                  style={{ maxHeight: "340px" }}
                />
              </div>
              <div className="flex-1 space-y-3">
                <div className="p-3 rounded-lg bg-bg-secondary border border-bg-border">
                  <div className="text-[9px] text-ivory-700 uppercase mb-1">Generated Caption</div>
                  <div className="text-xs text-ivory-400 leading-relaxed">{previewCaption}</div>
                </div>
                <div className="p-3 rounded-lg bg-bg-secondary border border-bg-border">
                  <div className="text-[9px] text-ivory-700 uppercase mb-1">Hashtags</div>
                  <div className="text-[10px] text-gold-600/80 font-mono leading-relaxed">{previewHashtags}</div>
                </div>
                {qualityScore && (
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-gold-500" />
                    <span className="text-xs text-signal-bull font-mono">Quality Score: {qualityScore}/100</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab: Generation Queue */}
      {tab === "queue" && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-bg-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Generation Queue</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-600/10 border border-gold-700/20 text-xs text-gold-400 hover:bg-gold-600/20 transition-colors">
              <Plus className="w-3 h-3" /> Add to Queue
            </button>
          </div>
          <div className="divide-y divide-bg-border">
            {QUEUE.map((q, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-bg-secondary/40 transition-colors">
                <div className="text-xs font-mono text-ivory-700 w-5">{i + 1}</div>
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                  q.type === "reel" ? "bg-purple-500/10" : q.type === "story" ? "bg-blue-500/10" : "bg-gold-500/10"
                }`}>
                  {q.type === "reel" ? <Film className="w-3.5 h-3.5 text-purple-400" />
                    : q.type === "story" ? <Layers className="w-3.5 h-3.5 text-blue-400" />
                    : <Image className="w-3.5 h-3.5 text-gold-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-ivory-200">{q.title}</div>
                  <div className="text-[10px] text-ivory-700 capitalize">{q.type}</div>
                </div>
                <div className={`label-tag text-[9px] ${q.priority === "high" ? "bg-gold-600/10 text-gold-400 border-gold-700/20" : "bg-bg-border text-ivory-700 border-bg-border"}`}>
                  {q.priority.toUpperCase()}
                </div>
                <div className={`text-xs font-mono ${q.eta === "Ready" ? "text-signal-bull" : "text-ivory-600"}`}>
                  {q.eta === "Ready" ? "✓ Ready" : `⏱ ${q.eta}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Generated Library */}
      {tab === "library" && (
        <div className="space-y-4">
          {GENERATED_PROMPTS.map(p => (
            <div key={p.id} className={`card-glass rounded-xl overflow-hidden border ${
              p.status === "generating" ? "border-gold-700/40" : "border-bg-border"
            }`}>
              <div className="flex items-center justify-between p-4 border-b border-bg-border">
                <div className="flex items-center gap-3">
                  {p.type === "reel"
                    ? <Film className="w-4 h-4 text-purple-400" />
                    : <Image className="w-4 h-4 text-gold-400" />}
                  <div>
                    <div className="text-xs font-semibold text-ivory-200">{p.title}</div>
                    <div className="text-[10px] text-ivory-700 capitalize">{p.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.status === "generating"
                    ? <span className="label-tag bg-gold-600/10 text-gold-400 border-gold-700/20 text-[9px] animate-pulse-fast">GENERATING</span>
                    : <span className="label-tag bg-signal-bull/10 text-signal-bull border-signal-bull/20 text-[9px]">READY</span>
                  }
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="text-[10px] text-ivory-700 uppercase tracking-wider mb-1.5">Image Prompt</div>
                  <div className="text-[11px] text-ivory-500 font-mono leading-relaxed line-clamp-3">{p.prompt}</div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-[10px] text-ivory-700 uppercase tracking-wider mb-1">Reel Hook</div>
                    <div className="text-xs text-ivory-300 italic">"{p.hook}"</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gold-600/10 border border-gold-700/20 text-[10px] text-gold-400 hover:bg-gold-600/20 transition-colors">
                      <Send className="w-3 h-3" /> Send to Approval
                    </button>
                    <button onClick={() => handleCopy(p.id, p.prompt)}
                      className="px-3 py-1.5 rounded-lg bg-bg-secondary border border-bg-border text-[10px] text-ivory-600 hover:text-ivory-300 transition-colors">
                      {copied === p.id ? <CheckCircle className="w-3 h-3 text-signal-bull" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
