"use client";

import { useState, useMemo } from "react";
import { Shield, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PortfolioPosition {
  symbol: string;
  sector: string;
  currentValue: number;
  allocation: number;
  beta: number;
  volatility: number;
  correlation: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const PORTFOLIO: PortfolioPosition[] = [
  { symbol: "RELIANCE",    sector: "Energy",    currentValue: 245000, allocation: 18.2, beta: 0.92, volatility: 18.4, correlation: 0.82 },
  { symbol: "HDFCBANK",    sector: "Finance",   currentValue: 198000, allocation: 14.7, beta: 1.08, volatility: 22.1, correlation: 0.78 },
  { symbol: "TCS",         sector: "IT",        currentValue: 167000, allocation: 12.4, beta: 0.74, volatility: 16.8, correlation: 0.71 },
  { symbol: "INFY",        sector: "IT",        currentValue: 134000, allocation: 9.9,  beta: 0.68, volatility: 15.2, correlation: 0.69 },
  { symbol: "ICICIBANK",   sector: "Finance",   currentValue: 112000, allocation: 8.3,  beta: 1.21, volatility: 24.3, correlation: 0.81 },
  { symbol: "BAJFINANCE",  sector: "Finance",   currentValue: 98000,  allocation: 7.3,  beta: 1.34, volatility: 28.7, correlation: 0.76 },
  { symbol: "HINDUNILVR",  sector: "FMCG",      currentValue: 89000,  allocation: 6.6,  beta: 0.56, volatility: 12.4, correlation: 0.52 },
  { symbol: "MARUTI",      sector: "Auto",      currentValue: 76000,  allocation: 5.6,  beta: 0.89, volatility: 19.8, correlation: 0.67 },
  { symbol: "SUNPHARMA",   sector: "Pharma",    currentValue: 67000,  allocation: 5.0,  beta: 0.62, volatility: 14.6, correlation: 0.48 },
  { symbol: "TATAMOTORS",  sector: "Auto",      currentValue: 58000,  allocation: 4.3,  beta: 1.45, volatility: 31.2, correlation: 0.74 },
];

const TOTAL_CAPITAL = 1_348_000;

function kellySize(winRate: number, rrRatio: number): number {
  const f = winRate - (1 - winRate) / rrRatio;
  return Math.max(0, Math.min(f * 100, 25));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PositionSizing() {
  const [capital, setCapital] = useState(500000);
  const [riskPct, setRiskPct] = useState(1.5);
  const [stopLossPct, setStopLossPct] = useState(3);
  const [winRate, setWinRate] = useState(55);
  const [rrRatio, setRrRatio] = useState(2.0);
  const [method, setMethod] = useState<"fixed" | "kelly" | "volatility" | "equal">("fixed");
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");

  const selected = PORTFOLIO.find((p) => p.symbol === selectedSymbol) ?? PORTFOLIO[0];

  const results = useMemo(() => {
    const riskAmount = (capital * riskPct) / 100;
    const fixedPos = riskAmount / (stopLossPct / 100);
    const fixedShares = Math.floor(fixedPos / (selected.currentValue / 100));

    const kellyPct = kellySize(winRate / 100, rrRatio);
    const kellyPos = (capital * kellyPct) / 100;
    const kellyShares = Math.floor(kellyPos / (selected.currentValue / 100));

    const volPos = (capital * (20 / selected.volatility) * riskPct) / 100;
    const volShares = Math.floor(volPos / (selected.currentValue / 100));

    const equalPos = capital / 10;
    const equalShares = Math.floor(equalPos / (selected.currentValue / 100));

    return { riskAmount, fixedPos, fixedShares, kellyPct, kellyPos, kellyShares, volPos, volShares, equalPos, equalShares };
  }, [capital, riskPct, stopLossPct, winRate, rrRatio, selected]);

  const activePos = method === "fixed" ? results.fixedPos : method === "kelly" ? results.kellyPos : method === "volatility" ? results.volPos : results.equalPos;
  const activeShares = method === "fixed" ? results.fixedShares : method === "kelly" ? results.kellyShares : method === "volatility" ? results.volShares : results.equalShares;
  const activePct = (activePos / capital) * 100;

  const portfolioHeat = PORTFOLIO.reduce((sum, p) => sum + p.allocation * p.beta, 0) / 100;
  const portfolioVol = Math.sqrt(PORTFOLIO.reduce((sum, p) => sum + Math.pow(p.allocation / 100 * p.volatility, 2), 0));

  const methodComparison = [
    { method: "Fixed %", pos: results.fixedPos, pct: (results.fixedPos / capital) * 100, shares: results.fixedShares },
    { method: "Kelly", pos: results.kellyPos, pct: results.kellyPct, shares: results.kellyShares },
    { method: "Volatility", pos: results.volPos, pct: (results.volPos / capital) * 100, shares: results.volShares },
    { method: "Equal Weight", pos: results.equalPos, pct: 10, shares: results.equalShares },
  ];

  const capitalScenarios = [100000, 250000, 500000, 750000, 1000000, 2000000].map((cap) => ({
    capital: `₹${(cap / 100000).toFixed(0)}L`,
    position: Math.round((cap * riskPct / 100) / (stopLossPct / 100)),
    risk: Math.round(cap * riskPct / 100),
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Position Sizing Calculator</h2>
          <p className="text-xs text-ivory-500 mt-0.5">Optimal position size across 4 methods · Portfolio heat analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-[10px] px-2 py-1 rounded font-semibold ${portfolioHeat > 1 ? "bg-signal-bear/20 text-signal-bear" : "bg-signal-bull/20 text-signal-bull"}`}>
            Portfolio Beta: {portfolioHeat.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Inputs */}
        <div className="card-base p-4 space-y-4">
          <div className="text-xs font-semibold text-ivory-300">Parameters</div>

          {/* Stock selector */}
          <div>
            <label className="text-[10px] text-ivory-600 uppercase tracking-wider">Stock</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full mt-1 bg-bg-primary border border-bg-border rounded text-xs text-ivory-200 px-2 py-1.5"
            >
              {PORTFOLIO.map((p) => <option key={p.symbol} value={p.symbol}>{p.symbol} — {p.sector}</option>)}
            </select>
          </div>

          {/* Method selector */}
          <div>
            <label className="text-[10px] text-ivory-600 uppercase tracking-wider">Sizing Method</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {(["fixed", "kelly", "volatility", "equal"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`text-[10px] py-1.5 rounded border capitalize transition-all ${
                    method === m ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"
                  }`}
                >
                  {m === "fixed" ? "Fixed %" : m === "kelly" ? "Kelly" : m === "volatility" ? "Vol Adj" : "Equal Wt"}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          {[
            { label: "Trading Capital", value: capital, min: 50000, max: 5000000, step: 10000, set: setCapital, fmt: (v: number) => `₹${(v / 100000).toFixed(1)}L` },
            { label: "Risk Per Trade", value: riskPct, min: 0.5, max: 5, step: 0.5, set: setRiskPct, fmt: (v: number) => `${v}%` },
            { label: "Stop Loss", value: stopLossPct, min: 1, max: 10, step: 0.5, set: setStopLossPct, fmt: (v: number) => `${v}%` },
            { label: "Win Rate", value: winRate, min: 30, max: 75, step: 1, set: setWinRate, fmt: (v: number) => `${v}%` },
            { label: "Risk : Reward", value: rrRatio, min: 1, max: 5, step: 0.5, set: setRrRatio, fmt: (v: number) => `1:${v}` },
          ].map(({ label, value, min, max, step, set, fmt }) => (
            <div key={label}>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-ivory-600 uppercase tracking-wider">{label}</span>
                <span className="text-ivory-300 font-semibold font-mono">{fmt(value)}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full h-1.5 rounded appearance-none bg-bg-border accent-maroon-600 cursor-pointer"
              />
            </div>
          ))}

          {/* Stock info */}
          <div className="bg-bg-primary rounded-lg p-3 space-y-1 text-[10px]">
            <div className="flex justify-between"><span className="text-ivory-600">Volatility (Ann.)</span><span className="text-ivory-200">{selected.volatility}%</span></div>
            <div className="flex justify-between"><span className="text-ivory-600">Beta</span><span className="text-ivory-200">{selected.beta}</span></div>
            <div className="flex justify-between"><span className="text-ivory-600">Correlation</span><span className="text-ivory-200">{selected.correlation}</span></div>
            <div className="flex justify-between"><span className="text-ivory-600">Kelly %</span><span className="text-gold-500 font-semibold">{results.kellyPct.toFixed(1)}%</span></div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {/* Main result */}
          <div className="card-base p-4 border border-maroon-800/40">
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider mb-1">Recommended Position</div>
            <div className="text-3xl font-bold text-ivory-100 font-mono">₹{Math.round(activePos).toLocaleString()}</div>
            <div className="text-sm text-ivory-500 mt-1">{activeShares} shares · {activePct.toFixed(1)}% of capital</div>
            <div className="mt-2 h-2 bg-bg-border rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${activePct > 20 ? "bg-signal-bear" : activePct > 10 ? "bg-gold-500" : "bg-signal-bull"}`} style={{ width: `${Math.min(activePct * 4, 100)}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-ivory-700 mt-0.5"><span>0%</span><span>25% max</span></div>
          </div>

          {/* Risk metrics */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Max Risk ₹", value: `₹${results.riskAmount.toLocaleString()}`, icon: AlertTriangle, color: "text-signal-bear" },
              { label: "Risk %", value: `${riskPct}%`, icon: Shield, color: "text-gold-500" },
              { label: "R Multiplier", value: `1:${rrRatio}`, icon: TrendingUp, color: "text-signal-bull" },
              { label: "Expected Value", value: `${((winRate / 100 * rrRatio) - (1 - winRate / 100)).toFixed(2)}R`, icon: DollarSign, color: "text-signal-bull" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card-base p-3 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <div>
                  <div className="text-[9px] text-ivory-600">{label}</div>
                  <div className={`text-sm font-bold font-mono ${color}`}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Method comparison chart */}
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Method Comparison</div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={methodComparison} layout="vertical" margin={{ top: 0, right: 8, left: 60, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
                <YAxis type="category" dataKey="method" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} width={56} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v.toFixed(1)}%`, "Size"]} />
                <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                  {methodComparison.map((d, i) => (
                    <Cell key={i} fill={d.method === (method === "fixed" ? "Fixed %" : method === "kelly" ? "Kelly" : method === "volatility" ? "Volatility" : "Equal Weight") ? "#7c1d1d" : "#2a1a1a"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Heat */}
        <div className="space-y-3">
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Portfolio Heat Map</div>
            <div className="space-y-1.5">
              {PORTFOLIO.map((p) => {
                const heat = (p.allocation / 100) * p.beta * p.volatility;
                const maxHeat = 6;
                return (
                  <div key={p.symbol} className="flex items-center gap-2">
                    <div className="w-24 text-[10px] text-ivory-400 truncate">{p.symbol}</div>
                    <div className="flex-1 h-3.5 bg-bg-primary rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all ${heat > 4 ? "bg-signal-bear/70" : heat > 2 ? "bg-gold-500/70" : "bg-signal-bull/70"}`}
                        style={{ width: `${(heat / maxHeat) * 100}%` }}
                      />
                    </div>
                    <div className="w-10 text-right text-[9px] font-mono text-ivory-500">{p.allocation.toFixed(1)}%</div>
                    <div className="w-10 text-right text-[9px] font-mono text-ivory-600">β{p.beta}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-ivory-700 mt-2 pt-2 border-t border-bg-border">
              <span>Portfolio Beta: <span className="text-ivory-300 font-semibold">{portfolioHeat.toFixed(2)}</span></span>
              <span>Port. Vol: <span className="text-ivory-300 font-semibold">{portfolioVol.toFixed(1)}%</span></span>
            </div>
          </div>

          {/* Capital scenarios */}
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Capital Scenarios ({riskPct}% risk, {stopLossPct}% SL)</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={capitalScenarios} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="capital" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Position Size"]} />
                <Bar dataKey="position" fill="#7c1d1d" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
