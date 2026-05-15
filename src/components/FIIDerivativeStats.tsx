"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart2, Activity } from "lucide-react";
import {
  AreaChart, BarChart, LineChart, ComposedChart,
  Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell,
} from "recharts";

interface ClientOI {
  category: string;
  indexFutLong: number; indexFutShort: number; indexFutNet: number;
  stockFutLong: number; stockFutShort: number; stockFutNet: number;
  indexCallLong: number; indexCallShort: number;
  indexPutLong: number; indexPutShort: number;
}

const CLIENT_OI: ClientOI[] = [
  { category: "FII",      indexFutLong: 124567, indexFutShort: 98234, indexFutNet: 26333,  stockFutLong: 45678, stockFutShort: 38901, stockFutNet: 6777,  indexCallLong: 312456, indexCallShort: 189234, indexPutLong: 289345, indexPutShort: 198456 },
  { category: "DII",      indexFutLong: 34567,  indexFutShort: 56789, indexFutNet: -22222, stockFutLong: 23456, stockFutShort: 18234, stockFutNet: 5222,  indexCallLong: 89234,  indexCallShort: 134567, indexPutLong: 123456, indexPutShort: 78234  },
  { category: "Proprietary",indexFutLong: 89234, indexFutShort: 78901, indexFutNet: 10333, stockFutLong: 67890, stockFutShort: 72345, stockFutNet: -4455, indexCallLong: 234567, indexCallShort: 256789, indexPutLong: 189234, indexPutShort: 212345 },
  { category: "Retail",   indexFutLong: 156789, indexFutShort: 178234, indexFutNet: -21445,stockFutLong: 89012, stockFutShort: 96789, stockFutNet: -7777, indexCallLong: 456789, indexCallShort: 512345, indexPutLong: 423456, indexPutShort: 389012 },
];

const fiiNetHistory = Array.from({ length: 30 }, (_, i) => ({
  date: `D${i + 1}`,
  indexFut: Math.round((Math.sin(i * 0.35) * 12000 + Math.cos(i * 0.2) * 6000) * 10) / 10,
  stockFut: Math.round((Math.sin(i * 0.28 + 1) * 5000 + Math.cos(i * 0.15) * 3000) * 10) / 10,
  pcr: +(0.8 + Math.sin(i * 0.3) * 0.25).toFixed(3),
}));

const oiConcentration = [
  { percentile: "Top 5 Client", long: 28.4, short: 31.2 },
  { percentile: "Top 10 Client", long: 42.1, short: 45.6 },
  { percentile: "Top 20 Client", long: 58.7, short: 62.3 },
  { percentile: "Top 50 Client", long: 74.2, short: 77.8 },
];

const fiiLongShortHistory = Array.from({ length: 20 }, (_, i) => ({
  date: `D${i + 1}`,
  longContracts: Math.round(115000 + Math.sin(i * 0.4) * 15000 + i * 500),
  shortContracts: Math.round(95000 + Math.sin(i * 0.35 + 1) * 12000 + i * 200),
  lsRatio: +(1.2 + Math.sin(i * 0.3) * 0.15).toFixed(3),
}));

