"use client";
import { useState, useMemo } from "react";
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

interface Holding {
  symbol: string;
  name: string;
  sector: string;
  currentValue: number;
  currentPct: number;
  targetPct: number;
  price: number;
  shares: number;
  gainLoss: number;
  gainLossPct: number;
  ltcg: boolean;
  beta: number;
}

const HOLDINGS: Holding[] = [
  { symbol: "HAL",       name: "HAL",       sector: "Defence",  currentValue: 214000, currentPct: 21.4, targetPct: 15.0, price: 4280,  shares: 50,  gainLoss:  82000, gainLossPct: 62.1, ltcg: true,  beta: 0.64 },
  { symbol: "DLF",       name: "DLF",       sector: "Realty",   currentValue: 137700, currentPct: 13.8, targetPct: 10.0, price: 918,   shares: 150, gainLoss:  36700, gainLossPct: 36.4, ltcg: false, beta: 1.24 },
  { symbol: "RVNL",      name: "RVNL",      sector: "Railway",  currentValue:  83000, currentPct:  8.3, targetPct: 10.0, price: 415,   shares: 200, gainLoss:  23000, gainLossPct: 38.3, ltcg: false, beta: 1.08 },
  { symbol: "HDFCBANK",  name: "HDFCBANK",  sector: "Banking",  currentValue: 184200, currentPct: 18.4, targetPct: 18.0, price: 1842,  shares: 100, gainLoss:   4200, gainLossPct:  2.3, ltcg: true,  beta: 0.94 },
  { symbol: "TCS",       name: "TCS",       sector: "IT",       currentValue: 193500, currentPct: 19.4, targetPct: 15.0, price: 3870,  shares: 50,  gainLoss: -12500, gainLossPct: -6.1, ltcg: true,  beta: 0.72 },
  { symbol: "SUNPHARMA", name: "SUNPHARMA", sector: "Pharma",   currentValue:  87250, currentPct:  8.7, targetPct: 10.0, price: 1745,  shares: 50,  gainLoss:  11250, gainLossPct: 14.8, ltcg: true,  beta: 0.52 },
  { symbol: "TATAMOTORS",name: "TATAMOTORS",sector: "Auto",     currentValue:  42100, currentPct:  4.2, targetPct:  8.0, price: 842,   shares: 50,  gainLoss: -11900, gainLossPct: -22.0,ltcg: false, beta: 1.28 },
  { symbol: "ITC",       name: "ITC",       sector: "FMCG",     currentValue:  57240, currentPct:  5.7, targetPct:  7.0, price: 428,   shares: 134, gainLoss:   3420, gainLossPct:  6.4, ltcg: true,  beta: 0.48 },
  { symbol: "CASH",      name: "Cash/Liquid",sector: "Cash",   currentValue:   1010, currentPct:  0.1, targetPct:  7.0, price: 1,     shares: 1010,gainLoss:      0, gainLossPct:  0.0, ltcg: false, beta: 0.0  },
];

const COLORS = ["#7c2d32", "#1d4ed8", "#15803d", "#b45309", "#7c3aed", "#0e7490", "#be185d", "#854d0e", "#3d3a32"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px] space-y-0.5">
      <div className="font-bold text-ivory-100">{payload[0].name}</div>
      <div className="text-ivory-400">Current: <span className="font-mono text-ivory-200">{payload[0].payload.currentPct?.toFixed(1)}%</span></div>
    </div>
  );
};

