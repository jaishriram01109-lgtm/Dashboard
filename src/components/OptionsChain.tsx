"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { Layers, Search, X, AlertTriangle, ChevronDown } from "lucide-react";
import { useAngelQuotes } from "@/hooks/useAngelData";
import { cn, fmt } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from "recharts";

// ─── SEEDED PRNG (mulberry32) — same seed → same data ─────────
function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

// ─── EXPIRY DATE GENERATION ───────────────────────────────────
const INDICES = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "SENSEX"];

function getUpcomingExpiries(symbol: string): string[] {
  const now = new Date();
  const isIndex = INDICES.includes(symbol.toUpperCase());
  const dates: string[] = [];

  if (isIndex) {
    // Weekly: NIFTY/FINNIFTY = Tuesday (2), BANKNIFTY = Wednesday (3)
    const sym = symbol.toUpperCase();
    const targetDay = sym === "BANKNIFTY" ? 3 : 2;
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    while (dates.length < 6) {
      if (d.getDay() === targetDay && d >= now) {
        dates.push(d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }));
      }
      d.setDate(d.getDate() + 1);
    }
  } else {
    // Monthly: last Thursday of each month
    for (let m = 0; m < 4; m++) {
      const targetMonth = now.getMonth() + m;
      const yr = now.getFullYear() + Math.floor(targetMonth / 12);
      const mo = targetMonth % 12;
      const lastDay = new Date(yr, mo + 1, 0);
      while (lastDay.getDay() !== 4) lastDay.setDate(lastDay.getDate() - 1);
      if (lastDay > now)
        dates.push(lastDay.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }));
    }
  }
  return dates.slice(0, 5);
}

// ─── CHAIN GENERATOR (seeded by symbol+expiry → stable data) ──
function genChain(spotPrice: number, symbol: string, expiry: string) {
  const seed = strHash(symbol + expiry);
  const rand = seededRand(seed);
  const step = spotPrice > 30000 ? 200 : spotPrice > 20000 ? 100 : spotPrice > 5000 ? 100 : spotPrice > 1000 ? 50 : 25;
  const atmStrike = Math.round(spotPrice / step) * step;
  const strikes: number[] = [];
  for (let i = -12; i <= 12; i++) strikes.push(atmStrike + i * step);

  const now = new Date();
  const expDate = new Date(expiry);
  const dte = Math.max(1, Math.round((expDate.getTime() - now.getTime()) / 86_400_000));
  const baseIV = 12 + (dte <= 7 ? 4 : dte <= 14 ? 2 : 0);

  return strikes.map(strike => {
    const moneyness = (spotPrice - strike) / spotPrice;
    const r1 = rand(), r2 = rand(), r3 = rand(), r4 = rand(), r5 = rand(), r6 = rand();
    const r7 = rand(), r8 = rand();
    const callOI = Math.floor(Math.abs(r1 * 5_000_000 * (1 - Math.abs(moneyness) * 2.5) + 80_000));
    const putOI  = Math.floor(Math.abs(r2 * 5_000_000 * (1 - Math.abs(moneyness) * 2.5) + 80_000));
    const callOIChg = Math.floor((r3 - 0.4) * 600_000);
    const putOIChg  = Math.floor((r4 - 0.4) * 600_000);
    const callIV = +(baseIV + Math.abs(moneyness) * 70 + r5 * 4).toFixed(1);
    const putIV  = +(baseIV + Math.abs(moneyness) * 70 + r6 * 4).toFixed(1);
    const intrinsicC = Math.max(spotPrice - strike, 0);
    const intrinsicP = Math.max(strike - spotPrice, 0);
    const timeVal = Math.sqrt(dte / 365) * spotPrice * 0.18;
    const callLTP = +(intrinsicC + timeVal * (callIV / 100) * (1 - Math.abs(moneyness)) + r7 * 3).toFixed(2);
    const putLTP  = +(intrinsicP + timeVal * (putIV  / 100) * (1 - Math.abs(moneyness)) + r8 * 3).toFixed(2);

    return {
      strike, isATM: strike === atmStrike,
      isITMCall: strike < spotPrice,
      isITMPut: strike > spotPrice,
      call: { ltp: callLTP, oi: callOI, oiChg: callOIChg, iv: callIV, volume: Math.floor(rand() * 80_000 + 2_000) },
      put:  { ltp: putLTP,  oi: putOI,  oiChg: putOIChg,  iv: putIV,  volume: Math.floor(rand() * 80_000 + 2_000) },
    };
  });
}

