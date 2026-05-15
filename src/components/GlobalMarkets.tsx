"use client";
import { useState } from "react";
import { Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

interface MarketItem {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePct: number;
  country: string;
  flag: string;
  region: string;
}

interface CurrencyItem {
  pair: string;
  value: number;
  change: number;
  changePct: number;
  flag: string;
  impact: string;
}

interface CommodityItem {
  name: string;
  symbol: string;
  value: number;
  unit: string;
  change: number;
  changePct: number;
  icon: string;
  indiaImpact: "positive" | "negative" | "neutral";
}

const INDICES: MarketItem[] = [
  { name: "S&P 500", symbol: "SPX", value: 5318, change: 18.4, changePct: 0.35, country: "USA", flag: "🇺🇸", region: "Americas" },
  { name: "Nasdaq 100", symbol: "NDX", value: 18720, change: 94.2, changePct: 0.51, country: "USA", flag: "🇺🇸", region: "Americas" },
  { name: "Dow Jones", symbol: "DJIA", value: 39840, change: -42.1, changePct: -0.11, country: "USA", flag: "🇺🇸", region: "Americas" },
  { name: "FTSE 100", symbol: "UKX", value: 8428, change: 12.8, changePct: 0.15, country: "UK", flag: "🇬🇧", region: "Europe" },
  { name: "DAX", symbol: "DAX", value: 18962, change: 84.3, changePct: 0.45, country: "Germany", flag: "🇩🇪", region: "Europe" },
  { name: "CAC 40", symbol: "CAC", value: 8124, change: -18.4, changePct: -0.23, country: "France", flag: "🇫🇷", region: "Europe" },
  { name: "Nikkei 225", symbol: "NKY", value: 38420, change: 284.1, changePct: 0.74, country: "Japan", flag: "🇯🇵", region: "Asia" },
  { name: "Hang Seng", symbol: "HSI", value: 19840, change: -142.8, changePct: -0.71, country: "HK", flag: "🇭🇰", region: "Asia" },
  { name: "Shanghai", symbol: "SHCOMP", value: 3142, change: -8.4, changePct: -0.27, country: "China", flag: "🇨🇳", region: "Asia" },
  { name: "Nifty 50", symbol: "NIFTY", value: 24180, change: 142.8, changePct: 0.59, country: "India", flag: "🇮🇳", region: "Asia" },
  { name: "Sensex", symbol: "SENSEX", value: 79420, change: 484.2, changePct: 0.61, country: "India", flag: "🇮🇳", region: "Asia" },
  { name: "SGX Nifty", symbol: "SGXNIFTY", value: 24215, change: 168.4, changePct: 0.70, country: "Singapore", flag: "🇸🇬", region: "Asia" },
];

const CURRENCIES: CurrencyItem[] = [
  { pair: "USD/INR", value: 83.42, change: -0.18, changePct: -0.22, flag: "🇺🇸🇮🇳", impact: "INR strengthen = FII inflow bullish" },
  { pair: "DXY", value: 102.4, change: -0.62, changePct: -0.60, flag: "🇺🇸", impact: "Weak DXY = EM rally, FII inflows" },
  { pair: "EUR/USD", value: 1.0842, change: 0.0042, changePct: 0.39, flag: "🇪🇺🇺🇸", impact: "Strong EUR = DXY weak = India positive" },
  { pair: "GBP/USD", value: 1.2684, change: 0.0028, changePct: 0.22, flag: "🇬🇧🇺🇸", impact: "Neutral for India" },
  { pair: "USD/JPY", value: 154.82, change: -0.48, changePct: -0.31, flag: "🇺🇸🇯🇵", impact: "Yen strengthening = risk-on globally" },
  { pair: "USD/CNY", value: 7.248, change: 0.012, changePct: 0.17, flag: "🇺🇸🇨🇳", impact: "Yuan weak = metals pressure" },
];

const COMMODITIES: CommodityItem[] = [
  { name: "Gold", symbol: "XAUUSD", value: 2384, unit: "$/oz", change: 12.4, changePct: 0.52, icon: "🥇", indiaImpact: "negative" },
  { name: "Silver", symbol: "XAGUSD", value: 28.42, unit: "$/oz", change: 0.38, changePct: 1.35, icon: "🥈", indiaImpact: "neutral" },
  { name: "Brent Crude", symbol: "BRNT", value: 78.2, unit: "$/bbl", change: -1.42, changePct: -1.78, icon: "🛢️", indiaImpact: "positive" },
  { name: "WTI Crude", symbol: "WTI", value: 74.8, unit: "$/bbl", change: -1.18, changePct: -1.55, icon: "🛢️", indiaImpact: "positive" },
  { name: "Natural Gas", symbol: "NATGAS", value: 2.142, unit: "$/MMBtu", change: 0.048, changePct: 2.29, icon: "🔥", indiaImpact: "negative" },
  { name: "Copper", symbol: "COPPER", value: 4.284, unit: "$/lb", change: -0.048, changePct: -1.11, icon: "🔴", indiaImpact: "neutral" },
  { name: "Aluminium", symbol: "ALUM", value: 2484, unit: "$/T", change: -18.4, changePct: -0.73, icon: "⚪", indiaImpact: "neutral" },
  { name: "MCX Gold", symbol: "MCXGOLD", value: 74240, unit: "₹/10g", change: 420, changePct: 0.57, icon: "🥇", indiaImpact: "negative" },
];

const CRYPTO = [
  { name: "Bitcoin", symbol: "BTC", value: 62840, change: 1284, changePct: 2.08, icon: "₿" },
  { name: "Ethereum", symbol: "ETH", value: 2984, change: 84.2, changePct: 2.91, icon: "Ξ" },
];

const CORRELATION_MATRIX = [
  { market: "S&P 500", corr: 0.72, label: "High positive — US market direction = Nifty direction" },
  { market: "Nasdaq", corr: 0.68, label: "Strong — IT sector especially correlated" },
  { market: "DXY", corr: -0.64, label: "Inverse — Strong USD hurts FII inflows" },
  { market: "Hang Seng", corr: 0.48, label: "Moderate — China slowdown spills over" },
  { market: "Crude Oil", corr: -0.42, label: "Moderate inverse — High crude = CAD deficit pressure" },
  { market: "Gold", corr: 0.28, label: "Weak positive — Both benefit in risk-off" },
  { market: "US 10Y Yield", corr: -0.58, label: "Inverse — High yields → DXY strong → FII outflows" },
  { market: "VIX (US)", corr: -0.71, label: "Strong inverse — High VIX = FII selling in India" },
];

// 30-day Nifty vs S&P trend
const TREND_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  nifty: 23400 + Math.sin(i * 0.3) * 400 + i * 26 + (Math.random() - 0.5) * 200,
  sp500: 5100 + Math.sin(i * 0.3 + 0.5) * 80 + i * 7.2 + (Math.random() - 0.5) * 60,
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px] space-y-0.5">
      <div className="text-ivory-500">Day {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value.toFixed(0)}
        </div>
      ))}
    </div>
  );
};