export default function FIIDerivativeStats() {
  const [activeTab, setActiveTab] = useState<"oi-table" | "flow" | "concentration">("oi-table");

  const fii = CLIENT_OI[0];
  const fiiLSRatio = (fii.indexFutLong / fii.indexFutShort).toFixed(2);
  const fiiNetOI = fii.indexFutNet + fii.stockFutNet;
  const retailNetOI = CLIENT_OI[3].indexFutNet + CLIENT_OI[3].stockFutNet;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">FII Derivative Statistics</h2>
          <p className="text-xs text-ivory-500 mt-0.5">SEBI client-wise OI · Long/Short ratio · PCR · Concentration</p>
        </div>
        <div className="flex gap-1.5">
          {(["oi-table", "flow", "concentration"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`text-[10px] px-3 py-1.5 rounded border capitalize transition-all ${activeTab === t ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {t.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "FII L/S Ratio", value: fiiLSRatio, sub: "Index Futures", color: Number(fiiLSRatio) > 1 ? "text-signal-bull" : "text-signal-bear" },
          { label: "FII Net OI (Lots)", value: fiiNetOI.toLocaleString(), sub: "Index + Stock", color: fiiNetOI > 0 ? "text-signal-bull" : "text-signal-bear" },
          { label: "Retail Net OI", value: retailNetOI.toLocaleString(), sub: "Index + Stock", color: retailNetOI > 0 ? "text-signal-bull" : "text-signal-bear" },
          { label: "FII Contra Retail", value: fiiNetOI * retailNetOI < 0 ? "YES" : "NO", sub: fiiNetOI * retailNetOI < 0 ? "Bullish divergence" : "Same direction", color: fiiNetOI * retailNetOI < 0 ? "text-signal-bull" : "text-ivory-400" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card-base p-3">
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider">{label}</div>
            <div className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</div>
            <div className="text-[10px] text-ivory-600 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {activeTab === "oi-table" && (
        <div className="space-y-3">
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Client-wise Open Interest — Index Futures (Lots)</div>
            <div className="grid grid-cols-6 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border">
              {["Category", "Long", "Short", "Net", "Net Bar", "Signal"].map((h) => <div key={h}>{h}</div>)}
            </div>
            {CLIENT_OI.map((c) => {
              const maxAbs = 30000;
              const pct = Math.abs(c.indexFutNet) / maxAbs * 100;
              const signal = c.category === "FII" ? (c.indexFutNet > 0 ? "BULL" : "BEAR") : c.category === "Retail" ? (c.indexFutNet > 0 ? "RETAIL BULL" : "RETAIL BEAR") : "—";
              const signalColor = c.indexFutNet > 0 ? "bg-signal-bull/20 text-signal-bull" : "bg-signal-bear/20 text-signal-bear";
              return (
                <div key={c.category} className="grid grid-cols-6 gap-2 text-[10px] px-2 py-2.5 border-b border-bg-border/40 hover:bg-bg-hover items-center">
                  <div className="font-semibold text-ivory-200">{c.category}</div>
                  <div className="font-mono text-signal-bull">{c.indexFutLong.toLocaleString()}</div>
                  <div className="font-mono text-signal-bear">{c.indexFutShort.toLocaleString()}</div>
                  <div className={`font-mono font-bold ${c.indexFutNet > 0 ? "text-signal-bull" : "text-signal-bear"}`}>
                    {c.indexFutNet > 0 ? "+" : ""}{c.indexFutNet.toLocaleString()}
                  </div>
                  <div className="h-3 bg-bg-primary rounded overflow-hidden">
                    <div className={`h-full rounded ${c.indexFutNet >= 0 ? "bg-signal-bull/50" : "bg-signal-bear/50"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  {signal !== "—" ? <div className={`text-[9px] px-1.5 py-0.5 rounded font-semibold text-center ${signalColor}`}>{signal}</div> : <div className="text-ivory-600">—</div>}
                </div>
              );
            })}
          </div>

          {/* Options OI comparison */}
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Index Options OI — Long vs Short by Client</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-ivory-600 mb-2">CALLS (Long vs Short)</div>
                {CLIENT_OI.map((c) => (
                  <div key={c.category} className="flex items-center gap-2 mb-1.5">
                    <div className="w-16 text-[10px] text-ivory-400">{c.category}</div>
                    <div className="flex-1 h-3 bg-bg-primary rounded overflow-hidden flex">
                      <div className="bg-signal-bull/50 h-full" style={{ width: `${(c.indexCallLong / (c.indexCallLong + c.indexCallShort)) * 100}%` }} />
                      <div className="bg-signal-bear/50 h-full flex-1" />
                    </div>
                    <div className="text-[9px] text-ivory-600 w-16 text-right font-mono">{((c.indexCallLong / (c.indexCallLong + c.indexCallShort)) * 100).toFixed(0)}% L</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[10px] text-ivory-600 mb-2">PUTS (Long vs Short)</div>
                {CLIENT_OI.map((c) => (
                  <div key={c.category} className="flex items-center gap-2 mb-1.5">
                    <div className="w-16 text-[10px] text-ivory-400">{c.category}</div>
                    <div className="flex-1 h-3 bg-bg-primary rounded overflow-hidden flex">
                      <div className="bg-signal-bull/50 h-full" style={{ width: `${(c.indexPutLong / (c.indexPutLong + c.indexPutShort)) * 100}%` }} />
                      <div className="bg-signal-bear/50 h-full flex-1" />
                    </div>
                    <div className="text-[9px] text-ivory-600 w-16 text-right font-mono">{((c.indexPutLong / (c.indexPutLong + c.indexPutShort)) * 100).toFixed(0)}% L</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "flow" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">FII Net Futures OI Change — 30 Days (Lots)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fiiNetHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={5} />
                <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                <ReferenceLine y={0} stroke="#4a3a3a" strokeDasharray="4 4" />
                <Bar dataKey="indexFut" name="Index Futures">
                  {fiiNetHistory.map((d, i) => <Cell key={i} fill={d.indexFut >= 0 ? "#166534" : "#7c1d1d"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">FII Long/Short Contracts + Ratio — 20 Days</div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={fiiLongShortHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={4} />
                <YAxis yAxisId="contracts" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis yAxisId="ratio" orientation="right" domain={[0.8, 1.6]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                <Bar yAxisId="contracts" dataKey="longContracts" name="Long" fill="#166534" radius={[2, 2, 0, 0]} />
                <Bar yAxisId="contracts" dataKey="shortContracts" name="Short" fill="#7c1d1d" radius={[2, 2, 0, 0]} />
                <Line yAxisId="ratio" dataKey="lsRatio" name="L/S Ratio" stroke="#d4af37" strokeWidth={2} dot={false} />
                <ReferenceLine yAxisId="ratio" y={1} stroke="#4a3a3a" strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "concentration" && (
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">OI Concentration — Top Client % Share</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={oiConcentration} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="percentile" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v}%`, ""]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <Bar dataKey="long" name="Long OI %" fill="#166534" radius={[3, 3, 0, 0]} />
              <Bar dataKey="short" name="Short OI %" fill="#7c1d1d" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 text-[10px] text-ivory-600 bg-bg-primary rounded p-3">
            <span className="text-gold-500 font-semibold">AI Insight: </span>
            Top 5 clients hold ~30% of total index futures OI. High concentration suggests large institutional players controlling market direction. When FII net OI diverges from retail, follow FII — they have an 80%+ accuracy historically.
          </div>
        </div>
      )}
    </div>
  );
}