export default function PortfolioRebalancer() {
  const [rebalanceBy, setRebalanceBy] = useState<"drift" | "equal" | "risk_parity">("drift");
  const [driftThreshold, setDriftThreshold] = useState(3);
  const [showTax, setShowTax] = useState(true);

  const totalValue = HOLDINGS.reduce((s, h) => s + h.currentValue, 0);

  const trades = useMemo(() => {
    return HOLDINGS.map(h => {
      const targetValue = totalValue * h.targetPct / 100;
      const diff = targetValue - h.currentValue;
      const diffPct = h.currentPct - h.targetPct;
      const shares = Math.abs(Math.round(diff / h.price));
      const action = diff > 0 ? "BUY" : diff < 0 ? "SELL" : "HOLD";
      const absDrift = Math.abs(diffPct);
      const needsRebalance = absDrift >= driftThreshold;
      const taxImpact = action === "SELL" && h.gainLoss > 0
        ? h.ltcg ? Math.round(h.gainLoss * (shares / h.shares) * 0.10) : Math.round(h.gainLoss * (shares / h.shares) * 0.15)
        : 0;
      return { ...h, targetValue, diff: Math.round(diff), diffPct, shares, action, needsRebalance, taxImpact };
    }).filter(t => t.action !== "HOLD" || Math.abs(t.diffPct) > 0.5);
  }, [driftThreshold, totalValue]);

  const needsRebalance = trades.filter(t => t.needsRebalance).length;
  const totalBuy = trades.filter(t => t.action === "BUY").reduce((s, t) => s + t.diff, 0);
  const totalSell = Math.abs(trades.filter(t => t.action === "SELL").reduce((s, t) => s + t.diff, 0));
  const totalTax = trades.filter(t => t.action === "SELL").reduce((s, t) => s + t.taxImpact, 0);

  const currentPortfolio = HOLDINGS.map((h, i) => ({ name: h.symbol, value: h.currentValue, fill: COLORS[i] }));
  const targetPortfolio = HOLDINGS.map((h, i) => ({ name: h.symbol, value: totalValue * h.targetPct / 100, fill: COLORS[i] }));

  const driftData = HOLDINGS.map(h => ({
    symbol: h.symbol,
    current: h.currentPct,
    target: h.targetPct,
    drift: parseFloat((h.currentPct - h.targetPct).toFixed(1)),
  })).sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));

  const portfolioMetrics = {
    weightedBeta: HOLDINGS.reduce((s, h) => s + h.beta * h.currentPct / 100, 0),
    targetBeta: HOLDINGS.reduce((s, h) => s + h.beta * h.targetPct / 100, 0),
    topHoldingConc: Math.max(...HOLDINGS.map(h => h.currentPct)),
    top3Conc: [...HOLDINGS].sort((a, b) => b.currentPct - a.currentPct).slice(0, 3).reduce((s, h) => s + h.currentPct, 0),
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-maroon-600" />
            Portfolio Rebalancer
          </h2>
          <p className="text-xs text-ivory-500">Target vs current allocation drift, rebalancing trades & tax efficiency</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-ivory-500">Portfolio:</span>
          <span className="text-ivory-100 font-bold">₹{(totalValue / 100000).toFixed(1)}L</span>
          <span className="text-ivory-700">|</span>
          {needsRebalance > 0
            ? <span className="text-signal-bear font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{needsRebalance} positions need rebalancing</span>
            : <span className="text-signal-bull font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" />Portfolio balanced</span>
          }
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total P&L", value: `₹${HOLDINGS.reduce((s, h) => s + h.gainLoss, 0).toLocaleString()}`, color: "text-signal-bull" },
          { label: "Portfolio Beta", value: portfolioMetrics.weightedBeta.toFixed(2), color: portfolioMetrics.weightedBeta > 1 ? "text-signal-bear" : "text-signal-bull" },
          { label: "Top 3 Concentration", value: `${portfolioMetrics.top3Conc.toFixed(1)}%`, color: portfolioMetrics.top3Conc > 55 ? "text-signal-bear" : "text-yellow-400" },
          { label: "Rebalance Tax Cost", value: `₹${totalTax.toLocaleString()}`, color: "text-yellow-400" },
        ].map(k => (
          <div key={k.label} className="card-glass rounded-xl p-3 text-center">
            <div className={cn("text-xl font-display font-bold", k.color)}>{k.value}</div>
            <div className="text-[10px] text-ivory-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card-glass rounded-xl p-4 flex items-center gap-6 flex-wrap">
        <div>
          <div className="text-[10px] font-semibold text-ivory-500 mb-1.5">Drift Threshold</div>
          <div className="flex items-center gap-2">
            <input type="range" min={1} max={10} step={0.5} value={driftThreshold}
              onChange={e => setDriftThreshold(Number(e.target.value))}
              className="w-32 h-1.5 rounded-full appearance-none bg-bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-maroon-600 cursor-pointer" />
            <span className="text-[11px] font-mono text-ivory-200">{driftThreshold}%</span>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <div onClick={() => setShowTax(t => !t)}
            className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer",
              showTax ? "bg-maroon-700 border-maroon-600" : "border-bg-border hover:border-maroon-800"
            )}>
            {showTax && <div className="w-2 h-2 bg-ivory-100 rounded-sm" />}
          </div>
          <span className="text-[11px] text-ivory-400">Show Tax Impact</span>
        </label>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Drift Chart */}
        <div className="card-glass rounded-xl p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Allocation Drift (Current vs Target %)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={driftData} layout="vertical" margin={{ left: 64 }} barSize={7}>
              <XAxis type="number" tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false} tickFormatter={v => v + "%"} />
              <YAxis type="category" dataKey="symbol" tick={{ fontSize: 10, fill: "#c8bfa8" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any, n: string) => [`${v}%`, n]} contentStyle={{ background: "#1a1814", border: "1px solid #3d3a32", fontSize: 10 }} />
              <Bar dataKey="current" name="Current" fill="#7c2d32" radius={[0, 2, 2, 0]} opacity={0.8} />
              <Bar dataKey="target" name="Target" fill="#3d3a32" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie comparison */}
        <div className="card-glass rounded-xl p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Current vs Target Allocation</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Current", data: currentPortfolio },
              { label: "Target", data: targetPortfolio },
            ].map(({ label, data }) => (
              <div key={label}>
                <div className="text-[10px] text-ivory-500 text-center mb-1">{label}</div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={30}>
                      {data.map((d, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rebalancing Trades */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-bg-border flex items-center justify-between">
          <div className="text-xs font-semibold text-ivory-300">Suggested Rebalancing Trades</div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-signal-bull">Buy: ₹{totalBuy.toLocaleString()}</span>
            <span className="text-signal-bear">Sell: ₹{totalSell.toLocaleString()}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-bg-border bg-bg-secondary/50">
                {["Symbol", "Sector", "Current", "Target", "Drift", "Action", "Shares", "Value", "Gain/Loss", showTax ? "Tax (STCG/LTCG)" : null, "Priority"].filter(Boolean).map(h => (
                  <th key={h!} className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => (
                <tr key={t.symbol} className={cn("border-b border-bg-border/50 hover:bg-bg-hover transition-colors",
                  t.needsRebalance && "bg-maroon-950/20",
                  i % 2 === 0 && !t.needsRebalance && "bg-bg-primary/20"
                )}>
                  <td className="px-3 py-2.5 font-mono font-bold text-ivory-100">{t.symbol}</td>
                  <td className="px-3 py-2.5 text-ivory-500 text-[11px]">{t.sector}</td>
                  <td className="px-3 py-2.5 font-mono text-ivory-300">{t.currentPct.toFixed(1)}%</td>
                  <td className="px-3 py-2.5 font-mono text-ivory-400">{t.targetPct.toFixed(1)}%</td>
                  <td className={cn("px-3 py-2.5 font-mono font-bold", Math.abs(t.diffPct) >= driftThreshold ? "text-signal-bear" : "text-ivory-500")}>
                    {t.diffPct > 0 ? "+" : ""}{t.diffPct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("label-tag text-[9px]",
                      t.action === "BUY" ? "bg-signal-bull/15 text-signal-bull" :
                      t.action === "SELL" ? "bg-signal-bear/15 text-signal-bear" :
                      "bg-ivory-800/20 text-ivory-500"
                    )}>{t.action}</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-ivory-300">{t.shares}</td>
                  <td className={cn("px-3 py-2.5 font-mono font-bold", t.action === "BUY" ? "text-signal-bull" : "text-signal-bear")}>
                    {t.action === "BUY" ? "+" : ""}₹{Math.abs(t.diff).toLocaleString()}
                  </td>
                  <td className={cn("px-3 py-2.5 font-mono", t.gainLoss >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                    {t.gainLoss >= 0 ? "+" : ""}₹{Math.abs(t.gainLoss).toLocaleString()} ({t.gainLossPct > 0 ? "+" : ""}{t.gainLossPct.toFixed(1)}%)
                  </td>
                  {showTax && (
                    <td className="px-3 py-2.5">
                      {t.taxImpact > 0 ? (
                        <div>
                          <span className="text-yellow-400 font-mono">₹{t.taxImpact.toLocaleString()}</span>
                          <span className="text-[9px] text-ivory-600 ml-1">{t.ltcg ? "LTCG 10%" : "STCG 15%"}</span>
                        </div>
                      ) : <span className="text-ivory-700">—</span>}
                    </td>
                  )}
                  <td className="px-3 py-2.5">
                    <span className={cn("label-tag text-[9px]",
                      t.needsRebalance ? "bg-signal-bear/15 text-signal-bear" : "bg-ivory-800/20 text-ivory-600"
                    )}>{t.needsRebalance ? "URGENT" : "MONITOR"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post-rebalance Beta */}
      <div className="card-glass rounded-xl p-4">
        <div className="text-xs font-semibold text-ivory-300 mb-3">Portfolio Beta — Current vs Post-Rebalance</div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className={cn("text-2xl font-display font-bold", portfolioMetrics.weightedBeta > 1 ? "text-signal-bear" : "text-signal-bull")}>{portfolioMetrics.weightedBeta.toFixed(2)}</div>
            <div className="text-[10px] text-ivory-500">Current Beta</div>
          </div>
          <div className="text-2xl text-ivory-700">→</div>
          <div className="text-center">
            <div className={cn("text-2xl font-display font-bold", portfolioMetrics.targetBeta > 1 ? "text-signal-bear" : "text-signal-bull")}>{portfolioMetrics.targetBeta.toFixed(2)}</div>
            <div className="text-[10px] text-ivory-500">Target Beta</div>
          </div>
          <div className="flex-1 ml-4">
            <p className="text-[11px] text-ivory-400 leading-relaxed">
              {portfolioMetrics.targetBeta < portfolioMetrics.weightedBeta
                ? `Rebalancing will reduce portfolio beta from ${portfolioMetrics.weightedBeta.toFixed(2)} to ${portfolioMetrics.targetBeta.toFixed(2)} — less volatile vs Nifty. HAL/Defence overweight being trimmed reduces high-beta exposure.`
                : `Post-rebalance beta increases slightly. Adding more TATAMOTORS and cash deployment will balance the portfolio.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
