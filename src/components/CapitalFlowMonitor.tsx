"use client";

import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  ComposedChart, BarChart, AreaChart,
  Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DailyFlow { date: string; fii: number; dii: number; retail: number; net: number }
interface CumulativeFlow { date: string; fiiCum: number; diiCum: number; netCum: number }
interface SectorFlow { sector: string; fiiNet: number; diiNet: number; netFlow: number; flowScore: number; direction: "INFLOW" | "OUTFLOW" | "NEUTRAL" }
interface StockFlow { symbol: string; fiiNet: number; diiNet: number; total: number; flowStrength: number }
interface MonthlyFlow { month: string; fii: number; dii: number }

// ─── Mock Data ────────────────────────────────────────────────────────────────
const todayFlows = {
  fii: { cashEquity: -245.3, indexFutures: 312.4, stockFutures: -89.2, indexOptions: 445.6, debt: 123.8, total: 547.3 },
  dii: { mf: 678.4, insurance: 234.5, banks: -45.2, total: 867.7 },
  retail: { net: -412.1 },
  date: "15-May-25",
};

const dailyFlows: DailyFlow[] = [
  { date: "16-Apr", fii: -512, dii: 623, retail: -111, net: 111 },
  { date: "17-Apr", fii: 234, dii: 445, retail: -679, net: 679 },
  { date: "22-Apr", fii: -789, dii: 312, retail: 477, net: -477 },
  { date: "23-Apr", fii: 1023, dii: 567, retail: -1590, net: 1590 },
  { date: "24-Apr", fii: 345, dii: 890, retail: -1235, net: 1235 },
  { date: "25-Apr", fii: -234, dii: 456, retail: -222, net: 222 },
  { date: "28-Apr", fii: 678, dii: 234, retail: -912, net: 912 },
  { date: "29-Apr", fii: -456, dii: 789, retail: -333, net: 333 },
  { date: "30-Apr", fii: 1234, dii: 345, retail: -1579, net: 1579 },
  { date: "02-May", fii: 567, dii: 678, retail: -1245, net: 1245 },
  { date: "05-May", fii: -890, dii: 234, retail: 656, net: -656 },
  { date: "06-May", fii: 1456, dii: 567, retail: -2023, net: 2023 },
  { date: "07-May", fii: 234, dii: 890, retail: -1124, net: 1124 },
  { date: "08-May", fii: -678, dii: 456, retail: 222, net: -222 },
  { date: "09-May", fii: 789, dii: 345, retail: -1134, net: 1134 },
  { date: "12-May", fii: 1023, dii: 678, retail: -1701, net: 1701 },
  { date: "13-May", fii: -345, dii: 890, retail: -545, net: 545 },
  { date: "14-May", fii: 456, dii: 567, retail: -1023, net: 1023 },
  { date: "15-May", fii: 547, dii: 868, retail: -1415, net: 1415 },
];

const cumulativeFlows: CumulativeFlow[] = dailyFlows.reduce((acc, d, i) => {
  const prev = acc[i - 1] ?? { fiiCum: 0, diiCum: 0, netCum: 0 };
  acc.push({
    date: d.date,
    fiiCum: Math.round(prev.fiiCum + d.fii),
    diiCum: Math.round(prev.diiCum + d.dii),
    netCum: Math.round(prev.netCum + d.net),
  });
  return acc;
}, [] as CumulativeFlow[]);

const sectorFlows: SectorFlow[] = [
  { sector: "Financials", fiiNet: 1234, diiNet: 567, netFlow: 1801, flowScore: 82, direction: "INFLOW" },
  { sector: "IT", fiiNet: 890, diiNet: 234, netFlow: 1124, flowScore: 74, direction: "INFLOW" },
  { sector: "Energy", fiiNet: -456, diiNet: 678, netFlow: 222, flowScore: 51, direction: "INFLOW" },
  { sector: "FMCG", fiiNet: 345, diiNet: 456, netFlow: 801, flowScore: 68, direction: "INFLOW" },
  { sector: "Auto", fiiNet: 234, diiNet: -123, netFlow: 111, flowScore: 52, direction: "INFLOW" },
  { sector: "Pharma", fiiNet: -789, diiNet: 890, netFlow: 101, flowScore: 48, direction: "NEUTRAL" },
  { sector: "Metals", fiiNet: -567, diiNet: -234, netFlow: -801, flowScore: 28, direction: "OUTFLOW" },
  { sector: "Realty", fiiNet: 123, diiNet: 234, netFlow: 357, flowScore: 61, direction: "INFLOW" },
  { sector: "Infra", fiiNet: -234, diiNet: 345, netFlow: 111, flowScore: 49, direction: "NEUTRAL" },
  { sector: "PSU Banks", fiiNet: 456, diiNet: 678, netFlow: 1134, flowScore: 77, direction: "INFLOW" },
  { sector: "Chemicals", fiiNet: -678, diiNet: -456, netFlow: -1134, flowScore: 22, direction: "OUTFLOW" },
  { sector: "Telecom", fiiNet: 345, diiNet: 123, netFlow: 468, flowScore: 63, direction: "INFLOW" },
];

