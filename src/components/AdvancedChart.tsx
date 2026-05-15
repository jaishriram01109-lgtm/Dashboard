"use client";
import { useState, useMemo } from "react";
import { BarChart2, TrendingUp, Minus, ZoomIn, RefreshCw } from "lucide-react";
import { cn, fmt, scoreColor } from "@/lib/utils";
import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, CartesianGrid,
} from "recharts";

// ─── OHLC DATA GENERATOR ─────────────────────────────────────
function generateOHLC(startPrice: number, days: number, trend: "bull" | "bear" | "sideways" = "bull") {
  const data = [];
  let close = startPrice;
  const trendBias = trend === "bull" ? 0.0003 : trend === "bear" ? -0.0003 : 0;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const open = close;
    const dailyBias = trendBias + (Math.random() - 0.48) * 0.008;
    const volatility = close * 0.018;
    const high = open + Math.abs(Math.random() * volatility);
    const low = open - Math.abs(Math.random() * volatility);
    close = Math.max(low, Math.min(high, open + dailyBias * close + (Math.random() - 0.5) * volatility));

    const vol = Math.floor(1000000 + Math.random() * 4000000);
    const isGreen = close >= open;

    // EMA calculations (simplified)
    const ema20 = close * (1 + (Math.random() - 0.5) * 0.01);
    const ema50 = close * (1 + (Math.random() - 0.5) * 0.02);
    const ema200 = close * (1 + (Math.random() - 0.5) * 0.04);

    // RSI (simplified 0-100)
    const rsi = 50 + dailyBias * 5000 + Math.random() * 20 - 10;

    // MACD (simplified)
    const macd = dailyBias * close * 2 + (Math.random() - 0.5) * close * 0.005;
    const signal = macd * 0.9 + (Math.random() - 0.5) * close * 0.002;
    const histogram = macd - signal;

    // Bollinger Bands
    const std = volatility * 0.8;
    const bbUpper = ema20 + 2 * std;
    const bbLower = ema20 - 2 * std;

    // VWAP
    const vwap = (high + low + close) / 3;

    data.push({
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: vol,
      isGreen,
      ema20: +ema20.toFixed(2),
      ema50: +ema50.toFixed(2),
      ema200: +ema200.toFixed(2),
      rsi: Math.min(Math.max(+rsi.toFixed(1), 5), 95),
      macd: +macd.toFixed(2),
      signal: +signal.toFixed(2),
      histogram: +histogram.toFixed(2),
      bbUpper: +bbUpper.toFixed(2),
      bbLower: +bbLower.toFixed(2),
      vwap: +vwap.toFixed(2),
    });
  }
  return data;
}

const CHART_SYMBOLS = [
  { label: "NIFTY 50", start: 22000, trend: "bull" as const },
  { label: "HAL", start: 4200, trend: "bull" as const },
  { label: "TCS", start: 3900, trend: "bull" as const },
  { label: "RVNL", start: 480, trend: "bull" as const },
  { label: "TATASTEEL", start: 175, trend: "bear" as const },
  { label: "BANKNIFTY", start: 50000, trend: "sideways" as const },
];

const TIMEFRAMES = ["1W", "1M", "3M", "6M", "1Y"];

const INDICATOR_PANELS = ["Price", "Volume", "RSI", "MACD"];

// Custom candlestick using Bar with custom shape
function CandleBar(props: any) {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  const { open, close, high, low, isGreen } = payload;
  const barColor = isGreen ? "#00E676" : "#FF1744";
  const totalRange = high - low;
  if (totalRange <= 0) return null;

  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  const priceRange = bodyBottom - bodyTop || 0.5;

  return (
    <g>
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={barColor} strokeWidth={1} opacity={0.6} />
      <rect x={x + 1} y={y + height * (1 - (bodyBottom - bodyTop) / totalRange)}
        width={width - 2} height={Math.max(height * (priceRange / totalRange), 2)}
        fill={barColor} fillOpacity={0.85} rx={1} />
    </g>
  );
}

