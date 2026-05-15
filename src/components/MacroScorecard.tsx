"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import {
  AreaChart, BarChart, LineChart, ComposedChart,
  Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell,
} from "recharts";

interface MacroIndicator {
  id: string; name: string; value: string; prev: string; unit: string;
  trend: "UP" | "DOWN" | "FLAT"; marketImpact: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  description: string; category: string; status: "GOOD" | "WATCH" | "BAD";
}

const INDICATORS: MacroIndicator[] = [
  { id: "gdp",      name: "GDP Growth",        value: "8.4",  prev: "7.6",  unit: "% YoY",   trend: "UP",   marketImpact: "POSITIVE", description: "Q3FY25 GDP beat estimates; consumption + capex driving growth",           category: "Growth",    status: "GOOD" },
  { id: "iip",      name: "IIP (Industry)",    value: "5.2",  prev: "3.8",  unit: "% YoY",   trend: "UP",   marketImpact: "POSITIVE", description: "Manufacturing output accelerating; capital goods component strong",       category: "Growth",    status: "GOOD" },
  { id: "pmi-mfg",  name: "PMI Manufacturing", value: "58.8", prev: "56.7", unit: "Index",   trend: "UP",   marketImpact: "POSITIVE", description: "Above 50 expansion zone; new orders and employment subindex strong",    category: "Growth",    status: "GOOD" },
  { id: "pmi-svc",  name: "PMI Services",      value: "61.2", prev: "60.6", unit: "Index",   trend: "UP",   marketImpact: "POSITIVE", description: "Services sector booming; India's competitive advantage visible",         category: "Growth",    status: "GOOD" },
  { id: "cpi",      name: "CPI Inflation",     value: "4.83", prev: "5.10", unit: "% YoY",   trend: "DOWN", marketImpact: "POSITIVE", description: "Easing toward RBI 4% target; food inflation key risk",                  category: "Inflation", status: "WATCH" },
  { id: "wpi",      name: "WPI Inflation",     value: "0.53", prev: "0.78", unit: "% YoY",   trend: "DOWN", marketImpact: "POSITIVE", description: "Near deflationary at wholesale level; input cost relief for corporates", category: "Inflation", status: "GOOD" },
  { id: "repo",     name: "Repo Rate",          value: "6.50", prev: "6.50", unit: "%",       trend: "FLAT", marketImpact: "NEUTRAL",  description: "RBI on hold; rate cut expected in H2 CY25 if inflation stays cool",    category: "Monetary",  status: "WATCH" },
  { id: "fxres",    name: "FX Reserves",        value: "648", prev: "634",  unit: "$ Bn",    trend: "UP",   marketImpact: "POSITIVE", description: "Record high; provides 10+ months import cover and currency stability", category: "External",  status: "GOOD" },
  { id: "cad",      name: "Current A/C Deficit",value: "1.2",  prev: "1.8",  unit: "% GDP",   trend: "DOWN", marketImpact: "POSITIVE", description: "Narrowing CAD; services exports and remittances offsetting trade gap",  category: "External",  status: "GOOD" },
  { id: "fiscal",   name: "Fiscal Deficit",     value: "5.1",  prev: "5.9",  unit: "% GDP",   trend: "DOWN", marketImpact: "POSITIVE", description: "Consolidation on track; govt capex quality high despite lower deficit", category: "Fiscal",    status: "WATCH" },
  { id: "gstsb",    name: "GST Collections",    value: "2.10", prev: "1.87", unit: "₹ Lakh Cr",trend: "UP", marketImpact: "POSITIVE", description: "Record GST mopup; reflects strong formal economy and compliance",      category: "Fiscal",    status: "GOOD" },
  { id: "unemp",    name: "Unemployment Rate",  value: "7.8",  prev: "8.1",  unit: "%",       trend: "DOWN", marketImpact: "POSITIVE", description: "Urban unemployment declining; rural MGNREGA demand normalising",        category: "Labour",    status: "WATCH" },
];

const gdpHistory = [
  { q: "Q1FY23", gdp: 13.5 }, { q: "Q2FY23", gdp: 6.3 }, { q: "Q3FY23", gdp: 4.4 }, { q: "Q4FY23", gdp: 6.1 },
  { q: "Q1FY24", gdp: 8.2 }, { q: "Q2FY24", gdp: 7.6 }, { q: "Q3FY24", gdp: 8.4 }, { q: "Q4FY24", gdp: 7.8 },
  { q: "Q1FY25", gdp: 7.2 }, { q: "Q2FY25", gdp: 7.4 }, { q: "Q3FY25", gdp: 8.4 }, { q: "Q4FY25E", gdp: 7.6 },
];

const inflationHistory = Array.from({ length: 24 }, (_, i) => ({
  month: `M${i + 1}`,
  cpi: +(6.5 - i * 0.07 + Math.sin(i * 0.4) * 0.5).toFixed(2),
  wpi: +(4.2 - i * 0.15 + Math.sin(i * 0.35) * 0.8).toFixed(2),
  core: +(5.8 - i * 0.05 + Math.sin(i * 0.3) * 0.3).toFixed(2),
}));

