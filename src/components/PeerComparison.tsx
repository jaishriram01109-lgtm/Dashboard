"use client";
import { useState } from "react";
import { GitCompare, Plus, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface StockProfile {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change1d: number;
  change1m: number;
  change3m: number;
  change1y: number;
  mktCap: number;
  pe: number;
  pb: number;
  evEbitda: number;
  roe: number;
  roce: number;
  de: number;
  salesGrowth: number;
  patGrowth: number;
  operatingMargin: number;
  netMargin: number;
  dividendYield: number;
  rsi: number;
  weekHigh52: number;
  weekLow52: number;
  smScore: number;
  aiScore: number;
  fiiHolding: number;
  promoterHolding: number;
  intrinsicValue: number;
  moat: "Wide" | "Narrow" | "None";
  aiVerdict: string;
}

const STOCKS: Record<string, StockProfile> = {
  HAL: {
    symbol: "HAL", name: "Hindustan Aeronautics", sector: "Defence", price: 4280, change1d: 3.8,
    change1m: 18.4, change3m: 32.1, change1y: 48.2, mktCap: 286000,
    pe: 34.2, pb: 9.1, evEbitda: 24.8, roe: 28.4, roce: 31.2, de: 0.0,
    salesGrowth: 22.4, patGrowth: 28.8, operatingMargin: 26.4, netMargin: 18.2,
    dividendYield: 0.82, rsi: 68, weekHigh52: 4480, weekLow52: 2420,
    smScore: 91, aiScore: 94, fiiHolding: 12.4, promoterHolding: 71.6,
    intrinsicValue: 4840, moat: "Wide",
    aiVerdict: "Best defence pick. Monopoly in fighter jets, helicopters. Record order book ₹98,000 Cr. Margin expansion expected.",
  },
  TCS: {
    symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", price: 3870, change1d: -0.4,
    change1m: -4.2, change3m: -8.4, change1y: -12.4, mktCap: 1406000,
    pe: 28.4, pb: 13.2, evEbitda: 20.4, roe: 47.1, roce: 52.4, de: 0.0,
    salesGrowth: 6.2, patGrowth: 4.8, operatingMargin: 24.8, netMargin: 18.4,
    dividendYield: 1.24, rsi: 42, weekHigh52: 4380, weekLow52: 3420,
    smScore: 58, aiScore: 65, fiiHolding: 14.8, promoterHolding: 72.3,
    intrinsicValue: 3640, moat: "Wide",
    aiVerdict: "Quality but expensive vs growth. FY27 guidance of 6-8% muted. Wait for better entry below ₹3,500.",
  },
  DLF: {
    symbol: "DLF", name: "DLF Limited", sector: "Realty", price: 918, change1d: 2.1,
    change1m: 12.4, change3m: 22.8, change1y: 38.4, mktCap: 228000,
    pe: 52.1, pb: 4.8, evEbitda: 28.4, roe: 9.2, roce: 8.8, de: 0.3,
    salesGrowth: 28.4, patGrowth: 42.8, operatingMargin: 32.4, netMargin: 22.1,
    dividendYield: 0.54, rsi: 62, weekHigh52: 940, weekLow52: 580,
    smScore: 84, aiScore: 82, fiiHolding: 18.2, promoterHolding: 74.1,
    intrinsicValue: 1020, moat: "Narrow",
    aiVerdict: "Premium realty play. Rate cut cycle + luxury housing demand. Pre-sales at record ₹21,000 Cr. Buy on dips.",
  },
  HDFCBANK: {
    symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: 1842, change1d: 0.8,
    change1m: 4.2, change3m: 8.4, change1y: 18.2, mktCap: 1398000,
    pe: 19.2, pb: 2.8, evEbitda: 12.4, roe: 15.8, roce: 14.2, de: 8.4,
    salesGrowth: 18.4, patGrowth: 14.2, operatingMargin: 42.8, netMargin: 24.8,
    dividendYield: 1.06, rsi: 52, weekHigh52: 1920, weekLow52: 1420,
    smScore: 68, aiScore: 72, fiiHolding: 22.4, promoterHolding: 0.0,
    intrinsicValue: 2040, moat: "Wide",
    aiVerdict: "Best private bank. Post-merger integration complete. Rate cut cycle very positive for NIMs. Accumulate on dips.",
  },
  TATAMOTORS: {
    symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", price: 842, change1d: 1.4,
    change1m: 8.4, change3m: -4.2, change1y: -14.2, mktCap: 311000,
    pe: 8.2, pb: 2.1, evEbitda: 6.4, roe: 28.4, roce: 22.1, de: 0.8,
    salesGrowth: 12.4, patGrowth: 84.2, operatingMargin: 11.4, netMargin: 6.8,
    dividendYield: 0.0, rsi: 61, weekHigh52: 1180, weekLow52: 684,
    smScore: 74, aiScore: 76, fiiHolding: 16.4, promoterHolding: 46.4,
    intrinsicValue: 980, moat: "Narrow",
    aiVerdict: "Cheapest valuation among auto stocks. JLR recovery play. Near 52W low — contrarian opportunity at current levels.",
  },
  SUNPHARMA: {
    symbol: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Pharma", price: 1745, change1d: 0.6,
    change1m: 2.4, change3m: 6.8, change1y: 22.4, mktCap: 418000,
    pe: 36.8, pb: 5.4, evEbitda: 22.4, roe: 16.2, roce: 18.9, de: 0.1,
    salesGrowth: 12.8, patGrowth: 18.4, operatingMargin: 28.4, netMargin: 22.8,
    dividendYield: 0.86, rsi: 55, weekHigh52: 1920, weekLow52: 1280,
    smScore: 62, aiScore: 68, fiiHolding: 18.8, promoterHolding: 54.4,
    intrinsicValue: 1940, moat: "Narrow",
    aiVerdict: "India's largest pharma. US specialty business growing 18% YoY. FDA risk mostly resolved. Long-term compounder.",
  },
  RVNL: {
    symbol: "RVNL", name: "Rail Vikas Nigam", sector: "Railway", price: 415, change1d: 1.9,
    change1m: 14.2, change3m: 28.4, change1y: 42.8, mktCap: 86000,
    pe: 29.4, pb: 6.2, evEbitda: 18.4, roe: 21.4, roce: 24.1, de: 0.1,
    salesGrowth: 24.8, patGrowth: 32.4, operatingMargin: 12.8, netMargin: 8.4,
    dividendYield: 1.24, rsi: 58, weekHigh52: 480, weekLow52: 180,
    smScore: 78, aiScore: 79, fiiHolding: 8.4, promoterHolding: 72.8,
    intrinsicValue: 480, moat: "Narrow",
    aiVerdict: "Railway capex supercycle beneficiary. Order book ₹95,000 Cr. High execution visibility. Buy on dips to ₹380.",
  },
};

const AVAILABLE_SYMBOLS = Object.keys(STOCKS);

const COLORS = ["#7c2d32", "#1d4ed8", "#15803d", "#b45309"];

// Generate rebased performance data (base = 100)
function genPerformanceData(symbols: string[]): { month: string; [key: string]: number | string }[] {
  const months = ["Jun-25", "Jul-25", "Aug-25", "Sep-25", "Oct-25", "Nov-25", "Dec-25", "Jan-26", "Feb-26", "Mar-26", "Apr-26", "May-26"];
  const seed: Record<string, number[]> = {
    HAL: [100, 108, 118, 128, 138, 144, 136, 148, 158, 168, 178, 148.2],
    TCS: [100, 98, 102, 96, 94, 92, 96, 90, 88, 92, 90, 87.6],
    DLF: [100, 106, 114, 118, 112, 122, 128, 132, 118, 128, 136, 138.4],
    HDFCBANK: [100, 102, 104, 108, 110, 108, 112, 114, 116, 118, 120, 118.2],
    TATAMOTORS: [100, 92, 88, 94, 88, 82, 86, 80, 84, 88, 86, 85.8],
    SUNPHARMA: [100, 104, 108, 106, 112, 116, 114, 118, 120, 122, 124, 122.4],
    RVNL: [100, 112, 124, 138, 128, 142, 152, 148, 158, 168, 178, 142.8],
  };
  return months.map((month, i) => {
    const row: { month: string; [key: string]: number | string } = { month };
    symbols.forEach(sym => { row[sym] = seed[sym]?.[i] ?? 100; });
    return row;
  });
}

function CompareCell({ a, b, better }: { a: number | string; b: number | string; better?: "higher" | "lower" }) {
  const aNum = typeof a === "number" ? a : parseFloat(String(a));
  const bNum = typeof b === "number" ? b : parseFloat(String(b));
  const aWins = better === "higher" ? aNum > bNum : better === "lower" ? aNum < bNum : false;
  const bWins = better === "higher" ? bNum > aNum : better === "lower" ? bNum < aNum : false;
  return (
    <div className="flex gap-0.5 text-center">
      <div className={cn("flex-1 font-mono text-xs py-1 rounded-l", aWins ? "bg-signal-bull/20 text-signal-bull font-bold" : "text-ivory-300")}>{a}</div>
      <div className={cn("flex-1 font-mono text-xs py-1 rounded-r", bWins ? "bg-signal-bull/20 text-signal-bull font-bold" : "text-ivory-300")}>{b}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px] space-y-0.5">
      <div className="text-ivory-500">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: {p.value.toFixed(1)}</div>
      ))}
    </div>
  );
};

