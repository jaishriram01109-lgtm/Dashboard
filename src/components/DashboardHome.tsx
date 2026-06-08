"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Bell, Activity, Brain, BarChart3, Shield, Target, Zap, Globe, PieChart, Search, BookOpen, Calculator, Flag, Eye } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  fetchHomeData,
  type IndexQuote, type ChartPoint,
} from "@/lib/liveData";
import { fetchBondYields, BOND_YF } from "@/lib/yahooData";
import { useAngelQuotes } from "@/hooks/useAngelData";

// Fallback mock data
const MOCK_INDICES: IndexQuote[] = [
  { name: "NIFTY 50",    symbol: "^NSEI",      value: 22850.45, change:  187.30, pct:  0.83 },
  { name: "BANK NIFTY",  symbol: "^NSEBANK",   value: 48234.60, change:  312.45, pct:  0.65 },
  { name: "SENSEX",      symbol: "^BSESN",     value: 75432.10, change:  601.20, pct:  0.80 },
  { name: "NIFTY IT",    symbol: "^CNXIT",     value: 38456.30, change: -234.10, pct: -0.61 },
  { name: "NIFTY PHARMA",symbol: "^CNXPHARMA", value: 21345.80, change:  289.40, pct:  0.67 },
  { name: "INDIA VIX",   symbol: "^INDIAVIX",  value: 13.42,    change:   -0.84, pct: -5.89 },
];

const MOCK_CHART: ChartPoint[] = Array.from({ length: 20 }, (_, i) => ({
  t: i,
  v: 22600 + Math.round(Math.sin(i * 0.45) * 120 + Math.cos(i * 0.25) * 60 + i * 12),
}));

const SECTIONS_GRID = [
  { id: "macro",        label: "Macro Intel",        icon: Globe,      group: "MARKET" },
  { id: "sectors",      label: "Sector Rotation",    icon: BarChart3,  group: "MARKET" },
  { id: "smart-money",  label: "Smart Money",        icon: Brain,      group: "MARKET" },
  { id: "heatmap",      label: "Market Heatmap",     icon: Activity,   group: "MARKET" },
  { id: "breadth",      label: "Breadth",            icon: Activity,   group: "MARKET" },
  { id: "flows",        label: "Capital Flows",      icon: TrendingUp, group: "MARKET" },
  { id: "trades",       label: "Trade Setups",       icon: Target,     group: "SIGNALS" },
  { id: "ai-predict",   label: "AI Prediction",      icon: Brain,      group: "SIGNALS" },
  { id: "scanner",      label: "Momentum Scanner",   icon: Search,     group: "SIGNALS" },
  { id: "patterns",     label: "Chart Patterns",     icon: Zap,        group: "SIGNALS" },
  { id: "quant",        label: "Quant Factor",       icon: Calculator, group: "SIGNALS" },
  { id: "sentiment",    label: "Sentiment",          icon: Eye,        group: "SIGNALS" },
  { id: "options",      label: "Options Chain",      icon: BarChart3,  group: "F&O" },
  { id: "fno",          label: "F&O Analytics",      icon: Activity,   group: "F&O" },
  { id: "volatility",   label: "Vol Surface",        icon: Zap,        group: "F&O" },
  { id: "optionstrategy",label:"Option Strategy",    icon: Target,     group: "F&O" },
  { id: "derivatives",  label: "Derivatives",        icon: BarChart3,  group: "F&O" },
  { id: "fiideriv",     label: "FII Derivatives",    icon: Shield,     group: "F&O" },
  { id: "portfolio",    label: "AI Portfolio",       icon: PieChart,   group: "PORTFOLIO" },
  { id: "rebalancer",   label: "Rebalancer",         icon: Activity,   group: "PORTFOLIO" },
  { id: "risk",         label: "Risk Dashboard",     icon: Shield,     group: "PORTFOLIO" },
  { id: "dividends",    label: "Dividends",          icon: TrendingUp, group: "PORTFOLIO" },
  { id: "sizing",       label: "Position Sizing",    icon: Calculator, group: "PORTFOLIO" },
  { id: "peer",         label: "Peer Compare",       icon: BarChart3,  group: "PORTFOLIO" },
  { id: "screener",     label: "Screener",           icon: Search,     group: "RESEARCH" },
  { id: "earnings",     label: "Earnings",           icon: BarChart3,  group: "RESEARCH" },
  { id: "insider",      label: "Insider Registry",   icon: Eye,        group: "RESEARCH" },
  { id: "promoter",     label: "Promoter Activity",  icon: Shield,     group: "RESEARCH" },
  { id: "delivery",     label: "Delivery Analysis",  icon: Activity,   group: "RESEARCH" },
  { id: "highlows",     label: "52W High/Low",       icon: TrendingUp, group: "RESEARCH" },
  { id: "advanced-chart",label:"Chart Studio",       icon: BarChart3,  group: "TOOLS" },
  { id: "backtest",     label: "Backtest Engine",    icon: Zap,        group: "TOOLS" },
  { id: "journal",      label: "Trade Journal",      icon: BookOpen,   group: "TOOLS" },
  { id: "tax",          label: "Tax Optimizer",      icon: Calculator, group: "TOOLS" },
  { id: "goals",        label: "Goal Planner",       icon: Flag,       group: "TOOLS" },
  { id: "mf",           label: "Mutual Funds",       icon: PieChart,   group: "TOOLS" },
];