const topBuyStocks: StockFlow[] = [
  { symbol: "RELIANCE", fiiNet: 567, diiNet: 234, total: 801, flowStrength: 88 },
  { symbol: "HDFCBANK", fiiNet: 456, diiNet: 345, total: 801, flowStrength: 85 },
  { symbol: "TCS", fiiNet: 389, diiNet: 212, total: 601, flowStrength: 79 },
  { symbol: "ICICIBANK", fiiNet: 234, diiNet: 312, total: 546, flowStrength: 74 },
  { symbol: "INFOSYS", fiiNet: 312, diiNet: 189, total: 501, flowStrength: 72 },
  { symbol: "BAJFINANCE", fiiNet: 189, diiNet: 278, total: 467, flowStrength: 69 },
  { symbol: "KOTAKBANK", fiiNet: 267, diiNet: 156, total: 423, flowStrength: 65 },
  { symbol: "HINDUNILVR", fiiNet: 145, diiNet: 234, total: 379, flowStrength: 61 },
];

const topSellStocks: StockFlow[] = [
  { symbol: "TATASTEEL", fiiNet: -345, diiNet: -234, total: -579, flowStrength: 82 },
  { symbol: "HINDALCO", fiiNet: -289, diiNet: -167, total: -456, flowStrength: 76 },
  { symbol: "JSWSTEEL", fiiNet: -234, diiNet: -189, total: -423, flowStrength: 71 },
  { symbol: "COALINDIA", fiiNet: -178, diiNet: -212, total: -390, flowStrength: 67 },
  { symbol: "ONGC", fiiNet: -156, diiNet: -167, total: -323, flowStrength: 63 },
  { symbol: "ULTRACEMCO", fiiNet: -145, diiNet: -134, total: -279, flowStrength: 58 },
  { symbol: "GRASIM", fiiNet: -123, diiNet: -112, total: -235, flowStrength: 54 },
  { symbol: "NTPC", fiiNet: -98, diiNet: -89, total: -187, flowStrength: 49 },
];

