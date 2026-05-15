"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import {
  ComposedChart, AreaChart, BarChart,
  Area, Bar, Line, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Leg {
  id: number;
  type: "CALL" | "PUT";
  action: "BUY" | "SELL";
  strike: number;
  premium: number;
  lots: number;
}

interface Strategy {
  name: string;
  legs: Omit<Leg, "id">[];
  description: string;
  outlook: "BULLISH" | "BEARISH" | "NEUTRAL" | "VOLATILE";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SPOT = 22850;
const LOT_SIZE = 75;

const STRIKES = [21500, 21750, 22000, 22250, 22500, 22750, 23000, 23250, 23500, 23750, 24000];

const PREMIUMS: Record<string, Record<number, number>> = {
  CALL: { 21500: 1380, 21750: 1148, 22000: 932, 22250: 728, 22500: 542, 22750: 378, 23000: 245, 23250: 148, 23500: 84, 23750: 46, 24000: 24 },
  PUT:  { 21500: 54,   21750: 78,   22000: 112, 22250: 158, 22500: 222, 22750: 308, 23000: 428, 23250: 580, 23500: 756, 23750: 962, 24000: 1190 },
};

const PRESET_STRATEGIES: Strategy[] = [
  {
    name: "Bull Call Spread",
    outlook: "BULLISH",
    description: "Buy lower strike call, sell higher strike call. Limited profit, limited risk.",
    legs: [
      { type: "CALL", action: "BUY", strike: 22500, premium: PREMIUMS.CALL[22500], lots: 1 },
      { type: "CALL", action: "SELL", strike: 23000, premium: PREMIUMS.CALL[23000], lots: 1 },
    ],
  },
  {
    name: "Bear Put Spread",
    outlook: "BEARISH",
    description: "Buy higher strike put, sell lower strike put. Profits when market falls.",
    legs: [
      { type: "PUT", action: "BUY", strike: 22750, premium: PREMIUMS.PUT[22750], lots: 1 },
      { type: "PUT", action: "SELL", strike: 22250, premium: PREMIUMS.PUT[22250], lots: 1 },
    ],
  },
  {
    name: "Long Straddle",
    outlook: "VOLATILE",
    description: "Buy ATM call and put. Profits from big moves in either direction.",
    legs: [
      { type: "CALL", action: "BUY", strike: 22750, premium: PREMIUMS.CALL[22750], lots: 1 },
      { type: "PUT", action: "BUY", strike: 22750, premium: PREMIUMS.PUT[22750], lots: 1 },
    ],
  },
  {
    name: "Short Straddle",
    outlook: "NEUTRAL",
    description: "Sell ATM call and put. Profits when market stays sideways.",
    legs: [
      { type: "CALL", action: "SELL", strike: 22750, premium: PREMIUMS.CALL[22750], lots: 1 },
      { type: "PUT", action: "SELL", strike: 22750, premium: PREMIUMS.PUT[22750], lots: 1 },
    ],
  },
  {
    name: "Iron Condor",
    outlook: "NEUTRAL",
    description: "Sell OTM call spread + OTM put spread. Max profit in a range.",
    legs: [
      { type: "PUT", action: "BUY", strike: 22000, premium: PREMIUMS.PUT[22000], lots: 1 },
      { type: "PUT", action: "SELL", strike: 22500, premium: PREMIUMS.PUT[22500], lots: 1 },
      { type: "CALL", action: "SELL", strike: 23000, premium: PREMIUMS.CALL[23000], lots: 1 },
      { type: "CALL", action: "BUY", strike: 23500, premium: PREMIUMS.CALL[23500], lots: 1 },
    ],
  },
  {
    name: "Covered Call",
    outlook: "NEUTRAL",
    description: "Hold underlying, sell OTM call. Generates income on flat markets.",
    legs: [
      { type: "CALL", action: "SELL", strike: 23250, premium: PREMIUMS.CALL[23250], lots: 1 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcPayoff(legs: Leg[], spotAtExpiry: number): number {
  return legs.reduce((total, leg) => {
    const intrinsic = leg.type === "CALL"
      ? Math.max(0, spotAtExpiry - leg.strike)
      : Math.max(0, leg.strike - spotAtExpiry);
    const pnl = leg.action === "BUY"
      ? (intrinsic - leg.premium) * leg.lots * LOT_SIZE
      : (leg.premium - intrinsic) * leg.lots * LOT_SIZE;
    return total + pnl;
  }, 0);
}

let _id = 10;

// ─── Component ────────────────────────────────────────────────────────────────
export default function OptionStrategyBuilder() {
  const [legs, setLegs] = useState<Leg[]>(
    PRESET_STRATEGIES[0].legs.map((l) => ({ ...l, id: _id++ }))
  );
  const [activePreset, setActivePreset] = useState(0);

  const payoffData = useMemo(() => {
    const points: { spot: number; pnl: number }[] = [];
    for (let s = SPOT - 2000; s <= SPOT + 2000; s += 50) {
      points.push({ spot: s, pnl: calcPayoff(legs, s) });
    }
    return points;
  }, [legs]);

  const maxProfit = Math.max(...payoffData.map((d) => d.pnl));
  const maxLoss = Math.min(...payoffData.map((d) => d.pnl));
  const breakevens = payoffData
    .filter((d, i, arr) => i > 0 && Math.sign(d.pnl) !== Math.sign(arr[i - 1].pnl))
    .map((d) => d.spot);

  const netPremium = legs.reduce((sum, l) => {
    const sign = l.action === "BUY" ? -1 : 1;
    return sum + sign * l.premium * l.lots * LOT_SIZE;
  }, 0);

  function applyPreset(idx: number) {
    setActivePreset(idx);
    setLegs(PRESET_STRATEGIES[idx].legs.map((l) => ({ ...l, id: _id++ })));
  }

  function addLeg() {
    setLegs((prev) => [...prev, { id: _id++, type: "CALL", action: "BUY", strike: 22750, premium: PREMIUMS.CALL[22750], lots: 1 }]);
  }

  function removeLeg(id: number) {
    setLegs((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLeg(id: number, field: keyof Leg, value: string | number) {
    setLegs((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === "type" || field === "strike") {
        const t = field === "type" ? String(value) as "CALL" | "PUT" : l.type;
        const s = field === "strike" ? Number(value) : l.strike;
        updated.premium = PREMIUMS[t][s] ?? l.premium;
      }
      return updated;
    }));
  }

  const outlook = PRESET_STRATEGIES[activePreset]?.outlook ?? "NEUTRAL";
  const outlookColor = outlook === "BULLISH" ? "text-signal-bull" : outlook === "BEARISH" ? "text-signal-bear" : outlook === "VOLATILE" ? "text-gold-500" : "text-ivory-400";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Option Strategy Builder</h2>
          <p className="text-xs text-ivory-500 mt-0.5">Nifty Spot: <span className="text-ivory-200 font-semibold">{SPOT.toLocaleString()}</span> · Lot Size: {LOT_SIZE}</p>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${outlookColor}`}>{outlook}</span>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESET_STRATEGIES.map((s, i) => (
          <button
            key={s.name}
            onClick={() => applyPreset(i)}
            className={`text-[10px] px-3 py-1.5 rounded-full border font-medium transition-all ${
              activePreset === i
                ? "bg-maroon-800/40 border-maroon-600 text-maroon-300"
                : "border-bg-border text-ivory-500 hover:text-ivory-200 hover:border-ivory-600"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Description */}
      {PRESET_STRATEGIES[activePreset] && (
        <div className="text-[11px] text-ivory-500 bg-bg-secondary border border-bg-border rounded-lg px-3 py-2">
          {PRESET_STRATEGIES[activePreset].description}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Leg Builder */}
        <div className="card-base p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ivory-300">Strategy Legs</span>
            <button onClick={addLeg} className="flex items-center gap-1 text-[10px] text-maroon-400 hover:text-maroon-300 border border-maroon-800/50 rounded px-2 py-1">
              <Plus className="w-3 h-3" /> Add Leg
            </button>
          </div>

          {/* Leg rows */}
          <div className="space-y-2">
            {legs.map((leg) => (
              <div key={leg.id} className="grid grid-cols-12 gap-1.5 items-center bg-bg-primary rounded-lg p-2">
                <select
                  value={leg.action}
                  onChange={(e) => updateLeg(leg.id, "action", e.target.value)}
                  className="col-span-2 bg-bg-secondary border border-bg-border rounded text-[10px] text-ivory-300 px-1 py-1"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
                <select
                  value={leg.type}
                  onChange={(e) => updateLeg(leg.id, "type", e.target.value)}
                  className="col-span-2 bg-bg-secondary border border-bg-border rounded text-[10px] text-ivory-300 px-1 py-1"
                >
                  <option value="CALL">CE</option>
                  <option value="PUT">PE</option>
                </select>
                <select
                  value={leg.strike}
                  onChange={(e) => updateLeg(leg.id, "strike", Number(e.target.value))}
                  className="col-span-3 bg-bg-secondary border border-bg-border rounded text-[10px] text-ivory-300 px-1 py-1"
                >
                  {STRIKES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="col-span-2 text-[10px] text-center font-mono text-ivory-400">{leg.premium}</div>
                <select
                  value={leg.lots}
                  onChange={(e) => updateLeg(leg.id, "lots", Number(e.target.value))}
                  className="col-span-2 bg-bg-secondary border border-bg-border rounded text-[10px] text-ivory-300 px-1 py-1"
                >
                  {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}L</option>)}
                </select>
                <button onClick={() => removeLeg(leg.id)} className="col-span-1 flex justify-center text-ivory-700 hover:text-signal-bear">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-bg-border">
            {[
              { label: "Max Profit", value: maxProfit === Infinity ? "Unlimited" : `₹${maxProfit.toLocaleString()}`, color: maxProfit > 0 ? "text-signal-bull" : "text-ivory-500" },
              { label: "Max Loss", value: maxLoss === -Infinity ? "Unlimited" : `₹${Math.abs(maxLoss).toLocaleString()}`, color: maxLoss < 0 ? "text-signal-bear" : "text-ivory-500" },
              { label: "Net Premium", value: `₹${Math.abs(netPremium).toLocaleString()}`, color: netPremium >= 0 ? "text-signal-bull" : "text-signal-bear", sub: netPremium >= 0 ? "Credit" : "Debit" },
              { label: "Breakeven(s)", value: breakevens.length > 0 ? breakevens.join(" / ") : "—", color: "text-gold-500" },
            ].map(({ label, value, color, sub }) => (
              <div key={label} className="bg-bg-primary rounded-lg p-2">
                <div className="text-[9px] text-ivory-600 uppercase tracking-wider">{label}</div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${color}`}>{value}</div>
                {sub && <div className="text-[9px] text-ivory-600">{sub}</div>}
              </div>
            ))}
          </div>

          {/* Greeks summary */}
          <div className="pt-2 border-t border-bg-border">
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider mb-2">Net Greeks (approx.)</div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { g: "Δ Delta", v: (legs.reduce((s, l) => s + (l.action === "BUY" ? 1 : -1) * (l.type === "CALL" ? 0.45 : -0.45) * l.lots, 0)).toFixed(2) },
                { g: "Γ Gamma", v: (legs.reduce((s, l) => s + (l.action === "BUY" ? 1 : -1) * 0.004 * l.lots, 0)).toFixed(4) },
                { g: "Θ Theta", v: (legs.reduce((s, l) => s + (l.action === "BUY" ? -1 : 1) * 8.2 * l.lots, 0)).toFixed(1) },
                { g: "V Vega", v: (legs.reduce((s, l) => s + (l.action === "BUY" ? 1 : -1) * 12.4 * l.lots, 0)).toFixed(1) },
              ].map(({ g, v }) => (
                <div key={g} className="bg-bg-primary rounded p-1.5 text-center">
                  <div className="text-[9px] text-ivory-600">{g}</div>
                  <div className="text-xs font-mono text-ivory-200 mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payoff Chart */}
        <div className="card-base p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ivory-300">P&amp;L at Expiry</span>
            <span className="text-[10px] text-ivory-600">Spot range ±2000 pts</span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={payoffData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="spot" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => v.toLocaleString()} interval={7} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, "P&L"]}
                labelFormatter={(l: number) => `Spot: ${l.toLocaleString()}`}
              />
              <ReferenceLine y={0} stroke="#4a3a3a" strokeDasharray="4 4" />
              <ReferenceLine x={SPOT} stroke="#d4af37" strokeDasharray="4 4" label={{ value: "CMP", fill: "#d4af37", fontSize: 9 }} />
              {breakevens.map((be) => (
                <ReferenceLine key={be} x={be} stroke="#6b7280" strokeDasharray="3 3" label={{ value: `BE ${be}`, fill: "#6b7280", fontSize: 8 }} />
              ))}
              <Area
                dataKey="pnl"
                stroke="#7c1d1d"
                fill="url(#payoffGrad)"
                strokeWidth={2}
                dot={false}
              />
              <defs>
                <linearGradient id="payoffGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#166534" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#7c1d1d" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#7c1d1d" stopOpacity={0.4} />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>

          {/* Risk/Reward bar */}
          {maxProfit !== Infinity && maxLoss !== -Infinity && maxLoss !== 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-ivory-600">
                <span>Risk / Reward</span>
                <span className="font-mono text-ivory-300">
                  1 : {Math.abs(maxProfit / maxLoss).toFixed(2)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-signal-bear/30 overflow-hidden">
                <div
                  className="h-full bg-signal-bull rounded-full"
                  style={{ width: `${Math.min(100, (maxProfit / (maxProfit + Math.abs(maxLoss))) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-ivory-700">
                <span>Max Loss ₹{Math.abs(maxLoss).toLocaleString()}</span>
                <span>Max Profit ₹{maxProfit.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Leg summary table */}
          <div className="border-t border-bg-border pt-3">
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider mb-2">Leg Summary</div>
            <div className="grid grid-cols-5 gap-1 text-[9px] text-ivory-600 mb-1 px-1">
              {["Action", "Type", "Strike", "Premium", "Cost"].map((h) => <div key={h}>{h}</div>)}
            </div>
            {legs.map((leg) => {
              const cost = (leg.action === "BUY" ? -1 : 1) * leg.premium * leg.lots * LOT_SIZE;
              return (
                <div key={leg.id} className="grid grid-cols-5 gap-1 text-[10px] px-1 py-0.5 rounded hover:bg-bg-hover">
                  <div className={leg.action === "BUY" ? "text-signal-bull font-semibold" : "text-signal-bear font-semibold"}>{leg.action}</div>
                  <div className="text-ivory-400">{leg.type === "CALL" ? "CE" : "PE"}</div>
                  <div className="text-ivory-300 font-mono">{leg.strike}</div>
                  <div className="text-ivory-400 font-mono">{leg.premium}</div>
                  <div className={`font-mono ${cost >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>
                    {cost >= 0 ? "+" : ""}₹{Math.abs(cost).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
