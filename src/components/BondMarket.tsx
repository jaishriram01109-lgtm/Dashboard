"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Shield } from "lucide-react";
import { fetchBondYields, BOND_YF, type YFQuote } from "@/lib/yahooData";
import {
  LineChart, BarChart, AreaChart,
  Line, Bar, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell,
} from "recharts";

interface GSec { tenor: string; yield: number; prev: number; change: number }
interface CorpBond { issuer: string; rating: string; tenor: string; yield: number; spread: number; sector: string }

const GSEC: GSec[] = [
  { tenor: "91D",  yield: 6.52, prev: 6.50, change: 0.02 },
  { tenor: "182D", yield: 6.68, prev: 6.66, change: 0.02 },
  { tenor: "364D", yield: 6.78, prev: 6.77, change: 0.01 },
  { tenor: "2Y",   yield: 6.89, prev: 6.91, change: -0.02 },
  { tenor: "3Y",   yield: 6.98, prev: 7.01, change: -0.03 },
  { tenor: "5Y",   yield: 7.08, prev: 7.11, change: -0.03 },
  { tenor: "7Y",   yield: 7.15, prev: 7.18, change: -0.03 },
  { tenor: "10Y",  yield: 7.12, prev: 7.15, change: -0.03 },
  { tenor: "14Y",  yield: 7.18, prev: 7.21, change: -0.03 },
  { tenor: "30Y",  yield: 7.28, prev: 7.30, change: -0.02 },
];

const yieldHistory = Array.from({ length: 60 }, (_, i) => ({
  date: `D${i + 1}`,
  "10Y": +(7.45 - i * 0.005 + Math.sin(i * 0.2) * 0.08).toFixed(3),
  "5Y":  +(7.30 - i * 0.004 + Math.sin(i * 0.22) * 0.06).toFixed(3),
  "2Y":  +(7.15 - i * 0.003 + Math.sin(i * 0.25) * 0.05).toFixed(3),
}));

const spreadHistory = Array.from({ length: 30 }, (_, i) => ({
  date: `D${i + 1}`,
  "10Y-2Y": +(0.20 + Math.sin(i * 0.3) * 0.08).toFixed(3),
  "10Y-3M": +(0.60 + Math.sin(i * 0.2) * 0.12).toFixed(3),
}));

const CORP_BONDS: CorpBond[] = [
  { issuer: "HDFC Ltd",       rating: "AAA", tenor: "3Y", yield: 7.45, spread: 47, sector: "Finance" },
  { issuer: "LIC Housing",    rating: "AAA", tenor: "5Y", yield: 7.62, spread: 54, sector: "Finance" },
  { issuer: "Bajaj Finance",  rating: "AAA", tenor: "2Y", yield: 7.38, spread: 49, sector: "Finance" },
  { issuer: "NABARD",         rating: "AAA", tenor: "10Y", yield: 7.48, spread: 36, sector: "PSU" },
  { issuer: "Power Grid",     rating: "AAA", tenor: "7Y", yield: 7.42, spread: 27, sector: "PSU" },
  { issuer: "Tata Capital",   rating: "AA+", tenor: "3Y", yield: 7.78, spread: 80, sector: "Finance" },
  { issuer: "Shriram Finance",rating: "AA",  tenor: "2Y", yield: 8.24, spread: 135, sector: "NBFC" },
  { issuer: "Adani Ports",    rating: "AA",  tenor: "5Y", yield: 8.15, spread: 107, sector: "Infra" },
];

const fiiDebtFlow = Array.from({ length: 20 }, (_, i) => ({
  date: `D${i + 1}`,
  flow: Math.round((Math.sin(i * 0.4) * 800 + Math.cos(i * 0.2) * 400) * 10) / 10,
}));

const ratingColors: Record<string, string> = {
  "AAA": "text-signal-bull", "AA+": "text-signal-bull", "AA": "text-gold-500",
  "AA-": "text-gold-500", "A+": "text-ivory-400", "A": "text-signal-bear",
};

