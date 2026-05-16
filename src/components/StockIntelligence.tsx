"use client";
import { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, AlertCircle, Activity, BookOpen, BarChart2 } from "lucide-react";
import { stockData } from "@/lib/mockData";
import type { StockData } from "@/lib/types";
import { useAngelQuotes } from "@/hooks/useAngelData";
import {
  cn, fmt, fmtPct, fmtCr, colorFromChange, signalColor, signalLabel,
  scoreColor, scoreBg, phaseColor, rsiColor, trendColor,
} from "@/lib/utils";
import {
  ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

function TrendBadge({ trend }: { trend: string }) {
  const map: Record<string, string> = {
    bullish: "bg-signal-bull/15 text-signal-bull border-signal-bull/30",
    bearish: "bg-signal-bear/15 text-signal-bear border-signal-bear/30",
    neutral: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    accumulation: "bg-signal-accumulate/15 text-signal-accumulate border-signal-accumulate/30",
    distribution: "bg-signal-distribute/15 text-signal-distribute border-signal-distribute/30",
  };
  return (
    <span className={cn("label-tag border text-[10px] uppercase", map[trend] ?? "bg-ivory-800/20 text-ivory-400")}>
      {trend}
    </span>
  );
}

function SparklineArea({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map(v => ({ v }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={`spark-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={positive ? "#00E676" : "#FF1744"} stopOpacity={0.4} />
            <stop offset="100%" stopColor={positive ? "#00E676" : "#FF1744"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v"
          stroke={positive ? "#00E676" : "#FF1744"} strokeWidth={1.5}
          fill={`url(#spark-${positive})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function AIScoreRing({ score }: { score: number }) {
  const color = score >= 85 ? "#00E676" : score >= 70 ? "#00BCD4" : score >= 50 ? "#FFB300" : "#FF1744";
  const circumference = 2 * Math.PI * 20;
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#1E1E24" strokeWidth="4" />
        <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color}66)` }} />
      </svg>
      <span className="absolute text-xs font-mono font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function StockCard({ stock, onClick, selected }: { stock: StockData; onClick: () => void; selected: boolean }) {
  const spark = Array.from({ length: 15 }, (_, i) =>
    stock.price * (1 + (Math.random() - 0.48) * 0.008 * i)
  );
  const isPositive = stock.changePct >= 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "card-glass rounded-xl p-3 cursor-pointer transition-all",
        selected ? "glow-border-maroon border-maroon-700/60" : ""
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-ivory-100">{stock.symbol}</span>
            {stock.accumulating && (
              <span className="label-tag bg-signal-accumulate/20 text-signal-accumulate">ACCUM</span>
            )}
          </div>
          <div className="text-[10px] text-ivory-600 truncate">{stock.name}</div>
        </div>
        <AIScoreRing score={stock.aiScore} />
      </div>

      {/* Price */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-base font-mono font-bold text-ivory-100">₹{fmt(stock.price)}</div>
          <div className={cn("text-xs font-mono", colorFromChange(stock.changePct))}>
            {isPositive ? "+" : ""}{fmt(stock.change, 2)} ({fmtPct(stock.changePct)})
          </div>
        </div>
        <div className="w-24 h-10">
          <SparklineArea data={spark} positive={isPositive} />
        </div>
      </div>

      {/* Signal + Phase */}
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("label-tag border text-[10px]", signalColor(stock.signal))}>
          {signalLabel(stock.signal)}
        </span>
        <span className={cn("text-[10px] font-semibold uppercase", phaseColor(stock.phase))}>
          {stock.phase}
        </span>
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        {[
          { label: "AI", value: stock.aiScore },
          { label: "SM", value: stock.smartMoneyScore },
          { label: "Inst", value: stock.institutionalScore },
        ].map(s => (
          <div key={s.label}>
            <div className={cn("font-mono font-bold text-sm", scoreColor(s.value))}>{s.value}</div>
            <div className="text-ivory-600">{s.label}</div>
          </div>
        ))}
      </div>

      {stock.aiAlert && (
        <div className="mt-2 pt-2 border-t border-bg-border flex items-start gap-1.5">
          <AlertCircle className="w-3 h-3 text-gold-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-gold-500 leading-tight">{stock.aiAlert}</p>
        </div>
      )}
    </div>
  );
}

function StockDetail({ stock }: { stock: StockData }) {
  const [tab, setTab] = useState<"fundamental" | "technical">("fundamental");
  const f = stock.fundamentals;
  const t = stock.technicals;

  const radarFundamentals = [
    { subject: "ROE", A: Math.min(f.roe * 2.5, 100) },
    { subject: "Growth", A: Math.min(f.profitGrowth * 2, 100) },
    { subject: "Quality", A: f.earningsQuality },
    { subject: "Value", A: f.valuationScore },
    { subject: "FCF", A: f.futureGrowthScore },
    { subject: "Moat", A: f.earningsQuality },
  ];

  return (
    <div className="card-glass rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-lg text-ivory-100">{stock.symbol}</h3>
            <span className={cn("label-tag border", signalColor(stock.signal))}>{signalLabel(stock.signal)}</span>
            {stock.accumulating && <span className="label-tag bg-signal-accumulate/20 text-signal-accumulate">ACCUMULATING</span>}
          </div>
          <div className="text-xs text-ivory-500">{stock.name} • {stock.sector}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono font-bold text-ivory-100">₹{fmt(stock.price)}</div>
          <div className={cn("text-sm font-mono", colorFromChange(stock.changePct))}>
            {stock.changePct >= 0 ? "+" : ""}{fmtPct(stock.changePct)}
          </div>
        </div>
      </div>

      {/* Scores row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "AI Score", value: stock.aiScore, icon: "🤖" },
          { label: "Smart Money", value: stock.smartMoneyScore, icon: "💰" },
          { label: "Institutional", value: stock.institutionalScore, icon: "🏦" },
        ].map(s => (
          <div key={s.label} className="bg-bg-secondary rounded-lg p-2 text-center">
            <div className="text-lg">{s.icon}</div>
            <div className={cn("text-2xl font-mono font-bold", scoreColor(s.value))}>{s.value}</div>
            <div className="text-[10px] text-ivory-600">{s.label}</div>
            <div className="mt-1.5 h-1 bg-bg-border rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", scoreBg(s.value))} style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* AI Alert */}
      {stock.aiAlert && (
        <div className="rounded-lg bg-gold-600/10 border border-gold-600/30 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gold-400 leading-relaxed">{stock.aiAlert}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["fundamental", "technical"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors",
              tab === t ? "bg-maroon-800/40 text-maroon-300 border border-maroon-800/50" : "text-ivory-600 hover:text-ivory-300"
            )}
          >
            {t === "fundamental" ? <><BookOpen className="inline w-3 h-3 mr-1" />Fundamentals</> : <><BarChart2 className="inline w-3 h-3 mr-1" />Technicals</>}
          </button>
        ))}
      </div>

      {tab === "fundamental" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            {[
              { label: "Market Cap", value: fmtCr(f.marketCap) },
              { label: "PE Ratio", value: `${f.peRatio}x` },
              { label: "PB Ratio", value: `${f.pbRatio}x` },
              { label: "ROE", value: `${f.roe}%`, pos: true },
              { label: "ROCE", value: `${f.roce}%`, pos: true },
              { label: "Debt/Equity", value: f.debtToEquity.toFixed(2), pos: f.debtToEquity < 0.5 },
              { label: "Dividend Yield", value: `${f.dividendYield}%` },
              { label: "Intrinsic Value", value: `₹${fmt(f.intrinsicValue)}` },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs py-0.5 border-b border-bg-border/30">
                <span className="text-ivory-500">{r.label}</span>
                <span className={cn("font-mono font-semibold", r.pos !== undefined ? (r.pos ? "text-signal-bull" : "text-signal-bear") : "text-ivory-200")}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[
              { label: "Revenue Growth", value: `+${f.revenueGrowth}% YoY`, pos: true },
              { label: "Profit Growth", value: `+${f.profitGrowth}% YoY`, pos: true },
              { label: "EPS Growth", value: `+${f.epsGrowth}% YoY`, pos: true },
              { label: "Promoter Hold", value: `${f.promoterHolding}%` },
              { label: "FII Hold", value: `${f.fiiHolding}%` },
              { label: "FII Change", value: `${f.fiiChangePct > 0 ? "+" : ""}${f.fiiChangePct}%`, pos: f.fiiChangePct > 0 },
              { label: "DII Hold", value: `${f.diiHolding}%` },
              { label: "DII Change", value: `${f.diiChangePct > 0 ? "+" : ""}${f.diiChangePct}%`, pos: f.diiChangePct > 0 },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs py-0.5 border-b border-bg-border/30">
                <span className="text-ivory-500">{r.label}</span>
                <span className={cn("font-mono font-semibold", r.pos !== undefined ? (r.pos ? "text-signal-bull" : "text-signal-bear") : "text-ivory-200")}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            {[
              { label: "RSI (14)", value: t.rsi.toFixed(1), color: rsiColor(t.rsi) },
              { label: "MACD", value: t.macd.toFixed(2), color: colorFromChange(t.macd) },
              { label: "EMA 20", value: `₹${fmt(t.ema20)}` },
              { label: "EMA 50", value: `₹${fmt(t.ema50)}` },
              { label: "EMA 200", value: `₹${fmt(t.ema200)}` },
              { label: "VWAP", value: `₹${fmt(t.vwap)}` },
              { label: "ATR", value: `₹${t.atr.toFixed(2)}` },
              { label: "Delivery %", value: `${t.deliveryPct}%`, color: t.deliveryPct >= 60 ? "text-signal-bull" : "text-ivory-200" },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs py-0.5 border-b border-bg-border/30">
                <span className="text-ivory-500">{r.label}</span>
                <span className={cn("font-mono font-semibold", r.color ?? "text-ivory-200")}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {[
              { label: "Trend (D/W/M)", value: `${t.trend1D} / ${t.trend1W} / ${t.trend1M}` },
              { label: "Volume vs Avg", value: `${(t.volume / t.avgVolume20D).toFixed(2)}x`, color: t.volume > t.avgVolume20D ? "text-signal-bull" : "text-ivory-200" },
              { label: "Breakout Zone", value: `₹${fmt(t.breakoutZone)}` },
              { label: "Support", value: `₹${fmt(t.supportZone)}` },
              { label: "Resistance", value: `₹${fmt(t.resistanceZone)}` },
              { label: "Demand Zone", value: `₹${fmt(t.demandZone[0])} - ${fmt(t.demandZone[1])}` },
              { label: "OI Change", value: `${t.oiChange > 0 ? "+" : ""}${t.oiChange}%`, color: colorFromChange(t.oiChange) },
              { label: "RS Score", value: t.relativeStrength, color: scoreColor(t.relativeStrength) },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs py-0.5 border-b border-bg-border/30">
                <span className="text-ivory-500">{r.label}</span>
                <span className={cn("font-mono font-semibold", r.color ?? "text-ivory-200")}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StockIntelligence() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StockData | null>(stockData[0]);
  const [sortBy, setSortBy] = useState<"aiScore" | "smartMoneyScore" | "changePct">("aiScore");
  const { quotes, isLive } = useAngelQuotes(30_000);

  const liveStockData = useMemo((): StockData[] => {
    if (!isLive || quotes.size === 0) return stockData;
    return stockData.map(s => {
      const q = quotes.get(s.symbol) ?? quotes.get(s.symbol.toUpperCase());
      if (!q) return s;
      return { ...s, price: q.ltp, change: q.change, changePct: q.changePct };
    });
  }, [quotes, isLive]);

  const filtered = liveStockData
    .filter(s =>
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.sector.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "aiScore") return b.aiScore - a.aiScore;
      if (sortBy === "smartMoneyScore") return b.smartMoneyScore - a.smartMoneyScore;
      if (sortBy === "changePct") return b.changePct - a.changePct;
      return 0;
    });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Search className="w-5 h-5 text-maroon-600" />
            Stock Intelligence Engine
          </h2>
          <p className="text-xs text-ivory-500 flex items-center gap-1">
            {isLive ? <><span className="w-1.5 h-1.5 rounded-full bg-signal-bull inline-block animate-pulse" /> Live prices — Angel One SmartAPI</> : "Full fundamental + technical + AI analysis for every NSE stock"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-600" />
          <input
            type="text"
            placeholder="Search symbol, name, sector..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-bg-card border border-bg-border rounded-lg pl-9 pr-3 py-2 text-xs text-ivory-200 placeholder-ivory-600 outline-none focus:border-maroon-700 transition-colors"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-ivory-300 outline-none"
        >
          <option value="aiScore">Sort: AI Score</option>
          <option value="smartMoneyScore">Sort: Smart Money</option>
          <option value="changePct">Sort: % Change</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock cards */}
        <div className="lg:col-span-1 space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          {filtered.map(stock => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onClick={() => setSelected(stock)}
              selected={selected?.symbol === stock.symbol}
            />
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <StockDetail stock={selected} />
          ) : (
            <div className="card-glass rounded-xl h-64 flex items-center justify-center text-ivory-600 text-sm">
              Select a stock to view detailed analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
