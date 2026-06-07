"use client";
import { useState, useMemo } from "react";
import { Zap, TrendingUp, TrendingDown, AlertTriangle, RotateCcw, ArrowUpRight, Target } from "lucide-react";
import { aiPredictions, marketRegime } from "@/lib/mockData";
import type { AIPrediction } from "@/lib/types";
import { cn, scoreColor, scoreBg, colorFromChange } from "@/lib/utils";
import { useAngelQuotes } from "@/hooks/useAngelData";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip, LineChart, Line,
} from "recharts";

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  sector_rally: { icon: <TrendingUp className="w-4 h-4" />, color: "text-signal-bull", bg: "bg-signal-bull/15", label: "SECTOR RALLY" },
  stock_outperform: { icon: <ArrowUpRight className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-400/15", label: "OUTPERFORM" },
  rotation: { icon: <RotateCcw className="w-4 h-4" />, color: "text-signal-accumulate", bg: "bg-signal-accumulate/15", label: "ROTATION" },
  breakout: { icon: <Target className="w-4 h-4" />, color: "text-gold-500", bg: "bg-gold-500/15", label: "BREAKOUT" },
  crash_alert: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-signal-bear", bg: "bg-signal-bear/15", label: "RISK ALERT" },
  weak_sector: { icon: <TrendingDown className="w-4 h-4" />, color: "text-signal-distribute", bg: "bg-signal-distribute/15", label: "WEAK SECTOR" },
};

