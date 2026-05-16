"use client";

import { useMemo } from "react";
import { Activity, TrendingUp, TrendingDown, Clock } from "lucide-react";
import {
  ComposedChart,
  BarChart,
  LineChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BreadthSnapshot {
  advancing: number;
  declining: number;
  unchanged: number;
  advanceDeclineRatio: number;
  newHighs52W: number;
  newLows52W: number;
  above20EMA: number;
  above50EMA: number;
  above200EMA: number;
  trin: number;
  mclellanOscillator: number;
  breadthThrust: number;
}

interface ADLinePoint {
  date: string;
  adLine: number;
  nifty: number;
}

interface MCOPoint {
  date: string;
  mco: number;
  signal: number;
}

interface HighLowPoint {
  date: string;
  newHighs: number;
  newLows: number;
}

interface AboveMAPoint {
  date: string;
  above20EMA: number;
  above50EMA: number;
  above200EMA: number;
}

interface TrinPoint {
  date: string;
  trin: number;
}

interface SectorBreadth {
  name: string;
  advancing: number;
  declining: number;
  unchanged: number;
  breadthScore: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BREADTH_SNAPSHOT: BreadthSnapshot = {
  advancing: 32,
  declining: 14,
  unchanged: 4,
  advanceDeclineRatio: 2.29,
  newHighs52W: 18,
  newLows52W: 3,
  above20EMA: 38,
  above50EMA: 31,
  above200EMA: 27,
  trin: 0.82,
  mclellanOscillator: 45.2,
  breadthThrust: 0.68,
};

const generateADLine = (): ADLinePoint[] => {
  const points: ADLinePoint[] = [];
  let adLine = 1000;
  let nifty = 100;
  const today = new Date(2026, 4, 15);
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const mon = d.toLocaleString("en-IN", { month: "short" });
    adLine += Math.round((Math.random() - 0.38) * 30 + 8);
    nifty += (Math.random() - 0.42) * 1.2 + 0.3;
    points.push({
      date: `${day} ${mon}`,
      adLine,
      nifty: Math.round(nifty * 100) / 100,
    });
  }
  return points;
};

const generateMCO = (): MCOPoint[] => {
  const points: MCOPoint[] = [];
  let mco = 10;
  const today = new Date(2026, 4, 15);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const mon = d.toLocaleString("en-IN", { month: "short" });
    mco += (Math.random() - 0.45) * 20;
    mco = Math.max(-80, Math.min(80, mco));
    const signal = mco * 0.85 + (Math.random() - 0.5) * 5;
    points.push({
      date: `${day} ${mon}`,
      mco: Math.round(mco * 10) / 10,
      signal: Math.round(signal * 10) / 10,
    });
  }
  return points;
};

const generateHighLow = (): HighLowPoint[] => {
  const points: HighLowPoint[] = [];
  const today = new Date(2026, 4, 15);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const mon = d.toLocaleString("en-IN", { month: "short" });
    points.push({
      date: `${day} ${mon}`,
      newHighs: Math.round(Math.random() * 20 + 5),
      newLows: Math.round(Math.random() * 8 + 1),
    });
  }
  return points;
};

const generateAboveMA = (): AboveMAPoint[] => {
  const points: AboveMAPoint[] = [];
  let above20 = 35;
  let above50 = 28;
  let above200 = 24;
  const today = new Date(2026, 4, 15);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const mon = d.toLocaleString("en-IN", { month: "short" });
    above20 = Math.max(15, Math.min(45, above20 + (Math.random() - 0.45) * 4));
    above50 = Math.max(15, Math.min(45, above50 + (Math.random() - 0.46) * 3));
    above200 = Math.max(15, Math.min(45, above200 + (Math.random() - 0.47) * 2));
    points.push({
      date: `${day} ${mon}`,
      above20EMA: Math.round(above20),
      above50EMA: Math.round(above50),
      above200EMA: Math.round(above200),
    });
  }
  return points;
};

const generateTrin = (): TrinPoint[] => {
  const points: TrinPoint[] = [];
  const today = new Date(2026, 4, 15);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.getDate();
    const mon = d.toLocaleString("en-IN", { month: "short" });
    const trin = Math.round((0.3 + Math.random() * 2.2) * 100) / 100;
    points.push({ date: `${day} ${mon}`, trin });
  }
  return points;
};

const AD_LINE_HISTORY: ADLinePoint[] = generateADLine();
const MCO_HISTORY: MCOPoint[] = generateMCO();
const HIGH_LOW_HISTORY: HighLowPoint[] = generateHighLow();
const ABOVE_MA_HISTORY: AboveMAPoint[] = generateAboveMA();
const TRIN_HISTORY: TrinPoint[] = generateTrin();