function ChangeCell({ pct, value }: { pct: number; value?: number }) {
  const pos = pct >= 0;
  return (
    <div className={cn("flex flex-col", pos ? "text-signal-bull" : "text-signal-bear")}>
      {value !== undefined && <span className="text-[10px] font-mono">{pos ? "+" : ""}{value.toFixed(2)}</span>}
      <span className="text-[11px] font-mono font-bold">{pos ? "+" : ""}{pct.toFixed(2)}%</span>
    </div>
  );
}

export default function GlobalMarkets() {
  const [region, setRegion] = useState<"all" | "Americas" | "Europe" | "Asia">("all");

  const filteredIndices = INDICES.filter(i => region === "all" || i.region === region);
  const bullishIndices = INDICES.filter(i => i.changePct > 0).length;
  const bearishIndices = INDICES.filter(i => i.changePct < 0).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-maroon-600" />
            Global Markets
          </h2>
          <p className="text-xs text-ivory-500">World indices, currencies, commodities & Nifty correlation</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-ivory-500">Global Breadth:</span>
          <span className="text-signal-bull font-bold">{bullishIndices} UP</span>
          <span className="text-ivory-700">|</span>
          <span className="text-signal-bear font-bold">{bearishIndices} DOWN</span>
        </div>
      </div>

      {/* Global Indices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-ivory-400">World Indices</div>
          <div className="flex gap-1">
            {(["all", "Americas", "Europe", "Asia"] as const).map(r => (
              <button key={r} onClick={() => setRegion(r)}
                className={cn("px-2.5 py-1 rounded text-[11px] font-semibold transition-colors",
                  region === r ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
                )}>{r === "all" ? "All" : r}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {filteredIndices.map(idx => (
            <div key={idx.symbol} className={cn("card-glass rounded-xl p-3 border",
              idx.symbol === "NIFTY" || idx.symbol === "SENSEX"
                ? "border-maroon-700/50 bg-maroon-950/20"
                : "border-transparent"
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{idx.flag}</span>
                <span className={cn("label-tag text-[8px]",
                  idx.changePct > 0 ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear"
                )}>
                  {idx.changePct > 0 ? "▲" : "▼"} {Math.abs(idx.changePct).toFixed(2)}%
                </span>
              </div>
              <div className="text-[10px] text-ivory-600 truncate">{idx.name}</div>
              <div className="text-sm font-display font-bold text-ivory-100 mt-0.5">
                {idx.value.toLocaleString()}
              </div>
              <div className={cn("text-[10px] font-mono mt-0.5", idx.change >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Currencies */}
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-bg-border">
            <div className="text-xs font-semibold text-ivory-300">Currency Pairs & India Impact</div>
          </div>
          <div className="divide-y divide-bg-border/50">
            {CURRENCIES.map(c => (
              <div key={c.pair} className="px-4 py-2.5 flex items-center gap-3 hover:bg-bg-hover transition-colors">
                <span className="text-base w-10">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-ivory-100">{c.pair}</span>
                    <span className="text-[11px] font-mono text-ivory-300">{c.value}</span>
                  </div>
                  <div className="text-[9px] text-ivory-600 truncate mt-0.5">{c.impact}</div>
                </div>
                <ChangeCell pct={c.changePct} />
              </div>
            ))}
          </div>
        </div>

        {/* Commodities */}
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-bg-border">
            <div className="text-xs font-semibold text-ivory-300">Commodities</div>
          </div>
          <div className="divide-y divide-bg-border/50">
            {COMMODITIES.map(c => (
              <div key={c.symbol} className="px-4 py-2.5 flex items-center gap-3 hover:bg-bg-hover transition-colors">
                <span className="text-base w-6">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-ivory-100">{c.name}</span>
                    <span className="text-[9px] text-ivory-600">{c.unit}</span>
                  </div>
                  <div className="text-[11px] font-mono text-ivory-300 mt-0.5">{c.value.toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ChangeCell pct={c.changePct} />
                  <span className={cn("label-tag text-[8px]",
                    c.indiaImpact === "positive" ? "bg-signal-bull/15 text-signal-bull" :
                    c.indiaImpact === "negative" ? "bg-signal-bear/15 text-signal-bear" :
                    "bg-ivory-800/20 text-ivory-600"
                  )}>
                    {c.indiaImpact === "positive" ? "↑ India" : c.indiaImpact === "negative" ? "↓ India" : "neutral"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crypto + Nifty Correlation */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Crypto */}
        <div className="card-glass rounded-xl p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Crypto — Risk Sentiment Indicator</div>
          <div className="space-y-3">
            {CRYPTO.map(c => (
              <div key={c.symbol} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-border flex items-center justify-center text-sm font-bold text-gold-500">{c.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-ivory-100">{c.name}</span>
                    <span className={cn("text-xs font-mono font-bold", c.changePct >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                      {c.changePct >= 0 ? "+" : ""}{c.changePct}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] font-mono text-ivory-400">${c.value.toLocaleString()}</span>
                    <span className={cn("text-[10px] font-mono", c.change >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                      {c.change >= 0 ? "+" : ""}${c.change.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-bg-border">
              <div className="text-[10px] text-ivory-600 leading-relaxed">
                BTC + ETH both up 2%+ = <span className="text-signal-bull">risk-on globally</span>. FII likely to continue EM inflows. Watch for correlation with Nifty open.
              </div>
            </div>
          </div>
        </div>

        {/* Nifty Correlation Matrix */}
        <div className="xl:col-span-2 card-glass rounded-xl p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Nifty 50 — Global Correlation Matrix</div>
          <div className="space-y-2">
            {CORRELATION_MATRIX.map(c => {
              const pct = Math.abs(c.corr) * 100;
              const positive = c.corr >= 0;
              return (
                <div key={c.market} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0 text-[11px] font-mono text-ivory-400">{c.market}</div>
                  <div className="flex-1 h-4 bg-bg-border rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-ivory-800 z-10" />
                    {positive ? (
                      <div className="absolute left-1/2 top-0 bottom-0 rounded-r"
                        style={{ width: `${pct / 2}%`, background: `rgba(34,197,94,${pct / 100 * 0.8 + 0.2})` }} />
                    ) : (
                      <div className="absolute right-1/2 top-0 bottom-0 rounded-l"
                        style={{ width: `${pct / 2}%`, background: `rgba(239,68,68,${pct / 100 * 0.8 + 0.2})` }} />
                    )}
                  </div>
                  <div className={cn("w-12 text-right flex-shrink-0 text-[11px] font-mono font-bold",
                    positive ? "text-signal-bull" : "text-signal-bear"
                  )}>
                    {c.corr >= 0 ? "+" : ""}{c.corr.toFixed(2)}
                  </div>
                  <div className="w-48 flex-shrink-0 text-[9px] text-ivory-600 truncate hidden lg:block">{c.label}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-bg-border flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-signal-bull/70" /><span className="text-ivory-500">Positive correlation</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-signal-bear/70" /><span className="text-ivory-500">Negative correlation</span></div>
            <span className="text-ivory-600">|</span>
            <span className="text-ivory-600">Bar width = strength (&gt;0.6 = significant)</span>
          </div>
        </div>
      </div>

      {/* Nifty vs S&P 30-Day Trend */}
      <div className="card-glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-semibold text-ivory-300">Nifty 50 vs S&P 500 — 30-Day Trend (Normalized)</div>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-maroon-500" /><span className="text-ivory-500">Nifty 50</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-400" /><span className="text-ivory-500">S&P 500 (scaled)</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={TREND_DATA}>
            <defs>
              <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c2d32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c2d32" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false}
              tickFormatter={v => v % 5 === 0 ? `D${v}` : ""} />
            <YAxis yAxisId="nifty" domain={["auto", "auto"]} hide />
            <YAxis yAxisId="sp" orientation="right" domain={["auto", "auto"]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Area yAxisId="nifty" type="monotone" dataKey="nifty" stroke="#7c2d32" strokeWidth={2} fill="url(#niftyGrad)" dot={false} name="Nifty" />
            <Area yAxisId="sp" type="monotone" dataKey="sp500" stroke="#60a5fa" strokeWidth={1.5} fill="transparent" dot={false} name="S&P 500" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
