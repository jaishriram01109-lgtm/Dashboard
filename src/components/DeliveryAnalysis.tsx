"use client";

import { useState } from "react";
import { TrendingUp, Package, AlertCircle } from "lucide-react";
import {
  ComposedChart, BarChart, LineChart,
  Bar, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine,
} from "recharts";

interface DeliveryStock {
  symbol: string; sector: string; deliveryPct: number; prevDeliveryPct: number;
  deliveryChange: number; volume: number; deliveryVol: number;
  price: number; change1D: number; signal: "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL" | "SURGE";
  avgDelivery30D: number;
}

const STOCKS: DeliveryStock[] = [
  { symbol: "RELIANCE",   sector: "Energy",   deliveryPct: 78.4, prevDeliveryPct: 62.1, deliveryChange: 16.3, volume: 4523000, deliveryVol: 3546232, price: 2987, change1D: 1.4,  signal: "ACCUMULATION", avgDelivery30D: 58.2 },
  { symbol: "HDFCBANK",   sector: "Finance",  deliveryPct: 72.1, prevDeliveryPct: 68.4, deliveryChange: 3.7,  volume: 3234000, deliveryVol: 2331714, price: 1723, change1D: 0.8,  signal: "ACCUMULATION", avgDelivery30D: 65.1 },
  { symbol: "TCS",        sector: "IT",       deliveryPct: 81.3, prevDeliveryPct: 79.2, deliveryChange: 2.1,  volume: 1234000, deliveryVol: 1002942, price: 3890, change1D: 0.4,  signal: "NEUTRAL",      avgDelivery30D: 77.4 },
  { symbol: "TATASTEEL",  sector: "Metals",   deliveryPct: 28.4, prevDeliveryPct: 52.3, deliveryChange: -23.9,volume: 8934000, deliveryVol: 2537256, price: 876,  change1D: -2.1, signal: "DISTRIBUTION", avgDelivery30D: 48.7 },
  { symbol: "BAJFINANCE", sector: "Finance",  deliveryPct: 67.8, prevDeliveryPct: 48.2, deliveryChange: 19.6, volume: 2134000, deliveryVol: 1446852, price: 7234, change1D: 2.3,  signal: "SURGE",        avgDelivery30D: 52.3 },
  { symbol: "ZOMATO",     sector: "Consumer", deliveryPct: 58.2, prevDeliveryPct: 54.1, deliveryChange: 4.1,  volume: 12345000,deliveryVol: 7184790, price: 245,  change1D: 3.4,  signal: "ACCUMULATION", avgDelivery30D: 51.8 },
  { symbol: "ICICIBANK",  sector: "Finance",  deliveryPct: 69.4, prevDeliveryPct: 71.2, deliveryChange: -1.8, volume: 3456000, deliveryVol: 2398464, price: 1245, change1D: 0.3,  signal: "NEUTRAL",      avgDelivery30D: 68.9 },
  { symbol: "WIPRO",      sector: "IT",       deliveryPct: 24.3, prevDeliveryPct: 45.6, deliveryChange: -21.3,volume: 5678000, deliveryVol: 1379754, price: 456,  change1D: -1.8, signal: "DISTRIBUTION", avgDelivery30D: 43.2 },
  { symbol: "MARUTI",     sector: "Auto",     deliveryPct: 76.2, prevDeliveryPct: 64.8, deliveryChange: 11.4, volume: 890000,  deliveryVol: 678318,  price: 12450,change1D: 1.9,  signal: "ACCUMULATION", avgDelivery30D: 61.3 },
  { symbol: "COALINDIA",  sector: "Mining",   deliveryPct: 43.1, prevDeliveryPct: 41.2, deliveryChange: 1.9,  volume: 6789000, deliveryVol: 2925999, price: 456,  change1D: 0.6,  signal: "NEUTRAL",      avgDelivery30D: 40.8 },
  { symbol: "HINDALCO",   sector: "Metals",   deliveryPct: 22.1, prevDeliveryPct: 48.7, deliveryChange: -26.6,volume: 9123000, deliveryVol: 2016183, price: 678,  change1D: -3.2, signal: "DISTRIBUTION", avgDelivery30D: 45.1 },
  { symbol: "SUNPHARMA",  sector: "Pharma",   deliveryPct: 74.8, prevDeliveryPct: 58.4, deliveryChange: 16.4, volume: 1234000, deliveryVol: 923232,  price: 1678, change1D: 2.1,  signal: "SURGE",        avgDelivery30D: 55.6 },
];

const niftyDelivery = Array.from({ length: 30 }, (_, i) => ({
  date: `D${i + 1}`,
  delivery: +(52 + Math.sin(i * 0.3) * 8 + Math.cos(i * 0.2) * 4).toFixed(1),
  niftyChg: +(Math.sin(i * 0.25) * 0.8 + Math.cos(i * 0.15) * 0.4).toFixed(2),
}));

const signalColor: Record<DeliveryStock["signal"], string> = {
  ACCUMULATION: "bg-signal-bull/20 text-signal-bull",
  SURGE:        "bg-signal-accumulate/20 text-signal-accumulate",
  NEUTRAL:      "bg-ivory-700/20 text-ivory-500",
  DISTRIBUTION: "bg-signal-bear/20 text-signal-bear",
};

