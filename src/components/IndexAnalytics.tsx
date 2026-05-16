"use client";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";
import { useAngelQuotes } from "@/hooks/useAngelData";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type IndexKey = "NIFTY50" | "BANKNIFTY";

interface IndexInfo {
  name: string;
  value: number;
  change: number;
  changePct: number;
  volume: string;
  pe: number;
  pb: number;
  divYield: number;
  high52w: number;
  low52w: number;
}

interface Constituent {
  rank: number;
  symbol: string;
  sector: string;
  weight: number;
  contribution: number;
  change1d: number;
}

interface BreadthData {
  above20EMA: number;
  above50EMA: number;
  above200EMA: number;
  advancing: number;
  declining: number;
  unchanged: number;
  total: number;
}

interface SectorContrib {
  sector: string;
  contribution: number;
}

interface DayData {
  date: string;
  nifty: number;
  equalWeight: number;
}

interface ADData {
  date: string;
  advances: number;
  declines: number;
}

interface RebalStock {
  symbol: string;
  type: "INCLUSION" | "EXCLUSION";
  score: number;
  reason: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INDEX_DATA: Record<IndexKey, IndexInfo> = {
  NIFTY50: {
    name: "Nifty 50", value: 24185.8, change: 142.4, changePct: 0.59,
    volume: "₹38,240 Cr", pe: 22.4, pb: 3.8, divYield: 1.24,
    high52w: 26277.4, low52w: 21281.5,
  },
  BANKNIFTY: {
    name: "Bank Nifty", value: 52340.2, change: 386.6, changePct: 0.74,
    volume: "₹14,820 Cr", pe: 14.8, pb: 2.6, divYield: 0.82,
    high52w: 55264.8, low52w: 43410.6,
  },
};

const NIFTY_CONSTITUENTS: Constituent[] = [
  { rank: 1,  symbol: "RELIANCE",   sector: "Energy",    weight: 9.82, contribution: 13.9, change1d: 0.74 },
  { rank: 2,  symbol: "HDFCBANK",   sector: "Banking",   weight: 8.64, contribution: -4.2, change1d: -0.48 },
  { rank: 3,  symbol: "ICICIBANK",  sector: "Banking",   weight: 7.21, contribution: 18.6, change1d: 1.34 },
  { rank: 4,  symbol: "INFY",       sector: "IT",        weight: 6.14, contribution: -8.1, change1d: -1.32 },
  { rank: 5,  symbol: "TCS",        sector: "IT",        weight: 5.84, contribution: 6.4,  change1d: 0.11 },
  { rank: 6,  symbol: "HDFC",       sector: "Finance",   weight: 4.92, contribution: 12.1, change1d: 1.24 },
  { rank: 7,  symbol: "KOTAKBANK",  sector: "Banking",   weight: 4.18, contribution: 5.8,  change1d: 0.69 },
  { rank: 8,  symbol: "AXISBANK",   sector: "Banking",   weight: 3.84, contribution: 9.4,  change1d: 1.22 },
  { rank: 9,  symbol: "BAJFINANCE", sector: "NBFC",      weight: 3.24, contribution: 14.2, change1d: 2.18 },
  { rank: 10, symbol: "LT",         sector: "Infra",     weight: 2.96, contribution: 7.8,  change1d: 1.32 },
  { rank: 11, symbol: "HINDUNILVR", sector: "FMCG",      weight: 2.82, contribution: -3.4, change1d: -0.60 },
  { rank: 12, symbol: "MARUTI",     sector: "Auto",      weight: 2.64, contribution: 4.6,  change1d: 0.87 },
  { rank: 13, symbol: "TITAN",      sector: "Consumer",  weight: 2.48, contribution: 8.2,  change1d: 1.64 },
  { rank: 14, symbol: "SUNPHARMA",  sector: "Pharma",    weight: 2.32, contribution: 3.6,  change1d: 0.78 },
  { rank: 15, symbol: "ASIANPAINT", sector: "Consumer",  weight: 2.14, contribution: -5.8, change1d: -1.36 },
  { rank: 16, symbol: "ITC",        sector: "FMCG",      weight: 2.06, contribution: -1.2, change1d: -0.29 },
  { rank: 17, symbol: "WIPRO",      sector: "IT",        weight: 1.88, contribution: -4.6, change1d: -1.22 },
  { rank: 18, symbol: "TATAMOTORS", sector: "Auto",      weight: 1.76, contribution: 6.2,  change1d: 1.76 },
  { rank: 19, symbol: "NESTLEIND",  sector: "FMCG",      weight: 1.64, contribution: -2.4, change1d: -0.73 },
  { rank: 20, symbol: "TATASTEEL",  sector: "Metals",    weight: 1.42, contribution: 3.8,  change1d: 1.34 },
];

const BANKNIFTY_CONSTITUENTS: Constituent[] = [
  { rank: 1, symbol: "HDFCBANK",  sector: "Banking", weight: 28.4, contribution: -18.2, change1d: -0.48 },
  { rank: 2, symbol: "ICICIBANK", sector: "Banking", weight: 22.8, contribution: 84.2,  change1d: 1.34 },
  { rank: 3, symbol: "KOTAKBANK", sector: "Banking", weight: 14.6, contribution: 26.4,  change1d: 0.69 },
  { rank: 4, symbol: "AXISBANK",  sector: "Banking", weight: 13.2, contribution: 42.6,  change1d: 1.22 },
  { rank: 5, symbol: "SBIBANK",   sector: "Banking", weight: 9.4,  contribution: 38.2,  change1d: 1.86 },
  { rank: 6, symbol: "INDUSINDBK",sector: "Banking", weight: 5.8,  contribution: -12.4, change1d: -0.94 },
  { rank: 7, symbol: "BANDHANBNK",sector: "Banking", weight: 2.4,  contribution: 8.4,   change1d: 1.64 },
  { rank: 8, symbol: "FEDERALBNK",sector: "Banking", weight: 2.2,  contribution: 6.2,   change1d: 1.32 },
  { rank: 9, symbol: "IDFCFIRSTB",sector: "Banking", weight: 1.2,  contribution: 4.6,   change1d: 1.76 },
  { rank: 10,symbol: "AUBANK",    sector: "Banking", weight: 0.8,  contribution: 3.2,   change1d: 1.42 },
  { rank: 11,symbol: "PNB",       sector: "Banking", weight: 0.6,  contribution: 2.4,   change1d: 1.84 },
  { rank: 12,symbol: "BANKBARODA",sector: "Banking", weight: 0.6,  contribution: 1.8,   change1d: 1.14 },
  { rank: 13,symbol: "RBLBANK",   sector: "Banking", weight: 0.4,  contribution: -2.8,  change1d: -2.48 },
  { rank: 14,symbol: "CANBK",     sector: "Banking", weight: 0.4,  contribution: 1.6,   change1d: 1.12 },
  { rank: 15,symbol: "UNIONBANK", sector: "Banking", weight: 0.4,  contribution: 1.4,   change1d: 1.26 },
  { rank: 16,symbol: "KARURVYSYA",sector: "Banking", weight: 0.3,  contribution: 0.8,   change1d: 0.68 },
  { rank: 17,symbol: "CSBBANK",   sector: "Banking", weight: 0.3,  contribution: 0.6,   change1d: 0.42 },
  { rank: 18,symbol: "NAINITAL",  sector: "Banking", weight: 0.2,  contribution: -0.4,  change1d: -0.28 },
  { rank: 19,symbol: "DCBBANK",   sector: "Banking", weight: 0.2,  contribution: 0.4,   change1d: 0.62 },
  { rank: 20,symbol: "JKBANK",    sector: "Banking", weight: 0.2,  contribution: 0.2,   change1d: 0.34 },
];

const NIFTY_BREADTH: BreadthData = {
  above20EMA: 34, above50EMA: 28, above200EMA: 22, advancing: 32, declining: 15, unchanged: 3, total: 50,
};

const BANKNIFTY_BREADTH: BreadthData = {
  above20EMA: 15, above50EMA: 11, above200EMA: 9, advancing: 14, declining: 8, unchanged: 2, total: 24,
};

const NIFTY_SECTOR_CONTRIB: SectorContrib[] = [
  { sector: "Banking",  contribution: 21.6 },
  { sector: "NBFC",     contribution: 14.2 },
  { sector: "Energy",   contribution: 13.9 },
  { sector: "Infra",    contribution: 7.8 },
  { sector: "Auto",     contribution: 6.4 },
  { sector: "IT",       contribution: -6.3 },
  { sector: "Pharma",   contribution: 3.6 },
  { sector: "FMCG",     contribution: -4.6 },
  { sector: "Consumer", contribution: 2.4 },
  { sector: "Metals",   contribution: 3.8 },
  { sector: "Finance",  contribution: 12.1 },
].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

const BANKNIFTY_SECTOR_CONTRIB: SectorContrib[] = [
  { sector: "Private Banks", contribution: 135.0 },
  { sector: "PSU Banks",     contribution: 44.8 },
  { sector: "Small Banks",   contribution: 7.0 },
  { sector: "NBFC-Banks",    contribution: -18.2 },
].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

// 30-day index vs equal weight data
const INDEX_VS_EW: DayData[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 3, 16 + i);
  const base = 100;
  const drift = i * 0.2;
  const noise1 = Math.sin(i * 0.8) * 1.4 + Math.cos(i * 0.3) * 0.8;
  const noise2 = Math.sin(i * 0.6) * 1.8 + Math.cos(i * 0.5) * 1.2;
  return {
    date: `${d.getDate()}/${d.getMonth() + 1}`,
    nifty: parseFloat((base + drift + noise1).toFixed(2)),
    equalWeight: parseFloat((base + drift * 0.8 + noise2).toFixed(2)),
  };
});

