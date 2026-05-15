"use client";
import { useState } from "react";
import { Crosshair, TrendingUp, TrendingDown, RefreshCw, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

type PatternType = "all" | "cup_handle" | "head_shoulders" | "bull_flag" | "bear_flag" | "double_bottom" | "double_top" | "triangle" | "wedge" | "breakout";
type Direction = "all" | "bullish" | "bearish";

interface Pattern {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change1d: number;
  patternType: Exclude<PatternType, "all">;
  direction: "bullish" | "bearish";
  confidence: number;
  timeframe: "15m" | "1H" | "4H" | "Daily" | "Weekly";
  formation: string;
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  rr: number;
  daysForming: number;
  volumeConfirmation: boolean;
  aiSummary: string;
  sparkData: number[];
}

const PATTERNS: Pattern[] = [
  {
    id: "p1", symbol: "HAL", name: "Hindustan Aeronautics", sector: "Defence",
    price: 4280, change1d: 3.8, patternType: "cup_handle", direction: "bullish",
    confidence: 92, timeframe: "Daily", formation: "14-week cup + 2-week handle forming",
    entry: 4310, stopLoss: 4080, target1: 4780, target2: 5240,
    rr: 2.2, daysForming: 112, volumeConfirmation: true,
    aiSummary: "Textbook cup & handle on daily chart — 14-week base formation. Handle consolidation above EMA20. Volume declining during handle (healthy). Breakout above ₹4,310 on high volume = entry signal. Target ₹4,780 (measured move).",
    sparkData: [3820, 3940, 4100, 3980, 3960, 4020, 4080, 4120, 4180, 4210, 4240, 4260, 4280],
  },
  {
    id: "p2", symbol: "DLF", name: "DLF Limited", sector: "Realty",
    price: 918, change1d: 2.1, patternType: "breakout", direction: "bullish",
    confidence: 88, timeframe: "Daily", formation: "6-month resistance breakout at ₹895",
    entry: 920, stopLoss: 875, target1: 1020, target2: 1120,
    rr: 2.4, daysForming: 182, volumeConfirmation: true,
    aiSummary: "Clean breakout above ₹895 resistance — tested 6 times over 6 months. Breakout confirmed with 2.8x average volume. Measured move target ₹1,020. Rate cut expectation adding momentum to realty sector.",
    sparkData: [780, 820, 864, 891, 878, 865, 882, 896, 892, 895, 904, 912, 918],
  },
  {
    id: "p3", symbol: "RVNL", name: "Rail Vikas Nigam", sector: "Railway",
    price: 415, change1d: 1.9, patternType: "bull_flag", direction: "bullish",
    confidence: 84, timeframe: "Daily", formation: "Strong pole (42%) + 12-day flag consolidation",
    entry: 422, stopLoss: 396, target1: 478, target2: 520,
    rr: 2.4, daysForming: 12, volumeConfirmation: true,
    aiSummary: "Bull flag after 42% pole rally. Flag consolidating between ₹398–416 on declining volume. Breakout above ₹422 with volume surge = continuation signal. Railway budget tailwind supports move.",
    sparkData: [295, 318, 342, 378, 412, 418, 408, 412, 406, 410, 414, 412, 415],
  },
  {
    id: "p4", symbol: "TATASTEEL", name: "Tata Steel", sector: "Metals",
    price: 162, change1d: -1.2, patternType: "head_shoulders", direction: "bearish",
    confidence: 78, timeframe: "Daily", formation: "H&S top at ₹172/178/174 — neckline ₹158",
    entry: 158, stopLoss: 170, target1: 142, target2: 128,
    rr: 1.9, daysForming: 42, volumeConfirmation: false,
    aiSummary: "Classic head & shoulders top forming over 42 days. Left shoulder ₹172, head ₹178, right shoulder ₹174. Neckline at ₹158. Break below neckline = short entry. China PMI weakness adds bearish macro backdrop. Volume on right shoulder declining — confirming weakness.",
    sparkData: [148, 158, 168, 172, 164, 170, 178, 172, 168, 174, 168, 164, 162],
  },
  {
    id: "p5", symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "NBFC",
    price: 7420, change1d: 1.9, patternType: "double_bottom", direction: "bullish",
    confidence: 81, timeframe: "Daily", formation: "Double bottom at ₹6,840 — W pattern",
    entry: 7450, stopLoss: 7080, target1: 8060, target2: 8580,
    rr: 2.0, daysForming: 68, volumeConfirmation: true,
    aiSummary: "Double bottom W-pattern with second bottom ₹6,848 (vs first ₹6,842 — near perfect). Neckline at ₹7,380 already breached. Confirmation above ₹7,450 with volume. Rate cut catalyst supports NBFC re-rating.",
    sparkData: [7180, 7040, 6860, 6840, 6920, 7080, 7180, 7240, 7310, 7380, 7390, 7410, 7420],
  },
  {
    id: "p6", symbol: "INFY", name: "Infosys", sector: "IT",
    price: 1580, change1d: -0.8, patternType: "wedge", direction: "bearish",
    confidence: 74, timeframe: "Daily", formation: "Rising wedge — 8-week narrowing range",
    entry: 1560, stopLoss: 1624, target1: 1420, target2: 1340,
    rr: 1.8, daysForming: 56, volumeConfirmation: false,
    aiSummary: "Rising wedge — 8 weeks of higher highs but converging lows. Volume declining on each thrust up. Breakdown below ₹1,560 on volume = short entry. IT sector cautious guidance expected; weak US macro adds to downside.",
    sparkData: [1480, 1510, 1525, 1545, 1538, 1555, 1548, 1562, 1568, 1572, 1575, 1578, 1580],
  },
  {
    id: "p7", symbol: "BEL", name: "Bharat Electronics", sector: "Defence",
    price: 318, change1d: 2.4, patternType: "triangle", direction: "bullish",
    confidence: 79, timeframe: "Daily", formation: "Ascending triangle — 16-week flat top ₹322",
    entry: 324, stopLoss: 304, target1: 360, target2: 394,
    rr: 2.1, daysForming: 112, volumeConfirmation: false,
    aiSummary: "Ascending triangle with flat resistance at ₹322 tested 5 times. Rising lows = buyer accumulation. Breakout above ₹322-324 = strong entry. Measured move: ₹360. Defence capex super-cycle as macro catalyst.",
    sparkData: [280, 286, 292, 298, 294, 300, 306, 302, 308, 312, 310, 314, 318],
  },
  {
    id: "p8", symbol: "GODREJPROP", name: "Godrej Properties", sector: "Realty",
    price: 2840, change1d: 3.2, patternType: "cup_handle", direction: "bullish",
    confidence: 76, timeframe: "Weekly", formation: "6-month cup + 3-week handle on weekly",
    entry: 2880, stopLoss: 2680, target1: 3240, target2: 3580,
    rr: 2.0, daysForming: 168, volumeConfirmation: true,
    aiSummary: "Weekly cup & handle developing over 6 months. Handle formed between ₹2,720–2,850. Weekly volume bullish divergence. Rate cut cycle + luxury housing demand = strong fundamental + technical confluence.",
    sparkData: [2420, 2520, 2640, 2780, 2840, 2740, 2710, 2730, 2760, 2790, 2820, 2835, 2840],
  },
];

const PATTERN_LABELS: Record<Exclude<PatternType, "all">, string> = {
  cup_handle: "Cup & Handle",
  head_shoulders: "Head & Shoulders",
  bull_flag: "Bull Flag",
  bear_flag: "Bear Flag",
  double_bottom: "Double Bottom",
  double_top: "Double Top",
  triangle: "Triangle",
  wedge: "Wedge",
  breakout: "Breakout",
};

function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-bg-border rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", value >= 85 ? "bg-signal-bull" : value >= 70 ? "bg-yellow-500" : "bg-signal-bear")}
          style={{ width: `${value}%` }} />
      </div>
      <span className={cn("text-[10px] font-mono font-bold", value >= 85 ? "text-signal-bull" : value >= 70 ? "text-yellow-400" : "text-signal-bear")}>
        {value}%
      </span>
    </div>
  );
}

