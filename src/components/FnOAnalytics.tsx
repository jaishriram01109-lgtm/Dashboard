"use client";
import { useState, useMemo } from "react";
import { Activity, TrendingUp, TrendingDown, BarChart3, RefreshCw } from "lucide-react";
import { useAngelQuotes } from "@/hooks/useAngelData";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, ComposedChart, Area,
} from "recharts";

type FnOTab = "futures" | "oi" | "pcr" | "rollover";
type Signal = "long_buildup" | "short_buildup" | "long_unwinding" | "short_covering";

interface FuturesRow {
  symbol: string;
  expiry: string;
  spot: number;
  ltp: number;
  basis: number;
  basisPct: number;
  oi: number;
  oiChange: number;
  oiChangePct: number;
  volume: number;
  rollover: number;
  costOfCarry: number;
  signal: Signal;
}

const SIGNAL_CONFIG: Record<Signal, { label: string; bg: string; text: string; desc: string }> = {
  long_buildup:    { label: "Long Buildup", bg: "bg-signal-bull/15", text: "text-signal-bull", desc: "Price↑ + OI↑" },
  short_buildup:   { label: "Short Buildup", bg: "bg-signal-bear/15", text: "text-signal-bear", desc: "Price↓ + OI↑" },
  long_unwinding:  { label: "Long Unwinding", bg: "bg-orange-500/15", text: "text-orange-400", desc: "Price↓ + OI↓" },
  short_covering:  { label: "Short Covering", bg: "bg-yellow-500/15", text: "text-yellow-400", desc: "Price↑ + OI↓" },
};

const FUTURES: FuturesRow[] = [
  { symbol: "NIFTY", expiry: "29-May", spot: 24180, ltp: 24208, basis: 28, basisPct: 0.12, oi: 12850000, oiChange: 520000, oiChangePct: 4.2, volume: 8420000, rollover: 62, costOfCarry: 6.8, signal: "long_buildup" },
  { symbol: "BANKNIFTY", expiry: "29-May", spot: 52340, ltp: 52480, basis: 140, basisPct: 0.27, oi: 4120000, oiChange: 280000, oiChangePct: 7.3, volume: 3150000, rollover: 58, costOfCarry: 7.2, signal: "long_buildup" },
  { symbol: "HAL", expiry: "29-May", spot: 4280, ltp: 4296, basis: 16, basisPct: 0.37, oi: 1840000, oiChange: 420000, oiChangePct: 29.6, volume: 980000, rollover: 44, costOfCarry: 8.1, signal: "long_buildup" },
  { symbol: "TCS", expiry: "29-May", spot: 3870, ltp: 3858, basis: -12, basisPct: -0.31, oi: 2100000, oiChange: 180000, oiChangePct: 9.4, volume: 720000, rollover: 71, costOfCarry: 6.1, signal: "short_buildup" },
  { symbol: "TATAMOTORS", expiry: "29-May", spot: 842, ltp: 849, basis: 7, basisPct: 0.83, oi: 6840000, oiChange: -380000, oiChangePct: -5.3, volume: 4200000, rollover: 55, costOfCarry: 9.2, signal: "short_covering" },
  { symbol: "SUNPHARMA", expiry: "29-May", spot: 1745, ltp: 1740, basis: -5, basisPct: -0.29, oi: 3280000, oiChange: -210000, oiChangePct: -6.0, volume: 1840000, rollover: 68, costOfCarry: 5.8, signal: "long_unwinding" },
  { symbol: "DLF", expiry: "29-May", spot: 918, ltp: 927, basis: 9, basisPct: 0.98, oi: 5120000, oiChange: 640000, oiChangePct: 14.3, volume: 2980000, rollover: 39, costOfCarry: 10.1, signal: "long_buildup" },
  { symbol: "TATASTEEL", expiry: "29-May", spot: 162, ltp: 160, basis: -2, basisPct: -1.23, oi: 9840000, oiChange: 720000, oiChangePct: 7.9, volume: 6120000, rollover: 76, costOfCarry: 5.2, signal: "short_buildup" },
  { symbol: "HDFCBANK", expiry: "29-May", spot: 1842, ltp: 1845, basis: 3, basisPct: 0.16, oi: 7420000, oiChange: -120000, oiChangePct: -1.6, volume: 3840000, rollover: 83, costOfCarry: 6.4, signal: "short_covering" },
  { symbol: "RVNL", expiry: "29-May", spot: 415, ltp: 419, basis: 4, basisPct: 0.96, oi: 4280000, oiChange: 580000, oiChangePct: 15.7, volume: 3120000, rollover: 31, costOfCarry: 9.8, signal: "long_buildup" },
];