const GROUP_COLORS: Record<string, string> = {
  "MARKET":    "bg-blue-500",
  "SIGNALS":   "bg-signal-bull",
  "F&O":       "bg-gold-500",
  "PORTFOLIO": "bg-maroon-400",
  "RESEARCH":  "bg-signal-accumulate",
  "TOOLS":     "bg-ivory-600",
};

interface Props { onNavigate: (id: string) => void }

export default function DashboardHome({ onNavigate }: Props) {
  const [indices, setIndices]       = useState<IndexQuote[]>(MOCK_INDICES);
  const [chartData, setChartData]   = useState<ChartPoint[]>(MOCK_CHART);
  const [usdInr, setUsdInr]         = useState<number | null>(null);
  const [us10y, setUs10y]           = useState<number | null>(null);
  const [isLive, setIsLive]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [dataSource, setDataSource] = useState<"angel" | "yahoo" | "simulated">("simulated");
  const [marketOpen, setMarketOpen] = useState(false);
  const { quotes } = useAngelQuotes();

  // Compute real market breadth from Angel One quotes
  const breadth = useMemo(() => {
    if (quotes.size === 0) return null;
    let adv = 0, dec = 0;
    quotes.forEach(q => {
      if (typeof q.token === "string" && q.token.length <= 6) {
        if (q.changePct > 0) adv++;
        else if (q.changePct < 0) dec++;
      }
    });
    return adv + dec > 5 ? { adv, dec } : null;
  }, [quotes]);

  useEffect(() => {
    const checkMarket = () => {
      const now = new Date();
      const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const mins = ist.getHours() * 60 + ist.getMinutes();
      setMarketOpen(mins >= 555 && mins < 930);
    };
    checkMarket();

    const load = async () => {
      setLoading(true);
      try {
        const [homeResult, bondMap] = await Promise.all([
          fetchHomeData(),
          fetchBondYields(),
        ]);
        const { indices: idxData, isReal, usdInr: usd, chartData: chartPts } = homeResult;
        const us10yQ = bondMap.get(BOND_YF["US 10Y"]);
        if (us10yQ) setUs10y(us10yQ.price);
        if (idxData.length > 0) setIndices(idxData);
        if (isReal) {
          setIsLive(true);
          // Detect source: Angel One session gives non-yahoo symbols (numeric tokens)
          const { getAngelSession } = await import("@/lib/angelOne");
          setDataSource(getAngelSession() ? "angel" : "yahoo");
        } else {
          setDataSource("simulated");
        }
        if (chartPts.length > 5) setChartData(chartPts);
        if (usd) setUsdInr(usd);
      } catch { /* keep mock */ }
      setLoading(false);
    };
    load();
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, []);

  const nifty = indices[0];
  const niftyChangeLabel = nifty
    ? `${nifty.change >= 0 ? "+" : ""}${nifty.change.toFixed(2)} (${nifty.pct >= 0 ? "+" : ""}${nifty.pct.toFixed(2)}%)`
    : "";

  const groups = Array.from(new Set(SECTIONS_GRID.map((s) => s.group)));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ivory-100 tracking-wide">SmartFlow AI</h1>
          <p className="text-xs text-ivory-500 mt-0.5">Institutional Intelligence Terminal · 52 Modules · NSE · BSE · F&amp;O</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${marketOpen ? "bg-signal-bull live-dot" : "bg-ivory-600"}`} />
          <span className="text-[10px] text-ivory-500">Markets {marketOpen ? "Open" : "Closed"}</span>
          {loading ? (
            <span className="text-[8px] font-mono text-ivory-600 animate-pulse">loading...</span>
          ) : isLive ? (
            <span className="text-[8px] font-mono font-bold text-signal-bull bg-signal-bull/10 px-1.5 py-0.5 rounded">
              ● {dataSource === "angel" ? "ANGEL LIVE" : "YAHOO LIVE"}
            </span>
          ) : (
            <span className="text-[8px] font-mono text-gold-500 bg-gold-500/10 px-1.5 py-0.5 rounded">
              ★ SIMULATED
            </span>
          )}
        </div>
      </div>

      {/* Live Index Bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {indices.map((idx) => (
          <div key={idx.name} className="card-base p-3">
            <div className="text-[9px] text-ivory-600 uppercase tracking-wider">{idx.name}</div>
            <div className="text-sm font-bold font-mono text-ivory-100 mt-0.5">
              {idx.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className={`text-[10px] font-semibold mt-0.5 flex items-center gap-1 ${idx.pct >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>
              {idx.pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {idx.pct >= 0 ? "+" : ""}{idx.pct.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Nifty mini chart + Quick stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card-base p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ivory-300">
              Nifty 50 — {isLive ? "Intraday (5m)" : "Simulated"}
            </span>
            <span className={`text-[10px] font-semibold ${nifty && nifty.pct >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>
              {niftyChangeLabel}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#166534" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip
                contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }}
                formatter={(v: number) => [v.toLocaleString("en-IN", { maximumFractionDigits: 2 }), "Nifty"]}
                labelFormatter={() => ""}
              />
              <Area dataKey="v" stroke="#166534" fill="url(#niftyGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 content-start">
          {[
            { label: "Market Breadth", value: breadth ? `${breadth.adv}A / ${breadth.dec}D` : "—",    positive: breadth ? breadth.adv > breadth.dec : true,  live: !!breadth },
            { label: "USD / INR",      value: usdInr ? `₹${usdInr.toFixed(2)}` : "—",                positive: false, live: !!usdInr },
            { label: "US 10Y Yield",   value: us10y  ? `${us10y.toFixed(2)}%`  : "—",                positive: false, live: !!us10y  },
            { label: "India VIX",      value: quotes.get("INDIA_VIX")?.ltp ? `${quotes.get("INDIA_VIX")!.ltp.toFixed(2)}` : "—", positive: false, live: !!quotes.get("INDIA_VIX") },
            { label: "NIFTY 50",       value: quotes.get("NIFTY")?.ltp ? `${quotes.get("NIFTY")!.ltp.toLocaleString("en-IN")}` : "—", positive: (quotes.get("NIFTY")?.changePct ?? 0) >= 0, live: !!quotes.get("NIFTY") },
            { label: "BANK NIFTY",     value: quotes.get("BANKNIFTY")?.ltp ? `${quotes.get("BANKNIFTY")!.ltp.toLocaleString("en-IN")}` : "—", positive: (quotes.get("BANKNIFTY")?.changePct ?? 0) >= 0, live: !!quotes.get("BANKNIFTY") },
            { label: "NIFTY IT",       value: quotes.get("NIFTY_IT")?.ltp ? `${quotes.get("NIFTY_IT")!.ltp.toLocaleString("en-IN")}` : "—", positive: (quotes.get("NIFTY_IT")?.changePct ?? 0) >= 0, live: !!quotes.get("NIFTY_IT") },
            { label: "NIFTY PHARMA",   value: quotes.get("NIFTY_PHARMA")?.ltp ? `${quotes.get("NIFTY_PHARMA")!.ltp.toLocaleString("en-IN")}` : "—", positive: (quotes.get("NIFTY_PHARMA")?.changePct ?? 0) >= 0, live: !!quotes.get("NIFTY_PHARMA") },
          ].map(({ label, value, positive, live }) => (
            <div key={label} className="card-base p-2.5">
              <div className="flex items-center justify-between gap-1">
                <div className="text-[9px] text-ivory-600 uppercase tracking-wider">{label}</div>
                {live
                  ? <span className="text-[8px] text-signal-bull font-mono">LIVE</span>
                  : <span className="text-[8px] text-ivory-700 font-mono">—</span>}
              </div>
              <div className={`text-xs font-bold font-mono mt-0.5 ${value === "—" ? "text-ivory-700" : positive ? "text-signal-bull" : "text-signal-bear"}`}>
                {value === "—" ? "Connect Angel One" : value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Grid */}
      <div>
        <div className="text-[10px] text-ivory-600 uppercase tracking-widest font-bold mb-3">
          Quick Navigation — All 52 Modules
        </div>
        <div className="space-y-4">
          {groups.map((group) => {
            const items = SECTIONS_GRID.filter((s) => s.group === group);
            return (
              <div key={group}>
                <div className="text-[9px] text-ivory-700 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                  <span className={`inline-block w-0.5 h-3 rounded ${GROUP_COLORS[group] ?? "bg-ivory-700"}`} />
                  {group}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-9 gap-2">
                  {items.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => onNavigate(id)}
                      className="card-base p-2.5 flex flex-col items-center gap-1.5 hover:bg-maroon-900/20 hover:border-maroon-800/40 border border-transparent transition-all group text-center"
                    >
                      <Icon className="w-4 h-4 text-ivory-600 group-hover:text-maroon-400 transition-colors" />
                      <span className="text-[9px] text-ivory-500 group-hover:text-ivory-200 leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-ivory-700 pt-2 border-t border-bg-border space-y-0.5">
        <div>
          SmartFlow AI v2.1.0 · 52 Sections · NSE · BSE · FII/DII · Options · Macro
          {dataSource === "angel" && <span className="text-signal-bull ml-2">· Data: Angel One SmartAPI</span>}
          {dataSource === "yahoo" && <span className="text-signal-bull ml-2">· Data: Yahoo Finance</span>}
          {dataSource === "simulated" && <span className="text-gold-500 ml-2">· Connect Angel One for live data</span>}
        </div>
        <div className="text-[9px] text-ivory-800 font-mono">
          Build: {process.env.NEXT_PUBLIC_BUILD_TIME ?? "dev"}
        </div>
      </div>
    </div>
  );
}
