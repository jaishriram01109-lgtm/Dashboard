"use client";
import { useState } from "react";
import { Layers, Plus, Trash2, RefreshCw, TrendingUp, Shield, BarChart2 } from "lucide-react";
import { stockData, sectorData } from "@/lib/mockData";
import { cn, fmt, fmtPct, fmtCr, colorFromChange, scoreColor, scoreBg } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

type PortfolioStock = { symbol: string; name: string; sector: string; weight: number; price: number; aiScore: number; changePct: number };

const defaultPortfolio: PortfolioStock[] = [
  { symbol: "HAL", name: "Hindustan Aeronautics", sector: "Defence", weight: 20, price: 4842.35, aiScore: 94, changePct: 3.95 },
  { symbol: "TCS", name: "Tata Consultancy", sector: "IT", weight: 15, price: 4284.60, aiScore: 88, changePct: 2.99 },
  { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma", weight: 12, price: 1842.40, aiScore: 82, changePct: 2.37 },
  { symbol: "RVNL", name: "Rail Vikas Nigam", sector: "Railway", weight: 12, price: 584.20, aiScore: 86, changePct: 4.43 },
  { symbol: "DLF", name: "DLF Limited", sector: "Realty", weight: 10, price: 924.60, aiScore: 78, changePct: 3.17 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", weight: 10, price: 1024.80, aiScore: 80, changePct: 3.26 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", weight: 11, price: 1784.60, aiScore: 64, changePct: -0.69 },
  { symbol: "Cash", name: "Cash & Equivalents", sector: "Cash", weight: 10, price: 1, aiScore: 0, changePct: 0 },
];

const COLORS = ["#DC143C", "#00E676", "#00BCD4", "#7C4DFF", "#FFB300", "#FF5722", "#4DB6AC", "#757575"];

const sectorAllocationData = [
  { sector: "Defence", weight: 20 },
  { sector: "IT", weight: 15 },
  { sector: "Railway", weight: 12 },
  { sector: "Pharma", weight: 12 },
  { sector: "Banking", weight: 11 },
  { sector: "Auto", weight: 10 },
  { sector: "Realty", weight: 10 },
  { sector: "Cash", weight: 10 },
];

export default function AIPortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>(defaultPortfolio);
  const [activeTab, setActiveTab] = useState<"portfolio" | "builder" | "risk">("portfolio");

  const totalWeight = portfolio.reduce((s, p) => s + p.weight, 0);
  const weightedReturn = portfolio.reduce((s, p) => s + (p.changePct * p.weight / 100), 0);
  const avgAIScore = Math.round(portfolio.filter(p => p.symbol !== "Cash").reduce((s, p) => s + p.aiScore, 0) / (portfolio.length - 1));
  const portfolioValue = 1000000; // ₹10L base

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-maroon-600" />
            AI Portfolio Builder
          </h2>
          <p className="text-xs text-ivory-500">Smart money-weighted portfolio construction and optimization</p>
        </div>
        <span className="label-tag bg-signal-accumulate/15 text-signal-accumulate">AI Optimized</span>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Portfolio Value", value: `₹${(portfolioValue / 100000).toFixed(2)}L`, color: "text-ivory-100" },
          { label: "Daily P&L", value: `${fmtPct(weightedReturn)}`, color: weightedReturn >= 0 ? "text-signal-bull" : "text-signal-bear" },
          { label: "AI Portfolio Score", value: avgAIScore, color: scoreColor(avgAIScore) },
          { label: "Total Exposure", value: `${totalWeight}%`, color: totalWeight === 100 ? "text-signal-bull" : "text-yellow-400" },
        ].map(k => (
          <div key={k.label} className="card-glass rounded-xl p-3 text-center">
            <div className={cn("text-xl font-mono font-bold", k.color)}>{k.value}</div>
            <div className="text-xs text-ivory-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-bg-border pb-0.5">
        {[
          { id: "portfolio", label: "Holdings" },
          { id: "builder", label: "AI Builder" },
          { id: "risk", label: "Risk Analysis" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={cn(
              "px-3 py-2 text-xs font-semibold border-b-2 -mb-0.5 transition-colors",
              activeTab === t.id ? "text-maroon-400 border-maroon-700" : "text-ivory-600 border-transparent hover:text-ivory-300"
            )}
          >{t.label}</button>
        ))}
      </div>

      {activeTab === "portfolio" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pie Chart */}
            <div className="card-glass rounded-xl p-4">
              <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-2">Sector Allocation</div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorAllocationData} cx="50%" cy="50%"
                      innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="weight">
                      {sectorAllocationData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(v: number) => [`${v}%`, "Weight"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Holdings table */}
            <div className="md:col-span-2 card-glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-bg-border">
                      {["Symbol", "Weight", "Price", "Day P&L", "AI Score", "Action"].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map(p => (
                      <tr key={p.symbol} className="border-b border-bg-border/50 hover:bg-bg-hover">
                        <td className="px-3 py-2.5">
                          <div className="font-mono font-bold text-xs text-ivory-100">{p.symbol}</div>
                          <div className="text-[10px] text-ivory-600">{p.sector}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-bg-border rounded-full overflow-hidden">
                              <div className="h-full bg-maroon-700 rounded-full" style={{ width: `${p.weight}%` }} />
                            </div>
                            <span className="text-xs font-mono text-ivory-200">{p.weight}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-ivory-200">
                          {p.price > 1 ? `₹${fmt(p.price)}` : "—"}
                        </td>
                        <td className={cn("px-3 py-2.5 font-mono text-xs", colorFromChange(p.changePct))}>
                          {p.symbol !== "Cash" ? fmtPct(p.changePct) : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          {p.symbol !== "Cash" ? (
                            <span className={cn("text-xs font-mono font-bold", scoreColor(p.aiScore))}>{p.aiScore}</span>
                          ) : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => setPortfolio(prev => prev.filter(x => x.symbol !== p.symbol))}
                            className="text-ivory-600 hover:text-signal-bear transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "builder" && (
        <div className="space-y-4">
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">AI Portfolio Recommendations</div>
            <div className="space-y-3">
              {[
                { action: "INCREASE", symbol: "HAL", reason: "Defence sector leadership. Smart money aggressively accumulating. Raise to 25%.", target: 25, current: 20, color: "text-signal-bull" },
                { action: "ADD", symbol: "INFY", reason: "IT sector rotation accelerating. Valuation attractive vs TCS. Consider adding 8%.", target: 8, current: 0, color: "text-signal-bull" },
                { action: "REDUCE", symbol: "HDFCBANK", reason: "Banking underperforming. Capital rotation out of banks into IT/Defence.", target: 6, current: 11, color: "text-yellow-400" },
                { action: "EXIT", symbol: "Cash", reason: "Deploy 5% cash into Defence/IT on next dip. Market regime risk-on.", target: 5, current: 10, color: "text-signal-accumulate" },
              ].map(r => (
                <div key={r.symbol} className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg border border-bg-border">
                  <span className={cn("label-tag flex-shrink-0 mt-0.5", r.color.replace("text-", "bg-") + "/15 " + r.color)}>
                    {r.action}
                  </span>
                  <div className="flex-1">
                    <span className="font-mono font-bold text-xs text-ivory-100 mr-2">{r.symbol}</span>
                    <span className="text-xs text-ivory-400">{r.reason}</span>
                    {r.current !== r.target && (
                      <div className="text-[10px] text-ivory-600 mt-0.5 font-mono">
                        {r.current}% → {r.target}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 rounded-lg bg-maroon-800/40 border border-maroon-800/50 text-xs text-maroon-300 font-semibold hover:bg-maroon-800/60 transition-colors">
              Apply AI Recommendations
            </button>
          </div>
        </div>
      )}

      {activeTab === "risk" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Portfolio Beta", value: "0.92", color: "text-signal-bull", desc: "Below market (1.0)" },
              { label: "Sharpe Ratio", value: "2.14", color: "text-signal-bull", desc: "Excellent risk-adjusted" },
              { label: "Max Drawdown", value: "-12.4%", color: "text-yellow-400", desc: "12M historical" },
              { label: "Value at Risk", value: "-4.2%", color: "text-signal-bear", desc: "95% confidence, 1D" },
            ].map(r => (
              <div key={r.label} className="card-glass rounded-xl p-3 text-center">
                <div className={cn("text-xl font-mono font-bold", r.color)}>{r.value}</div>
                <div className="text-xs text-ivory-300 font-semibold mt-0.5">{r.label}</div>
                <div className="text-[10px] text-ivory-600">{r.desc}</div>
              </div>
            ))}
          </div>
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">Sector Concentration Risk</div>
            <div className="space-y-2">
              {sectorAllocationData.map((s, i) => (
                <div key={s.sector} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-ivory-500 flex-shrink-0">{s.sector}</div>
                  <div className="flex-1 h-2 bg-bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.weight}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <div className="text-xs font-mono text-ivory-300 w-10 text-right">{s.weight}%</div>
                  <div className={cn("text-[10px] w-16", s.weight > 20 ? "text-signal-bear" : s.weight > 15 ? "text-yellow-400" : "text-signal-bull")}>
                    {s.weight > 20 ? "HIGH CONC" : s.weight > 15 ? "MODERATE" : "HEALTHY"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
