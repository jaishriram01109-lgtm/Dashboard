"use client";
import { useState } from "react";
import { ShieldAlert, TrendingDown, BarChart3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

type RiskTab = "overview" | "correlation" | "drawdown" | "stress";

const RISK_METRICS = [
  { label: "Portfolio Beta", value: "0.84", sub: "vs Nifty 50", status: "normal", hint: "Low beta = defensive tilt, less volatile than market" },
  { label: "Sharpe Ratio", value: "1.42", sub: "12-month rolling", status: "good", hint: "Ratio > 1.0 = good risk-adjusted return" },
  { label: "VaR (95%, 1D)", value: "₹1.24 Cr", sub: "Max daily loss", status: "normal", hint: "95% chance daily loss will not exceed this" },
  { label: "CVaR (95%, 1D)", value: "₹1.86 Cr", sub: "Expected shortfall", status: "warning", hint: "Expected loss in worst 5% scenarios" },
  { label: "Max Drawdown", value: "-14.2%", sub: "52-week peak-to-trough", status: "normal", hint: "Worst decline from a peak in past year" },
  { label: "Sortino Ratio", value: "1.84", sub: "Downside-only risk", status: "good", hint: "Ratio > 1.5 = strong downside risk management" },
  { label: "Tracking Error", value: "4.2%", sub: "vs Nifty 50", status: "normal", hint: "Lower = portfolio behaves more like benchmark" },
  { label: "Information Ratio", value: "0.92", sub: "Active return per risk", status: "good", hint: "Ratio > 0.5 = skilled active management" },
];

const STOCKS = ["HAL", "TCS", "SUNPHARMA", "TATAMOTORS", "DLF", "HDFCBANK", "RVNL", "TATASTEEL"];

const CORRELATIONS: Record<string, Record<string, number>> = {
  HAL:       { HAL: 1.00, TCS: 0.12, SUNPHARMA: 0.08, TATAMOTORS: 0.28, DLF: 0.32, HDFCBANK: 0.18, RVNL: 0.58, TATASTEEL: 0.21 },
  TCS:       { HAL: 0.12, TCS: 1.00, SUNPHARMA: 0.42, TATAMOTORS: 0.24, DLF: 0.16, HDFCBANK: 0.38, RVNL: 0.08, TATASTEEL: 0.28 },
  SUNPHARMA: { HAL: 0.08, TCS: 0.42, SUNPHARMA: 1.00, TATAMOTORS: 0.18, DLF: 0.12, HDFCBANK: 0.31, RVNL: 0.06, TATASTEEL: 0.22 },
  TATAMOTORS:{ HAL: 0.28, TCS: 0.24, SUNPHARMA: 0.18, TATAMOTORS: 1.00, DLF: 0.44, HDFCBANK: 0.52, RVNL: 0.34, TATASTEEL: 0.68 },
  DLF:       { HAL: 0.32, TCS: 0.16, SUNPHARMA: 0.12, TATAMOTORS: 0.44, DLF: 1.00, HDFCBANK: 0.48, RVNL: 0.38, TATASTEEL: 0.34 },
  HDFCBANK:  { HAL: 0.18, TCS: 0.38, SUNPHARMA: 0.31, TATAMOTORS: 0.52, DLF: 0.48, HDFCBANK: 1.00, RVNL: 0.22, TATASTEEL: 0.44 },
  RVNL:      { HAL: 0.58, TCS: 0.08, SUNPHARMA: 0.06, TATAMOTORS: 0.34, DLF: 0.38, HDFCBANK: 0.22, RVNL: 1.00, TATASTEEL: 0.28 },
  TATASTEEL: { HAL: 0.21, TCS: 0.28, SUNPHARMA: 0.22, TATAMOTORS: 0.68, DLF: 0.34, HDFCBANK: 0.44, RVNL: 0.28, TATASTEEL: 1.00 },
};

// 180-day portfolio drawdown simulation
const DRAWDOWN_DATA = (() => {
  let peak = 100;
  let value = 100;
  return Array.from({ length: 180 }, (_, i) => {
    const drift = 0.04 / 252;
    const shock = (Math.random() - 0.48) * 1.2;
    value = value * (1 + drift + shock / 100);
    if (value > peak) peak = value;
    const dd = ((value - peak) / peak) * 100;
    return { day: i + 1, value: parseFloat(value.toFixed(2)), drawdown: parseFloat(dd.toFixed(2)) };
  });
})();

const STRESS_SCENARIOS = [
  {
    name: "Market Crash −20%",
    desc: "Nifty drops 20% — 2008/2020 style correction",
    portfolioImpact: -14.2,
    varImpact: -8.4,
    bestStock: { sym: "SUNPHARMA", ret: -4.2 },
    worstStock: { sym: "TATAMOTORS", ret: -28.4 },
    probability: 8,
    color: "text-signal-bear",
    bg: "bg-signal-bear/10",
  },
  {
    name: "RBI Rate Hike 50bps",
    desc: "Unexpected hawkish pivot — inflation shock",
    portfolioImpact: -6.8,
    varImpact: -4.2,
    bestStock: { sym: "TCS", ret: 0.8 },
    worstStock: { sym: "DLF", ret: -18.4 },
    probability: 12,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    name: "FII Selloff ₹50,000 Cr",
    desc: "Sustained FII outflow over 2 weeks — DXY spike",
    portfolioImpact: -8.4,
    varImpact: -5.8,
    bestStock: { sym: "SUNPHARMA", ret: -3.4 },
    worstStock: { sym: "HDFCBANK", ret: -14.2 },
    probability: 15,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    name: "Global Recession",
    desc: "US GDP contracts 2 quarters, global trade down",
    portfolioImpact: -18.4,
    varImpact: -12.8,
    bestStock: { sym: "HAL", ret: -2.4 },
    worstStock: { sym: "TATASTEEL", ret: -42.8 },
    probability: 6,
    color: "text-signal-bear",
    bg: "bg-signal-bear/10",
  },
  {
    name: "Crude Oil Spike $120/bbl",
    desc: "Middle-East conflict drives crude to $120+",
    portfolioImpact: -4.8,
    varImpact: -2.8,
    bestStock: { sym: "HAL", ret: 2.4 },
    worstStock: { sym: "TATAMOTORS", ret: -12.4 },
    probability: 10,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    name: "Bull Run +25% (Upside)",
    desc: "Rate cuts + FII inflows + earnings beat cycle",
    portfolioImpact: 21.4,
    varImpact: 0,
    bestStock: { sym: "RVNL", ret: 42.8 },
    worstStock: { sym: "TCS", ret: 12.4 },
    probability: 22,
    color: "text-signal-bull",
    bg: "bg-signal-bull/10",
  },
];

const SECTOR_VAR = [
  { sector: "Defence", weight: 28, var: -3.2, beta: 0.64 },
  { sector: "Realty", weight: 18, var: -4.8, beta: 1.24 },
  { sector: "Banking", weight: 16, var: -3.8, beta: 0.94 },
  { sector: "IT", weight: 14, var: -3.2, beta: 0.72 },
  { sector: "Pharma", weight: 10, var: -2.8, beta: 0.52 },
  { sector: "Railway", weight: 8, var: -4.2, beta: 1.08 },
  { sector: "Auto", weight: 4, var: -5.4, beta: 1.28 },
  { sector: "Metals", weight: 2, var: -6.8, beta: 1.42 },
];

function corrColor(val: number): string {
  if (val >= 0.7) return "bg-signal-bear text-white";
  if (val >= 0.5) return "bg-orange-500/80 text-white";
  if (val >= 0.3) return "bg-yellow-500/60 text-black";
  if (val >= 0.1) return "bg-signal-bull/40 text-white";
  return "bg-bg-border text-ivory-600";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px] space-y-0.5">
      <div className="text-ivory-500">Day {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: {p.value.toFixed(2)}{p.name === "Drawdown" ? "%" : ""}</div>
      ))}
    </div>
  );
};