const pmiHistory = Array.from({ length: 18 }, (_, i) => ({
  month: `M${i + 1}`,
  mfg: +(55 + Math.sin(i * 0.35) * 3.5 + i * 0.2).toFixed(1),
  services: +(57 + Math.sin(i * 0.3 + 1) * 3.8 + i * 0.25).toFixed(1),
}));

const statusIcon = (s: MacroIndicator["status"]) => {
  if (s === "GOOD") return <CheckCircle className="w-4 h-4 text-signal-bull" />;
  if (s === "WATCH") return <AlertTriangle className="w-4 h-4 text-gold-500" />;
  return <XCircle className="w-4 h-4 text-signal-bear" />;
};

const impactColor = (i: MacroIndicator["marketImpact"]) =>
  i === "POSITIVE" ? "text-signal-bull" : i === "NEGATIVE" ? "text-signal-bear" : "text-ivory-500";

const CATEGORIES = ["All", "Growth", "Inflation", "Monetary", "External", "Fiscal", "Labour"];

export default function MacroScorecard() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeChart, setActiveChart] = useState<"gdp" | "inflation" | "pmi">("gdp");

  const goodCount = INDICATORS.filter((i) => i.status === "GOOD").length;
  const watchCount = INDICATORS.filter((i) => i.status === "WATCH").length;
  const badCount = INDICATORS.filter((i) => i.status === "BAD").length;
  const macroScore = Math.round((goodCount * 100 + watchCount * 50) / INDICATORS.length);

  const filtered = activeCategory === "All" ? INDICATORS : INDICATORS.filter((i) => i.category === activeCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">India Macro Scorecard</h2>
          <p className="text-xs text-ivory-500 mt-0.5">GDP · IIP · CPI · PMI · FX Reserves · Fiscal — AI interpretation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-signal-bull">{macroScore}</div>
            <div className="text-[9px] text-ivory-600">Macro Score</div>
          </div>
          <div className="text-[10px] space-y-0.5">
            <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-signal-bull" /><span className="text-ivory-400">{goodCount} Good</span></div>
            <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-gold-500" /><span className="text-ivory-400">{watchCount} Watch</span></div>
            <div className="flex items-center gap-1"><XCircle className="w-3 h-3 text-signal-bear" /><span className="text-ivory-400">{badCount} Bad</span></div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${activeCategory === c ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Indicator grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((ind) => (
          <div key={ind.id} className="card-base p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-ivory-500 uppercase tracking-wider">{ind.name}</span>
              {statusIcon(ind.status)}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-mono text-ivory-100">{ind.value}</span>
              <span className="text-xs text-ivory-600 mb-1">{ind.unit}</span>
              <div className={`flex items-center gap-0.5 mb-1 text-[10px] font-semibold ml-auto ${ind.trend === "UP" ? "text-signal-bull" : ind.trend === "DOWN" ? "text-signal-bear" : "text-ivory-500"}`}>
                {ind.trend === "UP" ? <TrendingUp className="w-3 h-3" /> : ind.trend === "DOWN" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                prev {ind.prev}
              </div>
            </div>
            <div className="text-[9px] text-ivory-600 leading-relaxed">{ind.description}</div>
            <div className={`text-[9px] font-semibold uppercase tracking-wider ${impactColor(ind.marketImpact)}`}>
              Market: {ind.marketImpact}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="card-base p-4">
        <div className="flex gap-2 mb-4">
          {(["gdp", "inflation", "pmi"] as const).map((c) => (
            <button key={c} onClick={() => setActiveChart(c)}
              className={`text-[10px] px-3 py-1.5 rounded border uppercase tracking-wider transition-all ${activeChart === c ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {c}
            </button>
          ))}
        </div>

        {activeChart === "gdp" && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={gdpHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="q" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v}%`, "GDP Growth"]} />
              <ReferenceLine y={6} stroke="#4a3a3a" strokeDasharray="4 4" label={{ value: "6%", fill: "#4a3a3a", fontSize: 9 }} />
              <Bar dataKey="gdp" radius={[3, 3, 0, 0]}>
                {gdpHistory.map((d, i) => <Cell key={i} fill={d.gdp >= 7 ? "#166534" : d.gdp >= 5 ? "#d4af37" : "#7c1d1d"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === "inflation" && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={inflationHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="month" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={3} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v}%`, ""]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <ReferenceLine y={4} stroke="#166534" strokeDasharray="4 4" label={{ value: "RBI Target 4%", fill: "#166534", fontSize: 8 }} />
              <Line dataKey="cpi" name="CPI" stroke="#d4af37" strokeWidth={1.5} dot={false} />
              <Line dataKey="wpi" name="WPI" stroke="#7c1d1d" strokeWidth={1.5} dot={false} />
              <Line dataKey="core" name="Core" stroke="#1e40af" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === "pmi" && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pmiHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="month" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={2} />
              <YAxis domain={[48, 65]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <ReferenceLine y={50} stroke="#4a3a3a" strokeDasharray="4 4" label={{ value: "Expansion 50", fill: "#4a3a3a", fontSize: 8 }} />
              <Line dataKey="mfg" name="Manufacturing PMI" stroke="#7c1d1d" strokeWidth={1.5} dot={false} />
              <Line dataKey="services" name="Services PMI" stroke="#166534" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
