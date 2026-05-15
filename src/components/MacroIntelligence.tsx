"use client";
import { useState } from "react";
import { Globe, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, AlertTriangle, Info } from "lucide-react";
import { macroData, rbiPolicy } from "@/lib/mockData";
import type { MacroIndicator } from "@/lib/types";
import { cn, fmt, fmtPct, colorFromChange, bgColorFromChange } from "@/lib/utils";
import {
  LineChart, Line, ResponsiveContainer, Tooltip, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

// Generate sparkline
function spark(base: number, count = 20): { v: number }[] {
  const arr = [base];
  for (let i = 1; i < count; i++) {
    arr.push(arr[i - 1] * (1 + (Math.random() - 0.49) * 0.01));
  }
  return arr.map(v => ({ v }));
}

const MACRO_GROUPS = [
  {
    id: "global", label: "Global Liquidity",
    items: [
      { key: "dxy", label: "DXY Index" },
      { key: "usYield10Y", label: "US 10Y Yield" },
      { key: "crude", label: "Crude Oil" },
      { key: "gold", label: "Gold (MCX)" },
    ],
  },
  {
    id: "india", label: "India Macro",
    items: [
      { key: "rbiRate", label: "RBI Repo Rate" },
      { key: "cpi", label: "CPI Inflation" },
      { key: "gdp", label: "GDP Growth" },
      { key: "indPMI", label: "India PMI" },
    ],
  },
  {
    id: "flows", label: "Capital Flows",
    items: [
      { key: "fiiFlow", label: "FII Net Flow" },
      { key: "diiFlow", label: "DII Net Flow" },
      { key: "mfFlow", label: "MF SIP Inflow" },
      { key: "usdrInr", label: "USD/INR" },
    ],
  },
  {
    id: "sentiment", label: "Market Sentiment",
    items: [
      { key: "vix", label: "India VIX" },
      { key: "uspmI", label: "US PMI" },
    ],
  },
];

function MacroCard({ indicator }: { indicator: MacroIndicator }) {
  const [expanded, setExpanded] = useState(false);
  const isPositive = indicator.changePct >= 0;
  const sparkData = spark(indicator.value);

  return (
    <div
      className={cn(
        "card-glass rounded-xl p-3 cursor-pointer transition-all",
        expanded ? "glow-border-maroon" : ""
      )}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-ivory-600 uppercase tracking-wider truncate">{indicator.name}</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-mono font-bold text-ivory-100">
              {fmt(indicator.value, indicator.unit === "%" ? 2 : 2)}{indicator.unit === "%" ? "%" : ""}
            </span>
            <span className={cn("text-xs font-mono", colorFromChange(indicator.impact === "negative" ? -1 : 1))}>
              {indicator.unit !== "%" && indicator.unit !== "pts" ? indicator.unit : ""}
            </span>
          </div>
          <div className={cn("text-xs font-mono mt-0.5", colorFromChange(indicator.changePct))}>
            {isPositive ? "▲" : "▼"} {Math.abs(indicator.changePct).toFixed(2)}%
          </div>
        </div>

        <div className="w-20 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <defs>
                <linearGradient id={`sg-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={indicator.impact === "positive" ? "#00E676" : "#FF1744"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={indicator.impact === "positive" ? "#00E676" : "#FF1744"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone" dataKey="v"
                stroke={indicator.impact === "positive" ? "#00E676" : "#FF1744"}
                strokeWidth={1.5}
                fill={`url(#sg-${indicator.id})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            "label-tag",
            indicator.impact === "positive" ? "bg-signal-bull/15 text-signal-bull" :
            indicator.impact === "negative" ? "bg-signal-bear/15 text-signal-bear" :
            "bg-yellow-500/15 text-yellow-400"
          )}>
            {indicator.impact.toUpperCase()}
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-ivory-600" /> : <ChevronDown className="w-3.5 h-3.5 text-ivory-600" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-bg-border animate-fade-in space-y-2">
          <p className="text-xs text-ivory-300 leading-relaxed">{indicator.interpretation}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] text-ivory-600">Affected:</span>
            {indicator.affectedSectors.map(s => (
              <span key={s} className="label-tag bg-maroon-800/20 text-maroon-400">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const radarData = [
  { subject: "FII Flow", A: 88 },
  { subject: "Macro", A: 76 },
  { subject: "Liquidity", A: 82 },
  { subject: "Sentiment", A: 84 },
  { subject: "Growth", A: 78 },
  { subject: "Policy", A: 80 },
];

export default function MacroIntelligence() {
  const indicators = macroData as unknown as Record<string, MacroIndicator>;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-maroon-600" />
            Macro Economic Intelligence
          </h2>
          <p className="text-xs text-ivory-500 mt-0.5">
            Real-time global macro indicators with AI-driven sector impact analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="label-tag bg-signal-bull/15 text-signal-bull">RISK ON</span>
          <span className="text-xs text-ivory-500 font-mono">Confidence: 84%</span>
        </div>
      </div>

      {/* Market Regime Banner */}
      <div className="rounded-xl bg-gradient-to-r from-maroon-900/40 to-bg-card border border-maroon-800/40 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-signal-bull/15 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-signal-bull" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-ivory-100">Market Regime: Risk-On</span>
            <span className="label-tag bg-signal-bull/20 text-signal-bull">84% Confidence</span>
          </div>
          <p className="text-xs text-ivory-300 leading-relaxed">
            FII inflows at 3-month high (₹12,450 Cr MTD). VIX below 14. DXY falling, US yields compressing.
            RBI rate cut confirms dovish pivot. Macro strongly supportive of equity rally continuation.
            Capital rotating into <strong className="text-signal-bull">Defence → IT → Pharma</strong>.
          </p>
        </div>
      </div>

      {/* Radar + RBI Policy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-glass rounded-xl p-4">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
            Macro Composite Score
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E1E24" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#A09278", fontSize: 10 }} />
                <Radar dataKey="A" stroke="#8B0000" fill="#8B0000" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-2xl font-mono font-bold text-ivory-100 mt-1">
            <span className="text-gradient-maroon">81</span>
            <span className="text-sm text-ivory-500"> / 100</span>
          </div>
        </div>

        <div className="card-glass rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
            RBI Policy Monitor
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-ivory-500">Current Rate</span>
            <span className="text-2xl font-mono font-bold text-ivory-100">
              {rbiPolicy.currentRate}<span className="text-sm text-ivory-500">%</span>
            </span>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { label: "Stance", value: rbiPolicy.stance, color: "text-signal-bull" },
              { label: "Next Meeting", value: rbiPolicy.nextMeeting },
              { label: "Expected Cut", value: `${Math.abs(rbiPolicy.expectedChange * 100)} bps`, color: "text-signal-bull" },
              { label: "Cut Probability", value: `${rbiPolicy.probability}%`, color: "text-gold-500" },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-ivory-500">{r.label}</span>
                <span className={cn("font-mono font-medium", r.color ?? "text-ivory-200")}>{r.value}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ivory-400 leading-relaxed border-t border-bg-border pt-2">
            {rbiPolicy.commentary.slice(0, 120)}...
          </p>
        </div>

        <div className="card-glass rounded-xl p-4 space-y-2">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-2">
            Capital Flow Summary
          </div>
          {["fiiFlow", "diiFlow", "mfFlow"].map(key => {
            const ind = indicators[key];
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[10px] text-ivory-600">{ind.name}</div>
                  <div className="text-sm font-mono font-bold text-ivory-100">
                    ₹{(ind.value / 100).toFixed(0)}Cr
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("text-xs font-mono font-bold", colorFromChange(ind.changePct))}>
                    {ind.changePct >= 0 ? "+" : ""}{ind.changePct.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-ivory-600">MoM</div>
                </div>
                <div className="w-16 h-1.5 bg-bg-border rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", ind.changePct >= 0 ? "bg-signal-bull" : "bg-signal-bear")}
                    style={{ width: `${Math.min(100, Math.abs(ind.changePct) * 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="mt-2 pt-2 border-t border-bg-border">
            <div className="flex justify-between text-xs">
              <span className="text-ivory-500">Net Institutional</span>
              <span className="text-signal-bull font-mono font-bold">+₹20,770 Cr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators Grid */}
      {MACRO_GROUPS.map(group => (
        <div key={group.id}>
          <h3 className="text-xs font-semibold text-ivory-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-bg-border" />
            {group.label}
            <div className="h-px flex-1 bg-bg-border" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {group.items.map(item => {
              const ind = indicators[item.key];
              return ind ? <MacroCard key={item.key} indicator={ind} /> : null;
            })}
          </div>
        </div>
      ))}

      {/* AI Commentary */}
      <div className="card-glass rounded-xl p-4 border-l-2 border-maroon-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-maroon-800/40 flex items-center justify-center">
            <Info className="w-3 h-3 text-maroon-400" />
          </div>
          <span className="text-xs font-semibold text-ivory-300 uppercase tracking-wider">AI Macro Commentary</span>
          <span className="label-tag bg-signal-accumulate/15 text-signal-accumulate">GPT-4 Analysis</span>
        </div>
        <p className="text-xs text-ivory-300 leading-relaxed">
          <strong className="text-ivory-100">Macro Setup: Strongly Bullish.</strong>{" "}
          The convergence of RBI rate cuts, DXY weakness, falling US yields, and record FII inflows creates an optimal environment for equity outperformance.
          Historical precedent (2020 post-COVID, 2016 demonetization recovery) shows that when all four factors align bullishly, Nifty averages +18% in the subsequent 3 months.
          Priority rotation: <strong className="text-signal-bull">Defence → IT → Pharma → Realty</strong>.
          Risk factors: Geopolitical escalation, crude spike above $90, INR depreciation beyond 85. Current probability of tail risk: <strong className="text-signal-bear">12%</strong>.
        </p>
      </div>
    </div>
  );
}
