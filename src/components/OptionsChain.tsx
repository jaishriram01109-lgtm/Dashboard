"use client";
import { useState, useMemo } from "react";
import { Layers, TrendingUp, TrendingDown, AlertTriangle, BarChart2 } from "lucide-react";
import { cn, fmt, scoreColor } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, ReferenceLine, AreaChart, Area,
} from "recharts";

// ─── DATA GENERATORS ─────────────────────────────────────────

function genOptionsChain(spotPrice: number, symbol: string) {
  const strikes: number[] = [];
  const step = spotPrice > 10000 ? 100 : spotPrice > 1000 ? 50 : 10;
  const atmStrike = Math.round(spotPrice / step) * step;
  for (let i = -10; i <= 10; i++) strikes.push(atmStrike + i * step);

  return strikes.map(strike => {
    const moneyness = (spotPrice - strike) / spotPrice;
    const callOI = Math.floor(Math.abs(Math.random() * 3000000 * (1 - Math.abs(moneyness) * 3) + 100000));
    const putOI = Math.floor(Math.abs(Math.random() * 3000000 * (1 - Math.abs(moneyness) * 3) + 100000));
    const callOIChange = Math.floor((Math.random() - 0.4) * 500000);
    const putOIChange = Math.floor((Math.random() - 0.4) * 500000);
    const intrinsicC = Math.max(spotPrice - strike, 0);
    const intrinsicP = Math.max(strike - spotPrice, 0);
    const callIV = 12 + Math.abs(moneyness) * 80 + Math.random() * 5;
    const putIV = 12 + Math.abs(moneyness) * 80 + Math.random() * 5;
    const callLTP = intrinsicC + callIV * spotPrice * 0.002 + Math.random() * 5;
    const putLTP = intrinsicP + putIV * spotPrice * 0.002 + Math.random() * 5;

    return {
      strike,
      isATM: strike === atmStrike,
      isITMCall: strike < spotPrice,
      isITMPut: strike > spotPrice,
      call: { ltp: +callLTP.toFixed(2), oi: callOI, oiChange: callOIChange, iv: +callIV.toFixed(1), volume: Math.floor(Math.random() * 50000 + 5000), delta: +(0.5 + moneyness * 2).toFixed(2) },
      put: { ltp: +putLTP.toFixed(2), oi: putOI, oiChange: putOIChange, iv: +putIV.toFixed(1), volume: Math.floor(Math.random() * 50000 + 5000), delta: +(-0.5 + moneyness * 2).toFixed(2) },
    };
  });
}

function computeMaxPain(chain: ReturnType<typeof genOptionsChain>) {
  // Max pain = strike where option sellers lose least
  let minLoss = Infinity, maxPainStrike = 0;
  chain.forEach(row => {
    const callLoss = chain.filter(r => r.strike < row.strike).reduce((s, r) => s + r.call.oi * (row.strike - r.strike), 0);
    const putLoss = chain.filter(r => r.strike > row.strike).reduce((s, r) => s + r.put.oi * (r.strike - row.strike), 0);
    const total = callLoss + putLoss;
    if (total < minLoss) { minLoss = total; maxPainStrike = row.strike; }
  });
  return maxPainStrike;
}

const SYMBOLS = [
  { label: "NIFTY", spot: 24856.20 },
  { label: "BANKNIFTY", spot: 53248.75 },
  { label: "HAL", spot: 4842.35 },
  { label: "TCS", spot: 4284.60 },
  { label: "RVNL", spot: 584.20 },
];

