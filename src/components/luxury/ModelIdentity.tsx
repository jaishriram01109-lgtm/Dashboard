"use client";

import { useState } from "react";
import {
  Crown, ScanFace, Sliders, CheckCircle, Layers, Palette,
  RefreshCw, Upload, Lock, Unlock, Eye, Zap, Star,
  ChevronRight, BarChart3, Shield, Sparkles,
} from "lucide-react";

// ─── Mock model DNA ────────────────────────────────────────────────────────
const FACIAL_FEATURES = [
  { trait: "Jawline",       value: "Sharp, chiseled",        score: 97 },
  { trait: "Eye Shape",     value: "Hunter / deep-set",      score: 95 },
  { trait: "Nose",          value: "Straight, refined",      score: 92 },
  { trait: "Cheekbones",    value: "High & prominent",       score: 96 },
  { trait: "Lips",          value: "Full, masculine",        score: 88 },
  { trait: "Brow Ridge",    value: "Strong, defined",        score: 94 },
  { trait: "Facial Ratio",  value: "Golden ratio 1.618",     score: 98 },
  { trait: "Skin Texture",  value: "Natural pores + depth",  score: 93 },
];

const STYLE_IDENTITY = [
  { category: "Primary Aesthetic",  value: "Old Money / Quiet Luxury" },
  { category: "Color Palette",      value: "Navy, Cream, Charcoal, Stone" },
  { category: "Brand Alignment",    value: "Dior, Tom Ford, Gucci, LV" },
  { category: "Fashion Week Vibe",  value: "Paris / Milan Editorial" },
  { category: "Body Type",          value: "Tall, Athletic, Lean (6'2)" },
  { category: "Age Range",          value: "24–30 years" },
  { category: "Grooming",           value: "Premium, minimal, precise" },
  { category: "Signature Detail",   value: "Tailored suit / open collar" },
];

const PERSONALITY_MATRIX = [
  { trait: "Mysterious",    score: 92 },
  { trait: "Masculine",     score: 96 },
  { trait: "Sophisticated", score: 94 },
  { trait: "Aspirational",  score: 98 },
  { trait: "Quiet Power",   score: 90 },
  { trait: "Editoria",      score: 95 },
];

const ANCHORS = [
  { label: "Primary Anchor",    status: "locked",   consistency: "99.2%", type: "Base identity" },
  { label: "Side Profile",      status: "locked",   consistency: "98.1%", type: "Left 45°"      },
  { label: "Cinematic",         status: "locked",   consistency: "97.8%", type: "Low-key light" },
  { label: "Outdoor Natural",   status: "locked",   consistency: "96.4%", type: "Golden hour"   },
  { label: "Fashion Editorial", status: "locked",   consistency: "98.7%", type: "Studio light"  },
  { label: "Close-Up Detail",   status: "building", consistency: "92.3%", type: "Macro face"    },
];

const LORA_STATUS = [
  { name: "ZephyrBase-v4.lora",    size: "2.1 GB", status: "active",   trainSteps: 12000 },
  { name: "ZephyrCinema-v2.lora",  size: "1.4 GB", status: "active",   trainSteps: 8500  },
  { name: "ZephyrLuxury-v1.lora",  size: "980 MB", status: "active",   trainSteps: 6200  },
  { name: "ZephyrStreet-v1.lora",  size: "750 MB", status: "training", trainSteps: 3100  },
];

