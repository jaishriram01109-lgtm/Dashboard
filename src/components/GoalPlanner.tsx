"use client";

import { useState, useMemo } from "react";
import { Target, TrendingUp, Calendar, DollarSign } from "lucide-react";
import {
  AreaChart, BarChart, LineChart,
  Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

interface Goal {
  id: string; name: string; targetAmount: number; currentSaved: number;
  monthlyContrib: number; returnRate: number; years: number;
  priority: "HIGH" | "MEDIUM" | "LOW"; category: string;
}

const PRESET_GOALS: Goal[] = [
  { id: "retirement", name: "Retirement Corpus",     targetAmount: 10000000, currentSaved: 2450000, monthlyContrib: 25000, returnRate: 12, years: 20, priority: "HIGH",   category: "Retirement" },
  { id: "house",      name: "Dream House",            targetAmount: 8000000,  currentSaved: 1200000, monthlyContrib: 30000, returnRate: 10, years: 8,  priority: "HIGH",   category: "Real Estate" },
  { id: "child-edu",  name: "Child's Education",      targetAmount: 3000000,  currentSaved: 450000,  monthlyContrib: 15000, returnRate: 12, years: 12, priority: "HIGH",   category: "Education" },
  { id: "car",        name: "Luxury Car",             targetAmount: 2000000,  currentSaved: 200000,  monthlyContrib: 20000, returnRate: 8,  years: 5,  priority: "MEDIUM", category: "Lifestyle" },
  { id: "vacation",   name: "Europe Trip",            targetAmount: 500000,   currentSaved: 80000,   monthlyContrib: 10000, returnRate: 7,  years: 2,  priority: "LOW",    category: "Travel" },
  { id: "emergency",  name: "Emergency Fund (6M)",    targetAmount: 600000,   currentSaved: 380000,  monthlyContrib: 20000, returnRate: 6,  years: 1,  priority: "HIGH",   category: "Safety Net" },
];

function futureValue(pv: number, pmt: number, r: number, n: number): number {
  const monthly = r / 100 / 12;
  if (monthly === 0) return pv + pmt * n * 12;
  return pv * Math.pow(1 + monthly, n * 12) + pmt * ((Math.pow(1 + monthly, n * 12) - 1) / monthly);
}

function requiredSIP(target: number, pv: number, r: number, n: number): number {
  const monthly = r / 100 / 12;
  const months = n * 12;
  if (monthly === 0) return (target - pv) / months;
  const fvPV = pv * Math.pow(1 + monthly, months);
  const remaining = target - fvPV;
  if (remaining <= 0) return 0;
  return remaining / ((Math.pow(1 + monthly, months) - 1) / monthly);
}

export default function GoalPlanner() {
  const [selectedGoal, setSelectedGoal] = useState("retirement");
  const [inflation, setInflation] = useState(6);
  const [stepUp, setStepUp] = useState(10);

  const goal = PRESET_GOALS.find((g) => g.id === selectedGoal) ?? PRESET_GOALS[0];

  const projectedCorpus = futureValue(goal.currentSaved, goal.monthlyContrib, goal.returnRate, goal.years);
  const inflationAdjustedTarget = goal.targetAmount * Math.pow(1 + inflation / 100, goal.years);
  const reqSIP = requiredSIP(inflationAdjustedTarget, goal.currentSaved, goal.returnRate, goal.years);
  const onTrack = projectedCorpus >= inflationAdjustedTarget;
  const progressPct = Math.min(100, (goal.currentSaved / inflationAdjustedTarget) * 100);

  const growthData = useMemo(() => {
    const points = [];
    for (let y = 0; y <= goal.years; y++) {
      const corpus = futureValue(goal.currentSaved, goal.monthlyContrib, goal.returnRate, y);
      const stepUpCorpus = (() => {
        let val = goal.currentSaved;
        let sip = goal.monthlyContrib;
        for (let m = 0; m < y * 12; m++) {
          val = val * (1 + goal.returnRate / 100 / 12) + sip;
          if (m > 0 && m % 12 === 0) sip *= (1 + stepUp / 100);
        }
        return val;
      })();
      const inflTarget = goal.targetAmount * Math.pow(1 + inflation / 100, y);
      points.push({
        year: `Y${y}`,
        corpus: Math.round(corpus),
        stepUp: Math.round(stepUpCorpus),
        target: Math.round(inflTarget),
      });
    }
    return points;
  }, [goal, inflation, stepUp]);

  const allGoalsProgress = PRESET_GOALS.map((g) => {
    const projected = futureValue(g.currentSaved, g.monthlyContrib, g.returnRate, g.years);
    const adjTarget = g.targetAmount * Math.pow(1 + inflation / 100, g.years);
    return { name: g.name.substring(0, 12), projected: Math.round(projected / 100000), target: Math.round(adjTarget / 100000), onTrack: projected >= adjTarget };
  });

  const priorityColor: Record<Goal["priority"], string> = {
    HIGH: "bg-signal-bear/20 text-signal-bear",
    MEDIUM: "bg-gold-500/20 text-gold-500",
    LOW: "bg-ivory-700/20 text-ivory-500",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Financial Goal Planner</h2>
          <p className="text-xs text-ivory-500 mt-0.5">Inflation-adjusted targets · Step-up SIP · Corpus projection</p>
        </div>
        <div className="flex gap-2 text-[10px] text-ivory-600">
          <span>Inflation: <span className="text-ivory-300 font-semibold">{inflation}%</span></span>
          <span>SIP Step-up: <span className="text-ivory-300 font-semibold">{stepUp}%</span></span>
        </div>
      </div>

      {/* Global controls */}
      <div className="card-base p-3 grid grid-cols-2 gap-4">
        {[
          { label: "Inflation Rate", value: inflation, min: 3, max: 10, step: 0.5, set: setInflation },
          { label: "Annual SIP Step-up", value: stepUp, min: 0, max: 25, step: 1, set: setStepUp },
        ].map(({ label, value, min, max, step, set }) => (
          <div key={label}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-ivory-600 uppercase tracking-wider">{label}</span>
              <span className="text-ivory-300 font-semibold">{value}%</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))}
              className="w-full h-1.5 rounded appearance-none bg-bg-border accent-maroon-600 cursor-pointer" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Goal selector */}
        <div className="space-y-2">
          <div className="text-[10px] text-ivory-600 uppercase tracking-wider">Select Goal</div>
          {PRESET_GOALS.map((g) => {
            const proj = futureValue(g.currentSaved, g.monthlyContrib, g.returnRate, g.years);
            const adjT = g.targetAmount * Math.pow(1 + inflation / 100, g.years);
            const track = proj >= adjT;
            const pct = Math.min(100, (g.currentSaved / adjT) * 100);
            return (
              <button key={g.id} onClick={() => setSelectedGoal(g.id)}
                className={`w-full card-base p-3 text-left border transition-all ${selectedGoal === g.id ? "border-maroon-700/60 bg-maroon-900/20" : "border-transparent hover:border-bg-border"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-ivory-200">{g.name}</span>
                  <div className="flex gap-1">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${priorityColor[g.priority]}`}>{g.priority}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${track ? "bg-signal-bull/20 text-signal-bull" : "bg-signal-bear/20 text-signal-bear"}`}>{track ? "ON TRACK" : "BEHIND"}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${track ? "bg-signal-bull" : "bg-gold-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-ivory-700 mt-0.5">
                  <span>{pct.toFixed(0)}% funded</span>
                  <span>₹{(g.targetAmount / 100000).toFixed(0)}L target</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Goal details */}
        <div className="xl:col-span-2 space-y-3">
          <div className="card-base p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-ivory-100">{goal.name}</div>
                <div className="text-[10px] text-ivory-500">{goal.category} · {goal.years} years · {goal.returnRate}% expected return</div>
              </div>
              <div className={`text-xs font-bold px-3 py-1 rounded ${onTrack ? "bg-signal-bull/20 text-signal-bull" : "bg-signal-bear/20 text-signal-bear"}`}>
                {onTrack ? "ON TRACK" : "BEHIND TARGET"}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {[
                { label: "Current Saved", value: `₹${(goal.currentSaved / 100000).toFixed(1)}L`, color: "text-ivory-200" },
                { label: "Projected Corpus", value: `₹${(projectedCorpus / 100000).toFixed(1)}L`, color: "text-signal-bull" },
                { label: "Inflation Adj. Target", value: `₹${(inflationAdjustedTarget / 100000).toFixed(1)}L`, color: "text-gold-500" },
                { label: "Required SIP", value: `₹${Math.round(reqSIP).toLocaleString()}/mo`, color: onTrack ? "text-signal-bull" : "text-signal-bear" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-bg-primary rounded-lg p-2">
                  <div className="text-[9px] text-ivory-600">{label}</div>
                  <div className={`text-sm font-bold font-mono mt-0.5 ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-ivory-600">
                <span>Funding Progress</span>
                <span className="text-ivory-300 font-semibold">{progressPct.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-bg-border rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${progressPct > 50 ? "bg-signal-bull" : progressPct > 25 ? "bg-gold-500" : "bg-signal-bear"}`}
                  style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-ivory-700">
                <span>₹0</span>
                <span>₹{(inflationAdjustedTarget / 100000).toFixed(1)}L (inflation adjusted)</span>
              </div>
            </div>
          </div>

          {/* Growth chart */}
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Corpus Growth Projection</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={growthData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="year" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`₹${(v / 100000).toFixed(1)}L`, ""]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                <Area dataKey="corpus" name="Flat SIP" stroke="#7c1d1d" fill="#7c1d1d" fillOpacity={0.2} strokeWidth={1.5} dot={false} />
                <Area dataKey="stepUp" name={`Step-up SIP +${stepUp}%`} stroke="#166534" fill="#166534" fillOpacity={0.2} strokeWidth={1.5} dot={false} />
                <Line dataKey="target" name="Target (inflation adj.)" stroke="#d4af37" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* All goals comparison */}
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">All Goals — Projected vs Target (₹ Lakh)</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={allGoalsProgress} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="name" tick={{ fill: "#8a7a6a", fontSize: 8 }} tickLine={false} angle={-20} textAnchor="end" />
                <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`₹${v}L`, ""]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                <Bar dataKey="projected" name="Projected" fill="#166534" radius={[2, 2, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#7c1d1d" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