const monthlyFlows: MonthlyFlow[] = [
  { month: "Jun-24", fii: -2345, dii: 3456 },
  { month: "Jul-24", fii: 4567, dii: 2345 },
  { month: "Aug-24", fii: 1234, dii: 3678 },
  { month: "Sep-24", fii: -3456, dii: 4567 },
  { month: "Oct-24", fii: -8765, dii: 6789 },
  { month: "Nov-24", fii: -5432, dii: 5432 },
  { month: "Dec-24", fii: 2345, dii: 3456 },
  { month: "Jan-25", fii: -9876, dii: 7890 },
  { month: "Feb-25", fii: 3456, dii: 4567 },
  { month: "Mar-25", fii: -1234, dii: 5678 },
  { month: "Apr-25", fii: 6789, dii: 3456 },
  { month: "May-25", fii: 2345, dii: 4321 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCr(v: number) {
  const abs = Math.abs(v);
  const str = abs >= 1000 ? `₹${(abs / 1000).toFixed(1)}K Cr` : `₹${abs.toFixed(0)} Cr`;
  return v < 0 ? `-${str}` : `+${str}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CapitalFlowMonitor() {
  const fiiTotal = todayFlows.fii.total;
  const diiTotal = todayFlows.dii.total;
  const combinedNet = fiiTotal + diiTotal;
  const fiiMtd = cumulativeFlows[cumulativeFlows.length - 1]?.fiiCum ?? 0;

  const fiiSubCats = [
    { label: "Cash Equity", value: todayFlows.fii.cashEquity },
    { label: "Index Futures", value: todayFlows.fii.indexFutures },
    { label: "Stock Futures", value: todayFlows.fii.stockFutures },
    { label: "Index Options", value: todayFlows.fii.indexOptions },
    { label: "Debt", value: todayFlows.fii.debt },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Capital Flow Monitor</h2>
          <p className="text-xs text-ivory-500 mt-0.5">FII / DII / Retail institutional flows — NSE</p>
        </div>
        <span className="label-tag bg-maroon-800/30 text-maroon-400 text-xs px-2 py-1">{todayFlows.date}</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "FII Net Today", value: fiiTotal, sub: "Provisional" },
          { label: "DII Net Today", value: diiTotal, sub: "Exchanges" },
          { label: "Combined Net", value: combinedNet, sub: "FII + DII", large: true },
          { label: "FII MTD", value: fiiMtd, sub: "Month to Date" },
        ].map(({ label, value, sub, large }) => (
          <div key={label} className="card-base p-3 space-y-1">
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider">{label}</div>
            <div className={`font-bold font-mono ${large ? "text-xl" : "text-base"} ${value >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>
              {fmtCr(value)}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-ivory-600">
              {value >= 0
                ? <ArrowUpRight className="w-3 h-3 text-signal-bull" />
                : <ArrowDownRight className="w-3 h-3 text-signal-bear" />}
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* FII Sub-Category Breakdown */}
      <div className="card-base p-3">
        <div className="text-[10px] text-ivory-600 uppercase tracking-wider mb-2">FII Segment Breakdown</div>
        <div className="grid grid-cols-5 gap-2">
          {fiiSubCats.map(({ label, value }) => (
            <div key={label} className="bg-bg-primary rounded-lg p-2 text-center space-y-1">
              <div className="text-[9px] text-ivory-600 uppercase tracking-wider">{label}</div>
              <div className={`text-sm font-bold font-mono ${value >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>
                {value >= 0 ? "+" : ""}{value.toFixed(0)}
              </div>
              <div className="text-[9px] text-ivory-700">Cr</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Daily FII vs DII */}
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Daily FII vs DII Flow (₹ Cr)</div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={dailyFlows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={3} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }}
                labelStyle={{ color: "#d4c5b0" }}
                formatter={(v: number, n: string) => [fmtCr(v), n.toUpperCase()]}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <Bar dataKey="fii" name="FII" fill="#7c1d1d" radius={[2, 2, 0, 0]} />
              <Bar dataKey="dii" name="DII" fill="#166534" radius={[2, 2, 0, 0]} />
              <Line dataKey="net" name="Net" stroke="#d4af37" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Flow */}
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Cumulative Flow MTD (₹ Cr)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cumulativeFlows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }}
                labelStyle={{ color: "#d4c5b0" }}
                formatter={(v: number, n: string) => [fmtCr(v), n.toUpperCase()]}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <Area dataKey="fiiCum" name="FII Cum" stroke="#7c1d1d" fill="#7c1d1d" fillOpacity={0.3} strokeWidth={1.5} />
              <Area dataKey="diiCum" name="DII Cum" stroke="#166534" fill="#166534" fillOpacity={0.3} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly FII vs DII */}
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Monthly FII vs DII — YTD (₹ Cr)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyFlows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="month" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }}
                formatter={(v: number, n: string) => [fmtCr(v), n.toUpperCase()]}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <Bar dataKey="fii" name="FII" radius={[2, 2, 0, 0]}>
                {monthlyFlows.map((d, i) => (
                  <Cell key={i} fill={d.fii >= 0 ? "#166534" : "#7c1d1d"} />
                ))}
              </Bar>
              <Bar dataKey="dii" name="DII" fill="#1e40af" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Flows */}
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Sector-wise Net Flow (₹ Cr)</div>
          <div className="space-y-1.5 overflow-y-auto max-h-52">
            {[...sectorFlows].sort((a, b) => b.netFlow - a.netFlow).map((s) => {
              const absMax = 1801;
              const pct = Math.abs(s.netFlow) / absMax * 100;
              return (
                <div key={s.sector} className="flex items-center gap-2">
                  <div className="w-20 text-[10px] text-ivory-400 truncate">{s.sector}</div>
                  <div className="flex-1 h-4 bg-bg-primary rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${s.netFlow >= 0 ? "bg-signal-bull/60" : "bg-signal-bear/60"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className={`w-20 text-right text-[10px] font-mono font-semibold ${s.netFlow >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>
                    {s.netFlow >= 0 ? "+" : ""}{s.netFlow}
                  </div>
                  <div className={`w-14 text-[9px] text-center px-1 py-0.5 rounded ${
                    s.direction === "INFLOW" ? "bg-signal-bull/20 text-signal-bull" :
                    s.direction === "OUTFLOW" ? "bg-signal-bear/20 text-signal-bear" :
                    "bg-ivory-700/20 text-ivory-500"
                  }`}>
                    {s.direction}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Buy / Sell */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top Buys */}
        <div className="card-base p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-signal-bull" />
            <span className="text-xs font-semibold text-ivory-300">Top Institutional Buys</span>
          </div>
          <div className="space-y-1.5">
            {topBuyStocks.map((s) => (
              <div key={s.symbol} className="flex items-center gap-2">
                <div className="w-24 text-[10px] font-semibold text-ivory-200">{s.symbol}</div>
                <div className="flex-1 h-3.5 bg-bg-primary rounded overflow-hidden">
                  <div className="h-full bg-signal-bull/50 rounded" style={{ width: `${s.flowStrength}%` }} />
                </div>
                <div className="w-20 text-right text-[10px] font-mono text-signal-bull">+{s.total} Cr</div>
                <div className="w-12 text-right text-[9px] text-ivory-600">FII {s.fiiNet >= 0 ? "+" : ""}{s.fiiNet}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sells */}
        <div className="card-base p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-signal-bear" />
            <span className="text-xs font-semibold text-ivory-300">Top Institutional Sells</span>
          </div>
          <div className="space-y-1.5">
            {topSellStocks.map((s) => (
              <div key={s.symbol} className="flex items-center gap-2">
                <div className="w-24 text-[10px] font-semibold text-ivory-200">{s.symbol}</div>
                <div className="flex-1 h-3.5 bg-bg-primary rounded overflow-hidden">
                  <div className="h-full bg-signal-bear/50 rounded" style={{ width: `${s.flowStrength}%` }} />
                </div>
                <div className="w-20 text-right text-[10px] font-mono text-signal-bear">{s.total} Cr</div>
                <div className="w-12 text-right text-[9px] text-ivory-600">FII {s.fiiNet}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