const BANKNIFTY_VS_EW: DayData[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 3, 16 + i);
  const base = 100;
  const drift = i * 0.25;
  const noise1 = Math.sin(i * 0.7) * 1.2 + Math.cos(i * 0.4) * 1.0;
  const noise2 = Math.sin(i * 0.5) * 2.0 + Math.cos(i * 0.6) * 0.9;
  return {
    date: `${d.getDate()}/${d.getMonth() + 1}`,
    nifty: parseFloat((base + drift + noise1).toFixed(2)),
    equalWeight: parseFloat((base + drift * 0.7 + noise2).toFixed(2)),
  };
});

// 30-day advance/decline
const AD_HISTORY: ADData[] = Array.from({ length: 30 }, (_, i) => {
  const base = 28 + Math.floor(Math.sin(i * 0.6) * 10);
  const adv = Math.max(5, Math.min(45, base));
  return {
    date: `D${i + 1}`,
    advances: adv,
    declines: 50 - adv,
  };
});

const BANKNIFTY_AD_HISTORY: ADData[] = Array.from({ length: 30 }, (_, i) => {
  const base = 14 + Math.floor(Math.sin(i * 0.7) * 6);
  const adv = Math.max(2, Math.min(22, base));
  return {
    date: `D${i + 1}`,
    advances: adv,
    declines: 24 - adv,
  };
});

