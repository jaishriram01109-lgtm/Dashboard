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
    // Weekly: NIFTY/FINNIFTY = Thursday (4), BANKNIFTY = Wednesday (3)
    const targetDay = symbol.toUpperCase() === "BANKNIFTY" ? 3 : 4;
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    // Include today if it's the expiry day and market hasn't closed
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

  // Days to expiry — affects IV
  const now = new Date();
  const expDate = new Date(expiry);
  const dte = Math.max(1, Math.round((expDate.getTime() - now.getTime()) / 86_400_000));
  const baseIV = 12 + (dte <= 7 ? 4 : dte <= 14 ? 2 : 0); // near-expiry IV premium

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
  NIFTY: 24856, BANKNIFTY: 53200, FINNIFTY: 23800,
  RELIANCE: 2900, TCS: 3870, HDFCBANK: 1840, INFY: 1580, ICICIBANK: 1280,
  LT: 3580, AXISBANK: 1180, BAJFINANCE: 7400, WIPRO: 480, KOTAKBANK: 1860,
  SUNPHARMA: 1745, TATAMOTORS: 840, MARUTI: 12400, ADANIPORTS: 1280, HAL: 4280, RVNL: 415,
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
            strokeLinecap="round" transform="rotate(-90 40 40)"
            style={{ filter: `drop-shadow(0 0 5px ${color}88)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-mono font-bold" style={{ color }}>{pcr.toFixed(2)}</span>
          <span className="text-[8px] text-ivory-600">PCR</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-center" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── IV SMILE ────────────────────────────────────────────────
function IVSmile({ chain }: { chain: Chain }) {
  const data = chain.slice(4, -4).map(r => ({ strike: r.strike, call: r.call.iv, put: r.put.iv }));
  return (
    <ResponsiveContainer width="100%" height={130}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
        <XAxis dataKey="strike" tick={{ fill: "#9C8C58", fontSize: 9 }} interval={2} />
        <YAxis tick={{ fill: "#9C8C58", fontSize: 9 }} tickFormatter={v => `${v}%`} width={32} />
        <Tooltip contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6, fontSize: 11 }} formatter={(v: number, n: string) => [`${v}%`, n]} />
        <Line type="monotone" dataKey="call" name="Call IV" stroke="#FF1744" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="put" name="Put IV" stroke="#00E676" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── SEARCH DROPDOWN ─────────────────────────────────────────
function SymbolSearch({ value, onChange, quotes }: {
  value: string;
  onChange: (s: string) => void;
  quotes: Map<string, { ltp: number }>;
}) {
  const [input, setInput] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setInput(value); }, [value]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(() =>
    PRESET_SYMBOLS.filter(s => s.toLowerCase().includes(input.toLowerCase())),
    [input]);

  const commit = (sym: string) => {
    const upper = sym.trim().toUpperCase();
    if (!upper) return;
    onChange(upper);
    setInput(upper);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1 bg-bg-card border border-bg-border rounded-lg px-2 py-1.5 focus-within:border-maroon-700 transition-colors">
        <Search className="w-3.5 h-3.5 text-ivory-600 flex-shrink-0" />
        <input
          value={input}
          onChange={e => { setInput(e.target.value.toUpperCase()); setOpen(true); }}
          onKeyDown={e => { if (e.key === "Enter") commit(input); if (e.key === "Escape") setOpen(false); }}
          onFocus={() => setOpen(true)}
          placeholder="Search symbol…"
          className="bg-transparent text-xs font-mono text-ivory-100 placeholder-ivory-700 outline-none w-28"
        />
        {input && (
          <button onClick={() => { setInput(""); setOpen(true); }} className="text-ivory-600 hover:text-ivory-300">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-bg-card border border-bg-border rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
          {filtered.map(sym => (
            <button key={sym} onMouseDown={() => commit(sym)}
              className="w-full px-3 py-1.5 text-xs font-mono text-left hover:bg-bg-hover flex items-center justify-between">
              <span className={sym === value ? "text-maroon-300" : "text-ivory-200"}>{sym}</span>
              {quotes.get(sym) && <span className="text-[10px] text-signal-bull">●LIVE</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function OptionsChain() {
  const [symbol, setSymbol]         = useState("NIFTY");
  const [showCols, setShowCols]     = useState<"all" | "oi" | "iv">("all");
  const [showATMOnly, setShowATMOnly] = useState(false);
  const { quotes, isLive } = useAngelQuotes();

  // Expiry dates for selected symbol
  const expiries = useMemo(() => getUpcomingExpiries(symbol), [symbol]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>("");
  // Reset expiry when symbol changes
  useEffect(() => {
    const exps = getUpcomingExpiries(symbol);
    setSelectedExpiry(exps[0] ?? "");
  }, [symbol]);

  // Spot price: live from Angel One if available, else default
  const spotPrice = useMemo(() => {
    const q = quotes.get(symbol);
    if (q) return q.ltp;
    return DEFAULT_SPOTS[symbol] ?? 1000;
  }, [symbol, quotes]);

  // Generate chain — seeded by symbol+expiry, stable until those change
  const chain = useMemo(() => {
    if (!selectedExpiry) return [];
    return genChain(spotPrice, symbol, selectedExpiry);
  }, [spotPrice, symbol, selectedExpiry]);

  const totalCallOI = useMemo(() => chain.reduce((s, r) => s + r.call.oi, 0), [chain]);
  const totalPutOI  = useMemo(() => chain.reduce((s, r) => s + r.put.oi, 0), [chain]);
  const pcr      = totalCallOI > 0 ? totalPutOI / totalCallOI : 1;
  const maxPain  = useMemo(() => computeMaxPain(chain), [chain]);
  const maxOI    = useMemo(() => Math.max(...chain.map(r => Math.max(r.call.oi, r.put.oi)), 1), [chain]);
  const atmRow   = chain.find(r => r.isATM);

  const displayChain = showATMOnly ? chain.filter(r => Math.abs(chain.indexOf(r) - chain.findIndex(x => x.isATM)) <= 5) : chain;

  // Days-to-expiry
  const dte = useMemo(() => {
    if (!selectedExpiry) return 0;
    const d = new Date(selectedExpiry);
    return Math.max(0, Math.round((d.getTime() - Date.now()) / 86_400_000));
  }, [selectedExpiry]);

  if (!selectedExpiry) return null;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-maroon-600" />
            Options Chain
          </h2>
          <p className="text-[11px] text-ivory-500 mt-0.5">
            PCR · Max Pain · IV Smile · OI Heatmap
            {isLive
              ? <span className="ml-2 text-signal-bull font-semibold">● Spot LIVE</span>
              : <span className="ml-2 text-gold-500/70">· All data simulated</span>}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Symbol search */}
          <SymbolSearch value={symbol} onChange={setSymbol} quotes={quotes as Map<string, { ltp: number }>} />

          {/* Quick tabs for major indices */}
          <div className="flex gap-1">
            {["NIFTY", "BANKNIFTY", "FINNIFTY"].map(s => (
              <button key={s} onClick={() => setSymbol(s)}
                className={cn("px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors",
                  symbol === s ? "bg-maroon-800 text-ivory-100" : "bg-bg-card border border-bg-border text-ivory-500 hover:text-ivory-200"
                )}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Expiry selector ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-ivory-600 uppercase tracking-wider flex-shrink-0">Expiry:</span>
        <div className="flex flex-wrap gap-1.5">
          {expiries.map(exp => (
            <button key={exp} onClick={() => setSelectedExpiry(exp)}
              className={cn(
                "px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-colors border",
                selectedExpiry === exp
                  ? "bg-maroon-800/60 border-maroon-700 text-maroon-200"
                  : "bg-bg-card border-bg-border text-ivory-500 hover:border-maroon-800/40 hover:text-ivory-200"
              )}>
              {exp}
              {exp === expiries[0] && <span className="ml-1 text-signal-bull text-[8px]">NEAR</span>}
            </button>
          ))}
        </div>
        {dte > 0 && (
          <span className="text-[10px] text-ivory-600 font-mono ml-1">{dte}d to expiry</span>
        )}
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-start gap-2 px-3 py-2 bg-gold-500/8 border border-gold-500/20 rounded-lg">
        <AlertTriangle className="w-3.5 h-3.5 text-gold-500 flex-shrink-0 mt-0.5" />
        <span className="text-[10px] text-gold-400">
          Spot price is {isLive ? <strong>live from Angel One</strong> : "simulated"}.
          OI, IV & volume are <strong>algorithmically generated</strong> per expiry (consistent within a session).
          Real options data needs Angel One F&amp;O subscription.
        </span>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {[
          { label: "Spot",       val: `₹${fmt(spotPrice)}`,                  color: "text-ivory-100",   badge: isLive ? "LIVE" : "SIM" },
          { label: "ATM Strike", val: atmRow ? `₹${atmRow.strike}` : "—",    color: "text-maroon-300",  badge: null },
          { label: "Max Pain",   val: `₹${fmt(maxPain, 0)}`,                 color: "text-gold-500",    badge: null, sub: `${((maxPain - spotPrice) / spotPrice * 100).toFixed(1)}%` },
          { label: "PCR",        val: pcr.toFixed(2),                         color: pcr > 1.2 ? "text-signal-bull" : pcr < 0.8 ? "text-signal-bear" : "text-yellow-400", badge: null },
          { label: "Call OI",    val: `${(totalCallOI / 100_000).toFixed(1)}L`, color: "text-signal-bear", badge: null },
          { label: "Put OI",     val: `${(totalPutOI  / 100_000).toFixed(1)}L`, color: "text-signal-bull", badge: null },
        ].map(k => (
          <div key={k.label} className="card-base p-2.5 text-center relative overflow-hidden">
            <div className={cn("text-sm font-mono font-bold", k.color)}>{k.val}</div>
            <div className="text-[9px] text-ivory-600 mt-0.5">{k.label}</div>
            {k.sub && <div className="text-[9px] text-ivory-700">{k.sub}</div>}
            {k.badge && (
              <span className={cn("absolute top-1 right-1 text-[8px] font-mono", k.badge === "LIVE" ? "text-signal-bull" : "text-gold-500/60")}>{k.badge}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 card-base p-4">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
            OI Distribution — {symbol} {selectedExpiry}
          </div>
          <OIBarChart chain={chain} maxPain={maxPain} />
          <div className="flex gap-4 mt-1 text-[10px] text-ivory-500">
            <div className="flex items-center gap-1"><div className="w-3 h-2 bg-signal-bear/60 rounded" />Call OI</div>
            <div className="flex items-center gap-1"><div className="w-3 h-2 bg-signal-bull/60 rounded" />Put OI</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-yellow-500/60" />Max Pain</div>
          </div>
        </div>

        <div className="card-base p-4 flex flex-col items-center gap-4">
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider w-full">Put-Call Ratio</div>
          <PCRGauge pcr={pcr} />
          <div className="w-full space-y-2 text-xs">
            {[
              { lbl: "PCR (OI)",    val: pcr.toFixed(2),           col: pcr > 1.2 ? "text-signal-bull" : pcr < 0.8 ? "text-signal-bear" : "text-yellow-400" },
              { lbl: "PCR (Vol)",   val: (pcr * 0.91).toFixed(2),  col: "text-ivory-300" },
              { lbl: "Max Pain",    val: `₹${fmt(maxPain, 0)}`,    col: "text-gold-500" },
              { lbl: "DTE",         val: `${dte} days`,            col: "text-ivory-400" },
              { lbl: "Market Bias", val: pcr > 1.2 ? "BULLISH" : pcr < 0.8 ? "BEARISH" : "NEUTRAL",
                col: pcr > 1.2 ? "text-signal-bull" : pcr < 0.8 ? "text-signal-bear" : "text-yellow-400" },
            ].map(r => (
              <div key={r.lbl} className="flex justify-between">
                <span className="text-ivory-600">{r.lbl}</span>
                <span className={cn("font-mono font-semibold", r.col)}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── IV Smile ── */}
      <div className="card-base p-4">
        <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
          Implied Volatility Smile — {symbol}
        </div>
        <IVSmile chain={chain} />
        <div className="flex gap-4 mt-1 text-[10px] text-ivory-500">
          <div className="flex items-center gap-1"><div className="w-3 h-1 bg-signal-bear rounded" />Call IV</div>
          <div className="flex items-center gap-1"><div className="w-3 h-1 bg-signal-bull rounded" />Put IV</div>
        </div>
      </div>

      {/* ── Options Chain Table ── */}
      <div className="card-base overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ivory-300 uppercase tracking-wider">
              {symbol} {selectedExpiry}
            </span>
            <span className="text-[10px] font-mono text-ivory-600">{chain.length} strikes</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowATMOnly(v => !v)}
              className={cn("px-2 py-0.5 rounded text-[10px] font-semibold transition-colors",
                showATMOnly ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300 border border-bg-border"
              )}>
              {showATMOnly ? "Show All" : "ATM ±5"}
            </button>
            {(["all", "oi", "iv"] as const).map(c => (
              <button key={c} onClick={() => setShowCols(c)}
                className={cn("px-2 py-0.5 rounded text-[10px] font-semibold transition-colors",
                  showCols === c ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
                )}>{c === "all" ? "All" : c.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono min-w-[780px]">
            <thead>
              <tr className="border-b border-bg-border text-[10px] uppercase tracking-wider">
                <th colSpan={showCols === "iv" ? 2 : showCols === "oi" ? 3 : 4}
                  className="text-center py-1.5 text-signal-bear/70 border-r border-bg-border">CALLS</th>
                <th className="px-3 py-1.5 text-center text-ivory-400 bg-bg-secondary">STRIKE</th>
                <th colSpan={showCols === "iv" ? 2 : showCols === "oi" ? 3 : 4}
                  className="text-center py-1.5 text-signal-bull/70 border-l border-bg-border">PUTS</th>
              </tr>
              <tr className="border-b border-bg-border text-[10px] text-ivory-600 uppercase tracking-wider">
                {showCols !== "iv" && <th className="px-2 py-1.5 text-right">OI Chg</th>}
                {showCols !== "iv" && <th className="px-2 py-1.5 text-right">OI</th>}
                {showCols !== "oi" && <th className="px-2 py-1.5 text-right">IV%</th>}
                <th className="px-2 py-1.5 text-right text-signal-bear">LTP</th>
                <th className="px-3 py-1.5 text-center bg-bg-secondary text-ivory-300">STRIKE</th>
                <th className="px-2 py-1.5 text-signal-bull">LTP</th>
                {showCols !== "oi" && <th className="px-2 py-1.5">IV%</th>}
                {showCols !== "iv" && <th className="px-2 py-1.5">OI</th>}
                {showCols !== "iv" && <th className="px-2 py-1.5">OI Chg</th>}
              </tr>
            </thead>
            <tbody>
              {displayChain.map(row => {
                const cPct = row.call.oi / maxOI;
                const pPct = row.put.oi  / maxOI;
                return (
                  <tr key={row.strike}
                    className={cn(
                      "border-b border-bg-border/30 hover:bg-bg-hover transition-colors text-[11px]",
                      row.isATM ? "bg-maroon-900/25" : ""
                    )}>
                    {/* CALL side */}
                    {showCols !== "iv" && (
                      <td className={cn("px-2 py-1.5 text-right", row.call.oiChg > 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {row.call.oiChg > 0 ? "+" : ""}{(row.call.oiChg / 1000).toFixed(0)}K
                      </td>
                    )}
                    {showCols !== "iv" && (
                      <td className="px-2 py-1.5 text-right relative">
                        <div className="absolute right-0 top-0 bottom-0 bg-signal-bear/10 rounded-l" style={{ width: `${cPct * 100}%` }} />
                        <span className="relative">{(row.call.oi / 100_000).toFixed(1)}L</span>
                      </td>
                    )}
                    {showCols !== "oi" && <td className="px-2 py-1.5 text-right text-ivory-500">{row.call.iv}%</td>}
                    <td className={cn("px-2 py-1.5 text-right font-bold", row.isITMCall ? "text-signal-bull" : "text-ivory-200")}>
                      {fmt(row.call.ltp)}
                    </td>
                    {/* Strike */}
                    <td className={cn(
                      "px-3 py-1.5 text-center font-bold bg-bg-secondary border-x border-bg-border",
                      row.isATM ? "text-maroon-300" : row.strike === maxPain ? "text-gold-500" : "text-ivory-300"
                    )}>
                      {row.strike}
                      {row.isATM && <div className="text-[8px] text-maroon-400 leading-none">ATM</div>}
                      {row.strike === maxPain && <div className="text-[8px] text-gold-500 leading-none">MAX PAIN</div>}
                    </td>
                    {/* PUT side */}
                    <td className={cn("px-2 py-1.5 font-bold", row.isITMPut ? "text-signal-bull" : "text-ivory-200")}>
                      {fmt(row.put.ltp)}
                    </td>
                    {showCols !== "oi" && <td className="px-2 py-1.5 text-ivory-500">{row.put.iv}%</td>}
                    {showCols !== "iv" && (
                      <td className="px-2 py-1.5 relative">
                        <div className="absolute left-0 top-0 bottom-0 bg-signal-bull/10 rounded-r" style={{ width: `${pPct * 100}%` }} />
                        <span className="relative">{(row.put.oi / 100_000).toFixed(1)}L</span>
                      </td>
                    )}
                    {showCols !== "iv" && (
                      <td className={cn("px-2 py-1.5", row.put.oiChg > 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {row.put.oiChg > 0 ? "+" : ""}{(row.put.oiChg / 1000).toFixed(0)}K
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AI Interpretation ── */}
      <div className="card-base p-4 border-l-2 border-maroon-700">
        <div className="text-xs font-semibold text-maroon-400 uppercase tracking-wider mb-2">Options Interpretation</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-ivory-300">
          <div>
            <strong className="text-ivory-100">PCR {pcr.toFixed(2)}</strong> —{" "}
            {pcr > 1.4 ? "Heavy put writing signals strong institutional bullishness. Support expected at lower levels."
              : pcr > 1.2 ? "Put writers active — market expects support. Mild bullish bias."
              : pcr < 0.7 ? "Aggressive call writing signals distribution. Upside may be capped."
              : pcr < 0.9 ? "Call writers dominant — cautious market sentiment. Bearish bias."
              : "Balanced PCR. Directionless. Wait for breakout above/below key strikes."}
          </div>
          <div>
            <strong className="text-ivory-100">Max Pain ₹{fmt(maxPain, 0)}</strong> — Option sellers benefit most if {symbol} expires at this level.
            {spotPrice > maxPain
              ? ` Spot is ₹${fmt(spotPrice - maxPain, 0)} above max pain — gravity pull downward near expiry.`
              : ` Spot is ₹${fmt(maxPain - spotPrice, 0)} below max pain — gravity pull upward near expiry.`}
          </div>
          <div>
            <strong className="text-ivory-100">DTE: {dte} days</strong> —{" "}
            {dte <= 2 ? "Expiry day or next day — theta decay is extreme. Avoid buying options unless in the money."
              : dte <= 7 ? "Near expiry — time decay accelerates. OTM options losing value rapidly."
              : dte <= 14 ? "Two weeks out — balance between theta and movement potential."
              : "Sufficient time value. Options pricing in expected move for the period."}
          </div>
        </div>
      </div>

    </div>
  );
}