export default function RiskDashboard() {
  const [tab, setTab] = useState<RiskTab>("overview");

  const tabs: { id: RiskTab; label: string }[] = [
    { id: "overview", label: "Risk Overview" },
    { id: "correlation", label: "Correlation Matrix" },
    { id: "drawdown", label: "Drawdown Analysis" },
    { id: "stress", label: "Stress Test" },
  ];

  const statusColor = (s: string) =>
    s === "good" ? "text-signal-bull" : s === "warning" ? "text-signal-bear" : "text-ivory-300";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-maroon-600" />
            Risk Dashboard
          </h2>
          <p className="text-xs text-ivory-500">Portfolio VaR, correlation heatmap, drawdown & stress test scenarios</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-signal-bull animate-pulse" />
          <span className="text-[11px] text-ivory-500 font-mono">Risk Engine Active</span>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-bg-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-3 py-2 text-xs font-semibold transition-colors -mb-px border-b-2",
              tab === t.id ? "text-maroon-300 border-maroon-600" : "text-ivory-600 border-transparent hover:text-ivory-300"
            )}>{t.label}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RISK_METRICS.map(m => (
              <div key={m.label} className="card-glass rounded-xl p-3" title={m.hint}>
                <div className={cn("text-xl font-display font-bold", statusColor(m.status))}>{m.value}</div>
                <div className="text-[10px] text-ivory-400 font-semibold mt-0.5">{m.label}</div>
                <div className="text-[9px] text-ivory-600 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Sector VaR Exposure */}
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-4">Sector VaR Exposure & Beta</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border">
                    {["Sector", "Weight", "VaR (1D, 95%)", "Beta", "Risk Level"].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SECTOR_VAR.map((s, i) => (
                    <tr key={s.sector} className={cn("border-b border-bg-border/50 hover:bg-bg-hover", i % 2 === 0 && "bg-bg-primary/20")}>
                      <td className="px-3 py-2 font-semibold text-ivory-200">{s.sector}</td>
                      <td className="px-3 py-2 font-mono text-ivory-300">{s.weight}%</td>
                      <td className="px-3 py-2 font-mono text-signal-bear font-bold">{s.var}%</td>
                      <td className={cn("px-3 py-2 font-mono font-bold", s.beta >= 1 ? "text-signal-bear" : s.beta >= 0.8 ? "text-yellow-400" : "text-signal-bull")}>{s.beta}</td>
                      <td className="px-3 py-2">
                        <div className="h-2 w-24 bg-bg-border rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", s.beta >= 1.2 ? "bg-signal-bear" : s.beta >= 0.9 ? "bg-yellow-500" : "bg-signal-bull")}
                            style={{ width: `${Math.min(s.beta / 1.5 * 100, 100)}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Correlation Matrix */}
      {tab === "correlation" && (
        <div className="card-glass rounded-xl p-4 overflow-x-auto">
          <div className="text-xs font-semibold text-ivory-300 mb-4">30-Day Return Correlation Matrix</div>
          <table className="text-[10px] font-mono">
            <thead>
              <tr>
                <th className="w-20 pr-2 text-right text-ivory-600" />
                {STOCKS.map(s => (
                  <th key={s} className="w-14 text-center pb-2 text-ivory-400 font-semibold">{s.length > 6 ? s.slice(0, 6) : s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STOCKS.map(row => (
                <tr key={row}>
                  <td className="pr-2 text-right text-ivory-400 font-semibold py-0.5">{row.length > 6 ? row.slice(0, 6) : row}</td>
                  {STOCKS.map(col => {
                    const val = CORRELATIONS[row][col];
                    return (
                      <td key={col} className="p-0.5">
                        <div className={cn("w-13 h-8 rounded flex items-center justify-center text-[10px] font-bold", corrColor(val))}>
                          {val.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 pt-3 border-t border-bg-border flex items-center gap-4 flex-wrap text-[10px]">
            {[
              { label: "≥0.7 High", cls: "bg-signal-bear w-3 h-3 rounded" },
              { label: "0.5–0.7 Med-High", cls: "bg-orange-500/80 w-3 h-3 rounded" },
              { label: "0.3–0.5 Medium", cls: "bg-yellow-500/60 w-3 h-3 rounded" },
              { label: "<0.3 Low", cls: "bg-signal-bull/40 w-3 h-3 rounded" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={l.cls} /><span className="text-ivory-500">{l.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-lg bg-maroon-950/30 text-[11px] text-ivory-400 leading-relaxed">
            <strong className="text-ivory-200">Key Insight:</strong> TATAMOTORS–TATASTEEL correlation at 0.68 is high — concentration risk if both held together. HAL–RVNL at 0.58 (both govt-defence/railway theme). Consider reducing one to lower correlated drawdown risk.
          </div>
        </div>
      )}

      {/* Drawdown */}
      {tab === "drawdown" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-signal-bear">-14.2%</div>
              <div className="text-[10px] text-ivory-500">Max Drawdown (180D)</div>
            </div>
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-yellow-400">28 days</div>
              <div className="text-[10px] text-ivory-500">Max Drawdown Duration</div>
            </div>
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-signal-bull">14 days</div>
              <div className="text-[10px] text-ivory-500">Avg Recovery Time</div>
            </div>
          </div>

          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-4">Portfolio Value & Drawdown — 180 Days</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={DRAWDOWN_DATA}>
                <defs>
                  <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c2d32" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c2d32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false}
                  tickFormatter={v => v % 30 === 0 ? `D${v}` : ""} />
                <YAxis tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={100} stroke="#3d3a32" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="value" stroke="#7c2d32" strokeWidth={2} fill="url(#portGrad)" dot={false} name="Portfolio" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-4">Drawdown % from Peak</div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={DRAWDOWN_DATA}>
                <defs>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false}
                  tickFormatter={v => v % 30 === 0 ? `D${v}` : ""} />
                <YAxis tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#3d3a32" />
                <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={1.5} fill="url(#ddGrad)" dot={false} name="Drawdown" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Stress Test */}
      {tab === "stress" && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-maroon-950/30 text-[11px] text-ivory-400">
            Monte Carlo stress scenarios based on historical volatility, correlation structure, and macro factor sensitivities. Probabilities reflect 12-month forward estimates.
          </div>
          {STRESS_SCENARIOS.map(s => (
            <div key={s.name} className={cn("card-glass rounded-xl p-4 border-l-4", s.portfolioImpact >= 0 ? "border-signal-bull" : "border-signal-bear")}>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-ivory-100">{s.name}</span>
                    <span className="label-tag bg-maroon-800/20 text-maroon-400 text-[9px]">{s.probability}% probability</span>
                  </div>
                  <div className="text-[11px] text-ivory-500 mb-3">{s.desc}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <div className="text-ivory-600 mb-0.5">Portfolio Impact</div>
                      <div className={cn("font-mono font-bold text-sm", s.portfolioImpact >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {s.portfolioImpact >= 0 ? "+" : ""}{s.portfolioImpact}%
                      </div>
                    </div>
                    {s.varImpact !== 0 && (
                      <div>
                        <div className="text-ivory-600 mb-0.5">VaR Breach</div>
                        <div className="font-mono font-bold text-signal-bear">{s.varImpact}%</div>
                      </div>
                    )}
                    <div>
                      <div className="text-ivory-600 mb-0.5">{s.portfolioImpact >= 0 ? "Top Gainer" : "Best Performer"}</div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-ivory-100">{s.bestStock.sym}</span>
                        <span className={cn("text-[10px] font-mono", s.bestStock.ret >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                          {s.bestStock.ret >= 0 ? "+" : ""}{s.bestStock.ret}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-ivory-600 mb-0.5">{s.portfolioImpact >= 0 ? "Laggard" : "Worst Hit"}</div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-ivory-100">{s.worstStock.sym}</span>
                        <span className={cn("text-[10px] font-mono", s.worstStock.ret >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                          {s.worstStock.ret >= 0 ? "+" : ""}{s.worstStock.ret}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className={cn("text-2xl font-display font-bold", s.color)}>
                    {s.portfolioImpact >= 0 ? "+" : ""}{s.portfolioImpact}%
                  </div>
                  <div className="text-[9px] text-ivory-600 mt-0.5">Portfolio</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
