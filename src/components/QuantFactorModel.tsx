"use client";
import { useState } from "react";
import { Activity, TrendingUp, Shield, Zap, BarChart2 } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type SignalType = "STRONG BUY" | "BUY" | "HOLD" | "SELL";
type FactorKey = "value" | "growth" | "quality" | "momentum" | "lowvol";

interface FactorScores {
  value: number;
  growth: number;
  quality: number;
  momentum: number;
  lowvol: number;
}

interface StockRow {
  symbol: string;
  factorScores: FactorScores;
  compositeScore: number;
  rank: number;
  signal: SignalType;
}

interface FactorCard {
  key: FactorKey;
  label: string;
  description: string;
  topStock: string;
  ytdReturn: number;
  icon: React.ReactNode;
}

interface MonthlyPerf {
  month: string;
  value: number;
  growth: number;
  quality: number;
  momentum: number;
  lowvol: number;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const STOCK_ROWS: StockRow[] = [
  { symbol: "ICICIBANK",    factorScores: { value: 88, growth: 82, quality: 91, momentum: 74, lowvol: 68 }, compositeScore: 82, rank: 1,  signal: "STRONG BUY" },
  { symbol: "HDFCBANK",     factorScores: { value: 84, growth: 76, quality: 93, momentum: 70, lowvol: 72 }, compositeScore: 80, rank: 2,  signal: "STRONG BUY" },
  { symbol: "BAJFINANCE",   factorScores: { value: 72, growth: 91, quality: 86, momentum: 82, lowvol: 48 }, compositeScore: 78, rank: 3,  signal: "STRONG BUY" },
  { symbol: "RELIANCE",     factorScores: { value: 82, growth: 78, quality: 80, momentum: 68, lowvol: 64 }, compositeScore: 75, rank: 4,  signal: "BUY" },
  { symbol: "HINDUNILVR",   factorScores: { value: 58, growth: 62, quality: 94, momentum: 54, lowvol: 91 }, compositeScore: 72, rank: 5,  signal: "BUY" },
  { symbol: "NESTLEIND",    factorScores: { value: 52, growth: 58, quality: 96, momentum: 58, lowvol: 94 }, compositeScore: 70, rank: 6,  signal: "BUY" },
  { symbol: "TITAN",        factorScores: { value: 56, growth: 84, quality: 88, momentum: 76, lowvol: 55 }, compositeScore: 70, rank: 7,  signal: "BUY" },
  { symbol: "KOTAKBANK",    factorScores: { value: 78, growth: 68, quality: 88, momentum: 62, lowvol: 76 }, compositeScore: 68, rank: 8,  signal: "BUY" },
  { symbol: "ASIANPAINT",   factorScores: { value: 54, growth: 72, quality: 90, momentum: 64, lowvol: 82 }, compositeScore: 68, rank: 9,  signal: "BUY" },
  { symbol: "TCS",          factorScores: { value: 76, growth: 54, quality: 87, momentum: 42, lowvol: 78 }, compositeScore: 64, rank: 10, signal: "HOLD" },
  { symbol: "AXISBANK",     factorScores: { value: 80, growth: 74, quality: 72, momentum: 58, lowvol: 58 }, compositeScore: 62, rank: 11, signal: "HOLD" },
  { symbol: "INFY",         factorScores: { value: 70, growth: 52, quality: 84, momentum: 46, lowvol: 76 }, compositeScore: 60, rank: 12, signal: "HOLD" },
  { symbol: "MARUTI",       factorScores: { value: 66, growth: 68, quality: 74, momentum: 52, lowvol: 62 }, compositeScore: 58, rank: 13, signal: "HOLD" },
  { symbol: "ITC",          factorScores: { value: 84, growth: 46, quality: 78, momentum: 38, lowvol: 82 }, compositeScore: 56, rank: 14, signal: "HOLD" },
  { symbol: "WIPRO",        factorScores: { value: 62, growth: 38, quality: 72, momentum: 32, lowvol: 74 }, compositeScore: 44, rank: 15, signal: "SELL" },
];

const FACTOR_PERFORMANCE: MonthlyPerf[] = [
  { month: "Jun", value: 2.1,  growth: 3.4,  quality: 1.8,  momentum: 4.2,  lowvol: 0.9 },
  { month: "Jul", value: -0.8, growth: 1.2,  quality: 0.6,  momentum: 3.8,  lowvol: 1.4 },
  { month: "Aug", value: 1.4,  growth: 2.8,  quality: 1.2,  momentum: -1.4, lowvol: 2.1 },
  { month: "Sep", value: 3.2,  growth: -0.4, quality: 2.4,  momentum: 2.6,  lowvol: 1.6 },
  { month: "Oct", value: -1.2, growth: 2.1,  quality: 0.8,  momentum: 5.4,  lowvol: -0.4 },
  { month: "Nov", value: 2.8,  growth: 3.6,  quality: 1.4,  momentum: 6.2,  lowvol: 0.8 },
  { month: "Dec", value: 1.6,  growth: -1.2, quality: 2.2,  momentum: -2.4, lowvol: 3.2 },
  { month: "Jan", value: 3.4,  growth: 4.2,  quality: 1.6,  momentum: 7.8,  lowvol: 1.2 },
  { month: "Feb", value: -0.4, growth: 1.8,  quality: 1.0,  momentum: 3.2,  lowvol: 2.4 },
  { month: "Mar", value: 2.2,  growth: 2.4,  quality: 2.8,  momentum: -1.8, lowvol: 1.8 },
  { month: "Apr", value: 1.8,  growth: 3.2,  quality: 1.4,  momentum: 4.6,  lowvol: 0.6 },
  { month: "May", value: 2.6,  growth: 1.4,  quality: 2.0,  momentum: 3.4,  lowvol: 1.4 },
];

// Cumulative performance
const CUMULATIVE_PERF: MonthlyPerf[] = FACTOR_PERFORMANCE.reduce<MonthlyPerf[]>((acc, row, i) => {
  if (i === 0) return [{ ...row }];
  const prev = acc[i - 1];
  return [
    ...acc,
    {
      month: row.month,
      value:    parseFloat((prev.value    + row.value   ).toFixed(2)),
      growth:   parseFloat((prev.growth   + row.growth  ).toFixed(2)),
      quality:  parseFloat((prev.quality  + row.quality ).toFixed(2)),
      momentum: parseFloat((prev.momentum + row.momentum).toFixed(2)),
      lowvol:   parseFloat((prev.lowvol   + row.lowvol  ).toFixed(2)),
    },
  ];
}, []);

const FACTOR_CORRELATION: number[][] = [
  [1.00,  0.42,  0.38, -0.18,  0.24],
  [0.42,  1.00,  0.54,  0.36, -0.12],
  [0.38,  0.54,  1.00,  0.22,  0.46],
  [-0.18, 0.36,  0.22,  1.00, -0.64],
  [0.24, -0.12,  0.46, -0.64,  1.00],
];

const FACTOR_LABELS: FactorKey[] = ["value", "growth", "quality", "momentum", "lowvol"];
const FACTOR_DISPLAY: Record<FactorKey, string> = {
  value: "Value", growth: "Growth", quality: "Quality", momentum: "Momentum", lowvol: "Low Vol",
};

const FACTOR_CARDS: FactorCard[] = [
  {
    key: "value",    label: "Value",    description: "PE / PB / DCF screen", topStock: "ITC",       ytdReturn: 18.4,
    icon: <BarChart2 size={16} className="text-gold-400" />,
  },
  {
    key: "growth",   label: "Growth",   description: "Rev / EPS / Sales CAGR", topStock: "BAJFINANCE", ytdReturn: 24.8,
    icon: <TrendingUp size={16} className="text-signal-bull" />,
  },
  {
    key: "quality",  label: "Quality",  description: "ROE / ROCE / D/E ratio", topStock: "NESTLEIND",  ytdReturn: 14.2,
    icon: <Shield size={16} className="text-signal-accumulate" />,
  },
  {
    key: "momentum", label: "Momentum", description: "1M / 3M / 6M / 12M return", topStock: "BAJFINANCE", ytdReturn: 32.6,
    icon: <Zap size={16} className="text-signal-neutral" />,
  },
  {
    key: "lowvol",   label: "Low Vol",  description: "Beta / StdDev / Max DD", topStock: "NESTLEIND",  ytdReturn: 11.8,
    icon: <Activity size={16} className="text-maroon-400" />,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "bg-signal-bull/20 text-signal-bull border border-signal-bull/30";
  if (score >= 50) return "bg-gold-500/20 text-gold-400 border border-gold-500/30";
  return "bg-signal-bear/20 text-signal-bear border border-signal-bear/30";
}

function signalStyle(s: SignalType): string {
  if (s === "STRONG BUY") return "bg-signal-bull text-bg-primary font-bold";
  if (s === "BUY") return "bg-signal-bull/20 text-signal-bull border border-signal-bull/30";
  if (s === "HOLD") return "bg-gold-500/20 text-gold-400 border border-gold-500/30";
  return "bg-signal-bear/20 text-signal-bear border border-signal-bear/30";
}

function correlationColor(v: number): string {
  if (v >= 0.4)  return "bg-signal-bull/30 text-signal-bull";
  if (v >= 0.1)  return "bg-signal-bull/15 text-signal-bull";
  if (v >= -0.1) return "bg-bg-hover text-ivory-400";
  if (v >= -0.4) return "bg-signal-bear/15 text-signal-bear";
  return "bg-signal-bear/30 text-signal-bear";
}

const FACTOR_LINE_COLORS: Record<FactorKey, string> = {
  value: "#DAA520", growth: "#00E676", quality: "#00BCD4", momentum: "#FF5722", lowvol: "#B8A870",
};

// Top 5 stocks for each factor
function top5(factor: FactorKey): Array<{ symbol: string; score: number }> {
  return [...STOCK_ROWS]
    .sort((a, b) => b.factorScores[factor] - a.factorScores[factor])
    .slice(0, 5)
    .map((s) => ({ symbol: s.symbol, score: s.factorScores[factor] }));
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps): JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-bg-card border border-bg-border rounded px-3 py-2 text-xs">
      <p className="text-ivory-300 font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}%</p>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuantFactorModel(): JSX.Element {
  const [selectedFactor, setSelectedFactor] = useState<FactorKey | null>(null);

  return (
    <div className="bg-bg-primary min-h-screen font-sans">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-bg-border px-6 py-4 flex items-center gap-3">
        <Activity className="text-maroon-800" size={22} />
        <h1 className="text-ivory-100 text-xl font-display font-bold tracking-wide">Quant Factor Model</h1>
        <span className="ml-2 text-xs text-ivory-500 bg-bg-card border border-bg-border px-2 py-0.5 rounded">
          15 Stocks · 5 Factors
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Factor cards top row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-3">
          {FACTOR_CARDS.map((fc) => (
            <button
              key={fc.key}
              onClick={() => setSelectedFactor(selectedFactor === fc.key ? null : fc.key)}
              className={
                selectedFactor === fc.key
                  ? "bg-bg-hover border-2 border-maroon-800 rounded-lg p-3 text-left transition-all"
                  : "bg-bg-card border border-bg-border rounded-lg p-3 text-left hover:bg-bg-hover transition-all"
              }
            >
              <div className="flex items-center gap-2 mb-1">
                {fc.icon}
                <span className="text-ivory-200 text-sm font-semibold">{fc.label}</span>
              </div>
              <p className="text-ivory-500 text-xs mb-2">{fc.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-ivory-400 text-xs">Top: {fc.topStock}</span>
                <span className="text-signal-bull text-xs font-mono font-bold">+{fc.ytdReturn}%</span>
              </div>
            </button>
          ))}
        </div>

        {/* ── Main: Heatmap + Charts ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-5">
          {/* Heatmap */}
          <div className="bg-bg-card border border-bg-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-bg-border">
              <p className="text-xs text-ivory-500 uppercase tracking-widest">Factor Score Heatmap</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border">
                    <th className="text-left px-3 py-2 text-ivory-500 font-normal">Stock</th>
                    {FACTOR_LABELS.map((fk) => (
                      <th
                        key={fk}
                        className={
                          selectedFactor === fk
                            ? "px-2 py-2 text-ivory-100 font-semibold text-center"
                            : "px-2 py-2 text-ivory-500 font-normal text-center"
                        }
                      >
                        {FACTOR_DISPLAY[fk]}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-ivory-500 font-normal text-center">Score</th>
                    <th className="px-2 py-2 text-ivory-500 font-normal text-center">Rank</th>
                    <th className="px-2 py-2 text-ivory-500 font-normal text-center">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {STOCK_ROWS.map((row) => (
                    <tr key={row.symbol} className="border-b border-bg-border/50 hover:bg-bg-hover/50">
                      <td className="px-3 py-1.5 text-ivory-200 font-mono font-semibold">{row.symbol}</td>
                      {FACTOR_LABELS.map((fk) => {
                        const score = row.factorScores[fk];
                        const isHighlighted = selectedFactor === fk;
                        return (
                          <td key={fk} className="px-2 py-1.5 text-center">
                            <span
                              className={
                                isHighlighted
                                  ? scoreColor(score) + " px-1.5 py-0.5 rounded text-xs font-mono font-bold ring-1 ring-maroon-800"
                                  : scoreColor(score) + " px-1.5 py-0.5 rounded text-xs font-mono"
                              }
                            >
                              {score}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-2 py-1.5 text-center">
                        <span className="text-ivory-100 font-mono font-bold">{row.compositeScore}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center text-ivory-500">#{row.rank}</td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={signalStyle(row.signal) + " px-1.5 py-0.5 rounded text-xs"}>
                          {row.signal}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts column */}
          <div className="space-y-4">
            {/* Factor Performance Chart */}
            <div className="bg-bg-card border border-bg-border rounded-lg p-4">
              <p className="text-xs text-ivory-500 uppercase tracking-widest mb-3">12-Month Cumulative Factor Performance (%)</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={CUMULATIVE_PERF} margin={{ top: 5, right: 15, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                  <XAxis dataKey="month" tick={{ fill: "#9C8C58", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9C8C58", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, color: "#B8A870" }} />
                  {FACTOR_LABELS.map((fk) => (
                    <Line
                      key={fk}
                      type="monotone"
                      dataKey={fk}
                      name={FACTOR_DISPLAY[fk]}
                      stroke={FACTOR_LINE_COLORS[fk]}
                      strokeWidth={selectedFactor === fk ? 3 : 1.5}
                      strokeOpacity={selectedFactor === null || selectedFactor === fk ? 1 : 0.3}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Factor Correlation */}
            <div className="bg-bg-card border border-bg-border rounded-lg p-4">
              <p className="text-xs text-ivory-500 uppercase tracking-widest mb-3">Factor Correlation Matrix</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="py-1 text-left text-ivory-600 font-normal w-20"></th>
                      {FACTOR_LABELS.map((fk) => (
                        <th key={fk} className="py-1 px-1 text-center text-ivory-500 font-normal">
                          {FACTOR_DISPLAY[fk].slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FACTOR_LABELS.map((rowFk, ri) => (
                      <tr key={rowFk}>
                        <td className="py-1 text-ivory-500 font-normal">{FACTOR_DISPLAY[rowFk].slice(0, 3)}</td>
                        {FACTOR_LABELS.map((colFk, ci) => {
                          const val = FACTOR_CORRELATION[ri][ci];
                          return (
                            <td key={colFk} className="py-1 px-1 text-center">
                              <span className={correlationColor(val) + " px-1.5 py-0.5 rounded font-mono"}>
                                {val.toFixed(2)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom: Top 5 per factor ─────────────────────────────────────────── */}
        <div className="bg-bg-card border border-bg-border rounded-lg p-4">
          <p className="text-xs text-ivory-500 uppercase tracking-widest mb-4">Top 5 Stocks Per Factor</p>
          <div className="grid grid-cols-5 gap-4">
            {FACTOR_LABELS.map((fk) => {
              const top = top5(fk);
              const color = FACTOR_LINE_COLORS[fk];
              return (
                <div key={fk}>
                  <p className="text-xs font-semibold mb-2" style={{ color }}>
                    {FACTOR_DISPLAY[fk]}
                  </p>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart
                      data={top}
                      layout="vertical"
                      margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
                    >
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9C8C58", fontSize: 9 }} />
                      <YAxis type="category" dataKey="symbol" tick={{ fill: "#B8A870", fontSize: 9 }} width={65} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          return (
                            <div className="bg-bg-card border border-bg-border rounded px-2 py-1 text-xs text-ivory-300">
                              {String(payload[0].value)}
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="score" radius={[0, 3, 3, 0]}>
                        {top.map((_, idx) => (
                          <Cell key={idx} fill={color} fillOpacity={1 - idx * 0.15} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