// ─── Utility ───────────────────────────────────────────────────────────────
function ScoreBar({ score, color = "#DAA520" }: { score: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[10px] font-mono text-ivory-600 w-8 text-right">{score}%</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function ModelIdentity() {
  const [tab, setTab] = useState<"dna" | "style" | "lora" | "anchors">("dna");

  const TABS = [
    { id: "dna",     label: "Face DNA",      icon: ScanFace   },
    { id: "style",   label: "Style Identity",icon: Palette    },
    { id: "anchors", label: "Reference Anchors", icon: Lock   },
    { id: "lora",    label: "LoRA Models",   icon: Layers     },
  ] as const;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ivory-100 flex items-center gap-2">
            <ScanFace className="w-6 h-6 text-gold-500" />
            Model Identity System
          </h2>
          <p className="text-xs text-ivory-700 mt-1 font-mono">Face consistency engine · Character DNA · LoRA embeddings · Reference anchors</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-signal-bull/10 border border-signal-bull/20 flex items-center gap-2">
            <Lock className="w-3 h-3 text-signal-bull" />
            <span className="text-xs font-semibold text-signal-bull">IDENTITY LOCKED</span>
          </div>
        </div>
      </div>

      {/* Model card + Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Model visual card */}
        <div className="card-glass rounded-2xl overflow-hidden border border-gold-700/30">
          <div className="relative h-56"
            style={{ background: "linear-gradient(160deg, #0d0b06 0%, #1a1400 50%, #0a0800 100%)" }}>
            {/* Decorative face silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-28 h-36 rounded-3xl border-2 border-gold-600/30"
                  style={{ background: "linear-gradient(160deg, #1f1a0a 0%, #0d0c08 100%)" }}>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-gold-600/20"
                    style={{ background: "radial-gradient(circle, #2a2010 0%, #0f0e08 100%)" }} />
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-gold-800/40" />
                  <div className="absolute bottom-14 left-6 w-4 h-1 rounded-full bg-gold-700/30" />
                  <div className="absolute bottom-14 right-6 w-4 h-1 rounded-full bg-gold-700/30" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, #DAA52020, transparent 60%)" }} />
            <div className="absolute top-3 right-3">
              <span className="label-tag bg-gold-600/20 text-gold-400 border border-gold-700/30 text-[10px]">AI GENERATED</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-display text-xl font-bold text-ivory-100">ZEPHYR VALE</h3>
            <p className="text-xs text-ivory-700 mb-3">European–Indian Aesthetic · Age 27 · 6'2"</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-base font-bold text-gold-400 font-display">99.2%</div>
                <div className="text-[9px] text-ivory-700 uppercase">Consistency</div>
              </div>
              <div>
                <div className="text-base font-bold text-signal-bull font-display">5</div>
                <div className="text-[9px] text-ivory-700 uppercase">LoRA Models</div>
              </div>
              <div>
                <div className="text-base font-bold text-purple-400 font-display">12K</div>
                <div className="text-[9px] text-ivory-700 uppercase">Train Steps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Personality matrix */}
        <div className="card-glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Personality Matrix</span>
          </div>
          <div className="space-y-3">
            {PERSONALITY_MATRIX.map(p => (
              <div key={p.trait}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-ivory-400">{p.trait}</span>
                </div>
                <ScoreBar score={p.score} color={p.score > 94 ? "#DAA520" : "#8B6914"} />
              </div>
            ))}
          </div>
        </div>

        {/* Overall stats */}
        <div className="card-glass rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">Identity Metrics</span>
          </div>
          {[
            { label: "Face Consistency Score", value: "99.2 / 100", color: "text-signal-bull" },
            { label: "Skin Realism Score",     value: "97.4 / 100", color: "text-signal-bull" },
            { label: "Lighting Realism",       value: "96.8 / 100", color: "text-signal-bull" },
            { label: "Editorial Quality",      value: "98.1 / 100", color: "text-gold-400"    },
            { label: "Brand Alignment",        value: "97.6 / 100", color: "text-gold-400"    },
            { label: "Viral Potential Score",  value: "94.3 / 100", color: "text-purple-400"  },
            { label: "Identity Stability",     value: "LOCKED",      color: "text-signal-bull" },
            { label: "Training Status",        value: "COMPLETE",    color: "text-signal-bull" },
          ].map(m => (
            <div key={m.label} className="flex items-center justify-between py-1 border-b border-bg-border/40 last:border-0">
              <span className="text-[11px] text-ivory-600">{m.label}</span>
              <span className={`text-[11px] font-mono font-semibold ${m.color}`}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl border border-bg-border w-fit">
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id
                ? "bg-gold-600/20 text-gold-400 border border-gold-700/30"
                : "text-ivory-700 hover:text-ivory-400"
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Face DNA */}
      {tab === "dna" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-glass rounded-xl p-5">
            <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold-500" /> Facial Feature Analysis
            </h3>
            <div className="space-y-4">
              {FACIAL_FEATURES.map(f => (
                <div key={f.trait}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-ivory-400 font-semibold">{f.trait}</span>
                    <span className="text-[10px] text-ivory-700 font-mono">{f.value}</span>
                  </div>
                  <ScoreBar score={f.score} />
                </div>
              ))}
            </div>
          </div>
          <div className="card-glass rounded-xl p-5">
            <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" /> Realism Parameters
            </h3>
            <div className="space-y-4">
              {[
                { name: "Natural Skin Pores",      score: 94, desc: "Microdermal texture active"    },
                { name: "Subsurface Scattering",   score: 96, desc: "Depth & warmth realism"        },
                { name: "Eye Catchlight",           score: 92, desc: "Natural specular highlight"    },
                { name: "Hair Strand Detail",       score: 88, desc: "Strand-level micro detail"     },
                { name: "Shadow Depth",             score: 95, desc: "Cinematic shadow softness"     },
                { name: "Depth of Field",           score: 97, desc: "DSLR bokeh emulation"          },
                { name: "Color Grading",            score: 93, desc: "Luxury editorial LUT applied"  },
                { name: "Anti-Symmetry Realism",    score: 89, desc: "Natural asymmetry preserved"   },
              ].map(r => (
                <div key={r.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-ivory-400 font-semibold">{r.name}</span>
                    <span className="text-[10px] text-ivory-700 italic">{r.desc}</span>
                  </div>
                  <ScoreBar score={r.score} color="#8B6914" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Style Identity */}
      {tab === "style" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-glass rounded-xl p-5">
            <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-gold-500" /> Style DNA
            </h3>
            <div className="space-y-3">
              {STYLE_IDENTITY.map(s => (
                <div key={s.category} className="flex gap-3 py-2 border-b border-bg-border/40 last:border-0">
                  <ChevronRight className="w-3 h-3 text-gold-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-ivory-700 uppercase tracking-wider">{s.category}</div>
                    <div className="text-xs font-semibold text-ivory-200 mt-0.5">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-glass rounded-xl p-5">
            <h3 className="text-xs font-semibold text-ivory-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 text-gold-500" /> Brand Alignment
            </h3>
            <div className="space-y-2">
              {[
                { brand: "Dior Homme",   alignment: 98, tier: "Flagship" },
                { brand: "Tom Ford",     alignment: 97, tier: "Flagship" },
                { brand: "Saint Laurent",alignment: 95, tier: "Primary"  },
                { brand: "Gucci",        alignment: 93, tier: "Primary"  },
                { brand: "Louis Vuitton",alignment: 91, tier: "Primary"  },
                { brand: "Prada",        alignment: 89, tier: "Secondary"},
                { brand: "Armani",       alignment: 88, tier: "Secondary"},
                { brand: "Versace",      alignment: 84, tier: "Optional" },
              ].map(b => (
                <div key={b.brand} className="flex items-center gap-3 py-1.5">
                  <div className="w-20 text-xs text-ivory-400 font-semibold">{b.brand}</div>
                  <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gold-600" style={{ width: `${b.alignment}%` }} />
                  </div>
                  <div className="text-[10px] font-mono text-gold-400 w-8">{b.alignment}%</div>
                  <div className="text-[9px] text-ivory-700 w-14">{b.tier}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reference Anchors */}
      {tab === "anchors" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ANCHORS.map(a => (
            <div key={a.label} className={`card-glass rounded-xl overflow-hidden border ${
              a.status === "locked" ? "border-signal-bull/20" : "border-gold-700/30"
            }`}>
              {/* Anchor preview placeholder */}
              <div className="h-32 relative"
                style={{ background: "linear-gradient(135deg, #0d0c08 0%, #181410 100%)" }}>
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <ScanFace className="w-12 h-12 text-gold-600" />
                </div>
                <div className="absolute top-2 right-2">
                  {a.status === "locked"
                    ? <Lock className="w-3.5 h-3.5 text-signal-bull" />
                    : <RefreshCw className="w-3.5 h-3.5 text-gold-400 animate-spin" />
                  }
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className={`label-tag text-[9px] ${
                    a.status === "locked"
                      ? "bg-signal-bull/10 text-signal-bull border-signal-bull/20"
                      : "bg-gold-600/10 text-gold-400 border-gold-700/20"
                  }`}>
                    {a.status === "locked" ? "LOCKED" : "TRAINING"}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="text-xs font-semibold text-ivory-200">{a.label}</div>
                <div className="text-[10px] text-ivory-700 mt-0.5">{a.type}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-gold-600 rounded-full"
                      style={{ width: a.consistency }} />
                  </div>
                  <span className="text-[10px] font-mono text-gold-400">{a.consistency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: LoRA Models */}
      {tab === "lora" && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-bg-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold text-ivory-200 uppercase tracking-wider">LoRA / Embedding Models</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-600/10 border border-gold-700/20 text-xs text-gold-400 hover:bg-gold-600/20 transition-colors">
              <Upload className="w-3 h-3" /> Train New
            </button>
          </div>
          <div className="divide-y divide-bg-border">
            {LORA_STATUS.map(l => (
              <div key={l.name} className="flex items-center gap-4 px-4 py-3 hover:bg-bg-secondary/40 transition-colors">
                <div className={`w-2 h-2 rounded-full ${l.status === "active" ? "bg-signal-bull live-dot" : "bg-gold-400 animate-pulse-fast"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-semibold text-ivory-200">{l.name}</div>
                  <div className="text-[10px] text-ivory-700">{l.trainSteps.toLocaleString()} training steps · {l.size}</div>
                </div>
                <div className={`label-tag text-[9px] ${
                  l.status === "active"
                    ? "bg-signal-bull/10 text-signal-bull border-signal-bull/20"
                    : "bg-gold-600/10 text-gold-400 border-gold-700/20"
                }`}>
                  {l.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