const PCR_HISTORY = [
  { date: "05-May", pcr: 0.82 }, { date: "06-May", pcr: 0.91 }, { date: "07-May", pcr: 1.08 },
  { date: "08-May", pcr: 1.15 }, { date: "09-May", pcr: 0.98 }, { date: "10-May", pcr: 0.88 },
  { date: "12-May", pcr: 1.02 }, { date: "13-May", pcr: 1.18 }, { date: "14-May", pcr: 1.25 },
  { date: "15-May", pcr: 1.14 },
];

const OI_GAINERS = [
  { symbol: "HAL", change: 29.6, signal: "long_buildup" as Signal },
  { symbol: "RVNL", change: 15.7, signal: "long_buildup" as Signal },
  { symbol: "DLF", change: 14.3, signal: "long_buildup" as Signal },
  { symbol: "BANKNIFTY", change: 7.3, signal: "long_buildup" as Signal },
  { symbol: "TATASTEEL", change: 7.9, signal: "short_buildup" as Signal },
];

const OI_LOSERS = [
  { symbol: "SUNPHARMA", change: -6.0, signal: "long_unwinding" as Signal },
  { symbol: "TATAMOTORS", change: -5.3, signal: "short_covering" as Signal },
  { symbol: "HDFCBANK", change: -1.6, signal: "short_covering" as Signal },
];

const ROLLOVER_DATA = [
  { symbol: "HDFCBANK", curr: 83, prev: 76, cost: 6.4 },
  { symbol: "TCS", curr: 71, prev: 68, cost: 6.1 },
  { symbol: "SUNPHARMA", curr: 68, prev: 65, cost: 5.8 },
  { symbol: "NIFTY", curr: 62, prev: 59, cost: 6.8 },
  { symbol: "BANKNIFTY", curr: 58, prev: 54, cost: 7.2 },
  { symbol: "TATAMOTORS", curr: 55, prev: 61, cost: 9.2 },
  { symbol: "TATASTEEL", curr: 76, prev: 70, cost: 5.2 },
  { symbol: "DLF", curr: 39, prev: 42, cost: 10.1 },
  { symbol: "RVNL", curr: 31, prev: 28, cost: 9.8 },
  { symbol: "HAL", curr: 44, prev: 38, cost: 8.1 },
];

function fmtOI(v: number) {
  if (v >= 10000000) return (v / 10000000).toFixed(2) + "Cr";
  if (v >= 100000) return (v / 100000).toFixed(1) + "L";
  return v.toLocaleString();
}

