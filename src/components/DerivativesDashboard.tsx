"use client";
import { useState } from "react";
import { Zap, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

type DerivTab = "greeks" | "flow" | "skew" | "positioning";

interface GreeksRow {
  symbol: string;
  expiry: string;
  strike: number;
  type: "CE" | "PE";
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  iv: number;
  ltp: number;
  oi: number;
  oiChg: number;
  premium: number;
}

interface OptionsFlow {
  id: string;
  time: string;
  symbol: string;
  strike: number;
  expiry: string;
  type: "CE" | "PE";
  side: "BUY" | "SELL";
  qty: number;
  premium: number;
  iv: number;
  notional: number;
  unusual: boolean;
  sentiment: "bullish" | "bearish" | "neutral";
}

const GREEKS: GreeksRow[] = [
  { symbol: "NIFTY", expiry: "22-May", strike: 24200, type: "CE", delta: 0.48, gamma: 0.0021, theta: -18.4, vega: 42.8, iv: 14.2, ltp: 142, oi: 2840000, oiChg: 184000, premium: 14.2 },
  { symbol: "NIFTY", expiry: "22-May", strike: 24200, type: "PE", delta: -0.52, gamma: 0.0021, theta: -16.8, vega: 41.2, iv: 15.8, ltp: 162, oi: 3240000, oiChg: -84000, premium: 16.2 },
  { symbol: "NIFTY", expiry: "22-May", strike: 24500, type: "CE", delta: 0.28, gamma: 0.0014, theta: -12.4, vega: 34.8, iv: 13.4, ltp: 68, oi: 4820000, oiChg: 320000, premium: 6.8 },
  { symbol: "NIFTY", expiry: "22-May", strike: 23900, type: "PE", delta: -0.31, gamma: 0.0016, theta: -14.2, vega: 36.4, iv: 16.8, ltp: 88, oi: 3640000, oiChg: -120000, premium: 8.8 },
  { symbol: "BANKNIFTY", expiry: "22-May", strike: 52500, type: "CE", delta: 0.42, gamma: 0.0008, theta: -42.8, vega: 84.2, iv: 15.4, ltp: 284, oi: 1240000, oiChg: 84000, premium: 28.4 },
  { symbol: "BANKNIFTY", expiry: "22-May", strike: 52500, type: "PE", delta: -0.58, gamma: 0.0008, theta: -38.4, vega: 80.8, iv: 17.2, ltp: 324, oi: 1640000, oiChg: -42000, premium: 32.4 },
  { symbol: "NIFTY", expiry: "29-May", strike: 24000, type: "CE", delta: 0.58, gamma: 0.0018, theta: -8.4, vega: 52.4, iv: 12.8, ltp: 284, oi: 1840000, oiChg: 240000, premium: 28.4 },
  { symbol: "NIFTY", expiry: "29-May", strike: 24000, type: "PE", delta: -0.42, gamma: 0.0018, theta: -7.8, vega: 50.8, iv: 14.4, ltp: 204, oi: 1420000, oiChg: -80000, premium: 20.4 },
];

const OPTIONS_FLOW: OptionsFlow[] = [
  { id: "of1", time: "09:18", symbol: "NIFTY", strike: 24500, expiry: "22-May", type: "CE", side: "BUY", qty: 5000, premium: 68, iv: 13.4, notional: 3.4, unusual: true, sentiment: "bullish" },
  { id: "of2", time: "09:24", symbol: "BANKNIFTY", strike: 52000, expiry: "22-May", type: "PE", side: "BUY", qty: 2000, premium: 420, iv: 17.8, notional: 8.4, unusual: true, sentiment: "bearish" },
  { id: "of3", time: "09:31", symbol: "NIFTY", strike: 24200, expiry: "29-May", type: "CE", side: "BUY", qty: 8000, premium: 284, iv: 12.8, notional: 22.7, unusual: true, sentiment: "bullish" },
  { id: "of4", time: "09:42", symbol: "NIFTY", strike: 23800, expiry: "22-May", type: "PE", side: "SELL", qty: 10000, premium: 42, iv: 18.4, notional: 4.2, unusual: false, sentiment: "bullish" },
  { id: "of5", time: "09:58", symbol: "NIFTY", strike: 24500, expiry: "29-May", type: "CE", side: "BUY", qty: 3000, premium: 184, iv: 13.8, notional: 5.5, unusual: false, sentiment: "bullish" },
  { id: "of6", time: "10:12", symbol: "BANKNIFTY", strike: 53000, expiry: "29-May", type: "CE", side: "BUY", qty: 1500, premium: 284, iv: 14.2, notional: 4.3, unusual: false, sentiment: "bullish" },
  { id: "of7", time: "10:28", symbol: "NIFTY", strike: 24000, expiry: "22-May", type: "PE", side: "BUY", qty: 4000, premium: 88, iv: 16.8, notional: 3.5, unusual: false, sentiment: "bearish" },
  { id: "of8", time: "10:45", symbol: "NIFTY", strike: 24200, expiry: "22-May", type: "CE", side: "SELL", qty: 12000, premium: 142, iv: 14.2, notional: 17.0, unusual: true, sentiment: "neutral" },
];

// IV Skew data — strikes vs IV for calls and puts
const IV_SKEW = [
  { strike: 23200, callIV: 18.4, putIV: 22.8 }, { strike: 23400, callIV: 16.8, putIV: 20.4 },
  { strike: 23600, callIV: 15.4, putIV: 18.4 }, { strike: 23800, callIV: 14.2, putIV: 16.8 },
  { strike: 24000, callIV: 13.4, putIV: 14.8 }, { strike: 24200, callIV: 14.2, putIV: 15.8 },
  { strike: 24400, callIV: 13.8, putIV: 14.2 }, { strike: 24600, callIV: 14.8, putIV: 13.4 },
  { strike: 24800, callIV: 16.2, putIV: 12.8 }, { strike: 25000, callIV: 17.8, putIV: 12.2 },
  { strike: 25200, callIV: 19.4, putIV: 11.8 },
];

// Dealer positioning
const DEALER_POSITIONING = [
  { segment: "Prop Desks", netDelta: 48200, netGamma: 1240, netTheta: -284000, netVega: 84200, bias: "bullish" },
  { segment: "FII (Index)", netDelta: -28400, netGamma: -840, netTheta: 184000, netVega: -42800, bias: "bearish" },
  { segment: "FII (Stock)", netDelta: 18400, netGamma: 420, netTheta: -92000, netVega: 28400, bias: "bullish" },
  { segment: "DII", netDelta: 8400, netGamma: 180, netTheta: -42000, netVega: 12800, bias: "bullish" },
  { segment: "Retail", netDelta: -42800, netGamma: -1820, netTheta: 284000, netVega: -62800, bias: "bearish" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px] space-y-0.5">
      <div className="text-ivory-500">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}{p.name.includes("IV") ? "%" : ""}</div>
      ))}
    </div>
  );
};