export default function BondMarket() {
  const [activeTab, setActiveTab] = useState<"yield-curve" | "corporate" | "fii-debt">("yield-curve");
  const [live, setLive] = useState<Map<string, YFQuote>>(new Map());
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const load = async () => {
      const m = await fetchBondYields();
      if (m.size) { setLive(m); setIsLive(true); }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const benchmarkYield = GSEC.find((g) => g.tenor === "10Y")!;
  const rbIRepo = 6.50;
  const realYield = benchmarkYield.yield - 4.83;

  const usYield10Y = live.get(BOND_YF["US 10Y"]);
  const usYield30Y = live.get(BOND_YF["US 30Y"]);
  const us3M = live.get(BOND_YF["US 3M"]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Bond &amp; Debt Market</h2>
          <p className="text-xs text-ivory-500 mt-0.5 flex items-center gap-1">
            {isLive ? <><span className="w-1.5 h-1.5 rounded-full bg-signal-bull inline-block animate-pulse" /> US Yields Live — Yahoo Finance · India G-Sec simulated</> : "G-Sec yield curve · Corporate bonds · FII debt flows"}
          </p>
        </div>
        <div className="flex gap-1.5">
          {(["yield-curve", "corporate", "fii-debt"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`text-[10px] px-3 py-1.5 rounded border capitalize transition-all ${activeTab === t ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {t.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Key rate cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "RBI Repo Rate", value: `${rbIRepo}%`, sub: "Current policy rate", color: "text-ivory-200" },
          { label: "India 10Y G-Sec", value: `${benchmarkYield.yield}%`, sub: `${benchmarkYield.change >= 0 ? "+" : ""}${benchmarkYield.change}% today`, color: benchmarkYield.change < 0 ? "text-signal-bull" : "text-signal-bear" },
          {
            label: "US 10Y Treasury",
            value: usYield10Y ? `${usYield10Y.price.toFixed(2)}%` : "—",
            sub: usYield10Y ? `${usYield10Y.changePct >= 0 ? "+" : ""}${usYield10Y.changePct.toFixed(2)}% today · Live` : "Yahoo Finance",
            color: usYield10Y ? (usYield10Y.changePct < 0 ? "text-signal-bull" : "text-signal-bear") : "text-ivory-500",
          },
          {
            label: "US 3M T-Bill",
            value: us3M ? `${us3M.price.toFixed(2)}%` : `${(benchmarkYield.yield - rbIRepo).toFixed(2)}%`,
            sub: us3M ? `Live · ${us3M.changePct >= 0 ? "+" : ""}${us3M.changePct.toFixed(2)}%` : "10Y vs Repo (India)",
            color: "text-gold-500",
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card-base p-3">
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider">{label}</div>
            <div className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</div>
            <div className="text-[10px] text-ivory-600 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {activeTab === "yield-curve" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Yield Curve */}
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">India G-Sec Yield Curve</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={GSEC} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="tenor" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <YAxis domain={[6.4, 7.4]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v}%`, "Yield"]} />
                <Line dataKey="yield" stroke="#d4af37" strokeWidth={2} dot={{ fill: "#d4af37", r: 4 }} />
                <Line dataKey="prev" stroke="#4a3a3a" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Prev" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-5 gap-1">
              {GSEC.filter((_, i) => i % 2 === 0).map((g) => (
                <div key={g.tenor} className="text-center bg-bg-primary rounded p-1.5">
                  <div className="text-[9px] text-ivory-600">{g.tenor}</div>
                  <div className="text-[10px] font-mono text-ivory-200">{g.yield}%</div>
                  <div className={`text-[9px] font-mono ${g.change > 0 ? "text-signal-bear" : "text-signal-bull"}`}>
                    {g.change > 0 ? "+" : ""}{g.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yield History */}
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Yield History — 60 Days</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={yieldHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={9} />
                <YAxis domain={[6.8, 7.6]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v}%`, ""]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                <Line dataKey="10Y" stroke="#d4af37" strokeWidth={1.5} dot={false} />
                <Line dataKey="5Y" stroke="#7c1d1d" strokeWidth={1.5} dot={false} />
                <Line dataKey="2Y" stroke="#1e40af" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-3">
              <div className="text-[10px] text-ivory-600 uppercase tracking-wider mb-2">Yield Spreads</div>
              <ResponsiveContainer width="100%" height={90}>
                <LineChart data={spreadHistory} margin={{ top: 2, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={5} />
                  <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                  <ReferenceLine y={0} stroke="#4a3a3a" strokeDasharray="3 3" />
                  <Line dataKey="10Y-2Y" stroke="#d4af37" strokeWidth={1.5} dot={false} name="10Y-2Y" />
                  <Line dataKey="10Y-3M" stroke="#7c1d1d" strokeWidth={1.5} dot={false} name="10Y-3M" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "corporate" && (
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Corporate Bond Universe</div>
          <div className="grid grid-cols-7 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border">
            {["Issuer", "Rating", "Tenor", "Yield", "Spread (bps)", "Sector", "Spread Bar"].map((h) => <div key={h}>{h}</div>)}
          </div>
          {CORP_BONDS.map((b) => (
            <div key={b.issuer} className="grid grid-cols-7 gap-2 text-[10px] px-2 py-2.5 border-b border-bg-border/40 hover:bg-bg-hover items-center">
              <div className="font-semibold text-ivory-200">{b.issuer}</div>
              <div className={`font-bold ${ratingColors[b.rating] ?? "text-ivory-400"}`}>{b.rating}</div>
              <div className="text-ivory-500 font-mono">{b.tenor}</div>
              <div className="text-ivory-200 font-mono">{b.yield}%</div>
              <div className={`font-mono ${b.spread > 100 ? "text-signal-bear" : b.spread > 60 ? "text-gold-500" : "text-signal-bull"}`}>{b.spread}</div>
              <div className="text-ivory-500">{b.sector}</div>
              <div className="h-2 bg-bg-primary rounded overflow-hidden">
                <div className={`h-full rounded ${b.spread > 100 ? "bg-signal-bear/60" : b.spread > 60 ? "bg-gold-500/60" : "bg-signal-bull/60"}`}
                  style={{ width: `${(b.spread / 150) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "fii-debt" && (
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">FII Debt Flow — 20 Days (₹ Cr)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fiiDebtFlow} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`₹${v} Cr`, "FII Debt"]} />
              <ReferenceLine y={0} stroke="#4a3a3a" strokeDasharray="4 4" />
              <Bar dataKey="flow" radius={[2, 2, 0, 0]}>
                {fiiDebtFlow.map((d, i) => <Cell key={i} fill={d.flow >= 0 ? "#166534" : "#7c1d1d"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
