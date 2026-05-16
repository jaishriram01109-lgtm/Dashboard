"use client";
import { useState } from "react";
import { Layers, Trash2, RefreshCw, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { cn, fmt, fmtPct, colorFromChange, scoreColor, scoreBg } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { usePortfolio } from "@/hooks/useAngelData";
import { calcAIScore, getSector, type HoldingRow } from "@/lib/angelData";

const COLORS = ["#DC143C", "#00E676", "#00BCD4", "#7C4DFF", "#FFB300", "#FF5722", "#4DB6AC", "#9E9E9E", "#E91E63", "#8BC34A"];

export default function AIPortfolio() {
  const { holdings, positions, loading, hasSession, refresh } = usePortfolio();
  const [activeTab, setActiveTab] = useState<"portfolio" | "positions" | "risk">("portfolio");

  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalPnL = holdings.reduce((s, h) => s + h.pnl, 0);
  const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0);
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Sector allocation from real holdings
  const sectorMap: Record<string, number> = {};
  holdings.forEach(h => {
    const sec = getSector(h.symbol);
    sectorMap[sec] = (sectorMap[sec] ?? 0) + h.currentValue;
  });
  const sectorData = Object.entries(sectorMap)
    .map(([sector, value]) => ({ sector, weight: totalValue > 0 ? (value / totalValue) * 100 : 0 }))
    .sort((a, b) => b.weight - a.weight);

  // Risk metrics from real data
  const maxWeight = holdings.length > 0 ? Math.max(...holdings.map(h => h.weight)) : 0;
  const maxPnLPct = holdings.length > 0 ? Math.max(...holdings.map(h => Math.abs(h.pnlPct))) : 0;
  const positiveHoldings = holdings.filter(h => h.pnl >= 0).length;
  const winRate = holdings.length > 0 ? (positiveHoldings / holdings.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-maroon-500" />
        <span className="text-xs text-ivory-600">Loading portfolio from Angel One...</span>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <Layers className="w-8 h-8 text-ivory-600" />
        <p className="text-sm text-ivory-400">Connect Angel One to see your real portfolio</p>
        <p className="text-xs text-ivory-600">Click "CONNECT ANGEL" in the header</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-maroon-600" />
            Portfolio
          </h2>
          <p className="text-xs text-ivory-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-bull live-dot inline-block" />
            Live data from Angel One SmartAPI
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maroon-800/30 border border-maroon-800/50 text-xs text-maroon-300 hover:bg-maroon-800/50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* KPIs */}
      {holdings.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Portfolio Value", value: `₹${totalValue >= 100000 ? (totalValue / 100000).toFixed(2) + "L" : fmt(totalValue)}`, color: "text-ivory-100" },
              { label: "Total P&L", value: `${totalPnL >= 0 ? "+" : ""}₹${fmt(Math.abs(totalPnL))} (${fmtPct(totalPnLPct)})`, color: totalPnL >= 0 ? "text-signal-bull" : "text-signal-bear" },
              { label: "Holdings", value: holdings.length, color: "text-ivory-100" },
              { label: "Win Rate", value: `${winRate.toFixed(0)}%`, color: winRate >= 60 ? "text-signal-bull" : winRate >= 40 ? "text-yellow-400" : "text-signal-bear" },
            ].map(k => (
              <div key={k.label} className="card-glass rounded-xl p-3 text-center">
                <div className={cn("text-lg font-mono font-bold", k.color)}>{k.value}</div>
                <div className="text-xs text-ivory-500">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-bg-border pb-0.5">
            {[
              { id: "portfolio", label: "Holdings" },
              { id: "positions", label: `Positions${positions.length > 0 ? ` (${positions.length})` : ""}` },
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sector Pie */}
              <div className="card-glass rounded-xl p-4">
                <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-2">Sector Allocation</div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sectorData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={2} dataKey="weight">
                        {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
                        formatter={(v: number, _: any, p: any) => [`${v.toFixed(1)}%`, p.payload.sector]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 mt-1">
                  {sectorData.slice(0, 4).map((s, i) => (
                    <div key={s.sector} className="flex items-center gap-2 text-[10px]">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-ivory-500 flex-1">{s.sector}</span>
                      <span className="font-mono text-ivory-300">{s.weight.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Holdings Table */}
              <div className="md:col-span-2 card-glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-bg-border">
                        {["Symbol", "Qty", "Avg Price", "LTP", "P&L", "Weight"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.sort((a, b) => b.currentValue - a.currentValue).map(h => (
                        <tr key={h.symbol} className="border-b border-bg-border/50 hover:bg-bg-hover">
                          <td className="px-3 py-2.5">
                            <div className="font-mono font-bold text-xs text-ivory-100">{h.symbol}</div>
                            <div className="text-[10px] text-ivory-600">{getSector(h.symbol)}</div>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-ivory-300">{h.qty}</td>
                          <td className="px-3 py-2.5 font-mono text-xs text-ivory-400">₹{fmt(h.avgPrice)}</td>
                          <td className="px-3 py-2.5 font-mono text-xs text-ivory-100">₹{fmt(h.ltp)}</td>
                          <td className={cn("px-3 py-2.5 font-mono text-xs", h.pnl >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                            {h.pnl >= 0 ? "+" : ""}₹{fmt(Math.abs(h.pnl))}
                            <div className="text-[9px] opacity-70">{fmtPct(h.pnlPct)}</div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-1.5 bg-bg-border rounded-full overflow-hidden">
                                <div className="h-full bg-maroon-700 rounded-full" style={{ width: `${Math.min(h.weight, 100)}%` }} />
                              </div>
                              <span className="text-xs font-mono text-ivory-400">{h.weight.toFixed(1)}%</span>
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

          {activeTab === "positions" && (
            <div className="card-glass rounded-xl overflow-hidden">
              {positions.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-ivory-600 text-sm">No open positions today</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-bg-border">
                        {["Symbol", "Qty", "Avg Price", "LTP", "P&L", "Type"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map(p => (
                        <tr key={p.symbol} className="border-b border-bg-border/50 hover:bg-bg-hover">
                          <td className="px-3 py-2.5 font-mono font-bold text-xs text-ivory-100">{p.symbol}</td>
                          <td className={cn("px-3 py-2.5 font-mono text-xs", p.qty > 0 ? "text-signal-bull" : "text-signal-bear")}>{p.qty}</td>
                          <td className="px-3 py-2.5 font-mono text-xs text-ivory-400">₹{fmt(p.avgPrice)}</td>
                          <td className="px-3 py-2.5 font-mono text-xs text-ivory-100">₹{fmt(p.ltp)}</td>
                          <td className={cn("px-3 py-2.5 font-mono text-xs", p.pnl >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                            {p.pnl >= 0 ? "+" : ""}₹{fmt(Math.abs(p.pnl))}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="label-tag bg-maroon-800/20 text-maroon-400 text-[10px]">{p.productType}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "risk" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Max Concentration", value: `${maxWeight.toFixed(1)}%`, color: maxWeight > 30 ? "text-signal-bear" : maxWeight > 20 ? "text-yellow-400" : "text-signal-bull", desc: maxWeight > 30 ? "High risk" : "Healthy" },
                  { label: "Win Rate", value: `${winRate.toFixed(0)}%`, color: winRate >= 60 ? "text-signal-bull" : "text-yellow-400", desc: `${positiveHoldings}/${holdings.length} stocks up` },
                  { label: "Total P&L", value: fmtPct(totalPnLPct), color: totalPnLPct >= 0 ? "text-signal-bull" : "text-signal-bear", desc: "Since avg buy" },
                  { label: "Max Single Move", value: `${maxPnLPct.toFixed(1)}%`, color: "text-ivory-300", desc: "Largest holding P&L%" },
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
                  {sectorData.map((s, i) => (
                    <div key={s.sector} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-ivory-500 flex-shrink-0">{s.sector}</div>
                      <div className="flex-1 h-2 bg-bg-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.weight}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <div className="text-xs font-mono text-ivory-300 w-12 text-right">{s.weight.toFixed(1)}%</div>
                      <div className={cn("text-[10px] w-16", s.weight > 30 ? "text-signal-bear" : s.weight > 20 ? "text-yellow-400" : "text-signal-bull")}>
                        {s.weight > 30 ? "HIGH" : s.weight > 20 ? "MODERATE" : "OK"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card-glass rounded-xl p-8 text-center space-y-3">
          <TrendingUp className="w-10 h-10 text-ivory-600 mx-auto" />
          <p className="text-sm text-ivory-400">No holdings found in your Angel One account</p>
          <p className="text-xs text-ivory-600">Holdings will appear here once you have stocks in your Demat account</p>
        </div>
      )}
    </div>
  );
}
