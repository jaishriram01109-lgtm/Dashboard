"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import {
  AreaChart, BarChart, ComposedChart,
  Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine,
} from "recharts";

interface Commodity {
  id: string; name: string; unit: string; price: number; change: number; changePct: number;
  high52W: number; low52W: number; indiaImpact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  impactNote: string; category: "ENERGY" | "METALS" | "AGRI";
}

const COMMODITIES: Commodity[] = [
  { id: "gold",    name: "Gold",          unit: "₹/10g",  price: 72450, change: 320,   changePct: 0.44,  high52W: 74200, low52W: 58400, indiaImpact: "NEGATIVE", impactNote: "Import cost ↑, CAD pressure", category: "METALS" },
  { id: "silver",  name: "Silver",        unit: "₹/kg",   price: 88320, change: -420,  changePct: -0.47, high52W: 92500, low52W: 68200, indiaImpact: "NEGATIVE", impactNote: "Solar panel cost ↑", category: "METALS" },
  { id: "crude",   name: "Crude Oil",     unit: "$/bbl",  price: 82.4,  change: -1.2,  changePct: -1.44, high52W: 97.2,  low52W: 68.5,  indiaImpact: "POSITIVE", impactNote: "Trade deficit ↓, inflation cool", category: "ENERGY" },
  { id: "natgas",  name: "Natural Gas",   unit: "$/mmBtu", price: 2.34, change: 0.08,  changePct: 3.54,  high52W: 3.82,  low52W: 1.89,  indiaImpact: "NEGATIVE", impactNote: "Power cost ↑, fertilizer cost ↑", category: "ENERGY" },
  { id: "copper",  name: "Copper",        unit: "$/MT",   price: 9845,  change: 125,   changePct: 1.29,  high52W: 10450, low52W: 7820,  indiaImpact: "NEGATIVE", impactNote: "Infra input cost ↑", category: "METALS" },
  { id: "zinc",    name: "Zinc",          unit: "$/MT",   price: 2876,  change: -34,   changePct: -1.17, high52W: 3210,  low52W: 2340,  indiaImpact: "NEUTRAL",  impactNote: "Galvanized steel cost", category: "METALS" },
  { id: "alum",    name: "Aluminium",     unit: "$/MT",   price: 2456,  change: 18,    changePct: 0.74,  high52W: 2780,  low52W: 2120,  indiaImpact: "NEUTRAL",  impactNote: "Auto & packaging sector", category: "METALS" },
  { id: "cotton",  name: "Cotton",        unit: "₹/Qtl",  price: 62400, change: 800,   changePct: 1.30,  high52W: 68500, low52W: 54200, indiaImpact: "POSITIVE", impactNote: "Textile sector revenue ↑", category: "AGRI" },
];

const genHistory = (base: number, vol: number) =>
  Array.from({ length: 60 }, (_, i) => ({
    date: `D${i + 1}`,
    price: Math.round((base + Math.sin(i * 0.18) * vol + Math.cos(i * 0.09) * vol * 0.5 + i * (vol * 0.01)) * 100) / 100,
  }));

const HISTORY: Record<string, { date: string; price: number }[]> = {
  gold: genHistory(71200, 800), silver: genHistory(87000, 2400), crude: genHistory(79, 6),
  natgas: genHistory(2.2, 0.28), copper: genHistory(9600, 320), zinc: genHistory(2820, 120),
  alum: genHistory(2400, 100), cotton: genHistory(60000, 2200),
};