// Custom Tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-bg-card border border-bg-border rounded-lg p-2.5 text-xs font-mono shadow-card min-w-36">
      <div className="text-ivory-300 font-semibold mb-1.5">{label}</div>
      <div className="space-y-0.5">
        {[
          { label: "O", value: d.open, color: "text-ivory-300" },
          { label: "H", value: d.high, color: "text-signal-bull" },
          { label: "L", value: d.low, color: "text-signal-bear" },
          { label: "C", value: d.close, color: d.isGreen ? "text-signal-bull" : "text-signal-bear" },
          { label: "Vol", value: `${(d.volume / 1000000).toFixed(2)}M` },
        ].map(r => (
          <div key={r.label} className="flex justify-between gap-4">
            <span className="text-ivory-600">{r.label}</span>
            <span className={cn(r.color ?? "text-ivory-200")}>{typeof r.value === "number" ? fmt(r.value) : r.value}</span>
          </div>
        ))}
        <div className="border-t border-bg-border pt-1 mt-1">
          <div className="flex justify-between"><span className="text-ivory-600">RSI</span><span className={d.rsi > 70 ? "text-signal-bear" : "text-signal-bull"}>{d.rsi}</span></div>
          <div className="flex justify-between"><span className="text-ivory-600">MACD</span><span className={d.macd > 0 ? "text-signal-bull" : "text-signal-bear"}>{d.macd.toFixed(1)}</span></div>
        </div>
      </div>
    </div>
  );
}

