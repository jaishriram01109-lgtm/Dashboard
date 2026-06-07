"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Zap, Target } from "lucide-react";
import { useAngelQuotes } from "@/hooks/useAngelData";
import { dayRSI } from "@/lib/angelData";
import {
  BarChart, LineChart,
  Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";

interface BreakoutStock {
  symbol: string; sector: string; price: number; high52W: number; low52W: number;
  fromHigh: number; fromLow: number; type: "NEW_HIGH" | "NEW_LOW" | "NEAR_HIGH" | "NEAR_LOW";
  volume: number; volVsAvg: number; rsi: number; breakoutQuality: number;
  signal: "BREAKOUT" | "BREAKDOWN" | "WATCH_HIGH" | "WATCH_LOW";
  daysAtHigh: number;
}

const STOCKS: BreakoutStock[] = [
  { symbol: "ZOMATO",    sector: "Consumer", price: 245.4, high52W: 245.4, low52W: 148.2, fromHigh: 0.0,  fromLow: 65.6,  type: "NEW_HIGH",   volume: 12450000, volVsAvg: 3.4, rsi: 72, breakoutQuality: 88, signal: "BREAKOUT",   daysAtHigh: 1  },
  { symbol: "BAJFINANCE",sector: "Finance",  price: 7234,  high52W: 7260,  low52W: 5890,  fromHigh: -0.4, fromLow: 22.8,  type: "NEAR_HIGH",  volume: 2340000,  volVsAvg: 2.1, rsi: 68, breakoutQuality: 81, signal: "WATCH_HIGH", daysAtHigh: 3  },
  { symbol: "COALINDIA", sector: "Mining",   price: 456,   high52W: 457.8, low52W: 312.4, fromHigh: -0.4, fromLow: 46.0,  type: "NEAR_HIGH",  volume: 5670000,  volVsAvg: 1.8, rsi: 66, breakoutQuality: 74, signal: "WATCH_HIGH", daysAtHigh: 2  },
  { symbol: "SUNPHARMA", sector: "Pharma",   price: 1678,  high52W: 1681,  low52W: 1234,  fromHigh: -0.2, fromLow: 36.0,  type: "NEAR_HIGH",  volume: 1340000,  volVsAvg: 2.4, rsi: 71, breakoutQuality: 82, signal: "WATCH_HIGH", daysAtHigh: 1  },
  { symbol: "RELIANCE",  sector: "Energy",   price: 2987,  high52W: 3024,  low52W: 2220,  fromHigh: -1.2, fromLow: 34.6,  type: "NEAR_HIGH",  volume: 4520000,  volVsAvg: 1.6, rsi: 63, breakoutQuality: 69, signal: "WATCH_HIGH", daysAtHigh: 5  },
  { symbol: "PAYTM",     sector: "Fintech",  price: 345,   high52W: 892,   low52W: 318,   fromHigh: -61.3,fromLow: 8.5,   type: "NEAR_LOW",   volume: 8760000,  volVsAvg: 2.8, rsi: 28, breakoutQuality: 24, signal: "WATCH_LOW",  daysAtHigh: 0  },
  { symbol: "TATASTEEL", sector: "Metals",   price: 876,   high52W: 1245,  low52W: 872,   fromHigh: -29.6,fromLow: 0.5,   type: "NEAR_LOW",   volume: 9870000,  volVsAvg: 3.1, rsi: 24, breakoutQuality: 18, signal: "WATCH_LOW",  daysAtHigh: 0  },
  { symbol: "HINDALCO",  sector: "Metals",   price: 678,   high52W: 1012,  low52W: 650,   fromHigh: -33.0,fromLow: 4.3,   type: "NEAR_LOW",   volume: 7650000,  volVsAvg: 2.2, rsi: 27, breakoutQuality: 22, signal: "WATCH_LOW",  daysAtHigh: 0  },
  { symbol: "WIPRO",     sector: "IT",       price: 456,   high52W: 634,   low52W: 412,   fromHigh: -28.1,fromLow: 10.7,  type: "NEAR_LOW",   volume: 5230000,  volVsAvg: 1.9, rsi: 32, breakoutQuality: 31, signal: "WATCH_LOW",  daysAtHigh: 0  },
];

const breakoutHistory = Array.from({ length: 20 }, (_, i) => ({
  date: `D${i + 1}`,
  newHighs: Math.round(8 + Math.sin(i * 0.4) * 5 + Math.cos(i * 0.3) * 3),
  newLows: Math.round(4 + Math.sin(i * 0.35 + 2) * 3 + Math.cos(i * 0.25) * 2),
}));

const qualityDist = [
  { range: "90-100", count: 3, label: "Excellent" },
  { range: "75-89",  count: 8, label: "Good" },
  { range: "60-74",  count: 12, label: "Fair" },
  { range: "40-59",  count: 7, label: "Weak" },
  { range: "0-39",   count: 4, label: "Poor" },
];

const signalBg: Record<BreakoutStock["signal"], string> = {
  BREAKOUT:   "bg-signal-bull/30 text-signal-bull",
  BREAKDOWN:  "bg-signal-bear/30 text-signal-bear",
  WATCH_HIGH: "bg-signal-bull/15 text-signal-bull",
  WATCH_LOW:  "bg-signal-bear/15 text-signal-bear",
};

export default function HighLowScanner() {
  const [filter, setFilter] = useState<"ALL" | "NEW_HIGH" | "NEAR_HIGH" | "NEAR_LOW" | "NEW_LOW">("ALL");
  const { quotes, isLive } = useAngelQuotes();

  const liveStocks = useMemo<BreakoutStock[]>(() =>
    STOCKS.map(stock => {
      const q = quotes.get(stock.symbol);
      if (!q) return stock;
      const price = q.ltp;
      const fromHigh = ((price - stock.high52W) / stock.high52W) * 100;
      const fromLow = ((price - stock.low52W) / stock.low52W) * 100;
      const type: BreakoutStock["type"] =
        fromHigh >= -0.5 ? "NEW_HIGH" :
        fromHigh >= -2   ? "NEAR_HIGH" :
        fromLow  <= 0.5  ? "NEW_LOW"   :
        fromLow  <= 5    ? "NEAR_LOW"  : stock.type;
      const signal: BreakoutStock["signal"] =
        type === "NEW_HIGH"  ? "BREAKOUT"   :
        type === "NEAR_HIGH" ? "WATCH_HIGH" :
        type === "NEW_LOW"   ? "BREAKDOWN"  : "WATCH_LOW";
      return { ...stock, price, fromHigh, fromLow, type, signal, volume: q.volume, rsi: dayRSI(q) };
    }), [quotes]);

  const filtered = filter === "ALL" ? liveStocks : liveStocks.filter((s) => s.type === filter);
  const newHighs = liveStocks.filter((s) => s.type === "NEW_HIGH").length;
  const nearHighs = liveStocks.filter((s) => s.type === "NEAR_HIGH").length;
  const nearLows = liveStocks.filter((s) => s.type === "NEAR_LOW").length;
  const newLows = liveStocks.filter((s) => s.type === "NEW_LOW").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide flex items-center gap-2">
            52W High / Low Scanner
            {isLive && <span className="label-tag bg-signal-bull/15 text-signal-bull text-[9px]">● LIVE</span>}
          </h2>
          <p className="text-xs text-ivory-500 mt-0.5">Breakout quality scoring · Volume confirmation · Follow-through analysis</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "New 52W High",  value: newHighs,  color: "text-signal-bull", icon: TrendingUp,   sub: "Fresh breakouts" },
          { label: "Near 52W High", value: nearHighs, color: "text-signal-bull", icon: Target,       sub: "Within 2%" },
          { label: "Near 52W Low",  value: nearLows,  color: "text-signal-bear", icon: TrendingDown, sub: "Within 5%" },
          { label: "New 52W Low",   value: newLows,   color: "text-signal-bear", icon: Zap,          sub: "Breakdown" },
        ].map(({ label, value, color, icon: Icon, sub }) => (
          <div key={label} className="card-base p-3 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <div className="text-[10px] text-ivory-600 uppercase tracking-wider">{label}</div>
              <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
              <div className="text-[9px] text-ivory-700">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", "NEW_HIGH", "NEAR_HIGH", "NEAR_LOW", "NEW_LOW"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[10px] px-3 py-1 rounded-full border transition-all ${filter === f ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Main table */}
      <div className="card-base p-4">
        <div className="grid grid-cols-10 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border">
          {["Symbol", "Sector", "Price", "52W High", "52W Low", "From High", "Vol×Avg", "RSI", "Quality", "Signal"].map((h) => <div key={h}>{h}</div>)}
        </div>
        {filtered.map((s) => (
          <div key={s.symbol} className="grid grid-cols-10 gap-2 text-[10px] px-2 py-2.5 border-b border-bg-border/40 hover:bg-bg-hover items-center">
            <div className="font-bold text-ivory-100">{s.symbol}</div>
            <div className="text-ivory-500">{s.sector}</div>
            <div className="font-mono text-ivory-200">₹{s.price.toLocaleString()}</div>
            <div className="font-mono text-signal-bull">₹{s.high52W.toLocaleString()}</div>
            <div className="font-mono text-signal-bear">₹{s.low52W.toLocaleString()}</div>
            <div className={`font-mono font-semibold ${s.fromHigh > -3 ? "text-signal-bull" : s.fromHigh > -15 ? "text-gold-500" : "text-signal-bear"}`}>
              {s.fromHigh.toFixed(1)}%
            </div>
            <div className={`font-mono font-semibold ${s.volVsAvg > 2 ? "text-signal-bull" : s.volVsAvg > 1.5 ? "text-gold-500" : "text-ivory-500"}`}>{s.volVsAvg}×</div>
            <div className={`font-mono ${s.rsi > 70 ? "text-signal-bear" : s.rsi < 30 ? "text-signal-bull" : "text-ivory-400"}`}>{s.rsi}</div>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-2 bg-bg-primary rounded overflow-hidden">
                <div className={`h-full rounded ${s.breakoutQuality > 75 ? "bg-signal-bull" : s.breakoutQuality > 50 ? "bg-gold-500" : "bg-signal-bear"}`}
                  style={{ width: `${s.breakoutQuality}%` }} />
              </div>
              <span className="text-[9px] text-ivory-500 w-6">{s.breakoutQuality}</span>
            </div>
            <div className={`text-[9px] px-1.5 py-0.5 rounded text-center font-semibold ${signalBg[s.signal]}`}>{s.signal.replace("_", " ")}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Daily High/Low history */}
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Daily New 52W Highs vs Lows — 20 Days</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={breakoutHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <Bar dataKey="newHighs" name="New Highs" fill="#166534" radius={[2, 2, 0, 0]} />
              <Bar dataKey="newLows" name="New Lows" fill="#7c1d1d" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quality distribution */}
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Breakout Quality Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={qualityDist} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="range" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [v, "Count"]} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {qualityDist.map((_, i) => (
                  <Cell key={i} fill={["#166534", "#22c55e", "#d4af37", "#f97316", "#7c1d1d"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