const seasonalData = [
  { month: "Jan", gold: 2.1, crude: -3.2, copper: 1.4 },
  { month: "Feb", gold: 1.8, crude: 1.1, copper: 2.2 },
  { month: "Mar", gold: -0.5, crude: 3.4, copper: 1.8 },
  { month: "Apr", gold: 1.2, crude: 2.1, copper: -0.9 },
  { month: "May", gold: 0.8, crude: -1.5, copper: 2.4 },
  { month: "Jun", gold: -1.1, crude: -2.8, copper: -1.2 },
  { month: "Jul", gold: 2.4, crude: -1.9, copper: -0.6 },
  { month: "Aug", gold: 3.1, crude: -3.4, copper: -1.8 },
  { month: "Sep", gold: 1.9, crude: 2.8, copper: 0.9 },
  { month: "Oct", gold: 2.8, crude: 4.2, copper: 1.6 },
  { month: "Nov", gold: 1.4, crude: -2.1, copper: 0.8 },
  { month: "Dec", gold: 0.6, crude: -0.8, copper: 1.2 },
];

export default function CommodityDashboard() {
  const [selected, setSelected] = useState("crude");
  const [activeCategory, setActiveCategory] = useState<"ALL" | "ENERGY" | "METALS" | "AGRI">("ALL");

  const filtered = activeCategory === "ALL" ? COMMODITIES : COMMODITIES.filter((c) => c.category === activeCategory);
  const sel = COMMODITIES.find((c) => c.id === selected) ?? COMMODITIES[0];
  const hist = HISTORY[selected] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Commodity Dashboard</h2>
          <p className="text-xs text-ivory-500 mt-0.5">MCX · LME · NYMEX — India market impact analysis</p>
        </div>
        <div className="flex gap-1.5">
          {(["ALL", "ENERGY", "METALS", "AGRI"] as const).map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`text-[10px] px-2.5 py-1 rounded border transition-all ${activeCategory === cat ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Commodity cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {filtered.map((c) => (
          <button key={c.id} onClick={() => setSelected(c.id)}
            className={`card-base p-3 text-left transition-all border ${selected === c.id ? "border-maroon-700/60 bg-maroon-900/20" : "border-transparent hover:border-bg-border"}`}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-ivory-500">{c.name}</span>
              <span className={`text-[8px] px-1 rounded ${c.indiaImpact === "POSITIVE" ? "bg-signal-bull/20 text-signal-bull" : c.indiaImpact === "NEGATIVE" ? "bg-signal-bear/20 text-signal-bear" : "bg-ivory-700/20 text-ivory-500"}`}>
                {c.indiaImpact}
              </span>
            </div>
            <div className="text-base font-bold font-mono text-ivory-100 mt-1">{c.price.toLocaleString()}</div>
            <div className="text-[10px] text-ivory-600">{c.unit}</div>
            <div className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${c.changePct >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>
              {c.changePct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {c.changePct >= 0 ? "+" : ""}{c.changePct.toFixed(2)}%
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Price Chart */}
        <div className="card-base p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ivory-300">{sel.name} — 60 Day Price</span>
            <div className="text-[10px] text-ivory-500">{sel.unit}</div>
          </div>
          <div className="flex gap-3 text-[10px] mb-3">
            <span className="text-ivory-600">52W H: <span className="text-signal-bull font-mono">{sel.high52W.toLocaleString()}</span></span>
            <span className="text-ivory-600">52W L: <span className="text-signal-bear font-mono">{sel.low52W.toLocaleString()}</span></span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={hist} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={9} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
              <Area dataKey="price" stroke="#d4af37" fill="#d4af37" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 p-2 bg-bg-primary rounded text-[10px] text-ivory-500 flex items-start gap-2">
            <Zap className="w-3 h-3 text-gold-500 mt-0.5 flex-shrink-0" />
            <span>India Impact: {sel.impactNote}</span>
          </div>
        </div>

        {/* Seasonal Patterns */}
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Seasonal Avg Monthly Return (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={seasonalData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="month" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v}%`, ""]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <ReferenceLine y={0} stroke="#4a3a3a" />
              <Bar dataKey="gold" name="Gold" fill="#d4af37" radius={[2, 2, 0, 0]} />
              <Bar dataKey="crude" name="Crude" fill="#7c1d1d" radius={[2, 2, 0, 0]} />
              <Bar dataKey="copper" name="Copper" fill="#1e40af" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