// RSI panel
function RSIPanel({ data }: { data: ReturnType<typeof generateOHLC> }) {
  return (
    <div className="h-20">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 0, right: 60, bottom: 0, left: 0 }}>
          <YAxis domain={[0, 100]} tick={{ fill: "#A09278", fontSize: 9 }} width={30} />
          <ReferenceLine y={70} stroke="#FF174444" strokeDasharray="3 3" />
          <ReferenceLine y={30} stroke="#00E67644" strokeDasharray="3 3" />
          <ReferenceLine y={50} stroke="#1E1E24" strokeDasharray="2 2" />
          <Line type="monotone" dataKey="rsi" stroke="#00BCD4" strokeWidth={1.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// MACD panel
function MACDPanel({ data }: { data: ReturnType<typeof generateOHLC> }) {
  return (
    <div className="h-20">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 0, right: 60, bottom: 0, left: 0 }}>
          <YAxis tick={{ fill: "#A09278", fontSize: 9 }} width={30} />
          <ReferenceLine y={0} stroke="#1E1E24" />
          <Bar dataKey="histogram" name="Hist" radius={[1, 1, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.histogram >= 0 ? "#00E676" : "#FF1744"} fillOpacity={0.8} />)}
          </Bar>
          <Line type="monotone" dataKey="macd" name="MACD" stroke="#DC143C" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="signal" name="Signal" stroke="#FFB300" strokeWidth={1} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AdvancedChart() {
  const [selectedSymbol, setSelectedSymbol] = useState(CHART_SYMBOLS[0]);
  const [timeframe, setTimeframe] = useState("3M");
  const [showEMA, setShowEMA] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showVWAP, setShowVWAP] = useState(true);
  const [activePanel, setActivePanel] = useState<"RSI" | "MACD" | "Volume" | null>("RSI");

  const days = timeframe === "1W" ? 7 : timeframe === "1M" ? 30 : timeframe === "3M" ? 90 : timeframe === "6M" ? 180 : 365;
  const data = useMemo(() => generateOHLC(selectedSymbol.start, days, selectedSymbol.trend), [selectedSymbol, days]);

  const lastCandle = data[data.length - 1];
  const prevCandle = data[data.length - 2];
  const dayChange = lastCandle.close - prevCandle.close;
  const dayChangePct = (dayChange / prevCandle.close) * 100;
  const isPositive = dayChange >= 0;
  const currentRSI = lastCandle.rsi;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-maroon-600" />
            Advanced Chart Studio
          </h2>
          <p className="text-xs text-ivory-500">Candlestick • EMA • Bollinger Bands • RSI • MACD • VWAP</p>
        </div>
      </div>

      {/* Symbol + timeframe selector */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {CHART_SYMBOLS.map(s => (
            <button key={s.label} onClick={() => setSelectedSymbol(s)}
              className={cn("px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors",
                selectedSymbol.label === s.label
                  ? "bg-maroon-800 text-ivory-100"
                  : "text-ivory-500 bg-bg-card border border-bg-border hover:text-ivory-200"
              )}>{s.label}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)}
              className={cn("px-2 py-1 rounded text-xs font-mono transition-colors",
                timeframe === tf ? "bg-maroon-800 text-ivory-100" : "text-ivory-500 hover:text-ivory-300"
              )}>{tf}</button>
          ))}
        </div>
      </div>

      {/* Price summary */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <span className="text-2xl font-mono font-bold text-ivory-100">₹{fmt(lastCandle.close)}</span>
          <span className={cn("ml-3 text-sm font-mono font-bold", isPositive ? "text-signal-bull" : "text-signal-bear")}>
            {isPositive ? "+" : ""}{fmt(dayChange)} ({dayChangePct.toFixed(2)}%)
          </span>
        </div>
        <div className="flex gap-3 text-xs font-mono text-ivory-500">
          <span>H: <span className="text-signal-bull">{fmt(lastCandle.high)}</span></span>
          <span>L: <span className="text-signal-bear">{fmt(lastCandle.low)}</span></span>
          <span>O: {fmt(lastCandle.open)}</span>
          <span>V: {(lastCandle.volume / 1000000).toFixed(2)}M</span>
        </div>
        <div className="flex gap-2 text-xs font-mono ml-auto">
          <span className="text-ivory-600">RSI: </span>
          <span className={cn("font-bold", currentRSI > 70 ? "text-signal-bear" : currentRSI < 30 ? "text-signal-bull" : "text-yellow-400")}>
            {currentRSI.toFixed(1)}
          </span>
          <span className="text-ivory-600 ml-2">MACD: </span>
          <span className={cn("font-bold", lastCandle.macd > 0 ? "text-signal-bull" : "text-signal-bear")}>
            {lastCandle.macd.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Indicator toggles */}
      <div className="flex items-center gap-3 flex-wrap text-xs">
        <span className="text-ivory-600">Overlays:</span>
        {[
          { label: "EMA 20/50/200", state: showEMA, set: setShowEMA, color: "text-signal-accumulate" },
          { label: "Bollinger Bands", state: showBB, set: setShowBB, color: "text-gold-500" },
          { label: "VWAP", state: showVWAP, set: setShowVWAP, color: "text-maroon-400" },
        ].map(ind => (
          <button key={ind.label} onClick={() => ind.set(!ind.state)}
            className={cn("flex items-center gap-1.5 px-2 py-1 rounded border transition-colors",
              ind.state
                ? "bg-maroon-800/20 border-maroon-800/40 " + ind.color
                : "border-bg-border text-ivory-600 hover:text-ivory-400"
            )}>
            <div className={cn("w-2 h-0.5 rounded", ind.state ? "bg-current" : "bg-ivory-700")} />
            {ind.label}
          </button>
        ))}
        <div className="h-4 w-px bg-bg-border" />
        <span className="text-ivory-600">Panels:</span>
        {(["RSI", "MACD", "Volume"] as const).map(p => (
          <button key={p} onClick={() => setActivePanel(activePanel === p ? null : p)}
            className={cn("px-2 py-1 rounded border text-xs transition-colors",
              activePanel === p ? "bg-maroon-800/20 border-maroon-800/40 text-maroon-300" : "border-bg-border text-ivory-600 hover:text-ivory-400"
            )}>{p}</button>
        ))}
      </div>

      {/* Main chart */}
      <div className="card-glass rounded-xl p-3">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 60, bottom: 5, left: 5 }}>
              <CartesianGrid stroke="#1E1E24" strokeDasharray="1 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#A09278", fontSize: 9 }}
                interval={Math.floor(data.length / 8)} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "#A09278", fontSize: 9 }}
                tickFormatter={v => `₹${(v / 1000).toFixed(v > 10000 ? 0 : 1)}${v > 10000 ? "K" : ""}`}
                width={55} tickLine={false} orientation="right" />
              <Tooltip content={<ChartTooltip />} />

              {/* Bollinger Bands */}
              {showBB && <>
                <Area type="monotone" dataKey="bbUpper" stroke="none" fill="#B8860B" fillOpacity={0.05} />
                <Line type="monotone" dataKey="bbUpper" stroke="#B8860B" strokeWidth={1} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="bbLower" stroke="#B8860B" strokeWidth={1} dot={false} strokeDasharray="4 2" />
              </>}

              {/* VWAP */}
              {showVWAP && <Line type="monotone" dataKey="vwap" stroke="#8B0000" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />}

              {/* EMA lines */}
              {showEMA && <>
                <Line type="monotone" dataKey="ema20" name="EMA20" stroke="#00BCD4" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="ema50" name="EMA50" stroke="#FFB300" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="ema200" name="EMA200" stroke="#FF5722" strokeWidth={1.5} dot={false} />
              </>}

              {/* Candlestick bars — rendered as high-low range bars */}
              <Bar dataKey="high" name="High" fill="transparent" />
              {data.map((d, i) => null)}
              <Line type="monotone" dataKey="close" stroke={isPositive ? "#00E676" : "#FF1744"}
                strokeWidth={1} dot={false} opacity={0.4} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        {showEMA && (
          <div className="flex gap-4 mt-1 pl-2 text-[10px]">
            {[
              { label: "EMA 20", color: "#00BCD4" },
              { label: "EMA 50", color: "#FFB300" },
              { label: "EMA 200", color: "#FF5722" },
              ...(showVWAP ? [{ label: "VWAP", color: "#8B0000" }] : []),
              ...(showBB ? [{ label: "BB", color: "#B8860B" }] : []),
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-4 h-0.5 rounded" style={{ background: l.color }} />
                <span className="text-ivory-600">{l.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Volume panel */}
      {activePanel === "Volume" && (
        <div className="card-glass rounded-xl p-3">
          <div className="text-[10px] text-ivory-500 uppercase tracking-wider mb-1">Volume</div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 0, right: 60, bottom: 0, left: 0 }}>
                <YAxis tick={{ fill: "#A09278", fontSize: 9 }} width={30} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                <Bar dataKey="volume" radius={[1, 1, 0, 0]}>
                  {data.map((d, i) => <Cell key={i} fill={d.isGreen ? "#00E67688" : "#FF174488"} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* RSI panel */}
      {activePanel === "RSI" && (
        <div className="card-glass rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] text-ivory-500 uppercase tracking-wider">RSI (14)</div>
            <div className="flex gap-3 text-[10px] text-ivory-600">
              <span>Overbought: <span className="text-signal-bear">70</span></span>
              <span>Oversold: <span className="text-signal-bull">30</span></span>
              <span className={cn("font-mono font-bold", currentRSI > 70 ? "text-signal-bear" : currentRSI < 30 ? "text-signal-bull" : "text-yellow-400")}>
                Current: {currentRSI.toFixed(1)}
              </span>
            </div>
          </div>
          <RSIPanel data={data} />
        </div>
      )}

      {/* MACD panel */}
      {activePanel === "MACD" && (
        <div className="card-glass rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] text-ivory-500 uppercase tracking-wider">MACD (12,26,9)</div>
            <div className="flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-signal-bear rounded" />MACD</span>
              <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-yellow-500 rounded" />Signal</span>
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-signal-bull/50 rounded" />Histogram</span>
            </div>
          </div>
          <MACDPanel data={data} />
        </div>
      )}

      {/* Key Levels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Support 1", value: fmt(lastCandle.bbLower), color: "text-signal-bull", sub: "BB Lower / Demand" },
          { label: "Support 2", value: fmt(lastCandle.ema50), color: "text-yellow-400", sub: "EMA 50" },
          { label: "Resistance 1", value: fmt(lastCandle.ema20 * 1.02), color: "text-signal-bear", sub: "Near supply zone" },
          { label: "Resistance 2", value: fmt(lastCandle.bbUpper), color: "text-signal-bear", sub: "BB Upper" },
        ].map(l => (
          <div key={l.label} className="card-glass rounded-xl p-3 text-center">
            <div className={cn("text-sm font-mono font-bold", l.color)}>₹{l.value}</div>
            <div className="text-xs text-ivory-400 font-semibold mt-0.5">{l.label}</div>
            <div className="text-[10px] text-ivory-600">{l.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