const NIFTY_REBALANCING: RebalStock[] = [
  { symbol: "ZOMATO",    type: "INCLUSION", score: 82, reason: "MCap threshold met, liquidity criteria passed" },
  { symbol: "PAYTM",     type: "INCLUSION", score: 64, reason: "Recent MCap recovery above ₹50,000 Cr" },
  { symbol: "NYKAA",     type: "INCLUSION", score: 58, reason: "Consistent profitability for 4 quarters" },
  { symbol: "TATACHEM",  type: "EXCLUSION", score: 28, reason: "MCap fallen below threshold for 3 quarters" },
  { symbol: "APOLLOHOSP",type: "EXCLUSION", score: 34, reason: "Low free-float; promoter buyback concerns" },
  { symbol: "GRASIM",    type: "EXCLUSION", score: 38, reason: "Declining trading volume vs. index average" },
];

const BANKNIFTY_REBALANCING: RebalStock[] = [
  { symbol: "YESBANK",  type: "INCLUSION", score: 55, reason: "Capital adequacy restored, NPAs declining" },
  { symbol: "UJJIVANSF", type: "INCLUSION", score: 48, reason: "Promoted to Small Finance Bank category" },
  { symbol: "LAKSHVILAS", type: "EXCLUSION", score: 22, reason: "MCap consistently below threshold" },
  { symbol: "SOUTHBNK",  type: "EXCLUSION", score: 30, reason: "Low liquidity, poor free-float ratio" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function breadthBarColor(pct: number): string {
  if (pct >= 60) return "bg-signal-bull";
  if (pct >= 40) return "bg-gold-500";
  return "bg-signal-bear";
}

function breadthTextColor(pct: number): string {
  if (pct >= 60) return "text-signal-bull";
  if (pct >= 40) return "text-gold-400";
  return "text-signal-bear";
}

function change1dColor(c: number): string {
  if (c > 0) return "text-signal-bull";
  if (c < 0) return "text-signal-bear";
  return "text-ivory-400";
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps): JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-bg-card border border-bg-border rounded px-3 py-2 text-xs">
      <p className="text-ivory-300 font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IndexAnalytics(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<IndexKey>("NIFTY50");
  const { quotes, isLive } = useAngelQuotes(30_000);

  const liveIndexData = useMemo(() => {
    const data = { ...INDEX_DATA };
    if (!isLive || quotes.size === 0) return data;
    const niftyQ = quotes.get("NIFTY");
    if (niftyQ) data.NIFTY50 = { ...INDEX_DATA.NIFTY50, value: niftyQ.ltp, change: niftyQ.change, changePct: niftyQ.changePct };
    const bnQ = quotes.get("BANKNIFTY");
    if (bnQ) data.BANKNIFTY = { ...INDEX_DATA.BANKNIFTY, value: bnQ.ltp, change: bnQ.change, changePct: bnQ.changePct };
    return data;
  }, [quotes, isLive]);

  const idx = liveIndexData[activeIndex];
  const constituents = activeIndex === "NIFTY50" ? NIFTY_CONSTITUENTS : BANKNIFTY_CONSTITUENTS;
  const breadth = activeIndex === "NIFTY50" ? NIFTY_BREADTH : BANKNIFTY_BREADTH;
  const sectorContrib = activeIndex === "NIFTY50" ? NIFTY_SECTOR_CONTRIB : BANKNIFTY_SECTOR_CONTRIB;
  const vsEW = activeIndex === "NIFTY50" ? INDEX_VS_EW : BANKNIFTY_VS_EW;
  const adHistory = activeIndex === "NIFTY50" ? AD_HISTORY : BANKNIFTY_AD_HISTORY;
  const rebalancing = activeIndex === "NIFTY50" ? NIFTY_REBALANCING : BANKNIFTY_REBALANCING;

  const isPositive = idx.changePct >= 0;
  const high52wPct = ((idx.value - idx.high52w) / idx.high52w) * 100;
  const low52wPct = ((idx.value - idx.low52w) / idx.low52w) * 100;

  const above20Pct = (breadth.above20EMA / breadth.total) * 100;
  const above50Pct = (breadth.above50EMA / breadth.total) * 100;
  const above200Pct = (breadth.above200EMA / breadth.total) * 100;

  const inclusions = rebalancing.filter((r) => r.type === "INCLUSION");
  const exclusions = rebalancing.filter((r) => r.type === "EXCLUSION");

  return (
    <div className="bg-bg-primary min-h-screen font-sans">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-bg-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="text-maroon-800" size={22} />
          <div>
            <h1 className="text-ivory-100 text-xl font-display font-bold tracking-wide">Index Analytics</h1>
            {isLive && <p className="text-xs text-signal-bull flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-signal-bull inline-block animate-pulse" /> Live — Angel One SmartAPI</p>}
          </div>
        </div>
        {/* Index toggle */}
        <div className="flex bg-bg-card border border-bg-border rounded-lg overflow-hidden">
          {(["NIFTY50", "BANKNIFTY"] as IndexKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveIndex(key)}
              className={
                activeIndex === key
                  ? "px-4 py-2 text-sm font-semibold text-ivory-100 bg-maroon-800"
                  : "px-4 py-2 text-sm text-ivory-500 hover:text-ivory-300 transition-colors"
              }
            >
              {key === "NIFTY50" ? "Nifty 50" : "Bank Nifty"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Top stats ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-3">
          {/* Value */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-3">
            <p className="text-ivory-500 text-xs uppercase tracking-widest mb-1">Value</p>
            <p className="text-ivory-100 font-mono font-bold text-lg">{idx.value.toLocaleString("en-IN")}</p>
          </div>
          {/* Change */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-3">
            <p className="text-ivory-500 text-xs uppercase tracking-widest mb-1">Change</p>
            <p className={isPositive ? "text-signal-bull font-mono font-bold text-lg" : "text-signal-bear font-mono font-bold text-lg"}>
              {isPositive ? "+" : ""}{idx.change.toFixed(1)}
            </p>
            <p className={isPositive ? "text-signal-bull text-xs" : "text-signal-bear text-xs"}>
              {isPositive ? "+" : ""}{idx.changePct.toFixed(2)}%
            </p>
          </div>
          {/* PE */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-3">
            <p className="text-ivory-500 text-xs uppercase tracking-widest mb-1">P/E Ratio</p>
            <p className="text-ivory-100 font-mono font-bold text-lg">{idx.pe}</p>
          </div>
          {/* PB */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-3">
            <p className="text-ivory-500 text-xs uppercase tracking-widest mb-1">P/B Ratio</p>
            <p className="text-ivory-100 font-mono font-bold text-lg">{idx.pb}</p>
          </div>
          {/* Div Yield */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-3">
            <p className="text-ivory-500 text-xs uppercase tracking-widest mb-1">Div Yield</p>
            <p className="text-signal-bull font-mono font-bold text-lg">{idx.divYield}%</p>
          </div>
          {/* 52W */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-3">
            <p className="text-ivory-500 text-xs uppercase tracking-widest mb-1">52W Range</p>
            <p className="text-signal-bear text-xs font-mono">H: {high52wPct.toFixed(1)}%</p>
            <p className="text-signal-bull text-xs font-mono">L: +{low52wPct.toFixed(1)}%</p>
          </div>
        </div>

        {/* ── Breadth ─────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          {/* EMA breadth bars */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <p className="text-xs text-ivory-500 uppercase tracking-widest mb-4">Market Breadth — EMA Status</p>
            <div className="space-y-4">
              {[
                { label: "Above 20 EMA", count: breadth.above20EMA, pct: above20Pct },
                { label: "Above 50 EMA", count: breadth.above50EMA, pct: above50Pct },
                { label: "Above 200 EMA", count: breadth.above200EMA, pct: above200Pct },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-ivory-400 text-xs">{item.label}</span>
                    <span className={breadthTextColor(item.pct) + " text-xs font-mono font-semibold"}>
                      {item.count}/{breadth.total} ({Math.round(item.pct)}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-bg-border rounded-full overflow-hidden">
                    <div
                      className={breadthBarColor(item.pct) + " h-full rounded-full transition-all"}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-2 border-t border-bg-border">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-signal-bull" />
                  <span className="text-signal-bull font-mono font-bold text-sm">{breadth.advancing}</span>
                  <span className="text-ivory-500 text-xs">Adv</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown size={14} className="text-signal-bear" />
                  <span className="text-signal-bear font-mono font-bold text-sm">{breadth.declining}</span>
                  <span className="text-ivory-500 text-xs">Dec</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gold-400 font-mono font-bold text-sm">{breadth.unchanged}</span>
                  <span className="text-ivory-500 text-xs">Unch</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advance / Decline */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <p className="text-xs text-ivory-500 uppercase tracking-widest mb-2">Advance / Decline — 30 Day Trend</p>
            <div className="flex items-center justify-center gap-8 mb-3">
              <div className="text-center">
                <p className="text-signal-bull font-mono font-bold text-3xl">{breadth.advancing}</p>
                <p className="text-signal-bull text-xs">Advancing</p>
              </div>
              <div className="text-center">
                <p className="text-signal-bear font-mono font-bold text-3xl">{breadth.declining}</p>
                <p className="text-signal-bear text-xs">Declining</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={adHistory} margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                <XAxis dataKey="date" tick={{ fill: "#9C8C58", fontSize: 9 }} interval={4} />
                <YAxis tick={{ fill: "#9C8C58", fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="advances" name="Advances" stackId="1" stroke="#00E676" fill="#00E67622" strokeWidth={1.5} />
                <Area type="monotone" dataKey="declines" name="Declines" stackId="1" stroke="#FF1744" fill="#FF174422" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Middle: Sector Contrib + Index vs EW ───────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Sector contribution */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <p className="text-xs text-ivory-500 uppercase tracking-widest mb-3">Sector Contribution (Points Today)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={sectorContrib}
                layout="vertical"
                margin={{ top: 5, right: 30, bottom: 5, left: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                <XAxis type="number" tick={{ fill: "#9C8C58", fontSize: 10 }} />
                <YAxis type="category" dataKey="sector" tick={{ fill: "#B8A870", fontSize: 10 }} width={58} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="contribution" name="Points" radius={[0, 3, 3, 0]}>
                  {sectorContrib.map((d, i) => (
                    <Cell key={i} fill={d.contribution >= 0 ? "#00E676" : "#FF1744"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Index vs Equal Weight */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <p className="text-xs text-ivory-500 uppercase tracking-widest mb-3">
              {activeIndex === "NIFTY50" ? "Nifty 50" : "Bank Nifty"} vs Equal Weight (Rebased 100)
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={vsEW} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                <XAxis dataKey="date" tick={{ fill: "#9C8C58", fontSize: 10 }} interval={4} />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "#9C8C58", fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#B8A870" }} />
                <Line
                  type="monotone"
                  dataKey="nifty"
                  name={activeIndex === "NIFTY50" ? "Nifty 50" : "Bank Nifty"}
                  stroke="#8B0000"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="equalWeight"
                  name="Equal Weight"
                  stroke="#DAA520"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Bottom: Constituents Table + Rebalancing Watch ─────────────────────── */}
        <div className="grid grid-cols-5 gap-4">
          {/* Constituents table (3 cols) */}
          <div className="col-span-3 bg-bg-card border border-bg-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-bg-border">
              <p className="text-xs text-ivory-500 uppercase tracking-widest">Top 20 Constituents</p>
            </div>
            <div className="overflow-y-auto max-h-72">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-bg-secondary">
                  <tr className="border-b border-bg-border">
                    <th className="text-left px-3 py-2 text-ivory-500 font-normal w-8">#</th>
                    <th className="text-left px-3 py-2 text-ivory-500 font-normal">Stock</th>
                    <th className="text-left px-3 py-2 text-ivory-500 font-normal">Sector</th>
                    <th className="text-right px-3 py-2 text-ivory-500 font-normal">Wt%</th>
                    <th className="text-right px-3 py-2 text-ivory-500 font-normal">Contrib (pts)</th>
                    <th className="text-right px-3 py-2 text-ivory-500 font-normal">1D%</th>
                  </tr>
                </thead>
                <tbody>
                  {constituents.map((c) => (
                    <tr key={c.rank} className="border-b border-bg-border/40 hover:bg-bg-hover/50">
                      <td className="px-3 py-1.5 text-ivory-600">{c.rank}</td>
                      <td className="px-3 py-1.5 text-ivory-100 font-mono font-semibold">{c.symbol}</td>
                      <td className="px-3 py-1.5 text-ivory-500">{c.sector}</td>
                      <td className="px-3 py-1.5 text-right text-ivory-300 font-mono">{c.weight.toFixed(2)}%</td>
                      <td className={
                        c.contribution >= 0
                          ? "px-3 py-1.5 text-right font-mono text-signal-bull"
                          : "px-3 py-1.5 text-right font-mono text-signal-bear"
                      }>
                        {c.contribution >= 0 ? "+" : ""}{c.contribution.toFixed(1)}
                      </td>
                      <td className={change1dColor(c.change1d) + " px-3 py-1.5 text-right font-mono"}>
                        {c.change1d >= 0 ? "+" : ""}{c.change1d.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rebalancing watch (2 cols) */}
          <div className="col-span-2 bg-bg-card border border-bg-border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className="text-gold-400" />
              <p className="text-xs text-ivory-500 uppercase tracking-widest">Rebalancing Watch</p>
            </div>

            {/* Inclusions */}
            <div>
              <p className="text-xs text-signal-bull font-semibold mb-2 flex items-center gap-1">
                <TrendingUp size={12} /> Inclusion Candidates
              </p>
              <div className="space-y-2">
                {inclusions.map((r) => (
                  <div key={r.symbol} className="bg-bg-secondary border border-signal-bull/20 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-ivory-100 font-mono font-semibold text-xs">{r.symbol}</span>
                      <span className="text-signal-bull text-xs font-bold">Score {r.score}</span>
                    </div>
                    <div className="h-1 bg-bg-border rounded-full overflow-hidden mb-1.5">
                      <div className="bg-signal-bull h-full rounded-full" style={{ width: `${r.score}%` }} />
                    </div>
                    <p className="text-ivory-500 text-xs leading-tight">{r.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div>
              <p className="text-xs text-signal-bear font-semibold mb-2 flex items-center gap-1">
                <TrendingDown size={12} /> Exclusion Candidates
              </p>
              <div className="space-y-2">
                {exclusions.map((r) => (
                  <div key={r.symbol} className="bg-bg-secondary border border-signal-bear/20 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-ivory-100 font-mono font-semibold text-xs">{r.symbol}</span>
                      <span className="text-signal-bear text-xs font-bold">Score {r.score}</span>
                    </div>
                    <div className="h-1 bg-bg-border rounded-full overflow-hidden mb-1.5">
                      <div className="bg-signal-bear h-full rounded-full" style={{ width: `${r.score}%` }} />
                    </div>
                    <p className="text-ivory-500 text-xs leading-tight">{r.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