export default function PeerComparison() {
  const [selected, setSelected] = useState<string[]>(["HAL", "TCS"]);

  const addStock = (sym: string) => {
    if (!selected.includes(sym) && selected.length < 4) setSelected(s => [...s, sym]);
  };
  const removeStock = (sym: string) => setSelected(s => s.filter(x => x !== sym));

  const profiles = selected.map(s => STOCKS[s]).filter(Boolean);
  const perfData = genPerformanceData(selected);

  // Radar data — normalize 0–100
  const radarData = [
    { metric: "Growth", ...Object.fromEntries(profiles.map(p => [p.symbol, Math.min(p.patGrowth * 2, 100)])) },
    { metric: "Profitability", ...Object.fromEntries(profiles.map(p => [p.symbol, Math.min(p.roce * 2, 100)])) },
    { metric: "Valuation", ...Object.fromEntries(profiles.map(p => [p.symbol, Math.max(0, 100 - p.pe * 1.5)])) },
    { metric: "Momentum", ...Object.fromEntries(profiles.map(p => [p.symbol, Math.min(Math.max(p.change3m + 50, 0), 100)])) },
    { metric: "Smart $", ...Object.fromEntries(profiles.map(p => [p.symbol, p.smScore])) },
    { metric: "Quality", ...Object.fromEntries(profiles.map(p => [p.symbol, Math.min(p.roe * 2.5, 100)])) },
  ];

  const winner = profiles.length >= 2
    ? profiles.reduce((best, p) => p.aiScore > best.aiScore ? p : best, profiles[0])
    : null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-maroon-600" />
            Peer Comparison
          </h2>
          <p className="text-xs text-ivory-500">Side-by-side stock analysis — fundamentals, technicals & AI verdict</p>
        </div>
        <div className="text-[10px] text-ivory-600 font-mono">Select up to 4 stocks</div>
      </div>

      {/* Stock Selector */}
      <div className="card-glass rounded-xl p-4">
        <div className="text-[10px] font-semibold text-ivory-500 uppercase tracking-wider mb-3">Selected Stocks</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((sym, i) => (
            <div key={sym} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold border"
              style={{ borderColor: COLORS[i], color: COLORS[i], background: `${COLORS[i]}15` }}>
              {sym}
              <button onClick={() => removeStock(sym)} className="opacity-60 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {selected.length < 4 && (
            <div className="flex flex-wrap gap-1">
              {AVAILABLE_SYMBOLS.filter(s => !selected.includes(s)).map(sym => (
                <button key={sym} onClick={() => addStock(sym)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-mono border border-bg-border text-ivory-600 hover:text-ivory-200 hover:border-maroon-800 transition-colors">
                  <Plus className="w-2.5 h-2.5" />{sym}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Winner */}
        {winner && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gold-500/10 border border-gold-500/20">
            <Trophy className="w-4 h-4 text-gold-500 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-gold-500">AI Pick: {winner.symbol}</span>
              <span className="text-[11px] text-ivory-400 ml-2">{winner.aiVerdict}</span>
            </div>
          </div>
        )}
      </div>

      {profiles.length >= 2 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Relative Performance Chart */}
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Relative Performance (Rebased to 100)</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={perfData}>
                <XAxis dataKey="month" tick={{ fontSize: 8, fill: "#8b8472" }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 8, fill: "#8b8472" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {profiles.map((p, i) => (
                  <Line key={p.symbol} type="monotone" dataKey={p.symbol} stroke={COLORS[i]}
                    strokeWidth={2} dot={false} name={p.symbol} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Comparison */}
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Multi-Dimension Score (0–100)</div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#3d3a32" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "#8b8472" }} />
                {profiles.map((p, i) => (
                  <Radar key={p.symbol} name={p.symbol} dataKey={p.symbol}
                    stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
                ))}
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {profiles.length >= 2 && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-bg-border bg-bg-secondary/50">
                  <th className="px-4 py-3 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider w-40">Metric</th>
                  {profiles.map((p, i) => (
                    <th key={p.symbol} className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS[i] }}>
                      {p.symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Price", key: "price", fmt: (v: number) => `₹${v.toLocaleString()}`, better: undefined },
                  { label: "1M Return", key: "change1m", fmt: (v: number) => `${v >= 0 ? "+" : ""}${v}%`, better: "higher" as const },
                  { label: "1Y Return", key: "change1y", fmt: (v: number) => `${v >= 0 ? "+" : ""}${v}%`, better: "higher" as const },
                  { label: "Market Cap", key: "mktCap", fmt: (v: number) => `₹${(v / 100000).toFixed(0)}K Cr`, better: undefined },
                  { label: "P/E Ratio", key: "pe", fmt: (v: number) => v.toFixed(1), better: "lower" as const },
                  { label: "P/B Ratio", key: "pb", fmt: (v: number) => v.toFixed(1), better: "lower" as const },
                  { label: "EV/EBITDA", key: "evEbitda", fmt: (v: number) => v.toFixed(1), better: "lower" as const },
                  { label: "ROE %", key: "roe", fmt: (v: number) => `${v}%`, better: "higher" as const },
                  { label: "ROCE %", key: "roce", fmt: (v: number) => `${v}%`, better: "higher" as const },
                  { label: "D/E Ratio", key: "de", fmt: (v: number) => v.toFixed(1), better: "lower" as const },
                  { label: "Sales Growth", key: "salesGrowth", fmt: (v: number) => `${v}%`, better: "higher" as const },
                  { label: "PAT Growth", key: "patGrowth", fmt: (v: number) => `${v}%`, better: "higher" as const },
                  { label: "Op. Margin", key: "operatingMargin", fmt: (v: number) => `${v}%`, better: "higher" as const },
                  { label: "Dividend Yield", key: "dividendYield", fmt: (v: number) => `${v}%`, better: "higher" as const },
                  { label: "RSI", key: "rsi", fmt: (v: number) => v.toString(), better: undefined },
                  { label: "SM Score", key: "smScore", fmt: (v: number) => v.toString(), better: "higher" as const },
                  { label: "AI Score", key: "aiScore", fmt: (v: number) => v.toString(), better: "higher" as const },
                  { label: "Intrinsic Value", key: "intrinsicValue", fmt: (v: number) => `₹${v.toLocaleString()}`, better: undefined },
                  { label: "FII Holding", key: "fiiHolding", fmt: (v: number) => `${v}%`, better: "higher" as const },
                  { label: "Promoter %", key: "promoterHolding", fmt: (v: number) => `${v}%`, better: "higher" as const },
                ].map(({ label, key, fmt, better }, ri) => {
                  const vals = profiles.map(p => (p as any)[key] as number);
                  const bestVal = better === "higher" ? Math.max(...vals) : better === "lower" ? Math.min(...vals) : null;
                  return (
                    <tr key={label} className={cn("border-b border-bg-border/40 hover:bg-bg-hover", ri % 2 === 0 && "bg-bg-primary/15")}>
                      <td className="px-4 py-2 text-[11px] text-ivory-500 font-medium">{label}</td>
                      {profiles.map((p, i) => {
                        const val = (p as any)[key] as number;
                        const isBest = bestVal !== null && val === bestVal;
                        return (
                          <td key={p.symbol} className={cn("px-4 py-2 text-center font-mono text-[11px]",
                            isBest ? "text-signal-bull font-bold bg-signal-bull/5" : "text-ivory-300"
                          )}>
                            {fmt(val)}
                            {isBest && profiles.length >= 2 && <span className="ml-1 text-[8px]">★</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* AI Verdict Row */}
                <tr className="border-b border-bg-border/40 bg-maroon-950/20">
                  <td className="px-4 py-3 text-[11px] text-maroon-400 font-bold">AI Verdict</td>
                  {profiles.map(p => (
                    <td key={p.symbol} className="px-4 py-3 text-[10px] text-ivory-400 leading-relaxed">{p.aiVerdict}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