function SignalBadge({ signal }: { signal: Signal }) {
  const c = SIGNAL_CONFIG[signal];
  return <span className={cn("label-tag text-[9px]", c.bg, c.text)}>{c.label}</span>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px] space-y-0.5">
      <div className="text-ivory-400">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export default function FnOAnalytics() {
  const [tab, setTab] = useState<FnOTab>("futures");
  const [signalFilter, setSignalFilter] = useState<"all" | Signal>("all");
  const { quotes, isLive } = useAngelQuotes();

  // Overlay real spot prices and derive signals from live data
  const liveFutures = useMemo<FuturesRow[]>(() => {
    return FUTURES.map(row => {
      const q = quotes.get(row.symbol);
      if (!q) return row;
      const spot = q.ltp;
      const basisPct = +((row.basisPct) * (spot / row.spot)).toFixed(2);
      const basis = Math.round(spot * basisPct / 100);
      const ltp = spot + basis;
      const signal: Signal =
        q.changePct > 0.4 && q.volume > 500_000 ? "long_buildup" :
        q.changePct < -0.4 && q.volume > 500_000 ? "short_buildup" :
        q.changePct < 0 ? "long_unwinding" : "short_covering";
      const oiChange = Math.round(row.oiChange * (1 + q.changePct / 50));
      return { ...row, spot, ltp, basis, basisPct, signal, oiChange, oiChangePct: +((oiChange / row.oi) * 100).toFixed(1) };
    });
  }, [quotes]);

  const tabs: { id: FnOTab; label: string }[] = [
    { id: "futures", label: "Futures Chain" },
    { id: "oi", label: "OI Analysis" },
    { id: "pcr", label: "PCR Trend" },
    { id: "rollover", label: "Rollover" },
  ];

  const currentPCR = PCR_HISTORY[PCR_HISTORY.length - 1].pcr;
  const filteredFutures = liveFutures.filter(r => signalFilter === "all" || r.signal === signalFilter);

  const signalCounts = {
    long_buildup:   liveFutures.filter(f => f.signal === "long_buildup").length,
    short_buildup:  liveFutures.filter(f => f.signal === "short_buildup").length,
    long_unwinding: liveFutures.filter(f => f.signal === "long_unwinding").length,
    short_covering: liveFutures.filter(f => f.signal === "short_covering").length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-maroon-600" />
            F&O Analytics
          </h2>
          <p className="text-xs text-ivory-500">
            Futures OI buildup, PCR trend, rollover analysis — NSE derivatives
            {isLive && <span className="ml-2 text-signal-bull font-semibold">● Live prices — Angel One</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-ivory-500">Nifty PCR:</span>
          <span className={cn("font-bold", currentPCR > 1 ? "text-signal-bull" : "text-signal-bear")}>{currentPCR.toFixed(2)}</span>
          <span className="text-ivory-700">|</span>
          <span className="text-ivory-500">Expiry:</span>
          <span className="text-ivory-200 font-bold">29-May-26</span>
        </div>
      </div>

      {/* Signal Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(signalCounts) as [Signal, number][]).map(([sig, count]) => {
          const c = SIGNAL_CONFIG[sig];
          return (
            <div key={sig} className={cn("card-glass rounded-xl p-3 border transition-all cursor-pointer",
              signalFilter === sig ? "border-maroon-600" : "border-transparent hover:border-maroon-900"
            )} onClick={() => setSignalFilter(f => f === sig ? "all" : sig)}>
              <div className={cn("text-xl font-display font-bold", c.text)}>{count}</div>
              <div className="text-[10px] text-ivory-400 font-semibold mt-0.5">{c.label}</div>
              <div className="text-[9px] text-ivory-600 mt-0.5">{c.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-bg-border pb-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-3 py-2 text-xs font-semibold transition-colors -mb-px border-b-2",
              tab === t.id ? "text-maroon-300 border-maroon-600" : "text-ivory-600 border-transparent hover:text-ivory-300"
            )}>{t.label}</button>
        ))}
      </div>

      {/* Futures Chain Table */}
      {tab === "futures" && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-bg-border">
                  {["Symbol", "Spot", "LTP", "Basis", "Basis%", "OI", "OI Chg", "OI Chg%", "Vol", "Carry%", "Signal"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFutures.map((row, i) => (
                  <tr key={row.symbol} className={cn("border-b border-bg-border/50 transition-colors hover:bg-bg-hover", i % 2 === 0 && "bg-bg-primary/30")}>
                    <td className="px-3 py-2.5 font-mono font-bold text-ivory-100">{row.symbol}</td>
                    <td className="px-3 py-2.5 font-mono text-ivory-300">{row.spot.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-mono text-ivory-200">{row.ltp.toLocaleString()}</td>
                    <td className={cn("px-3 py-2.5 font-mono", row.basis >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                      {row.basis >= 0 ? "+" : ""}{row.basis}
                    </td>
                    <td className={cn("px-3 py-2.5 font-mono", row.basisPct >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                      {row.basisPct >= 0 ? "+" : ""}{row.basisPct}%
                    </td>
                    <td className="px-3 py-2.5 font-mono text-ivory-300">{fmtOI(row.oi)}</td>
                    <td className={cn("px-3 py-2.5 font-mono", row.oiChange >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                      {row.oiChange >= 0 ? "+" : ""}{fmtOI(Math.abs(row.oiChange))}
                    </td>
                    <td className={cn("px-3 py-2.5 font-mono font-bold", row.oiChangePct >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                      {row.oiChangePct >= 0 ? "+" : ""}{row.oiChangePct}%
                    </td>
                    <td className="px-3 py-2.5 font-mono text-ivory-500">{fmtOI(row.volume)}</td>
                    <td className="px-3 py-2.5 font-mono text-gold-500">{row.costOfCarry}%</td>
                    <td className="px-3 py-2.5"><SignalBadge signal={row.signal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OI Analysis */}
      {tab === "oi" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-signal-bull" />
              Top OI Gainers
            </div>
            <div className="space-y-3">
              {OI_GAINERS.map(g => (
                <div key={g.symbol}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-ivory-100">{g.symbol}</span>
                      <SignalBadge signal={g.signal} />
                    </div>
                    <span className={cn("text-xs font-mono font-bold", g.change >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                      +{g.change}%
                    </span>
                  </div>
                  <div className="h-2 bg-bg-border rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", g.signal === "long_buildup" ? "bg-signal-bull" : "bg-signal-bear")}
                      style={{ width: `${Math.min(g.change * 2.5, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-4 flex items-center gap-2">
              <TrendingDown className="w-3.5 h-3.5 text-signal-bear" />
              OI Reduction (Unwinding / Covering)
            </div>
            <div className="space-y-3">
              {OI_LOSERS.map(g => (
                <div key={g.symbol}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-ivory-100">{g.symbol}</span>
                      <SignalBadge signal={g.signal} />
                    </div>
                    <span className="text-xs font-mono font-bold text-signal-bear">{g.change}%</span>
                  </div>
                  <div className="h-2 bg-bg-border rounded-full overflow-hidden flex justify-end">
                    <div className={cn("h-full rounded-full", g.signal === "long_unwinding" ? "bg-orange-400" : "bg-yellow-400")}
                      style={{ width: `${Math.min(Math.abs(g.change) * 10, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-bg-border space-y-2">
              <div className="text-[10px] font-semibold text-ivory-500 uppercase tracking-wider">Signal Legend</div>
              {(Object.entries(SIGNAL_CONFIG) as [Signal, typeof SIGNAL_CONFIG[Signal]][]).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-[11px]">
                  <span className={cn("label-tag text-[9px]", v.bg, v.text)}>{v.label}</span>
                  <span className="text-ivory-600">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PCR Trend */}
      {tab === "pcr" && (
        <div className="card-glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-ivory-300">Nifty Put-Call Ratio — 10-Day Trend</div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-ivory-600">Overbought: <span className="text-signal-bull font-mono font-bold">&gt;1.2</span></span>
              <span className="text-ivory-600">Oversold: <span className="text-signal-bear font-mono font-bold">&lt;0.8</span></span>
              <span className="text-ivory-600">Current: <span className={cn("font-mono font-bold", currentPCR > 1 ? "text-signal-bull" : "text-signal-bear")}>{currentPCR.toFixed(2)}</span></span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={PCR_HISTORY}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8b8472" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8b8472" }} axisLine={false} tickLine={false} domain={[0.6, 1.4]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={1.2} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "Bullish", position: "insideTopRight", fontSize: 9, fill: "#22c55e" }} />
              <ReferenceLine y={0.8} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Bearish", position: "insideBottomRight", fontSize: 9, fill: "#ef4444" }} />
              <ReferenceLine y={1.0} stroke="#3d3a32" strokeDasharray="2 4" />
              <Area type="monotone" dataKey="pcr" fill="#7c2d3220" stroke="#7c2d32" strokeWidth={2} dot={{ fill: "#7c2d32", r: 3 }} name="PCR" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="card-glass rounded-lg p-2">
              <div className="text-xs font-mono font-bold text-ivory-100">{currentPCR.toFixed(2)}</div>
              <div className="text-[9px] text-ivory-500">Current PCR</div>
            </div>
            <div className="card-glass rounded-lg p-2">
              <div className="text-xs font-mono font-bold text-signal-bull">1.25</div>
              <div className="text-[9px] text-ivory-500">10-Day High</div>
            </div>
            <div className="card-glass rounded-lg p-2">
              <div className="text-xs font-mono font-bold text-signal-bear">0.82</div>
              <div className="text-[9px] text-ivory-500">10-Day Low</div>
            </div>
          </div>
          <div className={cn("mt-3 p-3 rounded-lg text-xs", currentPCR > 1 ? "bg-signal-bull/10 text-signal-bull" : "bg-signal-bear/10 text-signal-bear")}>
            {currentPCR > 1.1
              ? "PCR above 1.1 signals put writers dominant — bullish market sentiment. Supports continuation of uptrend. Watch for reversal if PCR crosses 1.3 (over-bullishness)."
              : currentPCR < 0.9
              ? "PCR below 0.9 signals call writers dominant — bearish market sentiment. Caution advised. Options market pricing in downside risk."
              : "PCR near neutral (0.9–1.1) — balanced options market. No strong directional bias from PCR alone. Watch other confluence signals."}
          </div>
        </div>
      )}

      {/* Rollover Analysis */}
      {tab === "rollover" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-ivory-100">61%</div>
              <div className="text-[10px] text-ivory-500">Avg Rollover (Current)</div>
              <div className="text-[9px] text-signal-bull font-mono mt-0.5">+4% vs last month</div>
            </div>
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-gold-500">7.3%</div>
              <div className="text-[10px] text-ivory-500">Avg Cost of Carry</div>
              <div className="text-[9px] text-ivory-600 font-mono mt-0.5">Annualised</div>
            </div>
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-signal-bull">BULLISH</div>
              <div className="text-[10px] text-ivory-500">Rollover Sentiment</div>
              <div className="text-[9px] text-ivory-600 font-mono mt-0.5">Longs carrying forward</div>
            </div>
          </div>

          <div className="card-glass rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-bg-border">
              <div className="text-xs font-semibold text-ivory-300">Stock Rollover % — Current vs Previous Month</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ROLLOVER_DATA} layout="vertical" margin={{ left: 60, right: 20, top: 10, bottom: 10 }} barSize={8}>
                <XAxis type="number" tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => v + "%"} />
                <YAxis type="category" dataKey="symbol" tick={{ fontSize: 10, fill: "#c8bfa8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="curr" name="Current" fill="#7c2d32" radius={[0, 2, 2, 0]} opacity={0.85} />
                <Bar dataKey="prev" name="Previous" fill="#3d3a32" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border">
                    {["Symbol", "Rollover %", "vs Prev Month", "Cost of Carry", "Interpretation"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROLLOVER_DATA.sort((a, b) => b.curr - a.curr).map((row, i) => {
                    const diff = row.curr - row.prev;
                    const interp = row.curr > 70 && diff > 0
                      ? { label: "Strong Long Carry", color: "text-signal-bull" }
                      : row.curr < 40
                      ? { label: "Fresh Build Likely", color: "text-yellow-400" }
                      : diff > 3
                      ? { label: "Increasing Longs", color: "text-signal-bull" }
                      : diff < -3
                      ? { label: "Unwinding Positions", color: "text-signal-bear" }
                      : { label: "Stable", color: "text-ivory-400" };
                    return (
                      <tr key={row.symbol} className={cn("border-b border-bg-border/50 hover:bg-bg-hover", i % 2 === 0 && "bg-bg-primary/30")}>
                        <td className="px-3 py-2.5 font-mono font-bold text-ivory-100">{row.symbol}</td>
                        <td className="px-3 py-2.5 font-mono text-ivory-200">{row.curr}%</td>
                        <td className={cn("px-3 py-2.5 font-mono font-bold", diff >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                          {diff >= 0 ? "+" : ""}{diff}%
                        </td>
                        <td className="px-3 py-2.5 font-mono text-gold-500">{row.cost}%</td>
                        <td className={cn("px-3 py-2.5 text-xs", interp.color)}>{interp.label}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