type Chain = ReturnType<typeof genChain>;

function computeMaxPain(chain: Chain): number {
  let minLoss = Infinity, mp = 0;
  chain.forEach(row => {
    const cL = chain.filter(r => r.strike < row.strike).reduce((s, r) => s + r.call.oi * (row.strike - r.strike), 0);
    const pL = chain.filter(r => r.strike > row.strike).reduce((s, r) => s + r.put.oi  * (r.strike - row.strike), 0);
    if (cL + pL < minLoss) { minLoss = cL + pL; mp = row.strike; }
  });
  return mp;
}

// ─── PRESET SYMBOLS ──────────────────────────────────────────
const PRESET_SYMBOLS = [
  "NIFTY","BANKNIFTY","FINNIFTY",
  "RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK",
  "LT","AXISBANK","BAJFINANCE","WIPRO","KOTAKBANK",
  "SUNPHARMA","TATAMOTORS","MARUTI","ADANIPORTS","HAL","RVNL",
];

const DEFAULT_SPOTS: Record<string, number> = {
  NIFTY: 23123, BANKNIFTY: 51500, FINNIFTY: 23100,
  RELIANCE: 1295, TCS: 3420, HDFCBANK: 1648, INFY: 1395, ICICIBANK: 1372,
  LT: 3340, AXISBANK: 1085, BAJFINANCE: 6920, WIPRO: 272, KOTAKBANK: 1945,
  SUNPHARMA: 1748, TATAMOTORS: 598, MARUTI: 11480, ADANIPORTS: 1185, HAL: 4195, RVNL: 298,
};