function fmtGreek(v: number, decimals = 4) {
  return v.toFixed(decimals);
}

function GrkCell({ v, decimals = 4, colorize = false }: { v: number; decimals?: number; colorize?: boolean }) {
  return (
    <span className={cn("font-mono text-[11px]",
      colorize ? (v >= 0 ? "text-signal-bull" : "text-signal-bear") : "text-ivory-300"
    )}>
      {colorize && v > 0 ? "+" : ""}{fmtGreek(v, decimals)}
    </span>
  );
}

export default function DerivativesDashboard() {
  const [tab, setTab] = useState<DerivTab>("greeks");
  const [symbolFilter, setSymbolFilter] = useState<"NIFTY" | "BANKNIFTY">("NIFTY");

  const tabs: { id: DerivTab; label: string }[] = [
    { id: "greeks", label: "Option Greeks" },
    { id: "flow", label: "Options Flow" },
    { id: "skew", label: "IV Skew" },
    { id: "positioning", label: "Dealer Positioning" },
  ];

  const filteredGreeks = GREEKS.filter(g => g.symbol === symbolFilter);
  const bullishFlow = OPTIONS_FLOW.filter(f => f.sentiment === "bullish").length;
  const unusualFlow = OPTIONS_FLOW.filter(f => f.unusual).length;
  const totalNotional = OPTIONS_FLOW.reduce((s, f) => s + f.notional, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-maroon-600" />
            Derivatives Dashboard
          </h2>
          <p className="text-xs text-ivory-500">Option Greeks, unusual options flow, IV skew & dealer positioning</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-ivory-500">Unusual Trades:</span>
          <span className="text-gold-500 font-bold">{unusualFlow}</span>
          <span className="text-ivory-700">|</span>
          <span className="text-ivory-500">Total Notional:</span>
          <span className="text-ivory-200 font-bold">₹{totalNotional.toFixed(1)} Cr</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Nifty IV (ATM)", value: "14.2%", sub: "VIX correlation: 0.84", color: "text-ivory-100" },
          { label: "Put-Call Skew", value: "+2.6%", sub: "Puts costlier → fear premium", color: "text-signal-bear" },
          { label: "Flow Sentiment", value: `${bullishFlow}/${OPTIONS_FLOW.length} Bull`, sub: "Option buyer bias", color: "text-signal-bull" },
          { label: "Gamma Exposure", value: "+₹2.4 Cr/pt", sub: "Positive gamma = support", color: "text-signal-bull" },
        ].map(k => (
          <div key={k.label} className="card-glass rounded-xl p-3">
            <div className={cn("text-sm font-display font-bold", k.color)}>{k.value}</div>
            <div className="text-[10px] text-ivory-400 mt-0.5">{k.label}</div>
            <div className="text-[9px] text-ivory-600 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-bg-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-3 py-2 text-xs font-semibold transition-colors -mb-px border-b-2",
              tab === t.id ? "text-maroon-300 border-maroon-600" : "text-ivory-600 border-transparent hover:text-ivory-300"
            )}>{t.label}</button>
        ))}
      </div>

      {/* Greeks Tab */}
      {tab === "greeks" && (
        <div className="space-y-3">
          <div className="flex gap-1">
            {(["NIFTY", "BANKNIFTY"] as const).map(s => (
              <button key={s} onClick={() => setSymbolFilter(s)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  symbolFilter === s ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300 hover:bg-bg-hover"
                )}>{s}</button>
            ))}
          </div>
          <div className="card-glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border bg-bg-secondary/50">
                    {["Symbol", "Strike", "Type", "LTP", "IV", "Delta", "Gamma", "Theta", "Vega", "OI", "OI Chg"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGreeks.map((row, i) => (
                    <tr key={`${row.symbol}-${row.strike}-${row.type}`} className={cn("border-b border-bg-border/50 hover:bg-bg-hover", i % 2 === 0 && "bg-bg-primary/20")}>
                      <td className="px-3 py-2.5 font-mono font-bold text-ivory-100">{row.symbol}</td>
                      <td className="px-3 py-2.5 font-mono text-ivory-200">{row.strike.toLocaleString()}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn("label-tag text-[9px]",
                          row.type === "CE" ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear"
                        )}>{row.type}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-ivory-200">{row.ltp}</td>
                      <td className="px-3 py-2.5 font-mono text-yellow-400">{row.iv}%</td>
                      <td className="px-3 py-2.5"><GrkCell v={row.delta} decimals={2} colorize /></td>
                      <td className="px-3 py-2.5"><GrkCell v={row.gamma} decimals={4} /></td>
                      <td className="px-3 py-2.5"><GrkCell v={row.theta} decimals={1} colorize /></td>
                      <td className="px-3 py-2.5"><GrkCell v={row.vega} decimals={1} colorize /></td>
                      <td className="px-3 py-2.5 font-mono text-ivory-400">{(row.oi / 1000000).toFixed(2)}M</td>
                      <td className={cn("px-3 py-2.5 font-mono font-bold", row.oiChg >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {row.oiChg >= 0 ? "+" : ""}{(Math.abs(row.oiChg) / 1000).toFixed(0)}K
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-maroon-950/30 text-[11px] text-ivory-400 leading-relaxed">
            <strong className="text-ivory-200">Greeks Interpretation:</strong> Delta = price sensitivity per ₹1 move. Gamma = rate of delta change (high gamma near expiry = risk). Theta = daily time decay (negative = option loses value each day). Vega = sensitivity to 1% IV change. Positive theta for option sellers = income; negative theta for buyers = cost of holding.
          </div>
        </div>
      )}

      {/* Options Flow Tab */}
      {tab === "flow" && (
        <div className="space-y-3">
          <div className="card-glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border bg-bg-secondary/50">
                    {["Time", "Symbol", "Strike", "Exp", "Type", "Side", "Qty", "Premium", "IV", "Notional", "Signal"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {OPTIONS_FLOW.map((row, i) => (
                    <tr key={row.id} className={cn("border-b border-bg-border/50 hover:bg-bg-hover transition-colors",
                      row.unusual && "bg-maroon-950/30",
                      i % 2 === 0 && !row.unusual && "bg-bg-primary/20"
                    )}>
                      <td className="px-3 py-2.5 font-mono text-ivory-400">{row.time}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-ivory-100">{row.symbol}</td>
                      <td className="px-3 py-2.5 font-mono text-ivory-200">{row.strike.toLocaleString()}</td>
                      <td className="px-3 py-2.5 font-mono text-ivory-500">{row.expiry}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn("label-tag text-[9px]",
                          row.type === "CE" ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear"
                        )}>{row.type}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={cn("label-tag text-[9px]",
                          row.side === "BUY" ? "bg-signal-bull/15 text-signal-bull" : "bg-ivory-800/20 text-ivory-400"
                        )}>{row.side}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-ivory-300">{row.qty.toLocaleString()}</td>
                      <td className="px-3 py-2.5 font-mono text-ivory-300">₹{row.premium}</td>
                      <td className="px-3 py-2.5 font-mono text-yellow-400">{row.iv}%</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-ivory-100">₹{row.notional}Cr</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {row.unusual && <span className="label-tag bg-gold-500/15 text-gold-500 text-[9px]">UNUSUAL</span>}
                          <span className={cn("label-tag text-[9px]",
                            row.sentiment === "bullish" ? "bg-signal-bull/15 text-signal-bull" :
                            row.sentiment === "bearish" ? "bg-signal-bear/15 text-signal-bear" :
                            "bg-yellow-500/15 text-yellow-400"
                          )}>{row.sentiment === "bullish" ? "↑" : row.sentiment === "bearish" ? "↓" : "→"}</span>
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

      {/* IV Skew Tab */}
      {tab === "skew" && (
        <div className="space-y-4">
          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-semibold text-ivory-300">Nifty IV Smile / Skew (22-May Expiry)</div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-signal-bull" /><span className="text-ivory-500">Call IV</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-signal-bear" /><span className="text-ivory-500">Put IV</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={IV_SKEW}>
                <XAxis dataKey="strike" tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false}
                  tickFormatter={v => (v / 1000).toFixed(1) + "K"} />
                <YAxis tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false} domain={[10, 25]}
                  tickFormatter={v => v + "%"} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={24180} stroke="#3d3a32" strokeDasharray="4 2"
                  label={{ value: "ATM", position: "top", fontSize: 9, fill: "#8b8472" }} />
                <Line type="monotone" dataKey="callIV" stroke="#22c55e" strokeWidth={2} dot={false} name="Call IV" />
                <Line type="monotone" dataKey="putIV" stroke="#ef4444" strokeWidth={2} dot={false} name="Put IV" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="card-glass rounded-xl p-3 text-center">
              <div className="text-xl font-display font-bold text-signal-bear">+2.6%</div>
              <div className="text-[10px] text-ivory-500">ATM Put-Call IV Spread</div>
              <div className="text-[9px] text-ivory-600 mt-0.5">Puts costlier = fear premium present</div>
            </div>
            <div className="card-glass rounded-xl p-3 text-center">
              <div className="text-xl font-display font-bold text-yellow-400">14.2%</div>
              <div className="text-[10px] text-ivory-500">ATM Call IV (24,200 CE)</div>
              <div className="text-[9px] text-ivory-600 mt-0.5">Near 52-week low — cheap calls</div>
            </div>
            <div className="card-glass rounded-xl p-3 text-center">
              <div className="text-xl font-display font-bold text-signal-bull">Positive Skew</div>
              <div className="text-[10px] text-ivory-500">OTM Puts &gt; OTM Calls</div>
              <div className="text-[9px] text-ivory-600 mt-0.5">Market pricing downside tail risk</div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-maroon-950/30 text-[11px] text-ivory-400 leading-relaxed">
            <strong className="text-ivory-200">IV Skew Interpretation:</strong> Put IV &gt; Call IV = investors paying more for downside protection (fear). Current put-call IV spread of +2.6% is moderate — market is cautious but not panicking. ATM calls at 14.2% IV are cheap historically; consider buying calls for directional upside with favorable risk-reward.
          </div>
        </div>
      )}

      {/* Dealer Positioning */}
      {tab === "positioning" && (
        <div className="space-y-4">
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-4">Net Delta Exposure by Participant (Cr)</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={DEALER_POSITIONING} layout="vertical" margin={{ left: 80 }} barSize={12}>
                <XAxis type="number" tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false}
                  tickFormatter={v => v > 0 ? `+${v / 1000}K` : `${v / 1000}K`} />
                <YAxis type="category" dataKey="segment" tick={{ fontSize: 10, fill: "#c8bfa8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={0} stroke="#3d3a32" />
                <Bar dataKey="netDelta" name="Net Delta" radius={[0, 2, 2, 0]}>
                  {DEALER_POSITIONING.map((d, i) => (
                    <Cell key={i} fill={d.netDelta >= 0 ? "#22c55e" : "#ef4444"} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border">
                    {["Participant", "Net Delta", "Net Gamma", "Net Theta", "Net Vega", "Bias"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEALER_POSITIONING.map((d, i) => (
                    <tr key={d.segment} className={cn("border-b border-bg-border/50 hover:bg-bg-hover", i % 2 === 0 && "bg-bg-primary/20")}>
                      <td className="px-3 py-2.5 font-semibold text-ivory-200">{d.segment}</td>
                      <td className={cn("px-3 py-2.5 font-mono font-bold", d.netDelta >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {d.netDelta >= 0 ? "+" : ""}{(d.netDelta / 1000).toFixed(1)}K
                      </td>
                      <td className={cn("px-3 py-2.5 font-mono", d.netGamma >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {d.netGamma >= 0 ? "+" : ""}{d.netGamma}
                      </td>
                      <td className={cn("px-3 py-2.5 font-mono", d.netTheta >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {d.netTheta >= 0 ? "+" : ""}₹{(Math.abs(d.netTheta) / 1000).toFixed(0)}K
                      </td>
                      <td className={cn("px-3 py-2.5 font-mono", d.netVega >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                        {d.netVega >= 0 ? "+" : ""}₹{(Math.abs(d.netVega) / 1000).toFixed(0)}K
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={cn("label-tag text-[9px]",
                          d.bias === "bullish" ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear"
                        )}>
                          {d.bias === "bullish" ? "↑ BULLISH" : "↓ BEARISH"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-maroon-950/30 text-[11px] text-ivory-400 leading-relaxed">
            <strong className="text-ivory-200">Positioning Read:</strong> Prop desks and DII are net long delta (bullish). FII index positioning is net short delta — using index puts as hedge on their large equity book (structural). Retail traders are net short delta — contrarian bullish signal. Aggregate positioning is moderately bullish with support at 24,000.
          </div>
        </div>
      )}
    </div>
  );
}
