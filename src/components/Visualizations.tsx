"use client";
import { useState, useMemo } from "react";
import { PieChart as PieIcon, BarChart2, Activity, Grid } from "lucide-react";
import { sectorData, stockData } from "@/lib/mockData";
import { cn, fmt, fmtPct, colorFromChange, scoreColor } from "@/lib/utils";
import { useAngelQuotes } from "@/hooks/useAngelData";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ReferenceLine,
  PieChart, Pie, Sector, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ComposedChart, Scatter, ScatterChart, ZAxis,
} from "recharts";

// Generate candlestick-like OHLC data
function genOHLC(base: number, count = 60) {
  const data = [];
  let close = base;
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (count - i));
    const open = close;
    const volatility = close * 0.015;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    close = low + Math.random() * (high - low);
    const volume = 1000000 + Math.random() * 3000000;
    data.push({
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(0)),
      ma20: close * (1 + (Math.random() - 0.5) * 0.02),
    });
  }
  return data;
}

// Nifty 50 price chart
const niftyData = genOHLC(22000, 90);
const niftyLastClose = niftyData[niftyData.length - 1].close;

// Market breadth data
function genBreadthData(days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const advances = 20 + Math.floor(Math.random() * 30);
    const declines = 50 - advances;
    return {
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      advances,
      declines,
      ratio: (advances / 50),
      above50D: 40 + Math.floor(Math.random() * 25),
      above200D: 52 + Math.floor(Math.random() * 20),
    };
  });
}

const breadthData = genBreadthData();

// Volume profile
function genVolProfile() {
  return Array.from({ length: 20 }, (_, i) => ({
    price: 24000 + i * 50,
    volume: Math.floor(Math.random() * 500000) + 100000,
    type: i >= 9 && i <= 11 ? "poc" : "normal",
  }));
}

const volProfile = genVolProfile();

// RS Matrix
function RelativeStrengthMatrix() {
  const top8 = [...sectorData].sort((a, b) => b.relativeStrength - a.relativeStrength).slice(0, 8);

  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
        Relative Strength Matrix
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={top8.map(s => ({ subject: s.name.split(" ")[0], A: s.relativeStrength, B: s.momentumScore }))}>
            <PolarGrid stroke="#1E1E24" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#A09278", fontSize: 9 }} />
            <Radar name="RS" dataKey="A" stroke="#DC143C" fill="#DC143C" fillOpacity={0.2} strokeWidth={2} />
            <Radar name="Momentum" dataKey="B" stroke="#00BCD4" fill="#00BCD4" fillOpacity={0.1} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 justify-center text-[10px] text-ivory-500">
        <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-signal-bear rounded" /> Rel. Strength</div>
        <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-signal-accumulate rounded" /> Momentum</div>
      </div>
    </div>
  );
}

