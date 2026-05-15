"use client";
import { useState } from "react";
import { BookOpen, Plus, TrendingUp, TrendingDown, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

type TradeStatus = "open" | "closed";
type TradeDirection = "LONG" | "SHORT";
type SetupType = "Breakout" | "Reversal" | "Trend Follow" | "SMC" | "Gap Fill" | "Earnings Play";

interface JournalTrade {
  id: number;
  date: string;
  symbol: string;
  direction: TradeDirection;
  setup: SetupType;
  entry: number;
  exit?: number;
  sl: number;
  target: number;
  qty: number;
  pnl?: number;
  pnlPct?: number;
  rrActual?: number;
  status: TradeStatus;
  emotion: "Confident" | "FOMO" | "Revenge" | "Plan" | "Impulse";
  grade: "A" | "B" | "C" | "D";
  notes: string;
  mfe?: number;
  mae?: number;
}

const TRADES: JournalTrade[] = [
  { id: 1, date: "15-May-26", symbol: "HAL", direction: "LONG", setup: "Breakout", entry: 4210, exit: 4380, sl: 4080, target: 4480, qty: 50, pnl: 8500, pnlPct: 4.01, rrActual: 1.3, status: "closed", emotion: "Confident", grade: "A", notes: "Perfect breakout entry. Held to T1 but missed T2. Volume confirmation strong. Will hold longer next time.", mfe: 4428, mae: 4190 },
  { id: 2, date: "14-May-26", symbol: "TATAMOTORS", direction: "LONG", setup: "Trend Follow", entry: 828, exit: 848, sl: 812, target: 870, qty: 200, pnl: 4000, pnlPct: 2.42, rrActual: 1.25, status: "closed", emotion: "Plan", grade: "B", notes: "Good entry on pullback to EMA20. Exited at T1 instead of T2. Follow the plan better next time.", mfe: 854, mae: 822 },
  { id: 3, date: "13-May-26", symbol: "INFY", direction: "SHORT", setup: "Reversal", entry: 1598, exit: 1568, sl: 1618, target: 1548, qty: 100, pnl: 3000, pnlPct: 1.88, rrActual: 1.5, status: "closed", emotion: "Confident", grade: "A", notes: "Rising wedge breakdown. Entered after confirmation. Covered at T1. Clean trade following plan.", mfe: 1558, mae: 1604 },
  { id: 4, date: "12-May-26", symbol: "NIFTY CE", direction: "LONG", setup: "SMC", entry: 162, exit: 98, sl: 120, target: 240, qty: 75, pnl: -4800, pnlPct: -39.5, rrActual: -1.54, status: "closed", emotion: "FOMO", grade: "D", notes: "Chased the trade. Entered late after momentum started. No clear setup — pure FOMO. Lesson: never enter after 3% move without pullback.", mfe: 180, mae: 95 },
  { id: 5, date: "11-May-26", symbol: "DLF", direction: "LONG", setup: "Breakout", entry: 895, exit: 924, sl: 872, target: 960, qty: 150, pnl: 4350, pnlPct: 3.24, rrActual: 1.26, status: "closed", emotion: "Plan", grade: "A", notes: "6-month resistance breakout. Entered on first close above ₹895. Volume 2.8x average. Held to T1.", mfe: 932, mae: 890 },
  { id: 6, date: "10-May-26", symbol: "TATASTEEL", direction: "SHORT", setup: "Reversal", entry: 172, exit: 164, sl: 178, target: 158, qty: 400, pnl: 3200, pnlPct: 4.65, rrActual: 1.33, status: "closed", emotion: "Confident", grade: "B", notes: "H&S top confirmation. Good entry on right shoulder. Partial exit at T1, remaining stopped at 168.", mfe: 160, mae: 174 },
  { id: 7, date: "09-May-26", symbol: "HDFCBANK", direction: "LONG", setup: "Gap Fill", entry: 1812, exit: 1818, sl: 1795, target: 1848, qty: 80, pnl: 480, pnlPct: 0.33, rrActual: 0.18, status: "closed", emotion: "Impulse", grade: "C", notes: "Gap fill setup but poor risk-reward. Should have waited for better RR. Exited too early at resistance.", mfe: 1832, mae: 1808 },
  { id: 8, date: "08-May-26", symbol: "BEL", direction: "LONG", setup: "Breakout", entry: 308, sl: 295, target: 340, qty: 300, status: "open", emotion: "Confident", grade: "A", notes: "Ascending triangle breakout. Still in trade. 5% SL. Target ₹340 (+10.4%). Looking good." },
  { id: 9, date: "07-May-26", symbol: "RVNL", direction: "LONG", setup: "Trend Follow", entry: 402, exit: 420, sl: 388, target: 440, qty: 200, pnl: 3600, pnlPct: 4.48, rrActual: 1.29, status: "closed", emotion: "Plan", grade: "B", notes: "Bull flag continuation. Exited at T1. Left money on the table as stock went to 434.", mfe: 434, mae: 398 },
  { id: 10, date: "06-May-26", symbol: "NIFTY PE", direction: "LONG", setup: "Reversal", entry: 120, exit: 68, sl: 90, target: 200, qty: 50, pnl: -2600, pnlPct: -43.3, rrActual: -1.73, status: "closed", emotion: "Revenge", grade: "D", notes: "Revenge trade after previous loss. No setup. Bought puts after big green candle. Pure revenge — learn from this.", mfe: 145, mae: 62 },
];

const MONTHLY_PNL = [
  { month: "Jan", pnl: 28400 }, { month: "Feb", pnl: 18200 }, { month: "Mar", pnl: -8400 },
  { month: "Apr", pnl: 42800 }, { month: "May", pnl: 15730 },
];

const SETUP_PNL = [
  { setup: "Breakout", pnl: 16250, trades: 3, winRate: 100 },
  { setup: "Trend Follow", pnl: 7600, trades: 2, winRate: 100 },
  { setup: "SMC", pnl: 3000, trades: 1, winRate: 100 },
  { setup: "Reversal", pnl: 3600, trades: 2, winRate: 100 },
  { setup: "Gap Fill", pnl: 480, trades: 1, winRate: 100 },
  { setup: "FOMO/Revenge", pnl: -7400, trades: 2, winRate: 0 },
];

const GRADE_CONFIG: Record<"A" | "B" | "C" | "D", { bg: string; text: string }> = {
  A: { bg: "bg-signal-bull/20", text: "text-signal-bull" },
  B: { bg: "bg-blue-500/20", text: "text-blue-400" },
  C: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  D: { bg: "bg-signal-bear/20", text: "text-signal-bear" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px]">
      <div className="text-ivory-500">{label}</div>
      <div className={cn("font-mono font-bold", payload[0].value >= 0 ? "text-signal-bull" : "text-signal-bear")}>
        ₹{Math.abs(payload[0].value).toLocaleString()}
      </div>
    </div>
  );
};

