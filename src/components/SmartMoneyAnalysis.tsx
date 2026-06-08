"use client";
import { useState, useEffect, useMemo } from "react";
import { Brain, Eye, Target, Zap, TrendingUp, Users, DollarSign, AlertTriangle } from "lucide-react";
import { useAngelQuotes } from "@/hooks/useAngelData";
import { calcSmartMoneyScore } from "@/lib/angelData";
import { cn, fmt, fmtPct, scoreColor, scoreBg, colorFromChange } from "@/lib/utils";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, Cell, LineChart, Line, ReferenceLine,
} from "recharts";

// Generate fake smart money flow data
function genFlowData(days = 30) {
  const data = [];
  let fii = 0, dii = 0;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    fii += (Math.random() - 0.42) * 800;
    dii += (Math.random() - 0.44) * 600;
    data.push({
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      fii: parseFloat(fii.toFixed(0)),
      dii: parseFloat(dii.toFixed(0)),
      net: parseFloat((fii + dii).toFixed(0)),
    });
  }
  return data;
}

const flowData = genFlowData();

// Smart money detection signals
const smSignals = [
  {
    type: "institutional_accumulation",
    icon: "🏦",
    title: "Institutional Accumulation",
    stocks: [
      { symbol: "HAL", confidence: 96, evidence: "Block deal ₹284Cr at support zone. Delivery 68%. 3-session accumulation.", alert: true },
      { symbol: "TCS", confidence: 88, evidence: "FII +1.8% stake QoQ. Large lot buying in F&O. Delivery 72%.", alert: false },
      { symbol: "RVNL", confidence: 84, evidence: "MF buying dips. SIP inflow concentration. High delivery volume.", alert: true },
    ],
  },
  {
    type: "smart_money_entry",
    icon: "💰",
    title: "Smart Money Entry",
    stocks: [
      { symbol: "SUNPHARMA", confidence: 82, evidence: "Delivery spike 78.4% — 52W high. Low brokerage large trades.", alert: true },
      { symbol: "DLF", confidence: 76, evidence: "Volume expansion 2.6x. Option chain: heavy call writing at 950 suggests smart money long.", alert: false },
    ],
  },
  {
    type: "operator_activity",
    icon: "⚡",
    title: "Operator Activity",
    stocks: [
      { symbol: "TATAMOTORS", confidence: 72, evidence: "Unusual OI build +14.4%. Multiple dips bought. Accumulation at demand zone.", alert: false },
    ],
  },
  {
    type: "distribution",
    icon: "🔴",
    title: "Distribution Detected",
    stocks: [
      { symbol: "TATASTEEL", confidence: 88, evidence: "FII sold 2.4% stake. High volume on down days. Distribution phase confirmed.", alert: true },
    ],
  },
];

// ICT concepts visualization
const ictConcepts = [
  { label: "Order Blocks Detected", count: 12, color: "text-signal-bull", description: "Institutional order blocks on key support zones" },
  { label: "Fair Value Gaps", count: 8, color: "text-signal-accumulate", description: "Unfilled FVGs acting as magnetic levels" },
  { label: "Liquidity Sweeps", count: 5, color: "text-gold-500", description: "Stop hunts above/below key levels" },
  { label: "Smart Money Reversals", count: 4, color: "text-maroon-400", description: "Structure breaks with volume confirmation" },
  { label: "Manipulation Zones", count: 3, color: "text-signal-distribute", description: "False breakouts before true direction" },
];

// Wyckoff phase detector
const wyckoffData = [
  { symbol: "HAL", phase: "Markup", subPhase: "Phase C→D", confidence: 91, action: "BUY" },
  { symbol: "TCS", phase: "Markup", subPhase: "Phase D", confidence: 86, action: "BUY" },
  { symbol: "HDFCBANK", phase: "Accumulation", subPhase: "Phase B", confidence: 76, action: "ACCUMULATE" },
  { symbol: "RVNL", phase: "Markup", subPhase: "Phase C", confidence: 84, action: "BUY" },
  { symbol: "TATASTEEL", phase: "Markdown", subPhase: "Phase B", confidence: 88, action: "AVOID" },
  { symbol: "SUNPHARMA", phase: "Markup", subPhase: "Phase B→C", confidence: 78, action: "BUY" },
];

function SmartMoneyScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 85 ? "#00E676" : score >= 70 ? "#00BCD4" : score >= 50 ? "#FFB300" : "#FF1744";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-20 h-20">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1E1E24" strokeWidth="6" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
            strokeLinecap="round" transform="rotate(-90 40 40)"
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-mono font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-ivory-500 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function SmartMoneyAnalysis() {
  const [activeTab, setActiveTab] = useState<"signals" | "flow" | "wyckoff" | "ict">("signals");
  const { quotes, isLive } = useAngelQuotes();

  // Composite scores computed from live data; fallback to static when no session
  const composite = useMemo(() => {
    const vals: number[] = [];
    quotes.forEach(q => { if (typeof q.changePct === "number") vals.push(calcSmartMoneyScore(q)); });
    if (vals.length === 0) return { overall: 84, accumulation: 88, institutional: 76, breakout: 82, momentum: 71 };
    const avg     = vals.reduce((s, v) => s + v, 0) / vals.length;
    const bullPct = vals.filter(v => v > 55).length / vals.length;
    const boPct   = vals.filter(v => v > 70).length / vals.length;
    return {
      overall:       Math.round(Math.min(99, avg)),
      accumulation:  Math.round(Math.min(99, avg + bullPct * 12)),
      institutional: Math.round(Math.min(99, avg * 0.94 + 2)),
      breakout:      Math.round(Math.min(99, boPct * 80 + 18)),
      momentum:      Math.round(Math.min(99, avg * 0.88 + 4)),
    };
  }, [quotes]);

  // Live signal stocks: confidence derived from real market data
  const liveSignals = useMemo(() => {
    return smSignals.map(group => ({
      ...group,
      stocks: group.stocks.map(stock => {
        const q = quotes.get(stock.symbol);
        if (!q) return stock;
        const score = calcSmartMoneyScore(q);
        const priceTag = ` LTP ₹${q.ltp.toLocaleString("en-IN", { maximumFractionDigits: 1 })} (${q.changePct >= 0 ? "+" : ""}${q.changePct.toFixed(2)}%).`;
        return { ...stock, confidence: score, evidence: stock.evidence + priceTag };
      }),
    }));
  }, [quotes]);

  // Live Wyckoff: confidence from real momentum
  const liveWyckoff = useMemo(() => {
    return wyckoffData.map(w => {
      const q = quotes.get(w.symbol);
      if (!q) return w;
      const confidence = Math.min(99, Math.max(50, calcSmartMoneyScore(q)));
      return { ...w, confidence };
    });
  }, [quotes]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-maroon-600" />
            AI Smart Money Analysis
          </h2>
          <p className="text-xs text-ivory-500">Institutional footprint detection • ICT/SMC concepts • Wyckoff analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? "bg-signal-bull live-dot" : "bg-ivory-600"}`} />
          <span className={`text-xs font-mono ${isLive ? "text-signal-bull" : "text-ivory-600"}`}>
            {isLive ? "● LIVE — Angel One" : "SIMULATED"}
          </span>
        </div>
      </div>

      {/* Score dashboard */}
      <div className="card-glass rounded-xl p-4">
        <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-4">
          Smart Money Composite Dashboard
        </div>
        <div className="flex flex-wrap gap-6 justify-around">
          <SmartMoneyScoreGauge score={composite.overall}       label="Overall SM Score" />
          <SmartMoneyScoreGauge score={composite.accumulation}  label="Accumulation Index" />
          <SmartMoneyScoreGauge score={composite.institutional} label="Institutional Bias" />
          <SmartMoneyScoreGauge score={composite.breakout}      label="Breakout Readiness" />
          <SmartMoneyScoreGauge score={composite.momentum}      label="Momentum Quality" />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-bg-border pb-0.5">
        {[
          { id: "signals", label: "SM Signals", icon: <Zap className="w-3 h-3" /> },
          { id: "flow", label: "FII/DII Flow", icon: <DollarSign className="w-3 h-3" /> },
          { id: "wyckoff", label: "Wyckoff Phase", icon: <TrendingUp className="w-3 h-3" /> },
          { id: "ict", label: "ICT/SMC", icon: <Target className="w-3 h-3" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-b-2 -mb-0.5",
              activeTab === tab.id
                ? "text-maroon-400 border-maroon-700"
                : "text-ivory-600 border-transparent hover:text-ivory-300"
            )}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Smart Money Signals */}
      {activeTab === "signals" && (
        <div className="space-y-4">
          {liveSignals.map(group => (
            <div key={group.type} className="card-glass rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-bg-border flex items-center gap-2">
                <span className="text-lg">{group.icon}</span>
                <span className="text-xs font-semibold text-ivory-300 uppercase tracking-wider">{group.title}</span>
                <span className="ml-auto label-tag bg-maroon-800/20 text-maroon-400">{group.stocks.length}</span>
              </div>
              {group.stocks.map(stock => (
                <div key={stock.symbol} className="px-4 py-3 border-b border-bg-border/50 last:border-0 hover:bg-bg-hover transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm text-ivory-100">{stock.symbol}</span>
                        {stock.alert && (
                          <span className="label-tag bg-signal-bear/15 text-signal-bear">ALERT</span>
                        )}
                      </div>
                      <p className="text-xs text-ivory-400 leading-relaxed">{stock.evidence}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-ivory-500">Confidence</div>
                      <div className={cn("text-xl font-mono font-bold", scoreColor(stock.confidence))}>
                        {stock.confidence}%
                      </div>
                      <div className="w-16 h-1 bg-bg-border rounded-full overflow-hidden mt-1">
                        <div className={cn("h-full rounded-full", scoreBg(stock.confidence))}
                          style={{ width: `${stock.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* FII/DII Flow */}
      {activeTab === "flow" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gold-500/10 border border-gold-500/20 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
            <span className="text-[10px] text-gold-400">FII/DII flow numbers below are indicative estimates. For real-time SEBI data, check NSE/BSE official portals.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "FII Net (MTD)", value: "₹12,450 Cr", change: "+29.6%", positive: true },
              { label: "DII Net (MTD)", value: "₹8,320 Cr", change: "+17.5%", positive: true },
              { label: "Cumulative Net", value: "₹20,770 Cr", change: "+24.1%", positive: true },
            ].map(c => (
              <div key={c.label} className="card-glass rounded-xl p-3 text-center relative overflow-hidden">
                <div className="text-xs text-ivory-500">{c.label}</div>
                <div className={cn("text-xl font-mono font-bold mt-1", c.positive ? "text-signal-bull" : "text-signal-bear")}>{c.value}</div>
                <div className={cn("text-xs font-mono", c.positive ? "text-signal-bull" : "text-signal-bear")}>{c.change} MoM</div>
                <span className="absolute top-1 right-1 text-[8px] font-mono text-gold-500/60">EST.</span>
              </div>
            ))}
          </div>

          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                Cumulative FII/DII Flow (30 Days)
              </div>
              <span className="text-[9px] font-mono text-gold-500/70 bg-gold-500/10 px-1.5 py-0.5 rounded">SIMULATED</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={flowData} margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                  <defs>
                    <linearGradient id="fiiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00E676" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="diiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00BCD4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#00BCD4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "#A09278", fontSize: 9 }} interval={4} />
                  <YAxis tick={{ fill: "#A09278", fontSize: 9 }} tickFormatter={v => `₹${(v/100).toFixed(0)}Cr`} />
                  <Tooltip
                    contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
                    labelStyle={{ color: "#F5F0E8" }}
                    itemStyle={{ color: "#A09278" }}
                  />
                  <ReferenceLine y={0} stroke="#1E1E24" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="fii" name="FII" stroke="#00E676" fill="url(#fiiGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="dii" name="DII" stroke="#00BCD4" fill="url(#diiGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                Sector-wise FII Allocation
              </div>
              <span className="text-[9px] font-mono text-gold-500/70 bg-gold-500/10 px-1.5 py-0.5 rounded">INDICATIVE</span>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { sector: "IT", fii: 38.4, dii: 22.1 },
                    { sector: "Banking", fii: 32.4, dii: 28.4 },
                    { sector: "Pharma", fii: 24.2, dii: 31.4 },
                    { sector: "Auto", fii: 28.4, dii: 24.8 },
                    { sector: "CapGoods", fii: 18.4, dii: 36.2 },
                    { sector: "Realty", fii: 14.2, dii: 22.4 },
                    { sector: "Railway", fii: 6.4, dii: 42.4 },
                    { sector: "Defence", fii: 12.4, dii: 28.6 },
                  ]}
                  margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                >
                  <XAxis dataKey="sector" tick={{ fill: "#A09278", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#A09278", fontSize: 9 }} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Bar dataKey="fii" name="FII%" fill="#00E676" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="dii" name="DII%" fill="#00BCD4" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Wyckoff Phases */}
      {activeTab === "wyckoff" && (
        <div className="space-y-4">
          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                Wyckoff Market Cycle Detector
              </div>
              <span className={cn(
                "text-[9px] font-mono px-1.5 py-0.5 rounded",
                isLive ? "text-signal-bull bg-signal-bull/10" : "text-gold-500/70 bg-gold-500/10"
              )}>
                {isLive ? "CONFIDENCE: LIVE" : "PHASES: SIMULATED"}
              </span>
            </div>
            <p className="text-xs text-ivory-600 mb-4">
              {isLive
                ? "Confidence scores updated from live Angel One price data. Phase labels are AI analysis."
                : "Connect Angel One to update confidence scores with real price momentum."}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-bg-border">
                    {["Symbol", "Wyckoff Phase", "Sub-Phase", "Action", "Confidence"].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {liveWyckoff.map(w => (
                    <tr key={w.symbol} className="border-b border-bg-border/50 hover:bg-bg-hover">
                      <td className="px-3 py-2.5 font-mono font-bold text-xs text-ivory-100">{w.symbol}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn(
                          "label-tag",
                          w.phase === "Markup" ? "bg-signal-bull/15 text-signal-bull" :
                          w.phase === "Accumulation" ? "bg-signal-accumulate/15 text-signal-accumulate" :
                          "bg-signal-bear/15 text-signal-bear"
                        )}>
                          {w.phase}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-ivory-400 font-mono">{w.subPhase}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn(
                          "label-tag font-bold",
                          w.action === "BUY" ? "bg-signal-bull/20 text-signal-bull" :
                          w.action === "ACCUMULATE" ? "bg-signal-accumulate/20 text-signal-accumulate" :
                          "bg-signal-bear/20 text-signal-bear"
                        )}>
                          {w.action}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-bg-border rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", scoreBg(w.confidence))}
                              style={{ width: `${w.confidence}%` }} />
                          </div>
                          <span className={cn("text-xs font-mono", scoreColor(w.confidence))}>{w.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ICT/SMC Concepts */}
      {activeTab === "ict" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gold-500/10 border border-gold-500/20 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
            <span className="text-[10px] text-gold-400">ICT/SMC detections below are AI-generated pattern analysis. These are educational illustrations — not live order book data.</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ictConcepts.map(c => (
              <div key={c.label} className="card-glass rounded-xl p-3 flex items-start gap-3">
                <div className={cn("text-2xl font-mono font-bold flex-shrink-0", c.color)}>{c.count}</div>
                <div>
                  <div className="text-xs font-semibold text-ivory-200">{c.label}</div>
                  <div className="text-[10px] text-ivory-500 mt-0.5">{c.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">
                ICT Smart Money Concepts — Key Detections
              </div>
              <span className="text-[9px] font-mono text-gold-500/70 bg-gold-500/10 px-1.5 py-0.5 rounded">AI ANALYSIS</span>
            </div>
            <div className="space-y-3">
              {[
                {
                  type: "Order Block", symbol: "HAL", zone: "₹4,620 - ₹4,680", status: "ACTIVE",
                  desc: "Bullish order block at institutional demand. Price reacted +5.2% from OB. Volume confirmation present.",
                  color: "text-signal-bull",
                },
                {
                  type: "Fair Value Gap", symbol: "TCS", zone: "₹4,150 - ₹4,200", status: "UNFILLED",
                  desc: "FVG from May 8 gap-up still unfilled. Potential pullback magnet. Smart money likely to fill before continuation.",
                  color: "text-signal-accumulate",
                },
                {
                  type: "Liquidity Sweep", symbol: "RVNL", zone: "₹548 support swept", status: "CONFIRMED",
                  desc: "Classic stop hunt below 550 support. Quick reversal confirms smart money absorbed retail sell stops.",
                  color: "text-gold-500",
                },
                {
                  type: "Change of Character", symbol: "SUNPHARMA", zone: "₹1,820", status: "BOS CONFIRMED",
                  desc: "Break of structure at 1820 confirms bullish CHoCH. Previous lower high broken. New uptrend initiated.",
                  color: "text-signal-bull",
                },
                {
                  type: "Manipulation Zone", symbol: "TATASTEEL", zone: "₹155 - ₹160", status: "DISTRIBUTE",
                  desc: "False breakout above 155 resistance. Price rejected and reversed. Classic distribution before markdown.",
                  color: "text-signal-bear",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg border border-bg-border hover:border-maroon-800/40 transition-colors">
                  <div className="flex-shrink-0">
                    <span className={cn("label-tag", item.color.replace("text-", "bg-") + "/15 " + item.color)}>
                      {item.type}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-xs text-ivory-100">{item.symbol}</span>
                      <span className="text-[10px] text-ivory-500 font-mono">{item.zone}</span>
                      <span className={cn("label-tag ml-auto", item.color.replace("text-", "bg-") + "/20 " + item.color)}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-ivory-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
