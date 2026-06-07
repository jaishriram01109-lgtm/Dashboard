"use client";

import { useState } from "react";
import { Zap, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { useAngelQuotes } from "@/hooks/useAngelData";
import {
  LineChart,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TermStructurePoint {
  expiry: string;
  daysToExpiry: number;
  iv: number;
  atm: boolean;
}

interface IVSmilePoint {
  strike: number;
  nearCallIV: number;
  midCallIV: number;
  farCallIV: number;
}

interface VixHistoryPoint {
  date: string;
  vix: number;
  realizedVol: number;
}

interface IVPercentile {
  current: number;
  percentile30d: number;
  percentile90d: number;
  percentile1Y: number;
  regime: "LOW" | "NORMAL" | "HIGH";
}

interface IVByStrike {
  strike: number;
  callIV: number;
  putIV: number;
  callOI: number;
  putOI: number;
  ivSkew: number;
  isATM: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TERM_STRUCTURE: TermStructurePoint[] = [
  { expiry: "25-May", daysToExpiry: 10, iv: 12.8, atm: true },
  { expiry: "29-May", daysToExpiry: 14, iv: 13.4, atm: false },
  { expiry: "5-Jun",  daysToExpiry: 21, iv: 14.2, atm: false },
  { expiry: "19-Jun", daysToExpiry: 35, iv: 15.0, atm: false },
  { expiry: "26-Jun", daysToExpiry: 42, iv: 15.6, atm: false },
  { expiry: "31-Jul", daysToExpiry: 77, iv: 16.8, atm: false },
  { expiry: "28-Aug", daysToExpiry: 105, iv: 17.8, atm: false },
  { expiry: "25-Sep", daysToExpiry: 133, iv: 18.4, atm: false },
];

const IV_SMILE: IVSmilePoint[] = [
  { strike: 21000, nearCallIV: 22.4, midCallIV: 20.8, farCallIV: 19.4 },
  { strike: 21500, nearCallIV: 19.8, midCallIV: 18.4, farCallIV: 17.2 },
  { strike: 22000, nearCallIV: 17.2, midCallIV: 16.2, farCallIV: 15.4 },
  { strike: 22500, nearCallIV: 14.8, midCallIV: 14.2, farCallIV: 13.8 },
  { strike: 23000, nearCallIV: 13.2, midCallIV: 13.0, farCallIV: 12.8 },
  { strike: 23500, nearCallIV: 12.8, midCallIV: 12.6, farCallIV: 12.4 },
  { strike: 24000, nearCallIV: 13.4, midCallIV: 13.0, farCallIV: 12.8 },
  { strike: 24500, nearCallIV: 14.8, midCallIV: 14.2, farCallIV: 13.6 },
  { strike: 25000, nearCallIV: 16.8, midCallIV: 16.0, farCallIV: 15.2 },
  { strike: 25500, nearCallIV: 19.2, midCallIV: 18.2, farCallIV: 17.4 },
  { strike: 26000, nearCallIV: 21.8, midCallIV: 20.6, farCallIV: 19.6 },
];

const generateVixHistory = (): VixHistoryPoint[] => {
  const points: VixHistoryPoint[] = [];
  let vix = 16;
  let rv = 13;
  const today = new Date(2026, 4, 15);
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const mon = d.toLocaleString("en-IN", { month: "short" });
    vix += (Math.random() - 0.48) * 1.2;
    vix = Math.max(10, Math.min(22, vix));
    rv += (Math.random() - 0.49) * 1.0;
    rv = Math.max(8, Math.min(20, rv));
    points.push({
      date: `${day} ${mon}`,
      vix: Math.round(vix * 10) / 10,
      realizedVol: Math.round(rv * 10) / 10,
    });
  }
  return points;
};

const VIX_HISTORY: VixHistoryPoint[] = generateVixHistory();

const IV_PERCENTILE: IVPercentile = {
  current: 15.8,
  percentile30d: 42,
  percentile90d: 28,
  percentile1Y: 35,
  regime: "LOW",
};

const IV_BY_STRIKE: IVByStrike[] = [
  { strike: 22000, callIV: 17.2, putIV: 21.4, callOI: 284000, putOI: 420000, ivSkew: 4.2, isATM: false },
  { strike: 22500, callIV: 14.8, putIV: 18.4, callOI: 380000, putOI: 520000, ivSkew: 3.6, isATM: false },
  { strike: 23000, callIV: 13.2, putIV: 16.2, callOI: 620000, putOI: 840000, ivSkew: 3.0, isATM: false },
  { strike: 23500, callIV: 12.8, putIV: 14.8, callOI: 1240000, putOI: 1680000, ivSkew: 2.0, isATM: false },
  { strike: 24000, callIV: 13.4, putIV: 14.2, callOI: 2840000, putOI: 3240000, ivSkew: 0.8, isATM: true },
  { strike: 24500, callIV: 14.8, putIV: 13.4, callOI: 4820000, putOI: 2840000, ivSkew: -1.4, isATM: false },
  { strike: 25000, callIV: 16.8, putIV: 12.8, callOI: 3640000, putOI: 1840000, ivSkew: -4.0, isATM: false },
  { strike: 25500, callIV: 19.2, putIV: 12.2, callOI: 2240000, putOI: 980000, ivSkew: -7.0, isATM: false },
  { strike: 26000, callIV: 21.8, putIV: 11.8, callOI: 1420000, putOI: 540000, ivSkew: -10.0, isATM: false },
  { strike: 26500, callIV: 24.4, putIV: 11.4, callOI: 840000, putOI: 280000, ivSkew: -13.0, isATM: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Expiry = "Near" | "Mid" | "Far";

function regimeBadgeClass(regime: "LOW" | "NORMAL" | "HIGH"): string {
  if (regime === "LOW") return "bg-signal-bull/20 text-signal-bull";
  if (regime === "HIGH") return "bg-signal-bear/20 text-signal-bear";
  return "bg-signal-neutral/20 text-signal-neutral";
}

function percentileBarColor(pct: number): string {
  if (pct <= 33) return "bg-signal-bull";
  if (pct <= 66) return "bg-signal-neutral";
  return "bg-signal-bear";
}

function formatOI(oi: number): string {
  if (oi >= 1000000) return (oi / 1000000).toFixed(2) + "M";
  if (oi >= 1000) return (oi / 1000).toFixed(0) + "K";
  return String(oi);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VolatilitySurface() {
  const [selectedExpiry, setSelectedExpiry] = useState<Expiry>("Near");
  const { quotes, isLive } = useAngelQuotes();
  const ivp = IV_PERCENTILE;

  const atmDTE = TERM_STRUCTURE.find((t) => t.atm)?.daysToExpiry ?? 10;

  const expiryKeys: Expiry[] = ["Near", "Mid", "Far"];

  // Determine term structure shape (contango = IV rises with DTE, backwardation = IV falls)
  const firstIV = TERM_STRUCTURE[0].iv;
  const lastIV = TERM_STRUCTURE[TERM_STRUCTURE.length - 1].iv;
  const termShape = lastIV > firstIV ? "Contango" : "Backwardation";

  const liveVIX = quotes.get("INDIA_VIX")?.ltp;
  const currentVIX = liveVIX ?? VIX_HISTORY[VIX_HISTORY.length - 1].vix;
  const currentRV = VIX_HISTORY[VIX_HISTORY.length - 1].realizedVol;
  const ivRVSpread = Math.round((currentVIX - currentRV) * 10) / 10;
  const spreadLabel = ivRVSpread > 0 ? "Rich" : "Cheap";
  const spreadColor = ivRVSpread > 0 ? "text-signal-bear" : "text-signal-bull";

  return (
    <div className="bg-bg-primary min-h-screen p-4 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-gold-400" />
        <h1 className="text-xl font-display font-bold text-ivory-100">Volatility Surface</h1>
        <span className="text-xs text-ivory-600 bg-bg-card border border-bg-border rounded px-2 py-0.5">
          NIFTY Options
        </span>
        {isLive && liveVIX && (
          <span className="label-tag bg-signal-bull/15 text-signal-bull text-[9px]">● VIX LIVE</span>
        )}
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-bg-card border border-bg-border rounded-lg p-3">
          <span className="text-xs text-ivory-600 uppercase tracking-wider">India VIX</span>
          <div className="text-3xl font-mono font-bold text-maroon-400 mt-1">{currentVIX.toFixed(1)}</div>
          <div className="text-xs text-ivory-600">Current</div>
        </div>

        <div className="bg-bg-card border border-bg-border rounded-lg p-3">
          <span className="text-xs text-ivory-600 uppercase tracking-wider">IV Percentile (1Y)</span>
          <div className="text-3xl font-mono font-bold text-ivory-100 mt-1">{ivp.percentile1Y}%</div>
          <div className="w-full bg-bg-border rounded-full h-1.5 mt-1">
            <div className={"h-1.5 rounded-full " + percentileBarColor(ivp.percentile1Y)} style={{ width: ivp.percentile1Y + "%" }} />
          </div>
        </div>

        <div className="bg-bg-card border border-bg-border rounded-lg p-3">
          <span className="text-xs text-ivory-600 uppercase tracking-wider">Realized Vol (30D)</span>
          <div className="text-3xl font-mono font-bold text-signal-accumulate mt-1">{currentRV.toFixed(1)}%</div>
          <div className="text-xs text-ivory-600">Historical</div>
        </div>

        <div className="bg-bg-card border border-bg-border rounded-lg p-3">
          <span className="text-xs text-ivory-600 uppercase tracking-wider">IV – RV Spread</span>
          <div className={"text-3xl font-mono font-bold mt-1 " + spreadColor}>
            {ivRVSpread > 0 ? "+" : ""}{ivRVSpread.toFixed(1)}
          </div>
          <div className={"text-xs font-semibold " + spreadColor}>Options {spreadLabel}</div>
        </div>

        <div className="bg-bg-card border border-bg-border rounded-lg p-3">
          <span className="text-xs text-ivory-600 uppercase tracking-wider">Vol Regime</span>
          <div className="mt-1">
            <span className={"text-sm font-bold px-3 py-1.5 rounded " + regimeBadgeClass(ivp.regime)}>
              {ivp.regime}
            </span>
          </div>
          <div className="text-xs text-ivory-600 mt-1">Current regime</div>
        </div>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: IV Term Structure */}
        <div className="bg-bg-card border border-bg-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ivory-200">IV Term Structure</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-gold-500/20 text-gold-400">{termShape}</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TERM_STRUCTURE} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
              <XAxis
                dataKey="daysToExpiry"
                tick={{ fill: "#5C5233", fontSize: 10 }}
                tickLine={false}
                label={{ value: "DTE", position: "insideBottomRight", offset: -4, fill: "#5C5233", fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: "#5C5233", fontSize: 10 }}
                tickLine={false}
                width={32}
                domain={[10, 22]}
                tickFormatter={(v: number) => v + "%"}
              />
              <Tooltip
                contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6 }}
                labelStyle={{ color: "#E5D9B6" }}
                formatter={(value: number) => [value.toFixed(1) + "%", "IV"]}
                labelFormatter={(label: number) => "DTE: " + label}
              />
              <ReferenceLine
                x={atmDTE}
                stroke="#DAA520"
                strokeDasharray="4 2"
                label={{ value: "ATM", position: "top", fill: "#DAA520", fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="iv"
                name="IV%"
                stroke="#8B0000"
                strokeWidth={2}
                dot={{ fill: "#8B0000", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-ivory-600">
            Near-term ATM IV: {TERM_STRUCTURE[0].iv.toFixed(1)}% | Far-term: {TERM_STRUCTURE[TERM_STRUCTURE.length - 1].iv.toFixed(1)}%
          </div>
        </div>

        {/* Panel 2: IV Smile */}
        <div className="bg-bg-card border border-bg-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-ivory-200">IV Smile — Call IV by Strike</h2>
          </div>
          <div className="flex gap-1 mb-3">
            {expiryKeys.map((exp) => (
              <button
                key={exp}
                onClick={() => setSelectedExpiry(exp)}
                className={
                  "text-xs px-2 py-0.5 rounded border transition-colors " +
                  (selectedExpiry === exp
                    ? "border-maroon-700 bg-maroon-800/30 text-maroon-300"
                    : "border-bg-border bg-transparent text-ivory-600 hover:border-bg-hover")
                }
              >
                {exp}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={IV_SMILE} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
              <XAxis
                dataKey="strike"
                tick={{ fill: "#5C5233", fontSize: 9 }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: "#5C5233", fontSize: 10 }}
                tickLine={false}
                width={32}
                domain={[10, 26]}
                tickFormatter={(v: number) => v + "%"}
              />
              <Tooltip
                contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6 }}
                labelStyle={{ color: "#E5D9B6" }}
                formatter={(value: number) => [value.toFixed(1) + "%", "IV"]}
                labelFormatter={(label: number) => "Strike: " + label}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: "#B8A870" }} />
              <Line
                type="monotone"
                dataKey="nearCallIV"
                name="Near (25-May)"
                stroke="#FF1744"
                strokeWidth={selectedExpiry === "Near" ? 2.5 : 1}
                dot={false}
                strokeOpacity={selectedExpiry === "Near" ? 1 : 0.4}
              />
              <Line
                type="monotone"
                dataKey="midCallIV"
                name="Mid (19-Jun)"
                stroke="#FFD700"
                strokeWidth={selectedExpiry === "Mid" ? 2.5 : 1}
                dot={false}
                strokeOpacity={selectedExpiry === "Mid" ? 1 : 0.4}
              />
              <Line
                type="monotone"
                dataKey="farCallIV"
                name="Far (25-Sep)"
                stroke="#00BCD4"
                strokeWidth={selectedExpiry === "Far" ? 2.5 : 1}
                dot={false}
                strokeOpacity={selectedExpiry === "Far" ? 1 : 0.4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Panel 3: VIX History */}
        <div className="bg-bg-card border border-bg-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-ivory-200 mb-3">VIX vs Realized Vol — 60 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={VIX_HISTORY} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#5C5233", fontSize: 9 }}
                tickLine={false}
                interval={9}
              />
              <YAxis
                tick={{ fill: "#5C5233", fontSize: 10 }}
                tickLine={false}
                width={32}
                domain={[6, 24]}
                tickFormatter={(v: number) => v + "%"}
              />
              <Tooltip
                contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6 }}
                labelStyle={{ color: "#E5D9B6" }}
                formatter={(value: number) => [value.toFixed(1) + "%"]}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: "#B8A870" }} />
              <Area
                type="monotone"
                dataKey="vix"
                name="India VIX"
                stroke="#8B0000"
                fill="#8B000033"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="realizedVol"
                name="Realized Vol (30D)"
                stroke="#00E676"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* IV Percentile Gauges */}
        <div className="bg-bg-card border border-bg-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-ivory-200 mb-4">IV Percentile Gauges</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ivory-500">Current IV</span>
                <span className="text-ivory-200 font-mono">{ivp.current.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-bg-border rounded-full h-2">
                <div
                  className="bg-maroon-600 h-2 rounded-full"
                  style={{ width: Math.min(100, (ivp.current / 25) * 100).toFixed(0) + "%" }}
                />
              </div>
            </div>
            {[
              { label: "30D Percentile", value: ivp.percentile30d },
              { label: "90D Percentile", value: ivp.percentile90d },
              { label: "1Y Percentile", value: ivp.percentile1Y },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ivory-500">{row.label}</span>
                  <span className="text-ivory-200 font-mono font-semibold">{row.value}th</span>
                </div>
                <div className="w-full bg-bg-border rounded-full h-2">
                  <div
                    className={"h-2 rounded-full " + percentileBarColor(row.value)}
                    style={{ width: row.value + "%" }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-2 p-2 bg-bg-secondary rounded text-xs text-ivory-600 border border-bg-border">
              LOW (0–33): Cheap options, buy vol.{" "}
              NORMAL (34–66): Fair value.{" "}
              HIGH (67–100): Expensive, sell vol.
            </div>
          </div>
        </div>

        {/* IV Skew Table */}
        <div className="bg-bg-card border border-bg-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-ivory-200 mb-3">IV Skew by Strike</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-ivory-700 uppercase tracking-wider border-b border-bg-border">
                  <th className="text-left pb-2 pr-2">Strike</th>
                  <th className="text-center pb-2 px-1">Call IV</th>
                  <th className="text-center pb-2 px-1">Put IV</th>
                  <th className="text-center pb-2 px-1">Skew</th>
                  <th className="text-center pb-2 px-1">Call OI</th>
                  <th className="text-center pb-2 px-1">Put OI</th>
                </tr>
              </thead>
              <tbody>
                {IV_BY_STRIKE.map((row) => {
                  const rowClass = row.isATM
                    ? "border-b border-gold-600/30 bg-gold-500/5"
                    : "border-b border-bg-border/50 hover:bg-bg-hover";
                  const skewClass = row.ivSkew > 0 ? "text-signal-bear" : row.ivSkew < 0 ? "text-signal-bull" : "text-ivory-400";
                  return (
                    <tr key={row.strike} className={rowClass}>
                      <td className="py-1.5 pr-2 font-mono text-ivory-300 font-semibold">
                        {row.strike}
                        {row.isATM ? " *" : ""}
                      </td>
                      <td className="py-1.5 px-1 text-center font-mono text-signal-bull">{row.callIV.toFixed(1)}</td>
                      <td className="py-1.5 px-1 text-center font-mono text-signal-bear">{row.putIV.toFixed(1)}</td>
                      <td className={"py-1.5 px-1 text-center font-mono " + skewClass}>
                        {row.ivSkew > 0 ? "+" : ""}{row.ivSkew.toFixed(1)}
                      </td>
                      <td className="py-1.5 px-1 text-center text-ivory-600">{formatOI(row.callOI)}</td>
                      <td className="py-1.5 px-1 text-center text-ivory-600">{formatOI(row.putOI)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-2 text-xs text-ivory-700">* ATM strike | Skew = Put IV – Call IV</div>
          </div>
        </div>

        {/* Vol Regime History */}
        <div className="bg-bg-card border border-bg-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-ivory-200 mb-3">Vol Regime — 30 Days</h2>
          <div className="space-y-1 mb-3">
            {Array.from({ length: 30 }).map((_, i) => {
              const day = 29 - i;
              // Assign regime based on simple pattern for mock purposes
              const regimeIdx = (i + 3) % 7;
              const regime: "LOW" | "NORMAL" | "HIGH" =
                regimeIdx < 3 ? "LOW" : regimeIdx < 6 ? "NORMAL" : "HIGH";
              const barColor =
                regime === "LOW"
                  ? "bg-signal-bull"
                  : regime === "HIGH"
                  ? "bg-signal-bear"
                  : "bg-signal-neutral";
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-ivory-700 w-5 text-right">{day === 0 ? "T" : "-" + day}</span>
                  <div className="flex-1 h-3 bg-bg-border rounded-sm overflow-hidden">
                    <div className={"h-full rounded-sm " + barColor} style={{ width: "100%" }} />
                  </div>
                  <span className={"text-xs w-10 " + (regime === "LOW" ? "text-signal-bull" : regime === "HIGH" ? "text-signal-bear" : "text-signal-neutral")}>
                    {regime}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-bg-border pt-3 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-signal-bull flex-shrink-0" />
              <span className="text-ivory-600">LOW: VIX below 13. Options cheap, buy strategies favored.</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-signal-neutral flex-shrink-0" />
              <span className="text-ivory-600">NORMAL: VIX 13–18. Neutral strategies (strangles, spreads).</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-signal-bear flex-shrink-0" />
              <span className="text-ivory-600">HIGH: VIX above 18. Sell premium, reduce leverage.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
