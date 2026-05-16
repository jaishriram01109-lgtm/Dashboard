"use client";
import { useState } from "react";
import { BarChart3, ArrowUp, ArrowDown, Minus, TrendingUp, Filter } from "lucide-react";
import { sectorData, SECTOR_HEATMAP_COLORS } from "@/lib/mockData";
import type { SectorData, TimeFrame } from "@/lib/types";
import { cn, fmt, fmtPct, colorFromChange, signalColor, signalLabel, scoreColor, scoreBg, phaseColor } from "@/lib/utils";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  Tooltip, BarChart, Bar, XAxis, YAxis, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid,
} from "recharts";

const TIMEFRAMES: TimeFrame[] = ["1D", "1W", "1M", "3M", "1Y"];

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-ivory-600">{label}</span>
        <span className={cn("font-mono font-semibold", scoreColor(value))}>{value}</span>
      </div>
      <div className="h-1 bg-bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function SectorRow({ sector, rank }: { sector: SectorData; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const rankChange = sector.prevRank - sector.rank;

  return (
    <>
      <tr
        className={cn(
          "border-b border-bg-border/50 cursor-pointer transition-colors",
          expanded ? "bg-maroon-800/10" : "hover:bg-bg-hover"
        )}
        onClick={() => setExpanded(e => !e)}
      >
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-mono font-bold w-5 text-center",
              rank <= 3 ? "text-gold-500" : "text-ivory-500"
            )}>#{rank}</span>
            {rankChange !== 0 && (
              <span className={cn("text-[10px]", rankChange > 0 ? "text-signal-bull" : "text-signal-bear")}>
                {rankChange > 0 ? `▲${rankChange}` : `▼${Math.abs(rankChange)}`}
              </span>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5">
          <div className="font-semibold text-xs text-ivory-100">{sector.name}</div>
          <div className="text-[10px] text-ivory-500 font-mono">{sector.index}</div>
        </td>
        <td className="px-3 py-2.5">
          <div className="font-mono text-xs text-ivory-200">{fmt(sector.price)}</div>
          <div className={cn("text-[10px] font-mono", colorFromChange(sector.changePct))}>
            {fmtPct(sector.changePct)}
          </div>
        </td>
        <td className="px-3 py-2.5">
          <div className={cn("text-xs font-mono", colorFromChange(sector.weeklyChange))}>
            {fmtPct(sector.weeklyChange)}
          </div>
        </td>
        <td className="px-3 py-2.5">
          <div className={cn("text-xs font-mono", colorFromChange(sector.monthlyChange))}>
            {fmtPct(sector.monthlyChange)}
          </div>
        </td>
        <td className="px-3 py-2.5">
          <div className="w-24">
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-ivory-600">RS</span>
              <span className={cn("font-mono", scoreColor(sector.relativeStrength))}>{sector.relativeStrength}</span>
            </div>
            <div className="h-1 bg-bg-border rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", scoreBg(sector.relativeStrength))}
                style={{ width: `${sector.relativeStrength}%` }} />
            </div>
          </div>
        </td>
        <td className="px-3 py-2.5">
          <div className={cn(
            "text-center w-20 text-[11px] font-bold",
            scoreColor(sector.smartMoneyScore)
          )}>
            {sector.smartMoneyScore}
          </div>
        </td>
        <td className="px-3 py-2.5">
          <span className={cn(
            "label-tag border text-[10px]",
            signalColor(sector.signal)
          )}>
            {signalLabel(sector.signal)}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <span className={cn("text-xs font-semibold uppercase", phaseColor(sector.phase))}>
            {sector.phase}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <span className={cn(
            "label-tag",
            sector.breakoutProbability >= 80 ? "bg-signal-bull/15 text-signal-bull" :
            sector.breakoutProbability >= 60 ? "bg-yellow-500/15 text-yellow-400" :
            "bg-ivory-800/15 text-ivory-500"
          )}>
            {sector.breakoutProbability}%
          </span>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-maroon-900/10">
          <td colSpan={10} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scores */}
              <div className="space-y-2">
                <div className="text-[10px] text-ivory-500 uppercase tracking-wider font-semibold mb-2">Score Breakdown</div>
                <ScoreBar value={sector.relativeStrength} label="Relative Strength" color="#00E676" />
                <ScoreBar value={sector.momentumScore} label="Momentum" color="#00BCD4" />
                <ScoreBar value={sector.institutionalActivity} label="Institutional Activity" color="#B8860B" />
                <ScoreBar value={sector.smartMoneyScore} label="Smart Money" color="#8B0000" />
                <ScoreBar value={sector.breakoutProbability} label="Breakout Probability" color="#DC143C" />
              </div>

              {/* Flow data */}
              <div className="space-y-2">
                <div className="text-[10px] text-ivory-500 uppercase tracking-wider font-semibold mb-2">Institutional Exposure</div>
                {[
                  { label: "FII Holding", value: sector.fiiExposure, color: "bg-signal-bull" },
                  { label: "DII Holding", value: sector.diiExposure, color: "bg-signal-accumulate" },
                  { label: "MF Holding", value: sector.mfExposure, color: "bg-gold-500" },
                ].map(f => (
                  <div key={f.label}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-ivory-600">{f.label}</span>
                      <span className="font-mono text-ivory-200">{f.value}%</span>
                    </div>
                    <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", f.color)} style={{ width: `${Math.min(f.value * 2, 100)}%` }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 space-y-1.5 text-xs">
                  {[
                    { label: "Earnings Growth", value: `${sector.earningsGrowth}% YoY` },
                    { label: "PE Ratio", value: `${sector.peRatio}x` },
                    { label: "Govt Support", value: `${sector.govtSupport}/10` },
                    { label: "Risk Level", value: `${sector.riskLevel}/100` },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-ivory-500">{r.label}</span>
                      <span className="font-mono text-ivory-200">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI comment + top stocks */}
              <div className="space-y-3">
                <div className="text-[10px] text-ivory-500 uppercase tracking-wider font-semibold">AI Analysis</div>
                <p className="text-xs text-ivory-300 leading-relaxed">{sector.aiComment}</p>
                <div>
                  <div className="text-[10px] text-ivory-600 mb-1.5">Top Stocks</div>
                  <div className="flex flex-wrap gap-1.5">
                    {sector.topStocks.map(s => (
                      <span key={s} className="label-tag bg-maroon-800/20 text-maroon-300 border border-maroon-800/30">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ivory-600">Future Outlook:</span>
                  <span className={cn(
                    "label-tag",
                    sector.futureOutlook.includes("positive") ? "bg-signal-bull/15 text-signal-bull" :
                    sector.futureOutlook.includes("negative") ? "bg-signal-bear/15 text-signal-bear" :
                    "bg-yellow-500/15 text-yellow-400"
                  )}>
                    {sector.futureOutlook.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Heatmap component
function SectorHeatmap() {
  return (
    <div>
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">Sector Heatmap (1M Returns)</div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
        {sectorData.map(sector => {
          const pct = sector.monthlyChange;
          const intensity = Math.min(Math.abs(pct) / 20, 1);
          const isPositive = pct >= 0;
          const bg = isPositive
            ? `rgba(0, 230, 118, ${0.1 + intensity * 0.5})`
            : `rgba(255, 23, 68, ${0.1 + intensity * 0.5})`;
          return (
            <div
              key={sector.id}
              className="heatmap-cell rounded-lg p-2 text-center border border-bg-border/50"
              style={{ background: bg }}
            >
              <div className="text-[10px] font-semibold text-ivory-100 truncate">{sector.name.split(" ")[0]}</div>
              <div className={cn("text-xs font-mono font-bold mt-0.5", isPositive ? "text-signal-bull" : "text-signal-bear")}>
                {fmtPct(pct)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Scatter: RS vs Momentum
function RSvsMomentum() {
  const data = sectorData.map(s => ({
    x: s.relativeStrength,
    y: s.momentumScore,
    z: s.volumeExpansion * 30,
    name: s.name.split(" ")[0],
    phase: s.phase,
  }));

  const phaseColors: Record<string, string> = {
    markup: "#00E676",
    accumulation: "#00BCD4",
    distribution: "#FFB300",
    markdown: "#FF1744",
  };

  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
        Relative Strength vs Momentum Matrix
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 20, bottom: 20, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
            <XAxis dataKey="x" name="RS" type="number" domain={[20, 100]}
              label={{ value: "Relative Strength →", position: "insideBottom", offset: -10, fill: "#A09278", fontSize: 10 }}
              tick={{ fill: "#A09278", fontSize: 10 }} />
            <YAxis dataKey="y" name="Momentum" type="number" domain={[20, 100]}
              label={{ value: "Momentum →", angle: -90, position: "insideLeft", fill: "#A09278", fontSize: 10 }}
              tick={{ fill: "#A09278", fontSize: 10 }} />
            <ZAxis dataKey="z" range={[30, 200]} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-bg-card border border-bg-border rounded-lg p-2 text-xs">
                    <div className="font-bold text-ivory-100">{d.name}</div>
                    <div className="text-ivory-400">RS: {d.x} | Mom: {d.y}</div>
                  </div>
                );
              }}
            />
            <Scatter data={data} fill="#8B0000">
              {data.map((d, i) => (
                <Cell key={i} fill={phaseColors[d.phase] ?? "#8B0000"} fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-3 mt-1">
        {Object.entries(phaseColors).map(([phase, color]) => (
          <div key={phase} className="flex items-center gap-1.5 text-[10px] text-ivory-500">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {phase}
          </div>
        ))}
      </div>
    </div>
  );
}

// Rotation strength bar chart
function RotationChart() {
  const sorted = [...sectorData].sort((a, b) => b.rotationStrength - a.rotationStrength).slice(0, 8);
  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
        Rotation Strength Ranking
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 60 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#A09278", fontSize: 10 }} />
            <YAxis dataKey="name" type="category" width={55}
              tick={({ x, y, payload }) => (
                <text x={x} y={y} dy={4} textAnchor="end" fill="#A09278" fontSize={10}>
                  {payload.value.split(" ")[0]}
                </text>
              )} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-bg-card border border-bg-border rounded-lg p-2 text-xs">
                    <div className="font-bold text-ivory-100">{payload[0].payload.name}</div>
                    <div className="text-ivory-400">Rotation: {payload[0].value}</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="rotationStrength" radius={[0, 4, 4, 0]}>
              {sorted.map((s, i) => (
                <Cell key={i} fill={s.rotationStrength >= 80 ? "#00E676" : s.rotationStrength >= 60 ? "#00BCD4" : "#FFB300"} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function SectorRotation() {
  const [timeframe, setTimeframe] = useState<TimeFrame>("1M");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rank" | "rs" | "momentum" | "breakout">("rank");

  const phases = ["all", "markup", "accumulation", "distribution", "markdown"];

  const sorted = [...sectorData]
    .filter(s => filterPhase === "all" || s.phase === filterPhase)
    .sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "rs") return b.relativeStrength - a.relativeStrength;
      if (sortBy === "momentum") return b.momentumScore - a.momentumScore;
      if (sortBy === "breakout") return b.breakoutProbability - a.breakoutProbability;
      return 0;
    });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-maroon-600" />
            Sector Rotation Engine
          </h2>
          <p className="text-xs text-ivory-500">25 NSE sectors • Smart money flow • Institutional tracking</p>
        </div>
        <div className="flex items-center gap-2">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors",
                timeframe === tf
                  ? "bg-maroon-800 text-ivory-100"
                  : "text-ivory-500 hover:text-ivory-200 hover:bg-bg-hover"
              )}
            >{tf}</button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Leading Sectors", value: sectorData.filter(s => s.phase === "markup").length, color: "text-signal-bull", sub: "In markup phase" },
          { label: "Accumulating", value: sectorData.filter(s => s.phase === "accumulation").length, color: "text-signal-accumulate", sub: "Smart money building" },
          { label: "Distributing", value: sectorData.filter(s => s.phase === "distribution").length, color: "text-signal-distribute", sub: "Caution advised" },
          { label: "Declining", value: sectorData.filter(s => s.phase === "markdown").length, color: "text-signal-bear", sub: "Avoid fresh longs" },
        ].map(c => (
          <div key={c.label} className="card-glass rounded-xl p-3 text-center">
            <div className={cn("text-3xl font-mono font-bold", c.color)}>{c.value}</div>
            <div className="text-xs text-ivory-300 font-semibold mt-1">{c.label}</div>
            <div className="text-[10px] text-ivory-600">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RSvsMomentum />
        <RotationChart />
      </div>

      {/* Heatmap */}
      <div className="card-glass rounded-xl p-4">
        <SectorHeatmap />
      </div>

      {/* Filter + Table */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-ivory-500" />
            {phases.map(p => (
              <button
                key={p}
                onClick={() => setFilterPhase(p)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  filterPhase === p ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
                )}
              >{p}</button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs bg-bg-card border border-bg-border rounded px-2 py-1 text-ivory-300 outline-none"
          >
            <option value="rank">Sort: Overall Rank</option>
            <option value="rs">Sort: Relative Strength</option>
            <option value="momentum">Sort: Momentum</option>
            <option value="breakout">Sort: Breakout Probability</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-bg-border">
                {["Rank", "Sector", "Price", "1W", "1M", "Rel.Strength", "SM Score", "Signal", "Phase", "Breakout%"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((sector, i) => (
                <SectorRow key={sector.id} sector={sector} rank={i + 1} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
