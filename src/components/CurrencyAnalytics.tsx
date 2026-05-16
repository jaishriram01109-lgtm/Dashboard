"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Globe } from "lucide-react";
import { fetchGlobalMarkets, CURRENCY_YF, type YFQuote } from "@/lib/yahooData";
import {
  AreaChart, BarChart, LineChart, ComposedChart,
  Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell,
} from "recharts";

interface CurrencyPair {
  pair: string; rate: number; change: number; changePct: number;
  high52W: number; low52W: number; indiaImpact: string; trend: "APPRECIATION" | "DEPRECIATION" | "STABLE";
}

const PAIRS: CurrencyPair[] = [
  { pair: "USD/INR", rate: 83.42, change: -0.12, changePct: -0.14, high52W: 87.00, low52W: 81.80, indiaImpact: "Weaker INR = import inflation, FII outflows", trend: "STABLE" },
  { pair: "EUR/INR", rate: 90.24, change: 0.34,  changePct: 0.38,  high52W: 93.40, low52W: 87.20, indiaImpact: "EU trade, pharma/IT revenue impact", trend: "DEPRECIATION" },
  { pair: "GBP/INR", rate: 105.8, change: -0.22, changePct: -0.21, high52W: 110.4, low52W: 101.2, indiaImpact: "UK remittances, IT/pharma exports", trend: "STABLE" },
  { pair: "JPY/INR", rate: 0.554, change: 0.002, changePct: 0.36,  high52W: 0.581, low52W: 0.538, indiaImpact: "Japan FDI, auto sector", trend: "DEPRECIATION" },
  { pair: "CNY/INR", rate: 11.54, change: -0.08, changePct: -0.69, high52W: 12.10, low52W: 11.20, indiaImpact: "Imports (electronics/chemicals/pharma APIs)", trend: "APPRECIATION" },
  { pair: "AED/INR", rate: 22.72, change: -0.03, changePct: -0.13, high52W: 23.68, low52W: 22.28, indiaImpact: "Gulf remittances key to CAD", trend: "STABLE" },
];

const usdinrHistory = Array.from({ length: 90 }, (_, i) => ({
  date: `D${i + 1}`,
  rate: +(84.2 - i * 0.008 + Math.sin(i * 0.15) * 0.4 + Math.cos(i * 0.08) * 0.25).toFixed(3),
  rbi: +(84.0 - i * 0.007 + Math.sin(i * 0.12) * 0.2).toFixed(3),
}));

const rbiIntervention = Array.from({ length: 20 }, (_, i) => ({
  date: `D${i + 1}`,
  buy: i % 5 === 1 ? Math.round(Math.random() * 1500 + 500) : 0,
  sell: i % 4 === 2 ? Math.round(Math.random() * 1200 + 400) : 0,
}));

const emCurrencies = [
  { name: "INR",   ytd: 1.2,  vs3M: -0.8  },
  { name: "BRL",   ytd: -8.4, vs3M: -4.2  },
  { name: "ZAR",   ytd: -5.1, vs3M: -2.3  },
  { name: "IDR",   ytd: -3.2, vs3M: -1.8  },
  { name: "MXN",   ytd: -6.8, vs3M: -3.4  },
  { name: "TRY",   ytd: -22.1,vs3M: -8.4  },
  { name: "THB",   ytd: -2.1, vs3M: -0.9  },
  { name: "PHP",   ytd: -3.8, vs3M: -1.4  },
];

const dxyHistory = Array.from({ length: 60 }, (_, i) => ({
  date: `D${i + 1}`,
  dxy: +(104.5 + Math.sin(i * 0.2) * 1.8 + Math.cos(i * 0.1) * 1.2 - i * 0.02).toFixed(2),
  usdinr: +(84.5 - i * 0.015 + Math.sin(i * 0.18) * 0.3).toFixed(3),
}));

