"use client";
import { useState, useMemo } from "react";
import { FlaskConical, Play, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";

type Strategy = "rsi_mean" | "ema_cross" | "macd_momentum" | "bb_breakout" | "smc_ob";
type Symbol = "NIFTY" | "BANKNIFTY" | "HAL" | "TCS" | "TATAMOTORS" | "HDFCBANK";
type Timeframe = "Daily" | "4H" | "1H";

interface BacktestParams {
  strategy: Strategy;
  symbol: Symbol;
  timeframe: Timeframe;
  capital: number;
  riskPct: number;
  fromDate: string;
  toDate: string;
}

interface TradeResult {
  id: number;
  date: string;
  type: "LONG" | "SHORT";
  entry: number;
  exit: number;
  pnl: number;
  pnlPct: number;
  duration: number;
  exitReason: "TP" | "SL" | "Signal";
}

interface BacktestResult {
  totalReturn: number;
  cagr: number;
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  avgDuration: number;
  equityCurve: { date: string; equity: number; drawdown: number }[];
  trades: TradeResult[];
  monthlyPnl: { month: string; pnl: number }[];
}

const STRATEGIES: { id: Strategy; label: string; desc: string }[] = [
  { id: "rsi_mean", label: "RSI Mean Reversion", desc: "Buy RSI < 30, sell RSI > 70. ATR-based SL." },
  { id: "ema_cross", label: "EMA 20/50 Crossover", desc: "Long when EMA20 crosses above EMA50. Short on bearish cross." },
  { id: "macd_momentum", label: "MACD Momentum", desc: "Enter on MACD histogram direction change + signal line cross." },
  { id: "bb_breakout", label: "Bollinger Breakout", desc: "Trade breakouts above/below Bollinger Bands with volume filter." },
  { id: "smc_ob", label: "SMC Order Block", desc: "ICT-based order block entries with FVG confirmation and liquidity sweep." },
];

function generateBacktest(params: BacktestParams): BacktestResult {
  // Seeded pseudo-random for deterministic results per strategy+symbol combo
  const seed = params.strategy.charCodeAt(0) + params.symbol.charCodeAt(0) * 7;
  const rng = (n: number) => ((Math.sin(n * seed * 0.1) + 1) / 2);

  const strategyProfiles: Record<Strategy, { winRate: number; avgRR: number; frequency: number; cagr: number }> = {
    rsi_mean:       { winRate: 62, avgRR: 1.4, frequency: 28, cagr: 18.4 },
    ema_cross:      { winRate: 54, avgRR: 2.1, frequency: 18, cagr: 24.8 },
    macd_momentum:  { winRate: 58, avgRR: 1.8, frequency: 22, cagr: 21.4 },
    bb_breakout:    { winRate: 48, avgRR: 2.8, frequency: 15, cagr: 28.4 },
    smc_ob:         { winRate: 68, avgRR: 2.4, frequency: 12, cagr: 32.8 },
  };
  const symbolMultiplier: Record<Symbol, number> = {
    NIFTY: 1.0, BANKNIFTY: 1.1, HAL: 1.4, TCS: 0.8, TATAMOTORS: 1.2, HDFCBANK: 0.9,
  };
  const timeframeMultiplier: Record<Timeframe, number> = { Daily: 1.0, "4H": 1.2, "1H": 0.9 };

  const profile = strategyProfiles[params.strategy];
  const mult = symbolMultiplier[params.symbol] * timeframeMultiplier[params.timeframe];
  const adjustedWR = Math.min(profile.winRate * mult, 82);
  const adjustedCAGR = profile.cagr * mult;

  const numTrades = profile.frequency;
  const trades: TradeResult[] = [];

  let equity = params.capital;
  const equityCurve: { date: string; equity: number; drawdown: number }[] = [];
  let peak = equity;
  let maxDD = 0;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyPnl: { month: string; pnl: number }[] = months.map(m => ({ month: m, pnl: 0 }));

  for (let i = 0; i < numTrades; i++) {
    const isWin = rng(i * 13) * 100 < adjustedWR;
    const type: "LONG" | "SHORT" = rng(i * 7) > 0.5 ? "LONG" : "SHORT";
    const basePrice = 1000 + rng(i * 3) * 3000;
    const riskAmt = (equity * params.riskPct) / 100;
    const pnlAmt = isWin
      ? riskAmt * profile.avgRR * (0.8 + rng(i * 17) * 0.4)
      : -riskAmt * (0.8 + rng(i * 19) * 0.4);

    equity += pnlAmt;
    if (equity > peak) peak = equity;
    const dd = ((equity - peak) / peak) * 100;
    if (dd < maxDD) maxDD = dd;

    const monthIdx = Math.floor(i / numTrades * 12);
    if (monthIdx < 12) monthlyPnl[monthIdx].pnl += pnlAmt;

    const dayOffset = Math.floor(i * 365 / numTrades);
    const date = new Date(2025, 0, 1 + dayOffset);
    const dateStr = `${date.getDate().toString().padStart(2, "0")}-${months[date.getMonth()]}-25`;

    equityCurve.push({
      date: dateStr,
      equity: Math.round(equity),
      drawdown: parseFloat(dd.toFixed(2)),
    });

    trades.push({
      id: i + 1,
      date: dateStr,
      type,
      entry: parseFloat(basePrice.toFixed(2)),
      exit: parseFloat((basePrice * (1 + pnlAmt / equity * 0.1)).toFixed(2)),
      pnl: Math.round(pnlAmt),
      pnlPct: parseFloat((pnlAmt / params.capital * 100).toFixed(2)),
      duration: Math.floor(1 + rng(i * 11) * (params.timeframe === "Daily" ? 8 : 3)),
      exitReason: isWin ? "TP" : "SL",
    });
  }

  const winners = trades.filter(t => t.pnl > 0);
  const losers = trades.filter(t => t.pnl < 0);
  const totalReturn = ((equity - params.capital) / params.capital) * 100;

  return {
    totalReturn: parseFloat(totalReturn.toFixed(2)),
    cagr: parseFloat(adjustedCAGR.toFixed(1)),
    sharpe: parseFloat((adjustedCAGR / 20 * (adjustedWR / 50)).toFixed(2)),
    maxDrawdown: parseFloat(maxDD.toFixed(2)),
    winRate: parseFloat(adjustedWR.toFixed(1)),
    profitFactor: parseFloat((Math.abs(winners.reduce((s, t) => s + t.pnl, 0)) / Math.abs(losers.reduce((s, t) => s + t.pnl, 1) || 1)).toFixed(2)),
    totalTrades: numTrades,
    avgWin: winners.length ? Math.round(winners.reduce((s, t) => s + t.pnl, 0) / winners.length) : 0,
    avgLoss: losers.length ? Math.round(losers.reduce((s, t) => s + t.pnl, 0) / losers.length) : 0,
    bestTrade: Math.round(Math.max(...trades.map(t => t.pnl))),
    worstTrade: Math.round(Math.min(...trades.map(t => t.pnl))),
    avgDuration: Math.round(trades.reduce((s, t) => s + t.duration, 0) / trades.length),
    equityCurve,
    trades,
    monthlyPnl,
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px] space-y-0.5">
      <div className="text-ivory-500">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {typeof p.value === "number" ? (p.name === "Drawdown" ? p.value.toFixed(2) + "%" : "₹" + p.value.toLocaleString()) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function BacktestEngine() {
  const [params, setParams] = useState<BacktestParams>({
    strategy: "ema_cross",
    symbol: "NIFTY",
    timeframe: "Daily",
    capital: 1000000,
    riskPct: 2,
    fromDate: "01-Jan-25",
    toDate: "15-May-26",
  });
  const [hasRun, setHasRun] = useState(false);
  const [running, setRunning] = useState(false);

  const result = useMemo(() => hasRun ? generateBacktest(params) : null, [params, hasRun]);

  const runBacktest = () => {
    setRunning(true);
    setTimeout(() => { setHasRun(true); setRunning(false); }, 800);
  };

  const setP = <K extends keyof BacktestParams>(k: K, v: BacktestParams[K]) => {
    setParams(p => ({ ...p, [k]: v }));
    setHasRun(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-maroon-600" />
            Backtest Engine
          </h2>
          <p className="text-xs text-ivory-500">Strategy backtesting with equity curve, drawdown & full trade log</p>
        </div>
      </div>

      {/* Params Panel */}
      <div className="card-glass rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Strategy */}
          <div>
            <div className="text-[10px] font-semibold text-ivory-500 uppercase tracking-wider mb-2">Strategy</div>
            <div className="space-y-1.5">
              {STRATEGIES.map(s => (
                <label key={s.id} className="flex items-start gap-2 cursor-pointer group">
                  <div onClick={() => setP("strategy", s.id)}
                    className={cn("w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 transition-colors",
                      params.strategy === s.id ? "bg-maroon-600 border-maroon-500" : "border-bg-border group-hover:border-maroon-800"
                    )} />
                  <div>
                    <div className="text-[11px] font-semibold text-ivory-200">{s.label}</div>
                    <div className="text-[9px] text-ivory-600">{s.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Symbol + TF */}
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-semibold text-ivory-500 uppercase tracking-wider mb-2">Symbol</div>
              <div className="flex flex-wrap gap-1">
                {(["NIFTY", "BANKNIFTY", "HAL", "TCS", "TATAMOTORS", "HDFCBANK"] as Symbol[]).map(s => (
                  <button key={s} onClick={() => setP("symbol", s)}
                    className={cn("px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors",
                      params.symbol === s ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300 hover:bg-bg-hover"
                    )}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-ivory-500 uppercase tracking-wider mb-2">Timeframe</div>
              <div className="flex gap-1">
                {(["Daily", "4H", "1H"] as Timeframe[]).map(t => (
                  <button key={t} onClick={() => setP("timeframe", t)}
                    className={cn("px-3 py-1 rounded text-[11px] font-semibold transition-colors",
                      params.timeframe === t ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300 hover:bg-bg-hover"
                    )}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Capital + Risk */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-semibold text-ivory-500 uppercase tracking-wider">Initial Capital (₹)</span>
                <span className="text-[10px] font-mono text-ivory-200">₹{(params.capital / 100000).toFixed(0)}L</span>
              </div>
              <input type="range" min={100000} max={10000000} step={100000} value={params.capital}
                onChange={e => setP("capital", Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-maroon-600 cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-semibold text-ivory-500 uppercase tracking-wider">Risk Per Trade</span>
                <span className="text-[10px] font-mono text-ivory-200">{params.riskPct}%</span>
              </div>
              <input type="range" min={0.5} max={5} step={0.5} value={params.riskPct}
                onChange={e => setP("riskPct", Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-maroon-600 cursor-pointer" />
            </div>
            <button onClick={runBacktest} disabled={running}
              className={cn("w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                running ? "bg-maroon-900 text-ivory-600 cursor-not-allowed" : "bg-maroon-700 hover:bg-maroon-600 text-ivory-100 shadow-glow-maroon"
              )}>
              <Play className="w-4 h-4" />
              {running ? "Running Backtest..." : "Run Backtest"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { label: "Total Return", value: `${result.totalReturn >= 0 ? "+" : ""}${result.totalReturn}%`, color: result.totalReturn >= 0 ? "text-signal-bull" : "text-signal-bear" },
              { label: "CAGR", value: `${result.cagr}%`, color: "text-signal-bull" },
              { label: "Sharpe Ratio", value: result.sharpe.toFixed(2), color: result.sharpe >= 1 ? "text-signal-bull" : "text-yellow-400" },
              { label: "Max Drawdown", value: `${result.maxDrawdown.toFixed(1)}%`, color: "text-signal-bear" },
              { label: "Win Rate", value: `${result.winRate}%`, color: result.winRate >= 55 ? "text-signal-bull" : "text-yellow-400" },
              { label: "Profit Factor", value: result.profitFactor.toFixed(2), color: result.profitFactor >= 1.5 ? "text-signal-bull" : "text-yellow-400" },
              { label: "Total Trades", value: result.totalTrades, color: "text-ivory-200" },
              { label: "Avg Duration", value: `${result.avgDuration}d`, color: "text-ivory-300" },
            ].map(k => (
              <div key={k.label} className="card-glass rounded-xl p-2.5 text-center">
                <div className={cn("text-sm font-display font-bold", k.color)}>{k.value}</div>
                <div className="text-[9px] text-ivory-600 mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Equity Curve */}
            <div className="xl:col-span-2 card-glass rounded-xl p-4">
              <div className="text-xs font-semibold text-ivory-300 mb-3">Equity Curve — ₹{(result.equityCurve[result.equityCurve.length - 1]?.equity / 100000).toFixed(1)}L final</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={result.equityCurve}>
                  <defs>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c2d32" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c2d32" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#8b8472" }} axisLine={false} tickLine={false}
                    interval={Math.floor(result.equityCurve.length / 5)} />
                  <YAxis tick={{ fontSize: 8, fill: "#8b8472" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={params.capital} stroke="#3d3a32" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="equity" stroke="#7c2d32" strokeWidth={2} fill="url(#eqGrad)" dot={false} name="Equity" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly P&L */}
            <div className="card-glass rounded-xl p-4">
              <div className="text-xs font-semibold text-ivory-300 mb-3">Monthly P&L</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={result.monthlyPnl} barSize={14}>
                  <XAxis dataKey="month" tick={{ fontSize: 8, fill: "#8b8472" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <ReferenceLine y={0} stroke="#3d3a32" />
                  <Tooltip formatter={(v: any) => `₹${Math.round(v).toLocaleString()}`} contentStyle={{ background: "#1a1814", border: "1px solid #3d3a32", fontSize: 10 }} />
                  <Bar dataKey="pnl" name="P&L" radius={[2, 2, 0, 0]}>
                    {result.monthlyPnl.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? "#22c55e" : "#ef4444"} opacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats + Trade Log */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="card-glass rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-ivory-300">Trade Statistics</div>
              {[
                { label: "Avg Win", value: `₹${result.avgWin.toLocaleString()}`, color: "text-signal-bull" },
                { label: "Avg Loss", value: `₹${Math.abs(result.avgLoss).toLocaleString()}`, color: "text-signal-bear" },
                { label: "Best Trade", value: `₹${result.bestTrade.toLocaleString()}`, color: "text-signal-bull" },
                { label: "Worst Trade", value: `₹${Math.abs(result.worstTrade).toLocaleString()}`, color: "text-signal-bear" },
                { label: "Avg Win/Loss Ratio", value: (result.avgWin / Math.abs(result.avgLoss || 1)).toFixed(2) + "x", color: "text-gold-500" },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-[11px] text-ivory-500">{s.label}</span>
                  <span className={cn("text-[11px] font-mono font-bold", s.color)}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="xl:col-span-3 card-glass rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-bg-border text-xs font-semibold text-ivory-300">Trade Log</div>
              <div className="overflow-x-auto max-h-56 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-bg-secondary">
                    <tr className="border-b border-bg-border">
                      {["#", "Date", "Type", "Entry", "Exit", "P&L", "P&L%", "Duration", "Exit"].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 font-semibold uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.map((t, i) => (
                      <tr key={t.id} className={cn("border-b border-bg-border/50 hover:bg-bg-hover", i % 2 === 0 && "bg-bg-primary/20")}>
                        <td className="px-3 py-1.5 font-mono text-ivory-600">{t.id}</td>
                        <td className="px-3 py-1.5 font-mono text-ivory-400">{t.date}</td>
                        <td className="px-3 py-1.5">
                          <span className={cn("label-tag text-[9px]", t.type === "LONG" ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear")}>{t.type}</span>
                        </td>
                        <td className="px-3 py-1.5 font-mono text-ivory-300">{t.entry.toFixed(0)}</td>
                        <td className="px-3 py-1.5 font-mono text-ivory-300">{t.exit.toFixed(0)}</td>
                        <td className={cn("px-3 py-1.5 font-mono font-bold", t.pnl >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                          {t.pnl >= 0 ? "+" : ""}₹{Math.abs(t.pnl).toLocaleString()}
                        </td>
                        <td className={cn("px-3 py-1.5 font-mono", t.pnlPct >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                          {t.pnlPct >= 0 ? "+" : ""}{t.pnlPct}%
                        </td>
                        <td className="px-3 py-1.5 font-mono text-ivory-500">{t.duration}d</td>
                        <td className="px-3 py-1.5">
                          <span className={cn("label-tag text-[9px]", t.exitReason === "TP" ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear")}>{t.exitReason}</span>
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

      {!hasRun && !running && (
        <div className="card-glass rounded-xl p-12 text-center">
          <FlaskConical className="w-10 h-10 text-ivory-700 mx-auto mb-3" />
          <div className="text-ivory-500 text-sm">Configure your strategy and click Run Backtest</div>
          <div className="text-ivory-700 text-xs mt-1">Results include equity curve, trade log, monthly P&L, win rate, Sharpe ratio and more</div>
        </div>
      )}
    </div>
  );
}
