"use client";
import { useState, useMemo } from "react";
import { Search, Filter, SlidersHorizontal, Star, TrendingUp, TrendingDown, X, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenerStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change1d: number;
  mktCap: number;
  pe: number;
  pb: number;
  roe: number;
  roce: number;
  de: number;
  rsi: number;
  macdSignal: "buy" | "sell" | "neutral";
  aboveEma20: boolean;
  aboveEma50: boolean;
  aboveEma200: boolean;
  volSurge: number;
  delivery: number;
  smScore: number;
  fiiChange: number;
  aiScore: number;
  weekHigh52Pct: number;
}

const STOCKS: ScreenerStock[] = [
  { symbol: "HAL", name: "Hindustan Aeronautics", sector: "Defence", price: 4280, change1d: 3.8, mktCap: 286000, pe: 34.2, pb: 9.1, roe: 28.4, roce: 31.2, de: 0.0, rsi: 68, macdSignal: "buy", aboveEma20: true, aboveEma50: true, aboveEma200: true, volSurge: 4.2, delivery: 72, smScore: 91, fiiChange: 2.8, aiScore: 94, weekHigh52Pct: -4.2 },
  { symbol: "DLF", name: "DLF Limited", sector: "Realty", price: 918, change1d: 2.1, mktCap: 228000, pe: 52.1, pb: 4.8, roe: 9.2, roce: 8.8, de: 0.3, rsi: 62, macdSignal: "buy", aboveEma20: true, aboveEma50: true, aboveEma200: true, volSurge: 2.8, delivery: 58, smScore: 84, fiiChange: 1.9, aiScore: 82, weekHigh52Pct: -2.1 },
  { symbol: "RVNL", name: "Rail Vikas Nigam", sector: "Railway", price: 415, change1d: 1.9, mktCap: 86000, pe: 29.4, pb: 6.2, roe: 21.4, roce: 24.1, de: 0.1, rsi: 58, macdSignal: "buy", aboveEma20: true, aboveEma50: true, aboveEma200: true, volSurge: 3.1, delivery: 65, smScore: 78, fiiChange: 1.2, aiScore: 79, weekHigh52Pct: -8.4 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: 1842, change1d: 0.8, mktCap: 1398000, pe: 19.2, pb: 2.8, roe: 15.8, roce: 14.2, de: 8.4, rsi: 52, macdSignal: "neutral", aboveEma20: true, aboveEma50: true, aboveEma200: false, volSurge: 1.2, delivery: 61, smScore: 68, fiiChange: 0.4, aiScore: 72, weekHigh52Pct: -5.8 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", price: 3870, change1d: -0.4, mktCap: 1406000, pe: 28.4, pb: 13.2, roe: 47.1, roce: 52.4, de: 0.0, rsi: 45, macdSignal: "neutral", aboveEma20: false, aboveEma50: true, aboveEma200: true, volSurge: 0.9, delivery: 54, smScore: 58, fiiChange: -0.2, aiScore: 65, weekHigh52Pct: -12.4 },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical", sector: "Pharma", price: 1745, change1d: 0.6, mktCap: 418000, pe: 36.8, pb: 5.4, roe: 16.2, roce: 18.9, de: 0.1, rsi: 55, macdSignal: "neutral", aboveEma20: true, aboveEma50: false, aboveEma200: true, volSurge: 1.1, delivery: 67, smScore: 62, fiiChange: 0.6, aiScore: 68, weekHigh52Pct: -9.1 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", price: 842, change1d: 1.4, mktCap: 311000, pe: 8.2, pb: 2.1, roe: 28.4, roce: 22.1, de: 0.8, rsi: 61, macdSignal: "buy", aboveEma20: true, aboveEma50: true, aboveEma200: false, volSurge: 2.1, delivery: 48, smScore: 74, fiiChange: 1.1, aiScore: 76, weekHigh52Pct: -14.2 },
  { symbol: "TATASTEEL", name: "Tata Steel", sector: "Metals", price: 162, change1d: -1.2, mktCap: 204000, pe: 12.4, pb: 1.4, roe: 11.2, roce: 10.8, de: 0.9, rsi: 38, macdSignal: "sell", aboveEma20: false, aboveEma50: false, aboveEma200: false, volSurge: 1.8, delivery: 38, smScore: 32, fiiChange: -1.4, aiScore: 28, weekHigh52Pct: -24.8 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "NBFC", price: 7420, change1d: 1.9, mktCap: 448000, pe: 28.1, pb: 5.2, roe: 21.4, roce: 18.4, de: 4.2, rsi: 64, macdSignal: "buy", aboveEma20: true, aboveEma50: true, aboveEma200: true, volSurge: 1.9, delivery: 59, smScore: 76, fiiChange: 1.4, aiScore: 78, weekHigh52Pct: -6.4 },
  { symbol: "ITC", name: "ITC Limited", sector: "FMCG", price: 428, change1d: 0.4, mktCap: 534000, pe: 26.4, pb: 8.1, roe: 31.2, roce: 33.4, de: 0.0, rsi: 49, macdSignal: "neutral", aboveEma20: true, aboveEma50: false, aboveEma200: true, volSurge: 0.8, delivery: 71, smScore: 54, fiiChange: 0.2, aiScore: 61, weekHigh52Pct: -11.2 },
  { symbol: "L&T", name: "Larsen & Toubro", sector: "Capital Goods", price: 3580, change1d: 1.1, mktCap: 492000, pe: 32.8, pb: 4.2, roe: 14.2, roce: 16.8, de: 0.4, rsi: 57, macdSignal: "buy", aboveEma20: true, aboveEma50: true, aboveEma200: true, volSurge: 1.6, delivery: 62, smScore: 72, fiiChange: 0.8, aiScore: 74, weekHigh52Pct: -8.8 },
  { symbol: "BEL", name: "Bharat Electronics", sector: "Defence", price: 318, change1d: 2.4, mktCap: 232000, pe: 42.1, pb: 10.4, roe: 25.4, roce: 28.1, de: 0.0, rsi: 66, macdSignal: "buy", aboveEma20: true, aboveEma50: true, aboveEma200: true, volSurge: 3.4, delivery: 69, smScore: 88, fiiChange: 2.1, aiScore: 88, weekHigh52Pct: -5.1 },
  { symbol: "INFY", name: "Infosys", sector: "IT", price: 1580, change1d: -0.8, mktCap: 656000, pe: 24.8, pb: 8.4, roe: 32.1, roce: 34.8, de: 0.0, rsi: 42, macdSignal: "sell", aboveEma20: false, aboveEma50: false, aboveEma200: true, volSurge: 0.7, delivery: 52, smScore: 44, fiiChange: -0.8, aiScore: 52, weekHigh52Pct: -18.4 },
  { symbol: "GODREJPROP", name: "Godrej Properties", sector: "Realty", price: 2840, change1d: 3.2, mktCap: 78000, pe: 84.2, pb: 6.8, roe: 8.4, roce: 7.2, de: 0.8, rsi: 71, macdSignal: "buy", aboveEma20: true, aboveEma50: true, aboveEma200: true, volSurge: 4.8, delivery: 54, smScore: 80, fiiChange: 2.4, aiScore: 81, weekHigh52Pct: -1.4 },
  { symbol: "WIPRO", name: "Wipro", sector: "IT", price: 480, change1d: -0.6, mktCap: 248000, pe: 21.4, pb: 3.8, roe: 17.8, roce: 19.4, de: 0.1, rsi: 41, macdSignal: "sell", aboveEma20: false, aboveEma50: false, aboveEma200: false, volSurge: 0.6, delivery: 48, smScore: 36, fiiChange: -1.2, aiScore: 42, weekHigh52Pct: -22.1 },
];

interface Filters {
  peMax: number;
  pbMax: number;
  roeMin: number;
  roceMin: number;
  deMax: number;
  rsiMin: number;
  rsiMax: number;
  smScoreMin: number;
  aiScoreMin: number;
  deliveryMin: number;
  aboveEma20: boolean;
  aboveEma50: boolean;
  aboveEma200: boolean;
  macdBuy: boolean;
  volSurgeMin: number;
  sector: string;
}

const DEFAULT_FILTERS: Filters = {
  peMax: 200, pbMax: 50, roeMin: 0, roceMin: 0, deMax: 10,
  rsiMin: 0, rsiMax: 100, smScoreMin: 0, aiScoreMin: 0, deliveryMin: 0,
  aboveEma20: false, aboveEma50: false, aboveEma200: false, macdBuy: false,
  volSurgeMin: 0, sector: "all",
};

const PRESETS: { label: string; desc: string; filters: Partial<Filters> }[] = [
  { label: "Value + Momentum", desc: "Low PE/PB with high ROCE and RSI 50–70", filters: { peMax: 30, roceMin: 20, rsiMin: 50, rsiMax: 70, aboveEma50: true } },
  { label: "High ROCE Low Debt", desc: "Quality compounders — ROCE>25%, D/E<0.5", filters: { roceMin: 25, deMax: 0.5, roeMin: 20 } },
  { label: "FII Accumulation", desc: "Smart money buying — SM Score>70, FII buying", filters: { smScoreMin: 70, aiScoreMin: 70, deliveryMin: 55 } },
  { label: "Breakout Watch", desc: "Above all EMAs, high volume surge", filters: { aboveEma20: true, aboveEma50: true, aboveEma200: true, volSurgeMin: 2.0, macdBuy: true } },
  { label: "RSI Oversold Bounce", desc: "RSI < 45, above 200 EMA — reversal candidates", filters: { rsiMin: 25, rsiMax: 45, aboveEma200: true } },
];

type SortKey = keyof Pick<ScreenerStock, "symbol" | "price" | "change1d" | "pe" | "roe" | "roce" | "rsi" | "smScore" | "aiScore" | "delivery">;

export default function StockScreener() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("aiScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const applyPreset = (p: typeof PRESETS[0]) => {
    if (activePreset === p.label) {
      setFilters(DEFAULT_FILTERS);
      setActivePreset(null);
    } else {
      setFilters({ ...DEFAULT_FILTERS, ...p.filters });
      setActivePreset(p.label);
    }
  };

  const results = useMemo(() => {
    return STOCKS.filter(s => {
      if (search && !s.symbol.toLowerCase().includes(search.toLowerCase()) && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.sector !== "all" && s.sector !== filters.sector) return false;
      if (s.pe > filters.peMax) return false;
      if (s.pb > filters.pbMax) return false;
      if (s.roe < filters.roeMin) return false;
      if (s.roce < filters.roceMin) return false;
      if (s.de > filters.deMax) return false;
      if (s.rsi < filters.rsiMin || s.rsi > filters.rsiMax) return false;
      if (s.smScore < filters.smScoreMin) return false;
      if (s.aiScore < filters.aiScoreMin) return false;
      if (s.delivery < filters.deliveryMin) return false;
      if (filters.aboveEma20 && !s.aboveEma20) return false;
      if (filters.aboveEma50 && !s.aboveEma50) return false;
      if (filters.aboveEma200 && !s.aboveEma200) return false;
      if (filters.macdBuy && s.macdSignal !== "buy") return false;
      if (s.volSurge < filters.volSurgeMin) return false;
      return true;
    }).sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "boolean" || typeof vb === "boolean") return 0;
      return sortDir === "desc" ? (vb as number) - (va as number) : (va as number) - (vb as number);
    });
  }, [filters, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const setFilter = <K extends keyof Filters>(key: K, val: Filters[K]) => {
    setFilters(f => ({ ...f, [key]: val }));
    setActivePreset(null);
  };

  const sectors = ["all", ...Array.from(new Set(STOCKS.map(s => s.sector)))];

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortDir === "desc" ? <ChevronDown className="w-3 h-3 inline ml-0.5" /> : <ChevronUp className="w-3 h-3 inline ml-0.5" />;
  };

  const RangeInput = ({ label, value, onChange, min, max, step = 1, suffix = "" }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; step?: number; suffix?: string;
  }) => (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-ivory-500">{label}</span>
        <span className="text-[10px] text-ivory-200 font-mono">{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none bg-bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-maroon-600 cursor-pointer"
      />
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-maroon-600" />
            Stock Screener
          </h2>
          <p className="text-xs text-ivory-500">Multi-criteria fundamental + technical + smart money filter engine</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-ivory-500">{results.length} of {STOCKS.length} matches</span>
          <button onClick={() => setShowFilters(f => !f)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              showFilters ? "bg-maroon-800/40 text-maroon-300" : "bg-bg-hover text-ivory-400 hover:text-ivory-200"
            )}>
            <Filter className="w-3 h-3" />
            {showFilters ? "Hide" : "Show"} Filters
          </button>
          <button onClick={() => { setFilters(DEFAULT_FILTERS); setActivePreset(null); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-ivory-600 hover:text-ivory-300 hover:bg-bg-hover transition-colors">
            <X className="w-3 h-3" />Reset
          </button>
        </div>
      </div>

      {/* Preset Screens */}
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p)}
            title={p.desc}
            className={cn("px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
              activePreset === p.label
                ? "bg-maroon-800/40 text-maroon-300 border-maroon-600"
                : "bg-bg-secondary text-ivory-500 border-bg-border hover:text-ivory-200 hover:border-maroon-900"
            )}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Filter Panel */}
        {showFilters && (
          <div className="lg:col-span-1 card-glass rounded-xl p-4 space-y-5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ivory-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search symbol or name..."
                className="w-full bg-bg-primary border border-bg-border rounded-lg pl-8 pr-3 py-2 text-xs text-ivory-200 placeholder-ivory-700 focus:outline-none focus:border-maroon-700"
              />
            </div>

            {/* Sector */}
            <div>
              <div className="text-[10px] font-bold text-ivory-600 uppercase tracking-wider mb-2">Sector</div>
              <select value={filters.sector} onChange={e => setFilter("sector", e.target.value)}
                className="w-full bg-bg-primary border border-bg-border rounded-lg px-2 py-1.5 text-xs text-ivory-200 focus:outline-none focus:border-maroon-700">
                {sectors.map(s => <option key={s} value={s}>{s === "all" ? "All Sectors" : s}</option>)}
              </select>
            </div>

            {/* Fundamental Filters */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-ivory-600 uppercase tracking-wider">Fundamentals</div>
              <RangeInput label="PE Ratio (Max)" value={filters.peMax} onChange={v => setFilter("peMax", v)} min={5} max={200} step={5} />
              <RangeInput label="PB Ratio (Max)" value={filters.pbMax} onChange={v => setFilter("pbMax", v)} min={0.5} max={50} step={0.5} />
              <RangeInput label="ROE (Min)" value={filters.roeMin} onChange={v => setFilter("roeMin", v)} min={0} max={60} suffix="%" />
              <RangeInput label="ROCE (Min)" value={filters.roceMin} onChange={v => setFilter("roceMin", v)} min={0} max={60} suffix="%" />
              <RangeInput label="Debt/Equity (Max)" value={filters.deMax} onChange={v => setFilter("deMax", v)} min={0} max={10} step={0.1} />
            </div>

            {/* Technical Filters */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-ivory-600 uppercase tracking-wider">Technicals</div>
              <RangeInput label="RSI Min" value={filters.rsiMin} onChange={v => setFilter("rsiMin", v)} min={0} max={100} />
              <RangeInput label="RSI Max" value={filters.rsiMax} onChange={v => setFilter("rsiMax", v)} min={0} max={100} />
              <RangeInput label="Volume Surge (Min)" value={filters.volSurgeMin} onChange={v => setFilter("volSurgeMin", v)} min={0} max={10} step={0.5} suffix="x" />
              <RangeInput label="Delivery % (Min)" value={filters.deliveryMin} onChange={v => setFilter("deliveryMin", v)} min={0} max={90} suffix="%" />
              <div className="space-y-1.5">
                {([["aboveEma20", "Above EMA 20"], ["aboveEma50", "Above EMA 50"], ["aboveEma200", "Above EMA 200"], ["macdBuy", "MACD Bullish"]] as [keyof Filters, string][]).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setFilter(k, !filters[k] as Filters[typeof k])}
                      className={cn("w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer",
                        filters[k] ? "bg-maroon-700 border-maroon-600" : "border-bg-border hover:border-maroon-800"
                      )}>
                      {filters[k] && <div className="w-2 h-2 bg-ivory-100 rounded-sm" />}
                    </div>
                    <span className="text-[11px] text-ivory-400">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Smart Money Filters */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-ivory-600 uppercase tracking-wider">Smart Money</div>
              <RangeInput label="SM Score (Min)" value={filters.smScoreMin} onChange={v => setFilter("smScoreMin", v)} min={0} max={100} />
              <RangeInput label="AI Score (Min)" value={filters.aiScoreMin} onChange={v => setFilter("aiScoreMin", v)} min={0} max={100} />
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className={cn(showFilters ? "lg:col-span-3" : "lg:col-span-4")}>
          {results.length === 0 ? (
            <div className="card-glass rounded-xl p-12 text-center">
              <Search className="w-8 h-8 text-ivory-700 mx-auto mb-3" />
              <div className="text-ivory-500 text-sm">No stocks match your criteria</div>
              <div className="text-ivory-700 text-xs mt-1">Try relaxing some filters</div>
            </div>
          ) : (
            <div className="card-glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-bg-border bg-bg-secondary/50">
                      {([
                        ["symbol", "Symbol"], ["price", "Price"], ["change1d", "1D%"],
                        ["pe", "PE"], ["roe", "ROE"], ["roce", "ROCE"],
                        ["rsi", "RSI"], ["delivery", "Del%"], ["smScore", "SM"], ["aiScore", "AI"],
                      ] as [SortKey, string][]).map(([k, label]) => (
                        <th key={k}
                          onClick={() => handleSort(k)}
                          className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-ivory-300 select-none">
                          {label}<SortIcon k={k} />
                        </th>
                      ))}
                      <th className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider">EMA</th>
                      <th className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider">MACD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((s, i) => (
                      <tr key={s.symbol} className={cn("border-b border-bg-border/50 hover:bg-bg-hover transition-colors", i % 2 === 0 && "bg-bg-primary/20")}>
                        <td className="px-3 py-2.5">
                          <div className="font-mono font-bold text-ivory-100">{s.symbol}</div>
                          <div className="text-[9px] text-ivory-600 truncate max-w-[100px]">{s.sector}</div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-ivory-200">₹{s.price.toLocaleString()}</td>
                        <td className={cn("px-3 py-2.5 font-mono font-bold", s.change1d >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                          {s.change1d >= 0 ? "+" : ""}{s.change1d}%
                        </td>
                        <td className="px-3 py-2.5 font-mono text-ivory-300">{s.pe}</td>
                        <td className={cn("px-3 py-2.5 font-mono", s.roe >= 20 ? "text-signal-bull" : "text-ivory-400")}>{s.roe}%</td>
                        <td className={cn("px-3 py-2.5 font-mono", s.roce >= 20 ? "text-signal-bull" : "text-ivory-400")}>{s.roce}%</td>
                        <td className={cn("px-3 py-2.5 font-mono font-bold",
                          s.rsi >= 70 ? "text-signal-bear" : s.rsi <= 40 ? "text-signal-bull" : "text-yellow-400"
                        )}>{s.rsi}</td>
                        <td className={cn("px-3 py-2.5 font-mono", s.delivery >= 60 ? "text-signal-bull" : "text-ivory-400")}>{s.delivery}%</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 bg-bg-border rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", s.smScore >= 70 ? "bg-signal-bull" : s.smScore >= 40 ? "bg-yellow-500" : "bg-signal-bear")}
                                style={{ width: `${s.smScore}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-ivory-300">{s.smScore}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 bg-bg-border rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", s.aiScore >= 70 ? "bg-maroon-500" : s.aiScore >= 40 ? "bg-yellow-500" : "bg-ivory-700")}
                                style={{ width: `${s.aiScore}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-ivory-300">{s.aiScore}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-0.5">
                            {[["20", s.aboveEma20], ["50", s.aboveEma50], ["200", s.aboveEma200]].map(([label, above]) => (
                              <span key={label as string} className={cn("text-[8px] px-1 py-0.5 rounded font-mono",
                                above ? "bg-signal-bull/20 text-signal-bull" : "bg-bg-border text-ivory-700"
                              )}>{label}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={cn("label-tag text-[9px]",
                            s.macdSignal === "buy" ? "bg-signal-bull/15 text-signal-bull" :
                            s.macdSignal === "sell" ? "bg-signal-bear/15 text-signal-bear" :
                            "bg-yellow-500/15 text-yellow-400"
                          )}>{s.macdSignal.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