function PatternCard({ p }: { p: Pattern }) {
  const [expanded, setExpanded] = useState(false);
  const isBull = p.direction === "bullish";
  const sparkPoints = p.sparkData.map((v, i) => ({ i, v }));

  return (
    <div className={cn("card-glass rounded-xl overflow-hidden cursor-pointer transition-all border",
      expanded ? (isBull ? "border-signal-bull/30" : "border-signal-bear/30") : "border-transparent hover:border-maroon-900"
    )} onClick={() => setExpanded(e => !e)}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Sparkline */}
          <div className="w-24 h-12 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkPoints}>
                <defs>
                  <linearGradient id={`sg-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isBull ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isBull ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={isBull ? "#22c55e" : "#ef4444"} strokeWidth={1.5}
                  fill={`url(#sg-${p.id})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-ivory-100">{p.symbol}</span>
              <span className="label-tag bg-maroon-800/20 text-maroon-400 text-[9px]">{p.sector}</span>
              <span className={cn("label-tag text-[9px]",
                isBull ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear"
              )}>{isBull ? "↑ BULLISH" : "↓ BEARISH"}</span>
              <span className="label-tag bg-bg-border text-ivory-500 text-[9px]">{p.timeframe}</span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn("text-[11px] font-semibold", isBull ? "text-signal-bull" : "text-signal-bear")}>
                {PATTERN_LABELS[p.patternType]}
              </span>
              <span className="text-[9px] text-ivory-600">forming {p.daysForming} days</span>
            </div>
            <div className="text-[10px] text-ivory-500 mb-2">{p.formation}</div>
            <ConfidenceMeter value={p.confidence} />
          </div>

          {/* Targets */}
          <div className="flex-shrink-0 text-right">
            <div className="text-sm font-display font-bold text-ivory-100">₹{p.price.toLocaleString()}</div>
            <div className={cn("text-[10px] font-mono", p.change1d >= 0 ? "text-signal-bull" : "text-signal-bear")}>
              {p.change1d >= 0 ? "+" : ""}{p.change1d}%
            </div>
            <div className="mt-1 text-[9px]">
              <div className="text-ivory-600">T1: <span className="text-ivory-200 font-mono">₹{p.target1}</span></div>
              <div className="text-ivory-600">T2: <span className="text-ivory-200 font-mono">₹{p.target2}</span></div>
              <div className="text-gold-500 font-mono font-bold">R:R {p.rr}x</div>
            </div>
          </div>
        </div>

        {/* Collapsed quick stats */}
        {!expanded && (
          <div className="flex gap-4 mt-3 text-[10px]">
            <div><span className="text-ivory-600">Entry: </span><span className="font-mono text-ivory-200">₹{p.entry}</span></div>
            <div><span className="text-ivory-600">SL: </span><span className="font-mono text-signal-bear">₹{p.stopLoss}</span></div>
            <div className="flex items-center gap-1">
              {p.volumeConfirmation
                ? <span className="label-tag bg-signal-bull/15 text-signal-bull text-[9px]">VOL ✓</span>
                : <span className="label-tag bg-yellow-500/15 text-yellow-400 text-[9px]">VOL PENDING</span>
              }
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-bg-border px-4 py-3 bg-bg-secondary/30 animate-fade-in space-y-3">
          <p className="text-xs text-ivory-300 leading-relaxed">{p.aiSummary}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="bg-bg-primary/40 rounded-lg p-2">
              <div className="text-xs font-mono font-bold text-ivory-100">₹{p.entry}</div>
              <div className="text-[9px] text-ivory-600">Entry</div>
            </div>
            <div className="bg-bg-primary/40 rounded-lg p-2">
              <div className="text-xs font-mono font-bold text-signal-bear">₹{p.stopLoss}</div>
              <div className="text-[9px] text-ivory-600">Stop Loss</div>
            </div>
            <div className="bg-bg-primary/40 rounded-lg p-2">
              <div className="text-xs font-mono font-bold text-signal-bull">₹{p.target1}</div>
              <div className="text-[9px] text-ivory-600">Target 1</div>
            </div>
            <div className="bg-bg-primary/40 rounded-lg p-2">
              <div className="text-xs font-mono font-bold text-signal-bull">₹{p.target2}</div>
              <div className="text-[9px] text-ivory-600">Target 2</div>
            </div>
          </div>
          {/* R:R Visual */}
          <div className="flex items-center gap-1 h-4 rounded overflow-hidden text-[8px] font-mono">
            <div className="bg-signal-bear/60 flex items-center justify-center text-white px-1 flex-shrink-0"
              style={{ width: "15%" }}>SL</div>
            <div className="bg-maroon-800 flex items-center justify-center text-ivory-300 px-1 flex-shrink-0"
              style={{ width: "8%" }}>E</div>
            <div className="bg-signal-bull/50 flex items-center justify-center text-white px-1"
              style={{ width: "40%" }}>T1</div>
            <div className="bg-signal-bull/80 flex items-center justify-center text-white px-1 flex-1">T2</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TechnicalPatterns() {
  const [patternFilter, setPatternFilter] = useState<PatternType>("all");
  const [dirFilter, setDirFilter] = useState<Direction>("all");

  const filtered = PATTERNS.filter(p =>
    (patternFilter === "all" || p.patternType === patternFilter) &&
    (dirFilter === "all" || p.direction === dirFilter)
  ).sort((a, b) => b.confidence - a.confidence);

  const bullCount = PATTERNS.filter(p => p.direction === "bullish").length;
  const bearCount = PATTERNS.filter(p => p.direction === "bearish").length;
  const highConf = PATTERNS.filter(p => p.confidence >= 85).length;

  const patternCounts = PATTERNS.reduce<Record<string, number>>((acc, p) => {
    acc[p.patternType] = (acc[p.patternType] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-maroon-600" />
            Technical Pattern Scanner
          </h2>
          <p className="text-xs text-ivory-500">AI-detected chart patterns with entry, stop-loss & targets</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-signal-bull font-bold">{bullCount} Bullish</span>
          <span className="text-ivory-700">|</span>
          <span className="text-signal-bear font-bold">{bearCount} Bearish</span>
          <span className="text-ivory-700">|</span>
          <span className="text-gold-500 font-bold">{highConf} High Conf</span>
        </div>
      </div>

      {/* Pattern type chips */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setPatternFilter("all")}
          className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
            patternFilter === "all" ? "bg-maroon-800/40 text-maroon-300 border-maroon-700" : "text-ivory-600 border-bg-border hover:text-ivory-300"
          )}>All ({PATTERNS.length})</button>
        {(Object.entries(patternCounts) as [Exclude<PatternType, "all">, number][]).map(([type, count]) => (
          <button key={type} onClick={() => setPatternFilter(type)}
            className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
              patternFilter === type ? "bg-maroon-800/40 text-maroon-300 border-maroon-700" : "text-ivory-600 border-bg-border hover:text-ivory-300"
            )}>{PATTERN_LABELS[type]} ({count})</button>
        ))}
      </div>

      {/* Direction filter */}
      <div className="flex gap-1">
        {([["all", "All"], ["bullish", "↑ Bullish"], ["bearish", "↓ Bearish"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setDirFilter(id)}
            className={cn("px-3 py-1 rounded text-[11px] font-semibold transition-colors",
              dirFilter === id
                ? id === "bullish" ? "bg-signal-bull/20 text-signal-bull"
                  : id === "bearish" ? "bg-signal-bear/20 text-signal-bear"
                  : "bg-maroon-800/40 text-maroon-300"
                : "text-ivory-600 hover:text-ivory-300"
            )}>{label}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(p => <PatternCard key={p.id} p={p} />)}
        {filtered.length === 0 && (
          <div className="card-glass rounded-xl p-8 text-center text-ivory-600 text-sm">No patterns match the selected filters</div>
        )}
      </div>

      {/* Pattern Guide */}
      <div className="card-glass rounded-xl p-4">
        <div className="text-xs font-semibold text-ivory-400 mb-3">Pattern Reliability Guide</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { name: "Cup & Handle", rel: 88, dir: "Bullish" },
            { name: "Breakout", rel: 84, dir: "Neutral" },
            { name: "Double Bottom", rel: 80, dir: "Bullish" },
            { name: "Bull Flag", rel: 78, dir: "Bullish" },
            { name: "Ascending Triangle", rel: 76, dir: "Bullish" },
            { name: "Head & Shoulders", rel: 74, dir: "Bearish" },
            { name: "Rising Wedge", rel: 72, dir: "Bearish" },
            { name: "Double Top", rel: 70, dir: "Bearish" },
            { name: "Bear Flag", rel: 68, dir: "Bearish" },
            { name: "Descending Triangle", rel: 66, dir: "Bearish" },
          ].map(g => (
            <div key={g.name} className="text-center">
              <div className={cn("text-xs font-mono font-bold", g.dir === "Bullish" ? "text-signal-bull" : g.dir === "Bearish" ? "text-signal-bear" : "text-ivory-300")}>{g.rel}%</div>
              <div className="text-[9px] text-ivory-600 mt-0.5">{g.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