// ─── OI BAR CHART ────────────────────────────────────────────
function OIBarChart({ chain, maxPain }: { chain: Chain; maxPain: number }) {
  const data = chain.map(r => ({ strike: r.strike, callOI: +(r.call.oi / 100_000).toFixed(1), putOI: +(r.put.oi / 100_000).toFixed(1), isATM: r.isATM, isMP: r.strike === maxPain }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 22, left: 8 }}>
        <XAxis dataKey="strike" tick={{ fill: "#9C8C58", fontSize: 9 }} angle={-45} textAnchor="end" />
        <YAxis tick={{ fill: "#9C8C58", fontSize: 9 }} tickFormatter={v => `${v}L`} width={32} />
        <Tooltip contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6, fontSize: 11 }} formatter={(v: number, n: string) => [`${v}L`, n]} />
        <Bar dataKey="callOI" name="Call OI" radius={[2,2,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.isATM ? "#FF1744" : d.isMP ? "#FFB300" : "#FF174455"} />)}
        </Bar>
        <Bar dataKey="putOI" name="Put OI" radius={[2,2,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.isATM ? "#00E676" : d.isMP ? "#FFB30088" : "#00E67655"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── PCR GAUGE ───────────────────────────────────────────────
function PCRGauge({ pcr }: { pcr: number }) {
  const pct = Math.min(pcr / 2, 1) * 100;
  const color = pcr > 1.2 ? "#00E676" : pcr < 0.8 ? "#FF1744" : "#FFB300";
  const label = pcr > 1.4 ? "VERY BULLISH" : pcr > 1.2 ? "BULLISH" : pcr < 0.7 ? "VERY BEARISH" : pcr < 0.9 ? "BEARISH" : "NEUTRAL";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-20 h-20">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1E1E24" strokeWidth="7" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${(pct / 100) * 213.6} 213.6`}
            strokeLinecap="round" transform="rotate(-90 40 40)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{pcr.toFixed(2)}</span>
          <span className="text-[8px] text-ivory-500">PCR</span>
        </div>
      </div>
      <span className="text-[9px] font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── IV SMILE CHART ──────────────────────────────────────────
function IVSmile({ chain }: { chain: Chain }) {
  const data = chain.map(r => ({ strike: r.strike, callIV: r.call.iv, putIV: r.put.iv }));
  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 22, left: 8 }}>
        <XAxis dataKey="strike" tick={{ fill: "#9C8C58", fontSize: 9 }} angle={-45} textAnchor="end" />
        <YAxis tick={{ fill: "#9C8C58", fontSize: 9 }} tickFormatter={v => `${v}%`} width={32} />
        <Tooltip contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6, fontSize: 11 }} formatter={(v: number, n: string) => [`${v}%`, n]} />
        <Line type="monotone" dataKey="callIV" name="Call IV" stroke="#FF1744" dot={false} strokeWidth={1.5} />
        <Line type="monotone" dataKey="putIV"  name="Put IV"  stroke="#00E676" dot={false} strokeWidth={1.5} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── SYMBOL SEARCH ───────────────────────────────────────────
function SymbolSearch({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = PRESET_SYMBOLS.filter(s => s.includes(query.toUpperCase()));

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1 bg-bg-card border border-bg-border rounded-lg px-2 py-1.5 w-40">
        <Search className="w-3 h-3 text-ivory-500 shrink-0" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value.toUpperCase()); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === "Enter" && filtered.length > 0) { onChange(filtered[0]); setOpen(false); } }}
          placeholder="Search symbol"
          className="bg-transparent text-xs text-ivory-200 placeholder-ivory-600 outline-none w-full"
        />
        {query && <X className="w-3 h-3 text-ivory-500 cursor-pointer" onClick={() => { setQuery(""); onChange("NIFTY"); }} />}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 w-40 bg-bg-card border border-bg-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <button key={s} onClick={() => { onChange(s); setQuery(s); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs text-ivory-300 hover:bg-maroon-900/30 hover:text-ivory-100 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function OptionsChain() {
  const [symbol, setSymbol] = useState("NIFTY");
  const [expiry, setExpiry] = useState<string | null>(null);
  const [atmOnly, setAtmOnly] = useState(false);

  const expiries = useMemo(() => getUpcomingExpiries(symbol), [symbol]);
  const activeExpiry = expiry ?? expiries[0] ?? "";

  useEffect(() => { setExpiry(null); }, [symbol]);

  const { quotes, isLive } = useAngelQuotes();
  const liveQ = quotes.get(symbol);
  const spot = liveQ?.ltp ?? DEFAULT_SPOTS[symbol] ?? 23123;

  const chain = useMemo(() => genChain(spot, symbol, activeExpiry), [spot, symbol, activeExpiry]);
  const maxPain = useMemo(() => computeMaxPain(chain), [chain]);
  const totalCallOI = chain.reduce((s, r) => s + r.call.oi, 0);
  const totalPutOI  = chain.reduce((s, r) => s + r.put.oi,  0);
  const pcr = totalPutOI / totalCallOI;

  const displayChain = atmOnly ? chain.filter(r => Math.abs(chain.indexOf(r) - chain.findIndex(c => c.isATM)) <= 5) : chain;

  const dte = useMemo(() => {
    if (!activeExpiry) return 0;
    return Math.max(0, Math.round((new Date(activeExpiry).getTime() - Date.now()) / 86_400_000));
  }, [activeExpiry]);

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="card-base p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-maroon-500" />
            <h2 className="text-sm font-semibold text-ivory-100">Options Chain</h2>
            <span className="text-[10px] text-ivory-500">PCR · Max Pain · IV Smile · OI Heatmap</span>
            <span className="text-[9px] bg-amber-900/40 text-amber-400 border border-amber-800/50 rounded px-1.5 py-0.5">
              All data simulated
            </span>
          </div>
        </div>

        {/* ── Symbol search + quick tabs ── */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <SymbolSearch value={symbol} onChange={setSymbol} />
          {["NIFTY", "BANKNIFTY", "FINNIFTY"].map(s => (
            <button key={s} onClick={() => setSymbol(s)}
              className={cn("px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors",
                symbol === s
                  ? "bg-maroon-800 border-maroon-600 text-ivory-100"
                  : "bg-bg-card border-bg-border text-ivory-400 hover:border-maroon-700"
              )}>{s}</button>
          ))}
        </div>

        {/* ── Expiry selector ── */}
        <div className="mb-2">
          <span className="text-[10px] text-ivory-500 uppercase tracking-wider mr-2">Expiry:</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {expiries.map((exp, i) => (
              <button key={exp} onClick={() => setExpiry(exp)}
                className={cn("px-2 py-0.5 rounded text-[10px] border transition-colors flex items-center gap-1",
                  activeExpiry === exp
                    ? "bg-maroon-800 border-maroon-600 text-ivory-100"
                    : "bg-bg-card border-bg-border text-ivory-400 hover:border-maroon-700"
                )}>
                {exp}
                {i === 0 && <span className="text-[8px] text-gold-500 font-bold">NEAR</span>}
              </button>
            ))}
          </div>
          {dte > 0 && <p className="text-[10px] text-ivory-500 mt-1">{dte}d to expiry</p>}
        </div>

        {/* ── Disclaimer ── */}
        <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-800/40 rounded-lg p-2.5 text-[10px] text-amber-300 mt-2">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" />
          <span>Spot price is simulated. OI, IV &amp; volume are <strong>algorithmically generated per expiry (consistent within a session)</strong>. Real options data needs Angel One F&amp;O subscription.</span>
        </div>
      </div>

      {/* ── KPI bar ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Spot", val: `₹${fmt(spot)}`, badge: isLive ? "LIVE" : "SIM" },
          { label: "ATM Strike", val: `₹${fmt(Math.round(spot / (spot > 20000 ? 100 : 50)) * (spot > 20000 ? 100 : 50))}`, badge: "CALC" },
          { label: "Max Pain", val: `₹${fmt(maxPain)}`, sub: `${((maxPain - spot) / spot * 100).toFixed(1)}%`, badge: "SIM" },
          { label: "PCR", val: pcr.toFixed(2), badge: "SIM" },
        ].map(({ label, val, sub, badge }) => (
          <div key={label} className="card-base p-3 relative">
            <span className={cn("absolute top-2 right-2 text-[8px] font-bold rounded px-1 py-0.5",
              badge === "LIVE" ? "bg-emerald-900/50 text-emerald-400" : badge === "CALC" ? "bg-blue-900/50 text-blue-400" : "bg-amber-900/40 text-amber-500"
            )}>{badge}</span>
            <div className="text-[10px] text-ivory-500 mb-0.5">{label}</div>
            <div className="text-base font-bold text-ivory-100">{val}</div>
            {sub && <div className="text-[10px] text-gold-500">{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── OI distribution ── */}
      <div className="card-base p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
            OI Distribution — {symbol} {activeExpiry}
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />Call OI</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />Put OI</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />Max Pain</span>
          </div>
        </div>
        <OIBarChart chain={chain} maxPain={maxPain} />
      </div>

      {/* ── PCR + interpretation ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">Put-Call Ratio</div>
          <div className="flex items-center justify-between">
            <PCRGauge pcr={pcr} />
            <div className="flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between gap-8"><span className="text-ivory-500">PCR</span><span className="font-semibold text-ivory-200">{pcr.toFixed(2)}</span></div>
              <div className="flex justify-between gap-8"><span className="text-ivory-500">Call OI</span><span className="font-semibold text-red-400">{(totalCallOI/100000).toFixed(1)}L</span></div>
              <div className="flex justify-between gap-8"><span className="text-ivory-500">Put OI</span><span className="font-semibold text-emerald-400">{(totalPutOI/100000).toFixed(1)}L</span></div>
              <div className="flex justify-between gap-8"><span className="text-ivory-500">Max Pain</span><span className="font-semibold text-gold-500">₹{fmt(maxPain)}</span></div>
              <div className="flex justify-between gap-8"><span className="text-ivory-500">Barrier Area</span><span className="font-semibold text-ivory-300">{fmt(maxPain - 100)}–{fmt(maxPain + 100)}</span></div>
            </div>
          </div>
        </div>

        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-2">Options Interpretation</div>
          <div className="space-y-1.5 text-[11px] text-ivory-300">
            <p>📌 <strong>PCR {pcr.toFixed(2)}</strong> — {pcr > 1.2 ? "More puts written → bullish bias" : pcr < 0.8 ? "More calls written → bearish bias" : "Balanced positioning — consolidation zone"}.</p>
            <p>🎯 <strong>Max Pain ₹{fmt(maxPain)}</strong> — {spot > maxPain ? `Spot is ${((spot-maxPain)/spot*100).toFixed(1)}% above max pain. Expect pull downward near expiry.` : `Spot is ${((maxPain-spot)/spot*100).toFixed(1)}% below max pain. Expect drift upward near expiry.`}</p>
            <p>⏳ <strong>DTE {dte}d</strong> — {dte <= 2 ? "Expiry day. Theta decay maximum. Avoid buying options." : dte <= 7 ? "Near expiry. IV elevated, time decay accelerating." : "Sufficient time remains. IV relatively stable."}.</p>
          </div>
        </div>
      </div>

      {/* ── IV Smile ── */}
      <div className="card-base p-4">
        <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
          Implied Volatility Smile
        </div>
        <IVSmile chain={chain} />
        <div className="flex gap-4 mt-1 text-[10px] text-ivory-500">
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-red-500 inline-block" />Call IV</span>
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-500 inline-block" />Put IV</span>
        </div>
      </div>

      {/* ── Options Table ── */}
      <div className="card-base p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
            {symbol} {activeExpiry} <span className="text-ivory-600">({displayChain.length} strikes)</span>
          </div>
          <label className="flex items-center gap-1.5 text-[10px] text-ivory-400 cursor-pointer">
            <input type="checkbox" checked={atmOnly} onChange={e => setAtmOnly(e.target.checked)} className="w-3 h-3" />
            ATM ±5
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] md:text-[11px]">
            <thead>
              <tr className="text-ivory-500 border-b border-bg-border">
                <th className="text-right py-1 pr-2 font-medium">OI Chg</th>
                <th className="text-right py-1 pr-2 font-medium">OI</th>
                <th className="text-right py-1 pr-2 font-medium">IV</th>
                <th className="text-right py-1 pr-2 font-medium">LTP</th>
                <th className="text-center py-1 px-3 font-semibold text-ivory-300 bg-bg-card rounded">Strike</th>
                <th className="text-left py-1 pl-2 font-medium">LTP</th>
                <th className="text-left py-1 pl-2 font-medium">IV</th>
                <th className="text-left py-1 pl-2 font-medium">OI</th>
                <th className="text-left py-1 pl-2 font-medium">OI Chg</th>
              </tr>
            </thead>
            <tbody>
              {displayChain.map(row => (
                <tr key={row.strike}
                  className={cn(
                    "border-b border-bg-border/50 hover:bg-bg-card/40 transition-colors",
                    row.isATM && "bg-maroon-900/30 border-maroon-800/50",
                    row.strike === maxPain && "bg-amber-900/20"
                  )}>
                  <td className={cn("text-right py-1 pr-2", row.call.oiChg >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {row.call.oiChg >= 0 ? "+" : ""}{(row.call.oiChg / 1000).toFixed(0)}K
                  </td>
                  <td className="text-right py-1 pr-2 text-red-300">{(row.call.oi / 100_000).toFixed(1)}L</td>
                  <td className="text-right py-1 pr-2 text-ivory-400">{row.call.iv}%</td>
                  <td className={cn("text-right py-1 pr-2 font-semibold", row.isITMCall ? "text-red-300" : "text-ivory-200")}>
                    {row.call.ltp.toFixed(1)}
                  </td>
                  <td className={cn("text-center py-1 px-3 font-bold",
                    row.isATM ? "text-gold-400" : row.strike === maxPain ? "text-amber-400" : "text-ivory-300")}>
                    {row.strike}{row.isATM && " ★"}{row.strike === maxPain && " ⚡"}
                  </td>
                  <td className={cn("text-left py-1 pl-2 font-semibold", row.isITMPut ? "text-emerald-300" : "text-ivory-200")}>
                    {row.put.ltp.toFixed(1)}
                  </td>
                  <td className="text-left py-1 pl-2 text-ivory-400">{row.put.iv}%</td>
                  <td className="text-left py-1 pl-2 text-emerald-300">{(row.put.oi / 100_000).toFixed(1)}L</td>
                  <td className={cn("text-left py-1 pl-2", row.put.oiChg >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {row.put.oiChg >= 0 ? "+" : ""}{(row.put.oiChg / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