export default function TradeJournal() {
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [selected, setSelected] = useState<number | null>(null);

  const closedTrades = TRADES.filter(t => t.status === "closed" && t.pnl !== undefined);
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const winners = closedTrades.filter(t => (t.pnl ?? 0) > 0);
  const losers = closedTrades.filter(t => (t.pnl ?? 0) < 0);
  const winRate = closedTrades.length ? (winners.length / closedTrades.length * 100) : 0;
  const avgWin = winners.length ? winners.reduce((s, t) => s + (t.pnl ?? 0), 0) / winners.length : 0;
  const avgLoss = losers.length ? losers.reduce((s, t) => s + (t.pnl ?? 0), 0) / losers.length : 0;
  const profitFactor = losers.length ? Math.abs(winners.reduce((s, t) => s + (t.pnl ?? 0), 0) / losers.reduce((s, t) => s + (t.pnl ?? 0), 0)) : 0;
  const openTrades = TRADES.filter(t => t.status === "open");

  // Streak
  const closedSorted = [...closedTrades].sort((a, b) => b.id - a.id);
  let streak = 0;
  const streakDir = closedSorted[0]?.pnl && closedSorted[0].pnl > 0;
  for (const t of closedSorted) {
    if ((t.pnl ?? 0) > 0 === streakDir) streak++;
    else break;
  }

  const displayTrades = TRADES.filter(t => filter === "all" || t.status === filter).sort((a, b) => b.id - a.id);
  const selectedTrade = selected !== null ? TRADES.find(t => t.id === selected) : null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-maroon-600" />
            Trade Journal
          </h2>
          <p className="text-xs text-ivory-500">P&L tracking, performance analytics & trade review</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maroon-700 hover:bg-maroon-600 text-ivory-100 text-xs font-semibold transition-colors">
          <Plus className="w-3.5 h-3.5" />Add Trade
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: "Total P&L", value: `₹${totalPnl.toLocaleString()}`, color: totalPnl >= 0 ? "text-signal-bull" : "text-signal-bear" },
          { label: "Win Rate", value: `${winRate.toFixed(1)}%`, color: winRate >= 55 ? "text-signal-bull" : "text-yellow-400" },
          { label: "Profit Factor", value: profitFactor.toFixed(2), color: profitFactor >= 1.5 ? "text-signal-bull" : "text-yellow-400" },
          { label: "Avg Win", value: `₹${Math.round(avgWin).toLocaleString()}`, color: "text-signal-bull" },
          { label: "Avg Loss", value: `₹${Math.abs(Math.round(avgLoss)).toLocaleString()}`, color: "text-signal-bear" },
          { label: "Current Streak", value: `${streak} ${streakDir ? "W" : "L"}`, color: streakDir ? "text-signal-bull" : "text-signal-bear" },
          { label: "Open Trades", value: openTrades.length, color: "text-gold-500" },
        ].map(k => (
          <div key={k.label} className="card-glass rounded-xl p-2.5 text-center">
            <div className={cn("text-sm font-display font-bold", k.color)}>{k.value}</div>
            <div className="text-[9px] text-ivory-600 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Charts */}
        <div className="xl:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="card-glass rounded-xl p-4">
              <div className="text-xs font-semibold text-ivory-300 mb-3">Monthly P&L</div>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={MONTHLY_PNL} barSize={18}>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ReferenceLine y={0} stroke="#3d3a32" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
                    {MONTHLY_PNL.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? "#22c55e" : "#ef4444"} opacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card-glass rounded-xl p-4">
              <div className="text-xs font-semibold text-ivory-300 mb-3">P&L by Setup</div>
              <div className="space-y-1.5">
                {SETUP_PNL.map(s => (
                  <div key={s.setup} className="flex items-center gap-2">
                    <span className="text-[10px] text-ivory-500 w-20 flex-shrink-0 truncate">{s.setup}</span>
                    <div className="flex-1 h-2 bg-bg-border rounded-full overflow-hidden">
                      {s.pnl >= 0
                        ? <div className="h-full bg-signal-bull/70 rounded-full" style={{ width: `${Math.min(s.pnl / 200, 100)}%` }} />
                        : <div className="h-full bg-signal-bear/70 rounded-full flex justify-end ml-auto" style={{ width: `${Math.min(Math.abs(s.pnl) / 100, 100)}%` }} />
                      }
                    </div>
                    <span className={cn("text-[10px] font-mono font-bold w-14 text-right", s.pnl >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                      {s.pnl >= 0 ? "+" : ""}₹{Math.abs(s.pnl / 1000).toFixed(1)}K
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trade Log */}
          <div className="card-glass rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-bg-border flex items-center justify-between">
              <div className="text-xs font-semibold text-ivory-300">Trade Log</div>
              <div className="flex gap-1">
                {(["all", "open", "closed"] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cn("px-2.5 py-1 rounded text-[11px] font-semibold transition-colors capitalize",
                      filter === f ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
                    )}>{f}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border bg-bg-secondary/50">
                    {["Date", "Symbol", "Dir", "Setup", "Entry", "Exit", "P&L", "RR", "Emotion", "Grade"].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 font-semibold uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayTrades.map((t, i) => (
                    <tr key={t.id}
                      onClick={() => setSelected(selected === t.id ? null : t.id)}
                      className={cn("border-b border-bg-border/50 cursor-pointer transition-colors hover:bg-bg-hover",
                        selected === t.id && "bg-maroon-950/30",
                        i % 2 === 0 && selected !== t.id && "bg-bg-primary/20"
                      )}>
                      <td className="px-3 py-2 font-mono text-ivory-400">{t.date}</td>
                      <td className="px-3 py-2 font-mono font-bold text-ivory-100">{t.symbol}</td>
                      <td className="px-3 py-2">
                        <span className={cn("label-tag text-[9px]", t.direction === "LONG" ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear")}>{t.direction}</span>
                      </td>
                      <td className="px-3 py-2 text-ivory-400 text-[11px]">{t.setup}</td>
                      <td className="px-3 py-2 font-mono text-ivory-300">{t.entry}</td>
                      <td className="px-3 py-2 font-mono text-ivory-300">{t.exit ?? "—"}</td>
                      <td className={cn("px-3 py-2 font-mono font-bold", t.pnl === undefined ? "text-gold-500" : t.pnl >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {t.pnl === undefined ? "OPEN" : `${t.pnl >= 0 ? "+" : ""}₹${Math.abs(t.pnl).toLocaleString()}`}
                      </td>
                      <td className={cn("px-3 py-2 font-mono", (t.rrActual ?? 0) >= 1 ? "text-signal-bull" : "text-signal-bear")}>
                        {t.rrActual !== undefined ? (t.rrActual >= 0 ? "+" : "") + t.rrActual + "R" : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn("label-tag text-[9px]",
                          t.emotion === "Confident" || t.emotion === "Plan" ? "bg-signal-bull/15 text-signal-bull" :
                          t.emotion === "FOMO" || t.emotion === "Revenge" ? "bg-signal-bear/15 text-signal-bear" :
                          "bg-yellow-500/15 text-yellow-400"
                        )}>{t.emotion}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn("label-tag text-[9px] font-bold", GRADE_CONFIG[t.grade].bg, GRADE_CONFIG[t.grade].text)}>{t.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Trade Detail */}
          {selectedTrade ? (
            <div className="card-glass rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-ivory-100">{selectedTrade.symbol}</span>
                    <span className={cn("label-tag text-[9px]", selectedTrade.direction === "LONG" ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear")}>{selectedTrade.direction}</span>
                    <span className={cn("label-tag text-[9px] font-bold", GRADE_CONFIG[selectedTrade.grade].bg, GRADE_CONFIG[selectedTrade.grade].text)}>Grade {selectedTrade.grade}</span>
                  </div>
                  <div className="text-[10px] text-ivory-500 mt-0.5">{selectedTrade.date} · {selectedTrade.setup}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-ivory-600 hover:text-ivory-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ["Entry", `₹${selectedTrade.entry}`], ["Exit", selectedTrade.exit ? `₹${selectedTrade.exit}` : "Open"],
                  ["Stop Loss", `₹${selectedTrade.sl}`], ["Target", `₹${selectedTrade.target}`],
                  ["Qty", selectedTrade.qty], ["P&L", selectedTrade.pnl !== undefined ? `₹${selectedTrade.pnl.toLocaleString()}` : "Open"],
                  ...(selectedTrade.mfe ? [["MFE", `₹${selectedTrade.mfe}`]] : []),
                  ...(selectedTrade.mae ? [["MAE", `₹${selectedTrade.mae}`]] : []),
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-bg-primary/40 rounded-lg p-2">
                    <div className="text-[9px] text-ivory-600">{label}</div>
                    <div className="font-mono font-bold text-ivory-100">{val}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[10px] text-ivory-600 mb-1">Notes</div>
                <p className="text-[11px] text-ivory-300 leading-relaxed bg-bg-primary/30 rounded-lg p-2.5">{selectedTrade.notes}</p>
              </div>
              <div>
                <div className="text-[10px] text-ivory-600 mb-1">Emotional State</div>
                <span className={cn("label-tag text-[10px]",
                  selectedTrade.emotion === "Confident" || selectedTrade.emotion === "Plan" ? "bg-signal-bull/15 text-signal-bull" :
                  selectedTrade.emotion === "FOMO" || selectedTrade.emotion === "Revenge" ? "bg-signal-bear/15 text-signal-bear" :
                  "bg-yellow-500/15 text-yellow-400"
                )}>{selectedTrade.emotion}</span>
              </div>
            </div>
          ) : (
            <div className="card-glass rounded-xl p-4 text-center text-ivory-600 text-xs">Click a trade to see details</div>
          )}

          {/* Emotion Stats */}
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">P&L by Emotion</div>
            <div className="space-y-2">
              {[
                { emotion: "Plan / Confident", trades: closedTrades.filter(t => t.emotion === "Plan" || t.emotion === "Confident"), color: "text-signal-bull" },
                { emotion: "Impulse", trades: closedTrades.filter(t => t.emotion === "Impulse"), color: "text-yellow-400" },
                { emotion: "FOMO / Revenge", trades: closedTrades.filter(t => t.emotion === "FOMO" || t.emotion === "Revenge"), color: "text-signal-bear" },
              ].map(g => {
                const pnl = g.trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
                const wr = g.trades.length ? g.trades.filter(t => (t.pnl ?? 0) > 0).length / g.trades.length * 100 : 0;
                return (
                  <div key={g.emotion} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-[10px] text-ivory-400">{g.emotion}</div>
                      <div className="text-[9px] text-ivory-600">{g.trades.length} trades · {wr.toFixed(0)}% WR</div>
                    </div>
                    <span className={cn("text-[11px] font-mono font-bold", g.color)}>
                      {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-bg-border">
              <p className="text-[10px] text-ivory-500 leading-relaxed">
                {closedTrades.filter(t => t.emotion === "FOMO" || t.emotion === "Revenge").reduce((s, t) => s + (t.pnl ?? 0), 0) < 0
                  ? "⚠ FOMO/Revenge trades are costing you money. Stick to planned setups — remove emotion from execution."
                  : "Good emotional discipline. Keep following your plan."}
              </p>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Trade Grade Distribution</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {(["A", "B", "C", "D"] as const).map(grade => {
                const count = TRADES.filter(t => t.grade === grade).length;
                const cfg = GRADE_CONFIG[grade];
                return (
                  <div key={grade} className="bg-bg-primary/40 rounded-lg p-2">
                    <div className={cn("text-lg font-display font-bold", cfg.text)}>{grade}</div>
                    <div className="text-xs font-mono text-ivory-200">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