function PredictionCard({ pred, ltp }: { pred: AIPrediction; ltp?: number }) {
  const cfg = typeConfig[pred.type] ?? typeConfig.sector_rally;
  const isPositive = pred.expectedMove >= 0;

  return (
    <div className="card-glass rounded-xl p-4 hover:glow-border-maroon transition-all">
      <div className="flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", cfg.bg)}>
          <span className={cfg.color}>{cfg.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={cn("label-tag text-[10px]", cfg.bg, cfg.color, "border border-current/30")}>{cfg.label}</span>
              <div className="font-display font-bold text-sm text-ivory-100 mt-1 flex items-center gap-2">
                {pred.target}
                {ltp && (
                  <span className="text-[10px] font-mono text-gold-400 font-normal bg-gold-500/10 px-1.5 py-0.5 rounded">
                    LTP ₹{ltp.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={cn("text-xl font-mono font-bold", isPositive ? "text-signal-bull" : "text-signal-bear")}>
                {isPositive ? "+" : ""}{pred.expectedMove.toFixed(1)}%
              </div>
              <div className="text-[10px] text-ivory-600">Expected Move</div>
            </div>
          </div>

          <p className="text-xs text-ivory-400 leading-relaxed mt-2">{pred.rationale}</p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-ivory-600">Probability: </span>
                <span className={cn("font-mono font-bold", scoreColor(pred.probability))}>{pred.probability}%</span>
              </div>
              <div>
                <span className="text-ivory-600">Timeframe: </span>
                <span className="text-ivory-300 font-mono">{pred.timeframe}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-[10px] text-ivory-600">Confidence</div>
              <div className={cn("text-xs font-mono font-bold", scoreColor(pred.confidence))}>{pred.confidence}%</div>
            </div>
          </div>

          <div className="mt-2 h-1 bg-bg-border rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full", scoreBg(pred.probability))}
              style={{ width: `${pred.probability}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ML Model signals
const mlSignals = [
  { model: "Momentum ML", signal: "BULLISH", confidence: 82, desc: "3-month momentum factor scoring highest since 2021" },
  { model: "RS Factor", signal: "BULLISH", confidence: 88, desc: "Relative strength model: Defence > IT > Pharma leading" },
  { model: "Volume Flow", signal: "BULLISH", confidence: 76, desc: "Accumulation volume 40% above distribution volume (30D)" },
  { model: "Macro Regime", signal: "RISK ON", confidence: 84, desc: "Rate cut + FII flow combo historically bullish for 3M" },
  { model: "Sentiment AI", signal: "OPTIMISTIC", confidence: 72, desc: "News sentiment NLP scoring +0.68 (above +0.5 threshold)" },
  { model: "Pattern Recognition", signal: "BREAKOUT", confidence: 79, desc: "HAL, RVNL, TCS showing pre-breakout volume patterns" },
];

// Probability gauge
function ProbabilityGauge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-16 h-16">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#1E1E24" strokeWidth="5" />
          <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${(value / 100) * 175.9} 175.9`}
            strokeLinecap="round" transform="rotate(-90 32 32)"
            style={{ filter: `drop-shadow(0 0 4px ${color}66)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-[10px] text-ivory-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// Historical pattern data
function genPatternReturn(months: number, base: number) {
  return Array.from({ length: months }, (_, i) => ({
    month: `M${i + 1}`,
    return: base + (Math.random() - 0.4) * 5,
  }));
}

export default function AIPredictionEngine() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const { quotes } = useAngelQuotes();

  const filtered = activeFilter === "all"
    ? aiPredictions
    : aiPredictions.filter(p => p.type === activeFilter || (activeFilter === "bullish" && ["sector_rally", "stock_outperform", "breakout"].includes(p.type)));

  const bullishPreds = aiPredictions.filter(p => ["sector_rally", "stock_outperform", "breakout"].includes(p.type));
  const bearishPreds = aiPredictions.filter(p => ["crash_alert", "weak_sector"].includes(p.type));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-maroon-600" />
            AI Prediction Engine
          </h2>
          <p className="text-xs text-ivory-500">Machine learning • Quant models • Pattern recognition • Smart money forecasting</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="label-tag bg-signal-accumulate/15 text-signal-accumulate">GPT-4 + Quant</span>
          <span className="label-tag bg-maroon-800/20 text-maroon-400">6 Signals Active</span>
        </div>
      </div>

      {/* Market Regime */}
      <div className="card-glass rounded-xl p-4 border border-signal-bull/20">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="label-tag bg-signal-bull/20 text-signal-bull text-xs font-bold">
                MARKET REGIME: {marketRegime.regime.replace("_", " ").toUpperCase()}
              </span>
              <span className="text-xs text-ivory-500 font-mono">{marketRegime.confidence}% confidence</span>
            </div>
            <p className="text-xs text-ivory-300 leading-relaxed mb-3">{marketRegime.description}</p>
            <p className="text-xs text-gold-400 leading-relaxed italic">
              Strategy: {marketRegime.recommendedStrategy}
            </p>
            <div className="flex gap-3 mt-3">
              <div>
                <div className="text-[10px] text-signal-bull uppercase tracking-wider mb-1">Bullish Sectors</div>
                <div className="flex flex-wrap gap-1">
                  {marketRegime.sectors.bullish.map(s => (
                    <span key={s} className="label-tag bg-signal-bull/10 text-signal-bull">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-signal-bear uppercase tracking-wider mb-1">Bearish Sectors</div>
                <div className="flex flex-wrap gap-1">
                  {marketRegime.sectors.bearish.map(s => (
                    <span key={s} className="label-tag bg-signal-bear/10 text-signal-bear">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="h-1.5 bg-bg-border rounded-full overflow-hidden w-32 mt-8">
              <div className="h-full bg-signal-bull rounded-full" style={{ width: `${marketRegime.confidence}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Probability Gauges */}
      <div className="card-glass rounded-xl p-4">
        <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-4">
          Market Probability Dashboard
        </div>
        <div className="flex flex-wrap gap-6 justify-around">
          <ProbabilityGauge value={84} label="Bull Rally Probability" color="#00E676" />
          <ProbabilityGauge value={72} label="Sector Rotation Probability" color="#00BCD4" />
          <ProbabilityGauge value={87} label="FII Flow Continuation" color="#B8860B" />
          <ProbabilityGauge value={68} label="Rate Cut Probability" color="#DC143C" />
          <ProbabilityGauge value={91} label="Defence Rally Probability" color="#00E676" />
          <ProbabilityGauge value={28} label="Market Crash Risk" color="#FF1744" />
        </div>
      </div>

      {/* ML Model Signals */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-bg-border">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">ML Model Signals</div>
        </div>
        <div className="divide-y divide-bg-border/50">
          {mlSignals.map((m, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-hover">
              <div className="flex-shrink-0 w-28 text-[10px] text-ivory-500 font-semibold">{m.model}</div>
              <div className="flex-1 text-xs text-ivory-400">{m.desc}</div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "label-tag text-[10px]",
                  ["BULLISH", "RISK ON", "OPTIMISTIC", "BREAKOUT"].includes(m.signal)
                    ? "bg-signal-bull/15 text-signal-bull"
                    : "bg-signal-bear/15 text-signal-bear"
                )}>
                  {m.signal}
                </span>
                <span className={cn("text-xs font-mono font-bold", scoreColor(m.confidence))}>{m.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + Predictions */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: "all", label: "All Predictions" },
          { id: "bullish", label: "Bullish" },
          { id: "rotation", label: "Rotation" },
          { id: "crash_alert", label: "Risk Alerts" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
              activeFilter === f.id
                ? "bg-maroon-800/40 text-maroon-300 border-maroon-800/50"
                : "text-ivory-600 border-transparent hover:text-ivory-300 hover:border-bg-border"
            )}
          >{f.label}</button>
        ))}
        <span className="ml-auto text-xs text-ivory-600">{filtered.length} predictions</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(pred => (
          <PredictionCard key={pred.id} pred={pred} ltp={quotes.get(pred.target)?.ltp} />
        ))}
      </div>

      {/* Historical accuracy disclaimer */}
      <div className="card-glass rounded-xl p-3 border-l-2 border-maroon-800">
        <p className="text-[11px] text-ivory-500 leading-relaxed">
          <span className="text-maroon-400 font-semibold">Disclaimer:</span> AI predictions are based on quantitative models, historical patterns, and institutional flow data.
          Past accuracy does not guarantee future performance. These are probabilistic forecasts, not financial advice.
          Always validate with your own analysis and risk management framework before trading.
        </p>
      </div>
    </div>
  );
}