// Nifty 50 Area Chart
function NiftyChart() {
  return (
    <div className="card-glass rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">NIFTY 50</div>
          <div className="text-xl font-mono font-bold text-ivory-100 mt-0.5">
            {fmt(niftyLastClose)}
            <span className="text-signal-bull text-sm ml-2">+0.76%</span>
          </div>
        </div>
        <span className="label-tag bg-signal-bull/15 text-signal-bull">BULLISH</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={niftyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E676" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "#A09278", fontSize: 9 }} interval={14} />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "#A09278", fontSize: 9 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
              labelStyle={{ color: "#F5F0E8" }}
            />
            <Area type="monotone" dataKey="close" name="Nifty 50"
              stroke="#00E676" fill="url(#niftyGrad)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ma20" name="MA20" stroke="#FFB300" strokeWidth={1} dot={false} strokeDasharray="4 2" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Sector allocation pie
function SectorAllocationPie() {
  const data = sectorData.slice(0, 8).map(s => ({
    name: s.name.split(" ")[0],
    value: s.marketCap,
  }));
  const COLORS = ["#DC143C", "#00E676", "#00BCD4", "#FFB300", "#8B0000", "#4DB6AC", "#7C4DFF", "#FF5722"];

  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
        Market Cap Allocation
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data} cx="50%" cy="50%"
              innerRadius={50} outerRadius={80}
              paddingAngle={2} dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
              formatter={(v: number) => [`₹${(v / 1000).toFixed(0)}K Cr`, "Market Cap"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-4 gap-1 mt-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1 text-[10px]">
            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-ivory-500 truncate">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Market Breadth
function MarketBreadth({ adv, dec, isLive }: { adv: number; dec: number; isLive: boolean }) {
  const adRatio = dec > 0 ? (adv / dec).toFixed(2) : "—";
  const total = adv + dec;
  const advPct = total > 0 ? ((adv / total) * 100).toFixed(1) : "68.4";
  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        Market Breadth Indicator
        {isLive && <span className="label-tag bg-signal-bull/15 text-signal-bull text-[9px]">● LIVE</span>}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={breadthData.slice(-14)} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <XAxis dataKey="date" tick={{ fill: "#A09278", fontSize: 9 }} interval={3} />
            <YAxis tick={{ fill: "#A09278", fontSize: 9 }} />
            <Tooltip
              contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
            />
            <Bar dataKey="advances" name="Advances" fill="#00E676" fillOpacity={0.7} radius={[2, 2, 0, 0]} stackId="a" />
            <Bar dataKey="declines" name="Declines" fill="#FF1744" fillOpacity={0.7} radius={[2, 2, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-2 text-center text-xs">
        {[
          { label: "Advancing", value: isLive ? String(adv) : "34", color: "text-signal-bull" },
          { label: "Declining", value: isLive ? String(dec) : "16", color: "text-signal-bear" },
          { label: "A/D Ratio", value: isLive ? adRatio : "1.82", color: adv >= dec ? "text-signal-bull" : "text-signal-bear" },
        ].map(s => (
          <div key={s.label}>
            <div className={cn("font-mono font-bold", s.color)}>{s.value}</div>
            <div className="text-[10px] text-ivory-600">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Volume Profile
function VolumeProfileChart() {
  const poc = volProfile.find(v => v.type === "poc");
  const maxVol = Math.max(...volProfile.map(v => v.volume));

  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
        Nifty 50 Volume Profile
      </div>
      <div className="flex gap-2 h-48">
        <div className="flex-1">
          <div className="h-full flex flex-col justify-between">
            {[...volProfile].reverse().map((bar, i) => (
              <div key={i} className="flex items-center gap-1 h-2">
                <div
                  className={cn(
                    "h-full rounded-r transition-all",
                    bar.type === "poc" ? "bg-signal-bear" : "bg-maroon-700/50"
                  )}
                  style={{ width: `${(bar.volume / maxVol) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between text-[9px] text-ivory-600 font-mono">
          {[...volProfile].reverse().filter((_, i) => i % 4 === 0).map((bar, i) => (
            <span key={i}>{fmt(bar.price, 0)}</span>
          ))}
        </div>
      </div>
      {poc && (
        <div className="mt-2 text-[10px] text-ivory-500">
          POC: <span className="text-signal-bear font-mono">₹{fmt(poc.price, 0)}</span> — Point of Control (highest volume zone)
        </div>
      )}
    </div>
  );
}

// FII flow bar chart
function FIIDIIComparison() {
  const data = [
    { month: "Nov", fii: 8420, dii: 5240 },
    { month: "Dec", fii: 6840, dii: 6840 },
    { month: "Jan", fii: -4200, dii: 8420 },
    { month: "Feb", fii: 2840, dii: 7240 },
    { month: "Mar", fii: 9840, dii: 5840 },
    { month: "Apr", fii: 11240, dii: 7240 },
    { month: "May", fii: 12450, dii: 8320 },
  ];
  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">
        FII vs DII Monthly Flow (₹ Cr)
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 30 }}>
            <XAxis dataKey="month" tick={{ fill: "#A09278", fontSize: 10 }} />
            <YAxis tick={{ fill: "#A09278", fontSize: 9 }} tickFormatter={v => `${v > 0 ? "+" : ""}${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
              formatter={(v: number) => [`₹${v.toLocaleString()} Cr`, ""]}
            />
            <ReferenceLine y={0} stroke="#1E1E24" />
            <Bar dataKey="fii" name="FII" radius={[2, 2, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.fii >= 0 ? "#00E676" : "#FF1744"} fillOpacity={0.8} />)}
            </Bar>
            <Bar dataKey="dii" name="DII" fill="#00BCD4" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Momentum scanner table
function MomentumScanner() {
  const top = [...stockData].sort((a, b) => b.technicals.momentumStrength - a.technicals.momentumStrength);
  return (
    <div className="card-glass rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-bg-border">
        <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">Momentum Scanner</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-bg-border">
              {["Symbol", "Price", "Change", "RSI", "MACD", "Volume×", "Momentum", "Delivery%"].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {top.map(s => {
              const t = s.technicals;
              return (
                <tr key={s.symbol} className="border-b border-bg-border/50 hover:bg-bg-hover">
                  <td className="px-3 py-2 font-mono font-bold text-xs text-ivory-100">{s.symbol}</td>
                  <td className="px-3 py-2 font-mono text-xs text-ivory-200">₹{fmt(s.price)}</td>
                  <td className={cn("px-3 py-2 font-mono text-xs", colorFromChange(s.changePct))}>
                    {fmtPct(s.changePct)}
                  </td>
                  <td className={cn("px-3 py-2 font-mono text-xs")} style={{ color: t.rsi >= 70 ? "#FF1744" : t.rsi >= 50 ? "#00E676" : "#FFB300" }}>
                    {t.rsi.toFixed(1)}
                  </td>
                  <td className={cn("px-3 py-2 font-mono text-xs", colorFromChange(t.macd))}>{t.macd.toFixed(1)}</td>
                  <td className={cn("px-3 py-2 font-mono text-xs", t.volume > t.avgVolume20D * 1.5 ? "text-signal-bull" : "text-ivory-400")}>
                    {(t.volume / t.avgVolume20D).toFixed(1)}x
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-signal-bull rounded-full" style={{ width: `${t.momentumStrength}%` }} />
                      </div>
                      <span className={cn("text-xs font-mono", scoreColor(t.momentumStrength))}>{t.momentumStrength}</span>
                    </div>
                  </td>
                  <td className={cn("px-3 py-2 font-mono text-xs", t.deliveryPct >= 65 ? "text-signal-bull" : "text-ivory-400")}>
                    {t.deliveryPct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Visualizations() {
  const { quotes, isLive } = useAngelQuotes();

  const { adv, dec } = useMemo(() => {
    if (quotes.size === 0) return { adv: 34, dec: 16 };
    let adv = 0, dec = 0;
    quotes.forEach(q => { if (q.changePct > 0) adv++; else if (q.changePct < 0) dec++; });
    return { adv, dec };
  }, [quotes]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-maroon-600" />
          Market Visualizations
          {isLive && <span className="label-tag bg-signal-bull/15 text-signal-bull text-[9px]">● LIVE</span>}
        </h2>
        <p className="text-xs text-ivory-500">Multi-dimensional market analysis charts and dashboards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="md:col-span-2"><NiftyChart /></div>
        <SectorAllocationPie />
        <RelativeStrengthMatrix />
        <MarketBreadth adv={adv} dec={dec} isLive={isLive} />
        <VolumeProfileChart />
        <div className="md:col-span-2"><FIIDIIComparison /></div>
      </div>

      <MomentumScanner />
    </div>
  );
}