const carryTrade = [
  { currency: "INR", yieldDiff: 2.12, volatility: 4.2, sharpe: 0.50, signal: "ATTRACTIVE" },
  { currency: "BRL", yieldDiff: 8.75, volatility: 18.4, sharpe: 0.48, signal: "ATTRACTIVE" },
  { currency: "MXN", yieldDiff: 4.25, volatility: 12.8, sharpe: 0.33, signal: "NEUTRAL" },
  { currency: "ZAR", yieldDiff: 3.50, volatility: 16.2, sharpe: 0.22, signal: "NEUTRAL" },
  { currency: "TRY", yieldDiff: 20.5, volatility: 48.5, sharpe: 0.42, signal: "HIGH RISK" },
];

const trendColor = (t: CurrencyPair["trend"]) =>
  t === "APPRECIATION" ? "text-signal-bull" : t === "DEPRECIATION" ? "text-signal-bear" : "text-ivory-400";

export default function CurrencyAnalytics() {
  const [activeTab, setActiveTab] = useState<"usdinr" | "em" | "carry">("usdinr");
  const [selectedPair, setSelectedPair] = useState("USD/INR");
  const [live, setLive] = useState<Map<string, YFQuote>>(new Map());
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const load = async () => {
      const m = await fetchGlobalMarkets();
      if (m.size) { setLive(m); setIsLive(true); }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const livePairs: CurrencyPair[] = PAIRS.map(p => {
    const yfSym = CURRENCY_YF[p.pair];
    const q = yfSym ? live.get(yfSym) : undefined;
    if (!q) return p;
    const trend: CurrencyPair["trend"] = q.changePct > 0.1 ? "DEPRECIATION" : q.changePct < -0.1 ? "APPRECIATION" : "STABLE";
    return { ...p, rate: +q.price.toFixed(4), change: +q.change.toFixed(4), changePct: +q.changePct.toFixed(2), trend };
  });

  const sel = livePairs.find((p) => p.pair === selectedPair) ?? livePairs[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Currency Analytics</h2>
          <p className="text-xs text-ivory-500 mt-0.5 flex items-center gap-1">
            {isLive ? <><span className="w-1.5 h-1.5 rounded-full bg-signal-bull inline-block animate-pulse" /> Live — Yahoo Finance</> : "USD/INR · RBI intervention · EM basket · Carry trade signals"}
          </p>
        </div>
        <div className="flex gap-1.5">
          {(["usdinr", "em", "carry"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`text-[10px] px-3 py-1.5 rounded border uppercase tracking-wider transition-all ${activeTab === t ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {t === "usdinr" ? "USD/INR" : t === "em" ? "EM Basket" : "Carry Trade"}
            </button>
          ))}
        </div>
      </div>

      {/* Currency pair cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {livePairs.map((p) => (
          <button key={p.pair} onClick={() => setSelectedPair(p.pair)}
            className={`card-base p-2.5 text-left border transition-all ${selectedPair === p.pair ? "border-maroon-700/60 bg-maroon-900/20" : "border-transparent hover:border-bg-border"}`}>
            <div className="text-[9px] text-ivory-600">{p.pair}</div>
            <div className="text-sm font-bold font-mono text-ivory-100 mt-0.5">{p.rate}</div>
            <div className={`text-[9px] font-semibold mt-0.5 ${p.changePct >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>
              {p.changePct >= 0 ? "+" : ""}{p.changePct.toFixed(2)}%
            </div>
            <div className={`text-[8px] mt-0.5 ${trendColor(p.trend)}`}>{p.trend}</div>
          </button>
        ))}
      </div>

      {activeTab === "usdinr" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* USD/INR chart */}
            <div className="card-base p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-ivory-300">USD/INR — 90 Days</span>
                <div className="text-[10px] text-ivory-500">52W: {sel.low52W} — {sel.high52W}</div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={usdinrHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                  <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={14} />
                  <YAxis domain={[82, 85.5]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                  <Area dataKey="rate" name="USD/INR" stroke="#7c1d1d" fill="#7c1d1d" fillOpacity={0.2} strokeWidth={1.5} dot={false} />
                  <Line dataKey="rbi" name="RBI Fair Value" stroke="#d4af37" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-3 text-[10px] text-ivory-600 bg-bg-primary rounded p-2">
                <Globe className="w-3 h-3 inline mr-1 text-gold-500" />
                {sel.indiaImpact}
              </div>
            </div>

            {/* RBI Intervention */}
            <div className="card-base p-4">
              <div className="text-xs font-semibold text-ivory-300 mb-3">RBI Intervention — Last 20 Days ($ Mn)</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={rbiIntervention} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                  <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                  <Bar dataKey="buy" name="RBI Buy USD" fill="#7c1d1d" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="sell" name="RBI Sell USD" fill="#166534" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                {[
                  { label: "Net Intervention", value: "-$420 Mn", color: "text-signal-bull" },
                  { label: "FX Reserves", value: "$648 Bn", color: "text-signal-bull" },
                  { label: "Import Cover", value: "10.2 Months", color: "text-ivory-300" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-bg-primary rounded p-2 text-center">
                    <div className="text-ivory-600">{label}</div>
                    <div className={`font-semibold font-mono mt-0.5 ${color}`}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DXY vs USD/INR */}
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">DXY vs USD/INR Correlation — 60 Days</div>
            <ResponsiveContainer width="100%" height={160}>
              <ComposedChart data={dxyHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={9} />
                <YAxis yAxisId="dxy" orientation="left" domain={[101, 107]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <YAxis yAxisId="inr" orientation="right" domain={[83, 85]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                <Area yAxisId="dxy" dataKey="dxy" name="DXY Index" stroke="#d4af37" fill="#d4af37" fillOpacity={0.1} strokeWidth={1.5} dot={false} />
                <Line yAxisId="inr" dataKey="usdinr" name="USD/INR" stroke="#7c1d1d" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "em" && (
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">EM Currency Performance vs USD — YTD (%)</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={emCurrencies} layout="vertical" margin={{ top: 4, right: 20, left: 24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis type="number" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v}%`, "YTD"]} />
              <ReferenceLine x={0} stroke="#4a3a3a" />
              <Bar dataKey="ytd" radius={[0, 3, 3, 0]}>
                {emCurrencies.map((d, i) => <Cell key={i} fill={d.ytd >= 0 ? "#166534" : "#7c1d1d"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === "carry" && (
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Carry Trade Attractiveness vs USD</div>
          <div className="grid grid-cols-5 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border">
            {["Currency", "Yield Diff %", "Volatility", "Sharpe", "Signal"].map((h) => <div key={h}>{h}</div>)}
          </div>
          {carryTrade.map((c) => (
            <div key={c.currency} className="grid grid-cols-5 gap-2 text-[10px] px-2 py-2.5 border-b border-bg-border/40 hover:bg-bg-hover items-center">
              <div className="font-bold text-ivory-200">{c.currency}</div>
              <div className="font-mono text-signal-bull">+{c.yieldDiff}%</div>
              <div className={`font-mono ${c.volatility < 8 ? "text-signal-bull" : c.volatility < 20 ? "text-gold-500" : "text-signal-bear"}`}>{c.volatility}%</div>
              <div className={`font-mono font-semibold ${c.sharpe > 0.45 ? "text-signal-bull" : c.sharpe > 0.3 ? "text-gold-500" : "text-signal-bear"}`}>{c.sharpe}</div>
              <div className={`text-[9px] px-2 py-0.5 rounded font-semibold ${c.signal === "ATTRACTIVE" ? "bg-signal-bull/20 text-signal-bull" : c.signal === "NEUTRAL" ? "bg-ivory-700/20 text-ivory-500" : "bg-signal-bear/20 text-signal-bear"}`}>
                {c.signal}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