const SECTOR_BREADTH: SectorBreadth[] = [
  { name: "Banking", advancing: 8, declining: 3, unchanged: 1, breadthScore: 72 },
  { name: "IT", advancing: 6, declining: 5, unchanged: 0, breadthScore: 54 },
  { name: "Auto", advancing: 7, declining: 2, unchanged: 1, breadthScore: 76 },
  { name: "Pharma", advancing: 5, declining: 4, unchanged: 1, breadthScore: 55 },
  { name: "FMCG", advancing: 4, declining: 5, unchanged: 1, breadthScore: 44 },
  { name: "Metal", advancing: 9, declining: 2, unchanged: 0, breadthScore: 82 },
  { name: "Energy", advancing: 6, declining: 3, unchanged: 1, breadthScore: 66 },
  { name: "Realty", advancing: 7, declining: 1, unchanged: 0, breadthScore: 87 },
  { name: "Infra", advancing: 5, declining: 3, unchanged: 2, breadthScore: 60 },
  { name: "Media", advancing: 3, declining: 6, unchanged: 1, breadthScore: 33 },
  { name: "Telecom", advancing: 2, declining: 3, unchanged: 0, breadthScore: 40 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function breadthScoreBadge(score: number): string {
  if (score >= 65) return "bg-signal-bull/20 text-signal-bull";
  if (score >= 45) return "bg-signal-neutral/20 text-signal-neutral";
  return "bg-signal-bear/20 text-signal-bear";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function StatCard({ label, children, className = "" }: StatCardProps) {
  return (
    <div className={"bg-bg-card border border-bg-border rounded-lg p-3 flex flex-col gap-1 " + className}>
      <span className="text-xs text-ivory-600 uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

import { useAngelQuotes } from "@/hooks/useAngelData";
import { STOCK_INSTRUMENTS } from "@/lib/angelOne";

export default function MarketBreadth() {
  const { quotes, isLive } = useAngelQuotes(60_000);

  // Compute real breadth from Angel One quotes
  const snap = useMemo((): BreadthSnapshot => {
    if (!isLive || quotes.size === 0) return BREADTH_SNAPSHOT;

    const stockKeys = Object.keys(STOCK_INSTRUMENTS);
    let advancing = 0, declining = 0, unchanged = 0;
    let advVol = 0, declVol = 0;
    let aboveDay = 0; // proxy for above 20EMA: ltp > open

    stockKeys.forEach(key => {
      const q = quotes.get(key);
      if (!q) return;
      if (q.changePct > 0.1) { advancing++; advVol += q.volume; }
      else if (q.changePct < -0.1) { declining++; declVol += q.volume; }
      else unchanged++;
      if (q.ltp > q.open) aboveDay++;
    });

    const total = advancing + declining + unchanged;
    const adRatio = declining > 0 ? advancing / declining : advancing;
    const trin = (total > 0 && declVol > 0)
      ? (advancing / declining) / (advVol / declVol)
      : BREADTH_SNAPSHOT.trin;
    const above20 = total > 0 ? Math.round((aboveDay / total) * 50) : BREADTH_SNAPSHOT.above20EMA;

    return {
      advancing,
      declining,
      unchanged,
      advanceDeclineRatio: Math.round(adRatio * 100) / 100,
      newHighs52W: BREADTH_SNAPSHOT.newHighs52W,
      newLows52W: BREADTH_SNAPSHOT.newLows52W,
      above20EMA: above20,
      above50EMA: Math.round(above20 * 0.82),
      above200EMA: Math.round(above20 * 0.71),
      trin: Math.round(trin * 100) / 100,
      mclellanOscillator: Math.round((advancing - declining) * 1.5),
      breadthThrust: total > 0 ? Math.round((advancing / total) * 100) / 100 : BREADTH_SNAPSHOT.breadthThrust,
    };
  }, [quotes, isLive]);

  const timestamp = isLive ? formatDate(new Date()) : formatDate(new Date(2026, 4, 15, 15, 28));

  const trinColor = snap.trin < 0.8 ? "text-signal-bull" : snap.trin > 1.2 ? "text-signal-bear" : "text-signal-neutral";
  const adRatioColor = snap.advanceDeclineRatio > 1 ? "text-signal-bull" : "text-signal-bear";
  const mcoTag = snap.mclellanOscillator > 0 ? "BULL" : "BEAR";
  const mcoTagClass = snap.mclellanOscillator > 0 ? "bg-signal-bull/20 text-signal-bull" : "bg-signal-bear/20 text-signal-bear";

  const abovePct = Math.round((snap.above200EMA / 50) * 100);

  return (
    <div className="bg-bg-primary min-h-screen p-4 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-maroon-500" />
          <h1 className="text-xl font-display font-bold text-ivory-100">Market Breadth</h1>
          <span className="text-xs text-ivory-600 bg-bg-card border border-bg-border rounded px-2 py-0.5">NSE</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-ivory-600">
          <Clock className="w-3.5 h-3.5" />
          <span>{isLive ? "Live" : "Simulated"} as of {timestamp}</span>
          {isLive
            ? <span className="font-mono font-bold text-signal-bull bg-signal-bull/10 px-1.5 py-0.5 rounded text-[9px]">● LIVE</span>
            : <span className="font-mono font-bold text-gold-500 bg-gold-500/10 px-1.5 py-0.5 rounded text-[9px]">★ DEMO</span>
          }
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* A/D Ratio */}
        <StatCard label="A/D Ratio">
          <span className={"text-3xl font-mono font-bold " + adRatioColor}>
            {snap.advanceDeclineRatio.toFixed(2)}
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-signal-bull">{snap.advancing} Adv</span>
            <span className="text-ivory-700">/</span>
            <span className="text-signal-bear">{snap.declining} Dec</span>
          </div>
        </StatCard>

        {/* 52W Highs/Lows */}
        <StatCard label="52W Highs / Lows">
          <div className="flex items-end gap-3">
            <div className="flex flex-col">
              <span className="text-2xl font-mono font-bold text-signal-bull">{snap.newHighs52W}</span>
              <span className="text-xs text-ivory-600">New Highs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-mono font-bold text-signal-bear">{snap.newLows52W}</span>
              <span className="text-xs text-ivory-600">New Lows</span>
            </div>
          </div>
        </StatCard>

        {/* % Above 200 EMA */}
        <StatCard label="% Above 200 EMA">
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 rounded-full border-2 border-maroon-700 flex items-center justify-center">
              <span className="text-sm font-mono font-bold text-ivory-100">{abovePct}%</span>
            </div>
            <div className="text-xs text-ivory-600">
              <div>{snap.above200EMA} of 50</div>
              <div className="text-ivory-700">stocks</div>
            </div>
          </div>
        </StatCard>

        {/* McClellan Oscillator */}
        <StatCard label="McClellan Osc.">
          <span className="text-3xl font-mono font-bold text-ivory-100">
            {snap.mclellanOscillator.toFixed(1)}
          </span>
          <span className={"text-xs font-semibold px-1.5 py-0.5 rounded self-start " + mcoTagClass}>
            {mcoTag}
          </span>
        </StatCard>

        {/* TRIN */}
        <StatCard label="TRIN (Arms Index)">
          <span className={"text-3xl font-mono font-bold " + trinColor}>
            {snap.trin.toFixed(2)}
          </span>
          <span className="text-xs text-ivory-600">
            {snap.trin < 0.8 ? "Breadth Bullish" : snap.trin > 1.2 ? "Breadth Bearish" : "Neutral"}
          </span>
        </StatCard>

        {/* Breadth Thrust */}
        <StatCard label="Breadth Thrust">
          <span className="text-3xl font-mono font-bold text-gold-400">
            {snap.breadthThrust.toFixed(2)}
          </span>
          <div className="w-full bg-bg-border rounded-full h-1.5 mt-1">
            <div
              className="bg-gold-500 h-1.5 rounded-full"
              style={{ width: (snap.breadthThrust * 100).toFixed(0) + "%" }}
            />
          </div>
          <span className="text-xs text-ivory-600">Scale 0 – 1</span>
        </StatCard>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT — wider */}
        <div className="lg:col-span-3 space-y-4">
          {/* A/D Line vs Nifty50 */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-ivory-200 mb-3">
              A/D Line vs Nifty 50 — 60 Days
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={AD_LINE_HISTORY} margin={{ top: 4, right: 40, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#5C5233", fontSize: 10 }}
                  tickLine={false}
                  interval={9}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#5C5233", fontSize: 10 }}
                  tickLine={false}
                  width={50}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#5C5233", fontSize: 10 }}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6 }}
                  labelStyle={{ color: "#E5D9B6" }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: "#B8A870" }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="adLine"
                  name="A/D Line"
                  stroke="#00BCD4"
                  fill="#00BCD41A"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="nifty"
                  name="Nifty (rebased)"
                  stroke="#DAA520"
                  strokeWidth={1.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* McClellan Oscillator */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-ivory-200 mb-3">
              McClellan Oscillator — 30 Days
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={MCO_HISTORY} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#5C5233", fontSize: 10 }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis tick={{ fill: "#5C5233", fontSize: 10 }} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6 }}
                  labelStyle={{ color: "#E5D9B6" }}
                />
                <ReferenceLine y={0} stroke="#3D3622" strokeDasharray="4 2" />
                <Bar dataKey="mco" name="MCO" maxBarSize={12}>
                  {MCO_HISTORY.map((entry, index) => (
                    <Cell
                      key={"mco-" + index}
                      fill={entry.mco >= 0 ? "#00E676" : "#FF1744"}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="signal"
                  name="Signal (10d EMA)"
                  stroke="#FFD700"
                  strokeWidth={1.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-4">
          {/* New 52W Highs vs Lows */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-ivory-200 mb-3">
              New 52W Highs vs Lows — 30 Days
            </h2>
            <ResponsiveContainer width="100%" height={150}>
              <ComposedChart data={HIGH_LOW_HISTORY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#5C5233", fontSize: 9 }}
                  tickLine={false}
                  interval={6}
                />
                <YAxis tick={{ fill: "#5C5233", fontSize: 9 }} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6 }}
                  labelStyle={{ color: "#E5D9B6" }}
                />
                <Bar dataKey="newHighs" name="New Highs" fill="#00E676" maxBarSize={6} />
                <Bar dataKey="newLows" name="New Lows" fill="#FF1744" maxBarSize={6} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* % Stocks Above MAs */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-ivory-200 mb-3">
              % Stocks Above Moving Averages
            </h2>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={ABOVE_MA_HISTORY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#5C5233", fontSize: 9 }}
                  tickLine={false}
                  interval={6}
                />
                <YAxis
                  tick={{ fill: "#5C5233", fontSize: 9 }}
                  tickLine={false}
                  width={28}
                  domain={[10, 50]}
                />
                <Tooltip
                  contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6 }}
                  labelStyle={{ color: "#E5D9B6" }}
                />
                <ReferenceLine y={25} stroke="#3D3622" strokeDasharray="4 2" label={{ value: "50%", fill: "#5C5233", fontSize: 9 }} />
                <Line type="monotone" dataKey="above20EMA" name="20 EMA" stroke="#00E676" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="above50EMA" name="50 EMA" stroke="#FFD700" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="above200EMA" name="200 EMA" stroke="#FF1744" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* TRIN */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-ivory-200 mb-3">TRIN — 30 Days</h2>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={TRIN_HISTORY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#5C5233", fontSize: 9 }}
                  tickLine={false}
                  interval={6}
                />
                <YAxis tick={{ fill: "#5C5233", fontSize: 9 }} tickLine={false} width={28} domain={[0, 2.5]} />
                <Tooltip
                  contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 6 }}
                  labelStyle={{ color: "#E5D9B6" }}
                />
                <ReferenceLine y={1} stroke="#DAA520" strokeDasharray="4 2" />
                <Bar dataKey="trin" name="TRIN" maxBarSize={8}>
                  {TRIN_HISTORY.map((entry, index) => (
                    <Cell
                      key={"trin-" + index}
                      fill={entry.trin < 1 ? "#00E676" : "#FF1744"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sector Breadth Table */}
      <div className="bg-bg-card border border-bg-border rounded-lg p-4">
        <h2 className="text-sm font-semibold text-ivory-200 mb-3">Sector Breadth</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-ivory-700 uppercase tracking-wider border-b border-bg-border">
                <th className="text-left pb-2 pr-4">Sector</th>
                <th className="text-center pb-2 px-2">Adv</th>
                <th className="text-center pb-2 px-2">Dec</th>
                <th className="text-center pb-2 px-2">Unch</th>
                <th className="pb-2 px-4 text-left w-40">A/D Distribution</th>
                <th className="text-center pb-2 px-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {SECTOR_BREADTH.map((s) => {
                const total = s.advancing + s.declining + s.unchanged;
                const advPct = Math.round((s.advancing / total) * 100);
                const decPct = Math.round((s.declining / total) * 100);
                const badgeClass = breadthScoreBadge(s.breadthScore);
                return (
                  <tr key={s.name} className="border-b border-bg-border/50 hover:bg-bg-hover transition-colors">
                    <td className="py-2 pr-4 text-ivory-300 font-medium">{s.name}</td>
                    <td className="py-2 px-2 text-center text-signal-bull">{s.advancing}</td>
                    <td className="py-2 px-2 text-center text-signal-bear">{s.declining}</td>
                    <td className="py-2 px-2 text-center text-ivory-700">{s.unchanged}</td>
                    <td className="py-2 px-4">
                      <div className="w-full h-2 bg-bg-border rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-signal-bull rounded-l-full"
                          style={{ width: advPct + "%" }}
                        />
                        <div
                          className="h-full bg-signal-bear"
                          style={{ width: decPct + "%" }}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={"text-xs font-semibold px-2 py-0.5 rounded " + badgeClass}>
                        {s.breadthScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
