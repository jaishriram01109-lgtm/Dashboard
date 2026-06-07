"use client";
import { useState, useMemo } from "react";
import { Target, TrendingUp, Shield, Clock, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { tradeSetups } from "@/lib/mockData";
import type { TradeSetup, TradeType } from "@/lib/types";
import { useAngelQuotes } from "@/hooks/useAngelData";
import { cn, fmt, fmtPct, scoreColor, scoreBg, signalColor } from "@/lib/utils";

const tradeTypeColors: Record<TradeType, string> = {
  intraday: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  btst: "bg-signal-accumulate/20 text-signal-accumulate border-signal-accumulate/40",
  swing: "bg-signal-bull/20 text-signal-bull border-signal-bull/40",
  positional: "bg-maroon-700/20 text-maroon-300 border-maroon-700/40",
  long_term: "bg-gold-600/20 text-gold-400 border-gold-600/40",
};

const tradeTypeLabel: Record<TradeType, string> = {
  intraday: "INTRADAY",
  btst: "BTST",
  swing: "SWING",
  positional: "POSITIONAL",
  long_term: "LONG TERM",
};

function RRVisual({ entry, sl, t1, t2, t3, rr }: { entry: number; sl: number; t1: number; t2: number; t3: number; rr: number }) {
  const risk = entry - sl;
  const reward = t3 - entry;
  const total = sl < t3 ? t3 - sl : sl - t3;
  const slPct = Math.abs((sl - entry) / (t3 - sl)) * 100;
  const t1Pct = ((t1 - entry) / (t3 - sl)) * 100;
  const t2Pct = ((t2 - entry) / (t3 - sl)) * 100;

  return (
    <div className="space-y-2">
      <div className="relative h-6 bg-bg-border rounded-full overflow-hidden flex">
        {/* SL zone */}
        <div
          className="bg-signal-bear/40 flex items-center justify-center text-[9px] text-signal-bear font-mono"
          style={{ width: `${slPct}%` }}
        >SL</div>
        {/* Entry marker */}
        <div className="w-px bg-ivory-100 relative z-10" />
        {/* Target zones */}
        <div className="flex-1 flex">
          <div className="bg-signal-bull/20 flex items-center justify-center text-[9px] text-signal-bull font-mono"
            style={{ width: `${t1Pct}%` }}>T1</div>
          <div className="bg-signal-bull/30 flex items-center justify-center text-[9px] text-signal-bull font-mono"
            style={{ width: `${t2Pct - t1Pct}%` }}>T2</div>
          <div className="bg-signal-bull/40 flex-1 flex items-center justify-center text-[9px] text-signal-bull font-mono">T3</div>
        </div>
      </div>
      <div className="flex justify-between text-[10px] font-mono text-ivory-500">
        <span className="text-signal-bear">SL ₹{fmt(sl)}</span>
        <span className="text-ivory-300">Entry ₹{fmt(entry)}</span>
        <span className="text-signal-bull">T3 ₹{fmt(t3)}</span>
      </div>
    </div>
  );
}

function TradeCard({ setup, ltp }: { setup: TradeSetup; ltp?: number }) {
  const [expanded, setExpanded] = useState(false);
  const rrColor = setup.riskReward >= 3 ? "text-signal-bull" : setup.riskReward >= 2 ? "text-yellow-400" : "text-signal-bear";
  const distPct = ltp ? ((ltp - setup.entry) / setup.entry) * 100 : null;

  return (
    <div className={cn("card-glass rounded-xl overflow-hidden transition-all", expanded ? "glow-border-maroon" : "")}>
      {/* Card header */}
      <div
        className="p-4 cursor-pointer hover:bg-bg-hover/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-sm text-ivory-100">{setup.symbol}</span>
              <span className={cn("label-tag border text-[10px]", tradeTypeColors[setup.tradeType])}>
                {tradeTypeLabel[setup.tradeType]}
              </span>
              {ltp && (
                <span className={cn(
                  "label-tag text-[9px] font-mono font-bold",
                  distPct !== null && Math.abs(distPct) < 1 ? "bg-signal-bull/15 text-signal-bull" :
                  distPct !== null && distPct > 0 ? "bg-gold-500/15 text-gold-400" : "bg-ivory-700/20 text-ivory-400"
                )}>
                  LTP ₹{ltp.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                  {distPct !== null && ` (${distPct >= 0 ? "+" : ""}${distPct.toFixed(1)}%)`}
                </span>
              )}
              <span className="text-[10px] text-ivory-500 font-mono truncate max-w-48">{setup.setupType}</span>
            </div>
            <div className="text-[10px] text-ivory-600 mt-0.5">{setup.name} • {setup.sector}</div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs text-ivory-500">R:R</div>
              <div className={cn("text-lg font-mono font-bold", rrColor)}>1:{setup.riskReward.toFixed(1)}</div>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-ivory-500" /> : <ChevronDown className="w-4 h-4 text-ivory-500" />}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: "Entry", value: `₹${fmt(setup.entry)}`, color: "text-ivory-100" },
            { label: "Stop Loss", value: `₹${fmt(setup.stopLoss)}`, color: "text-signal-bear" },
            { label: "Target 1", value: `₹${fmt(setup.target1)}`, color: "text-signal-bull" },
            { label: "Target 3", value: `₹${fmt(setup.target3)}`, color: "text-signal-bull" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={cn("text-xs font-mono font-bold", s.color)}>{s.value}</div>
              <div className="text-[10px] text-ivory-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Probability bars */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: "Swing Prob", value: setup.swingProbability },
            { label: "Momentum", value: setup.momentumProbability },
            { label: "Conviction", value: setup.convictionScore },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-ivory-600">{s.label}</span>
                <span className={cn("font-mono font-semibold", scoreColor(s.value))}>{s.value}%</span>
              </div>
              <div className="h-1 bg-bg-border rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", scoreBg(s.value))} style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-bg-border p-4 space-y-4 animate-fade-in bg-bg-secondary/30">
          {/* RR Visual */}
          <div>
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider mb-2">Risk/Reward Visualization</div>
            <RRVisual
              entry={setup.entry} sl={setup.stopLoss}
              t1={setup.target1} t2={setup.target2} t3={setup.target3} rr={setup.riskReward}
            />
          </div>

          {/* Full targets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Entry Zone", value: `₹${fmt(setup.entry)}`, pct: "+0%", color: "text-ivory-100" },
              { label: "Target 1", value: `₹${fmt(setup.target1)}`, pct: fmtPct(((setup.target1 - setup.entry) / setup.entry) * 100), color: "text-emerald-400" },
              { label: "Target 2", value: `₹${fmt(setup.target2)}`, pct: fmtPct(((setup.target2 - setup.entry) / setup.entry) * 100), color: "text-signal-bull" },
              { label: "Target 3", value: `₹${fmt(setup.target3)}`, pct: fmtPct(((setup.target3 - setup.entry) / setup.entry) * 100), color: "text-signal-bull" },
            ].map(t => (
              <div key={t.label} className="bg-bg-card rounded-lg p-2 text-center">
                <div className="text-[10px] text-ivory-600">{t.label}</div>
                <div className={cn("text-sm font-mono font-bold", t.color)}>{t.value}</div>
                <div className={cn("text-[10px] font-mono", t.color)}>{t.pct}</div>
              </div>
            ))}
          </div>

          {/* Stop Loss detail */}
          <div className="bg-signal-bear/5 border border-signal-bear/20 rounded-lg p-3">
            <div className="flex justify-between text-xs">
              <span className="text-ivory-500">Stop Loss:</span>
              <span className="text-signal-bear font-mono font-bold">₹{fmt(setup.stopLoss)}</span>
              <span className="text-signal-bear font-mono">{fmtPct(((setup.stopLoss - setup.entry) / setup.entry) * 100)}</span>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Smart Money", value: setup.smartMoneyScore },
              { label: "Institutional", value: setup.institutionalScore },
              { label: "Conviction", value: setup.convictionScore },
            ].map(s => (
              <div key={s.label} className="text-center bg-bg-card rounded-lg p-2">
                <div className={cn("text-2xl font-mono font-bold", scoreColor(s.value))}>{s.value}</div>
                <div className="text-[10px] text-ivory-600">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Holding period */}
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-ivory-500" />
            <span className="text-ivory-500">Holding Period:</span>
            <span className="text-ivory-200 font-semibold">{setup.holdingPeriod}</span>
            <span className="text-ivory-500 ml-2">Timeframe:</span>
            <span className="label-tag bg-maroon-800/20 text-maroon-400">{setup.timeframe}</span>
          </div>

          {/* AI Rationale */}
          <div className="bg-maroon-900/20 border border-maroon-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-maroon-400" />
              <span className="text-[10px] font-semibold text-maroon-400 uppercase tracking-wider">AI Rationale</span>
            </div>
            <p className="text-xs text-ivory-300 leading-relaxed">{setup.aiRationale}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Summary stats
function SummaryStats() {
  const avgRR = (tradeSetups.reduce((s, t) => s + t.riskReward, 0) / tradeSetups.length).toFixed(1);
  const avgConviction = Math.round(tradeSetups.reduce((s, t) => s + t.convictionScore, 0) / tradeSetups.length);
  const swingCount = tradeSetups.filter(t => t.tradeType === "swing").length;
  const highConviction = tradeSetups.filter(t => t.convictionScore >= 85).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: "Active Setups", value: tradeSetups.length, color: "text-ivory-100", sub: "High probability" },
        { label: "Avg R:R Ratio", value: `1:${avgRR}`, color: "text-signal-bull", sub: "Risk-adjusted" },
        { label: "Avg Conviction", value: `${avgConviction}%`, color: scoreColor(avgConviction), sub: "AI score" },
        { label: "High Conviction", value: highConviction, color: "text-gold-500", sub: "Score ≥85" },
      ].map(s => (
        <div key={s.label} className="card-glass rounded-xl p-3 text-center">
          <div className={cn("text-2xl font-mono font-bold", s.color)}>{s.value}</div>
          <div className="text-xs text-ivory-300 font-semibold mt-0.5">{s.label}</div>
          <div className="text-[10px] text-ivory-600">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

export default function TradeOpportunities() {
  const [filter, setFilter] = useState<"all" | TradeType>("all");
  const [sortBy, setSortBy] = useState<"conviction" | "rr" | "probability">("conviction");
  const { quotes, isLive } = useAngelQuotes();

  const filtered = tradeSetups
    .filter(t => filter === "all" || t.tradeType === filter)
    .sort((a, b) => {
      if (sortBy === "conviction") return b.convictionScore - a.convictionScore;
      if (sortBy === "rr") return b.riskReward - a.riskReward;
      if (sortBy === "probability") return b.swingProbability - a.swingProbability;
      return 0;
    });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-maroon-600" />
            Trade Opportunity Engine
          </h2>
          <p className="text-xs text-ivory-500">
            AI-generated high-probability setups with entry, SL, and targets
            {isLive && <span className="ml-2 text-signal-bull font-semibold">● Live LTP — Angel One</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-signal-bull live-dot" />
          <span className="text-xs text-signal-bull font-mono">LIVE SETUPS</span>
        </div>
      </div>

      <SummaryStats />

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {(["all", "intraday", "btst", "swing", "positional", "long_term"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors border",
                filter === f
                  ? "bg-maroon-800/40 text-maroon-300 border-maroon-800/50"
                  : "text-ivory-600 border-transparent hover:text-ivory-300 hover:border-bg-border"
              )}
            >
              {f === "all" ? "ALL" : tradeTypeLabel[f as TradeType]}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs bg-bg-card border border-bg-border rounded px-2 py-1 text-ivory-300 outline-none"
        >
          <option value="conviction">Sort: Conviction</option>
          <option value="rr">Sort: R:R Ratio</option>
          <option value="probability">Sort: Probability</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(setup => (
          <TradeCard key={setup.id} setup={setup} ltp={quotes.get(setup.symbol)?.ltp} />
        ))}
        {filtered.length === 0 && (
          <div className="card-glass rounded-xl h-32 flex items-center justify-center text-ivory-600 text-sm">
            No setups match current filters
          </div>
        )}
      </div>
    </div>
  );
}