// ─── OI BAR CHART ────────────────────────────────────────────
function OIBarChart({ chain }: { chain: ReturnType<typeof genOptionsChain> }) {
  const data = chain.map(r => ({
    strike: r.strike,
    callOI: r.call.oi / 100000,
    putOI: r.put.oi / 100000,
    isATM: r.isATM,
  }));
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
          <XAxis dataKey="strike" tick={{ fill: "#A09278", fontSize: 9 }} angle={-45} textAnchor="end" />
          <YAxis tick={{ fill: "#A09278", fontSize: 9 }} tickFormatter={v => `${v.toFixed(0)}L`} />
          <Tooltip
            contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
            formatter={(v: number) => [`${v.toFixed(1)}L`, ""]}
          />
          <Bar dataKey="callOI" name="Call OI" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.isATM ? "#FF1744" : "#FF174466"} />)}
          </Bar>
          <Bar dataKey="putOI" name="Put OI" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.isATM ? "#00E676" : "#00E67666"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── PCR GAUGE ───────────────────────────────────────────────
function PCRGauge({ pcr }: { pcr: number }) {
  const pct = Math.min(pcr / 2, 1) * 100;
  const color = pcr > 1.2 ? "#00E676" : pcr < 0.8 ? "#FF1744" : "#FFB300";
  const label = pcr > 1.2 ? "OVERSOLD — BULLISH" : pcr < 0.8 ? "OVERBOUGHT — BEARISH" : "NEUTRAL";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 96 96" className="w-24 h-24">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#1E1E24" strokeWidth="8" />
          <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(pct / 100) * 251.2} 251.2`}
            strokeLinecap="round" transform="rotate(-90 48 48)"
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-mono font-bold" style={{ color }}>{pcr.toFixed(2)}</span>
          <span className="text-[9px] text-ivory-600">PCR</span>
        </div>
      </div>
      <span className={cn("text-[10px] font-semibold text-center", color === "#00E676" ? "text-signal-bull" : color === "#FF1744" ? "text-signal-bear" : "text-yellow-400")}>
        {label}
      </span>
    </div>
  );
}

// ─── IV SMILE ────────────────────────────────────────────────
function IVSmileChart({ chain }: { chain: ReturnType<typeof genOptionsChain> }) {
  const data = chain.map(r => ({ strike: r.strike, callIV: r.call.iv, putIV: r.put.iv }));
  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <XAxis dataKey="strike" tick={{ fill: "#A09278", fontSize: 9 }} interval={2} />
          <YAxis tick={{ fill: "#A09278", fontSize: 9 }} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }} />
          <Line type="monotone" dataKey="callIV" name="Call IV" stroke="#FF1744" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="putIV" name="Put IV" stroke="#00E676" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function OptionsChain() {
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [showColumns, setShowColumns] = useState<"all" | "oi" | "iv">("all");

  const chain = useMemo(() => genOptionsChain(selectedSymbol.spot, selectedSymbol.label), [selectedSymbol]);
  const totalCallOI = chain.reduce((s, r) => s + r.call.oi, 0);
  const totalPutOI = chain.reduce((s, r) => s + r.put.oi, 0);
  const pcr = totalPutOI / totalCallOI;
  const maxPain = computeMaxPain(chain);
  const maxOI = Math.max(...chain.map(r => Math.max(r.call.oi, r.put.oi)));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-maroon-600" />
            Options Chain & OI Analytics
          </h2>
          <p className="text-xs text-ivory-500">Put-Call Ratio • Max Pain • IV Smile • Open Interest Heatmap</p>
        </div>
        <div className="flex gap-2">
          {SYMBOLS.map(s => (
            <button key={s.label}
              onClick={() => setSelectedSymbol(s)}
              className={cn("px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors",
                selectedSymbol.label === s.label
                  ? "bg-maroon-800 text-ivory-100"
                  : "text-ivory-500 hover:text-ivory-200 bg-bg-card border border-bg-border"
              )}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Spot Price", value: `₹${fmt(selectedSymbol.spot)}`, color: "text-ivory-100" },
          { label: "Max Pain", value: `₹${fmt(maxPain, 0)}`, color: "text-gold-500", sub: `${((maxPain - selectedSymbol.spot) / selectedSymbol.spot * 100).toFixed(1)}% from spot` },
          { label: "Total Call OI", value: `${(totalCallOI / 100000).toFixed(1)}L`, color: "text-signal-bear" },
          { label: "Total Put OI", value: `${(totalPutOI / 100000).toFixed(1)}L`, color: "text-signal-bull" },
        ].map(k => (
          <div key={k.label} className="card-glass rounded-xl p-3 text-center">
            <div className={cn("text-xl font-mono font-bold", k.color)}>{k.value}</div>
            <div className="text-xs text-ivory-400 mt-0.5">{k.label}</div>
            {k.sub && <div className="text-[10px] text-ivory-600">{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card-glass rounded-xl p-4">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">OI Distribution by Strike</div>
          <OIBarChart chain={chain} />
          <div className="flex gap-4 mt-1 text-[10px] text-ivory-500">
            <div className="flex items-center gap-1"><div className="w-3 h-2 bg-signal-bear/60 rounded" />Call OI</div>
            <div className="flex items-center gap-1"><div className="w-3 h-2 bg-signal-bull/60 rounded" />Put OI</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-signal-bear rounded-full" />ATM Strike</div>
          </div>
        </div>
        <div className="card-glass rounded-xl p-4 flex flex-col items-center gap-4">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider w-full">Put-Call Ratio</div>
          <PCRGauge pcr={pcr} />
          <div className="w-full space-y-1.5 text-xs">
            {[
              { label: "PCR (OI)", value: pcr.toFixed(2), color: pcr > 1.2 ? "text-signal-bull" : pcr < 0.8 ? "text-signal-bear" : "text-yellow-400" },
              { label: "PCR (Vol)", value: (pcr * 0.92).toFixed(2), color: "text-ivory-300" },
              { label: "Call Writers", value: "AGGRESSIVE", color: "text-signal-bear" },
              { label: "Put Writers", value: pcr > 1 ? "DOMINANT" : "LIGHT", color: pcr > 1 ? "text-signal-bull" : "text-ivory-400" },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-ivory-600">{r.label}</span>
                <span className={cn("font-mono font-semibold", r.color)}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IV Smile */}
      <div className="card-glass rounded-xl p-4">
        <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">Implied Volatility Smile</div>
        <IVSmileChart chain={chain} />
      </div>

      {/* Options chain table */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
          <span className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">Options Chain</span>
          <div className="flex gap-2">
            {(["all", "oi", "iv"] as const).map(c => (
              <button key={c} onClick={() => setShowColumns(c)}
                className={cn("px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
                  showColumns === c ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
                )}>{c === "all" ? "All Columns" : c.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono min-w-[900px]">
            <thead>
              <tr className="border-b border-bg-border">
                {/* CALL headers */}
                {showColumns !== "iv" && <th className="px-2 py-2 text-right text-[10px] text-signal-bear/70 tracking-wider">OI Chg</th>}
                {showColumns !== "iv" && <th className="px-2 py-2 text-right text-[10px] text-signal-bear/70 tracking-wider">OI</th>}
                {showColumns !== "oi" && <th className="px-2 py-2 text-right text-[10px] text-signal-bear/70 tracking-wider">IV%</th>}
                <th className="px-2 py-2 text-right text-[10px] text-signal-bear tracking-wider">CALL LTP</th>
                {/* Strike */}
                <th className="px-3 py-2 text-center text-[10px] text-ivory-300 tracking-wider font-bold bg-bg-secondary">STRIKE</th>
                {/* PUT headers */}
                <th className="px-2 py-2 text-left text-[10px] text-signal-bull tracking-wider">PUT LTP</th>
                {showColumns !== "oi" && <th className="px-2 py-2 text-left text-[10px] text-signal-bull/70 tracking-wider">IV%</th>}
                {showColumns !== "iv" && <th className="px-2 py-2 text-left text-[10px] text-signal-bull/70 tracking-wider">OI</th>}
                {showColumns !== "iv" && <th className="px-2 py-2 text-left text-[10px] text-signal-bull/70 tracking-wider">OI Chg</th>}
              </tr>
            </thead>
            <tbody>
              {chain.map(row => {
                const callOIPct = row.call.oi / maxOI;
                const putOIPct = row.put.oi / maxOI;
                return (
                  <tr key={row.strike}
                    className={cn(
                      "border-b border-bg-border/30 hover:bg-bg-hover transition-colors",
                      row.isATM ? "bg-maroon-900/20" : ""
                    )}>
                    {/* CALL side */}
                    {showColumns !== "iv" && (
                      <td className={cn("px-2 py-1.5 text-right text-[11px]",
                        row.call.oiChange > 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {row.call.oiChange > 0 ? "+" : ""}{(row.call.oiChange / 1000).toFixed(0)}K
                      </td>
                    )}
                    {showColumns !== "iv" && (
                      <td className="px-2 py-1.5 text-right relative">
                        <div className="absolute right-0 top-0 bottom-0 bg-signal-bear/15 rounded-l"
                          style={{ width: `${callOIPct * 100}%` }} />
                        <span className="relative">{(row.call.oi / 100000).toFixed(1)}L</span>
                      </td>
                    )}
                    {showColumns !== "oi" && (
                      <td className="px-2 py-1.5 text-right text-ivory-500">{row.call.iv}%</td>
                    )}
                    <td className={cn("px-2 py-1.5 text-right font-bold",
                      row.isITMCall ? "text-signal-bull" : "text-ivory-300")}>
                      {fmt(row.call.ltp)}
                    </td>
                    {/* Strike */}
                    <td className={cn("px-3 py-1.5 text-center font-bold bg-bg-secondary border-x border-bg-border",
                      row.isATM ? "text-maroon-300 text-sm" : "text-ivory-300")}>
                      {row.strike}
                      {row.isATM && <div className="text-[8px] text-maroon-400">ATM</div>}
                      {row.strike === maxPain && <div className="text-[8px] text-gold-500">MAX PAIN</div>}
                    </td>
                    {/* PUT side */}
                    <td className={cn("px-2 py-1.5 font-bold",
                      row.isITMPut ? "text-signal-bull" : "text-ivory-300")}>
                      {fmt(row.put.ltp)}
                    </td>
                    {showColumns !== "oi" && (
                      <td className="px-2 py-1.5 text-ivory-500">{row.put.iv}%</td>
                    )}
                    {showColumns !== "iv" && (
                      <td className="px-2 py-1.5 relative">
                        <div className="absolute left-0 top-0 bottom-0 bg-signal-bull/15 rounded-r"
                          style={{ width: `${putOIPct * 100}%` }} />
                        <span className="relative">{(row.put.oi / 100000).toFixed(1)}L</span>
                      </td>
                    )}
                    {showColumns !== "iv" && (
                      <td className={cn("px-2 py-1.5 text-[11px]",
                        row.put.oiChange > 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {row.put.oiChange > 0 ? "+" : ""}{(row.put.oiChange / 1000).toFixed(0)}K
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* OI Interpretation */}
      <div className="card-glass rounded-xl p-4 border-l-2 border-maroon-700">
        <div className="text-xs font-semibold text-maroon-400 uppercase tracking-wider mb-2">AI Options Interpretation</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-ivory-300">
          <div>
            <strong className="text-ivory-100">PCR {pcr.toFixed(2)}</strong> — {pcr > 1.2
              ? "Heavy put writing indicates smart money is bullish. Market expects support at lower levels."
              : pcr < 0.8
              ? "Aggressive call writing signals distribution. Upside capped near current levels."
              : "Balanced PCR. Directionless market. Wait for breakout confirmation."}
          </div>
          <div>
            <strong className="text-ivory-100">Max Pain ₹{fmt(maxPain, 0)}</strong> — Option sellers (institutions) profit most if {selectedSymbol.label} expires at {maxPain}. Expiry price tends to gravitate toward max pain.
          </div>
        </div>
      </div>
    </div>
  );
}