export default function DeliveryAnalysis() {
  const [filter, setFilter] = useState<"ALL" | "ACCUMULATION" | "DISTRIBUTION" | "SURGE">("ALL");
  const [sortBy, setSortBy] = useState<"deliveryPct" | "deliveryChange" | "volume">("deliveryChange");

  const filtered = (filter === "ALL" ? STOCKS : STOCKS.filter((s) => s.signal === filter))
    .sort((a, b) => sortBy === "deliveryChange" ? b.deliveryChange - a.deliveryChange : sortBy === "deliveryPct" ? b.deliveryPct - a.deliveryPct : b.volume - a.volume);

  const accCount = STOCKS.filter((s) => s.signal === "ACCUMULATION" || s.signal === "SURGE").length;
  const distCount = STOCKS.filter((s) => s.signal === "DISTRIBUTION").length;
  const avgDelivery = (STOCKS.reduce((a, s) => a + s.deliveryPct, 0) / STOCKS.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Delivery Analysis</h2>
          <p className="text-xs text-ivory-500 mt-0.5">Delivery % surge detection · Institutional accumulation signals</p>
        </div>
        <div className="flex gap-1.5">
          {(["deliveryPct", "deliveryChange", "volume"] as const).map((s) => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`text-[10px] px-2.5 py-1 rounded border transition-all ${sortBy === s ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {s === "deliveryPct" ? "Del%" : s === "deliveryChange" ? "Δ Change" : "Volume"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Accumulation", value: accCount, color: "text-signal-bull", sub: "stocks buying" },
          { label: "Distribution", value: distCount, color: "text-signal-bear", sub: "stocks selling" },
          { label: "Avg Delivery", value: `${avgDelivery}%`, color: "text-ivory-200", sub: "market avg" },
          { label: "Nifty Delivery", value: "58.4%", color: "text-gold-500", sub: "vs 52% avg" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card-base p-3">
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider">{label}</div>
            <div className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</div>
            <div className="text-[9px] text-ivory-700 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Signal filter */}
      <div className="flex gap-2">
        {(["ALL", "ACCUMULATION", "DISTRIBUTION", "SURGE"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[10px] px-3 py-1 rounded-full border transition-all ${filter === f ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card-base p-4">
        <div className="grid grid-cols-9 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border">
          {["Symbol", "Sector", "Del%", "Prev Del%", "Δ Del%", "Volume", "Del Volume", "1D%", "Signal"].map((h) => <div key={h}>{h}</div>)}
        </div>
        {filtered.map((s) => (
          <div key={s.symbol} className="grid grid-cols-9 gap-2 text-[10px] px-2 py-2.5 border-b border-bg-border/40 hover:bg-bg-hover items-center">
            <div className="font-bold text-ivory-100">{s.symbol}</div>
            <div className="text-ivory-500">{s.sector}</div>
            <div className={`font-mono font-bold ${s.deliveryPct > 70 ? "text-signal-bull" : s.deliveryPct < 35 ? "text-signal-bear" : "text-ivory-300"}`}>{s.deliveryPct}%</div>
            <div className="font-mono text-ivory-500">{s.prevDeliveryPct}%</div>
            <div className={`font-mono font-bold ${s.deliveryChange > 0 ? "text-signal-bull" : "text-signal-bear"}`}>
              {s.deliveryChange > 0 ? "+" : ""}{s.deliveryChange}%
            </div>
            <div className="font-mono text-ivory-500">{(s.volume / 100000).toFixed(1)}L</div>
            <div className="font-mono text-ivory-400">{(s.deliveryVol / 100000).toFixed(1)}L</div>
            <div className={`font-mono ${s.change1D >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>{s.change1D >= 0 ? "+" : ""}{s.change1D}%</div>
            <div className={`text-[9px] px-1.5 py-0.5 rounded text-center font-semibold ${signalColor[s.signal]}`}>{s.signal}</div>
          </div>
        ))}
      </div>

      {/* Nifty delivery trend */}
      <div className="card-base p-4">
        <div className="text-xs font-semibold text-ivory-300 mb-3">Nifty Delivery % vs Index Change — 30 Days</div>
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={niftyDelivery} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
            <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={5} />
            <YAxis yAxisId="del" domain={[35, 70]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
            <YAxis yAxisId="chg" orientation="right" domain={[-2, 2]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
            <ReferenceLine yAxisId="del" y={52} stroke="#4a3a3a" strokeDasharray="4 4" label={{ value: "Avg 52%", fill: "#4a3a3a", fontSize: 8 }} />
            <Bar yAxisId="del" dataKey="delivery" name="Delivery %" radius={[2, 2, 0, 0]}>
              {niftyDelivery.map((d, i) => <Cell key={i} fill={d.delivery > 55 ? "#166534" : d.delivery < 45 ? "#7c1d1d" : "#4a3a3a"} />)}
            </Bar>
            <Line yAxisId="chg" dataKey="niftyChg" name="Nifty Δ%" stroke="#d4af37" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
