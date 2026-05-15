"use client";
import { useState } from "react";
import { DollarSign, Calendar, TrendingUp, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

type DivTab = "portfolio" | "calendar" | "history" | "drip";

interface DivStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  shares: number;
  dps: number;
  frequency: "Annual" | "Semi-annual" | "Quarterly" | "Monthly";
  yield: number;
  payoutRatio: number;
  divGrowth5y: number;
  exDate: string;
  payDate: string;
  lastDividend: number;
  consecutive: number;
  isSafe: boolean;
}

interface DivEvent {
  date: string;
  symbol: string;
  type: "ex-date" | "record" | "pay";
  amount: number;
  yield: number;
}

const DIV_PORTFOLIO: DivStock[] = [
  { symbol: "ITC", name: "ITC Limited", sector: "FMCG", price: 428, shares: 500, dps: 7.5, frequency: "Annual", yield: 1.75, payoutRatio: 84, divGrowth5y: 8.2, exDate: "20-May-26", payDate: "05-Jun-26", lastDividend: 7.0, consecutive: 28, isSafe: true },
  { symbol: "COALINDIA", name: "Coal India", sector: "Mining", price: 478, shares: 300, dps: 29.0, frequency: "Semi-annual", yield: 6.07, payoutRatio: 72, divGrowth5y: 12.4, exDate: "17-May-26", payDate: "02-Jun-26", lastDividend: 25.0, consecutive: 18, isSafe: true },
  { symbol: "POWERGRID", name: "Power Grid", sector: "Power", price: 280, shares: 600, dps: 9.0, frequency: "Quarterly", yield: 3.21, payoutRatio: 62, divGrowth5y: 6.8, exDate: "18-May-26", payDate: "04-Jun-26", lastDividend: 8.5, consecutive: 22, isSafe: true },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: 1842, shares: 100, dps: 19.5, frequency: "Annual", yield: 1.06, payoutRatio: 18, divGrowth5y: 14.2, exDate: "22-May-26", payDate: "10-Jun-26", lastDividend: 15.0, consecutive: 24, isSafe: true },
  { symbol: "TCS", name: "TCS", sector: "IT", price: 3870, shares: 50, dps: 10.0, frequency: "Quarterly", yield: 0.26, payoutRatio: 42, divGrowth5y: 22.4, exDate: "25-May-26", payDate: "12-Jun-26", lastDividend: 10.0, consecutive: 12, isSafe: true },
  { symbol: "HAL", name: "HAL", sector: "Defence", price: 4280, shares: 30, dps: 35.0, frequency: "Annual", yield: 0.82, payoutRatio: 22, divGrowth5y: 28.4, exDate: "30-May-26", payDate: "18-Jun-26", lastDividend: 24.0, consecutive: 8, isSafe: true },
  { symbol: "HINDUNILVR", name: "HUL", sector: "FMCG", price: 2384, shares: 80, dps: 42.0, frequency: "Semi-annual", yield: 1.76, payoutRatio: 94, divGrowth5y: 4.8, exDate: "10-Jun-26", payDate: "28-Jun-26", lastDividend: 40.0, consecutive: 32, isSafe: true },
  { symbol: "NESTLEIND", name: "Nestle India", sector: "FMCG", price: 24840, shares: 5, dps: 320.0, frequency: "Annual", yield: 1.29, payoutRatio: 78, divGrowth5y: 8.4, exDate: "15-Jun-26", payDate: "02-Jul-26", lastDividend: 300.0, consecutive: 26, isSafe: true },
];

const DIV_CALENDAR: DivEvent[] = [
  { date: "17-May", symbol: "COALINDIA", type: "ex-date", amount: 14.5, yield: 3.04 },
  { date: "18-May", symbol: "POWERGRID", type: "ex-date", amount: 2.25, yield: 0.80 },
  { date: "20-May", symbol: "ITC", type: "ex-date", amount: 7.5, yield: 1.75 },
  { date: "22-May", symbol: "HDFCBANK", type: "ex-date", amount: 19.5, yield: 1.06 },
  { date: "25-May", symbol: "TCS", type: "ex-date", amount: 10.0, yield: 0.26 },
  { date: "30-May", symbol: "HAL", type: "ex-date", amount: 35.0, yield: 0.82 },
  { date: "02-Jun", symbol: "COALINDIA", type: "pay", amount: 14.5, yield: 3.04 },
  { date: "04-Jun", symbol: "POWERGRID", type: "pay", amount: 2.25, yield: 0.80 },
  { date: "05-Jun", symbol: "ITC", type: "pay", amount: 7.5, yield: 1.75 },
  { date: "10-Jun", symbol: "HDFCBANK", type: "pay", amount: 19.5, yield: 1.06 },
  { date: "10-Jun", symbol: "HINDUNILVR", type: "ex-date", amount: 21.0, yield: 0.88 },
  { date: "12-Jun", symbol: "TCS", type: "pay", amount: 10.0, yield: 0.26 },
  { date: "15-Jun", symbol: "NESTLEIND", type: "ex-date", amount: 320.0, yield: 1.29 },
  { date: "18-Jun", symbol: "HAL", type: "pay", amount: 35.0, yield: 0.82 },
];

const DIV_HISTORY = [
  { year: "FY21", ITC: 5.0, COALINDIA: 17.5, POWERGRID: 5.5, HDFCBANK: 6.5 },
  { year: "FY22", ITC: 5.5, COALINDIA: 19.0, POWERGRID: 6.5, HDFCBANK: 6.5 },
  { year: "FY23", ITC: 6.25, COALINDIA: 22.5, POWERGRID: 7.5, HDFCBANK: 7.5 },
  { year: "FY24", ITC: 7.0, COALINDIA: 25.0, POWERGRID: 8.5, HDFCBANK: 15.0 },
  { year: "FY25", ITC: 7.5, COALINDIA: 29.0, POWERGRID: 9.0, HDFCBANK: 19.5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px] space-y-0.5">
      <div className="text-ivory-500">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: ₹{p.value}</div>
      ))}
    </div>
  );
};

function DRIPCalculator() {
  const [investment, setInvestment] = useState(500000);
  const [yield_, setYield] = useState(3.5);
  const [years, setYears] = useState(10);
  const [divGrowth, setDivGrowth] = useState(8);
  const [priceGrowth, setPriceGrowth] = useState(12);

  const calc = () => {
    let shares = investment / 1000; // assume ₹1000 price
    let price = 1000;
    let totalDivReceived = 0;
    const yearlyData: { year: string; portfolioVal: number; cumDiv: number; income: number }[] = [];

    for (let y = 1; y <= years; y++) {
      const annualDivPerShare = price * yield_ / 100 * Math.pow(1 + divGrowth / 100, y - 1);
      const annualIncome = shares * annualDivPerShare;
      totalDivReceived += annualIncome;
      // Reinvest dividends at current price
      shares += annualIncome / price;
      price *= (1 + priceGrowth / 100);
      yearlyData.push({
        year: `Y${y}`,
        portfolioVal: Math.round(shares * price / 1000),
        cumDiv: Math.round(totalDivReceived / 1000),
        income: Math.round(annualIncome),
      });
    }

    return { yearlyData, finalValue: Math.round(shares * price), totalDivReceived: Math.round(totalDivReceived), finalShares: Math.round(shares) };
  };

  const result = calc();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Investment (₹)", val: investment, set: setInvestment, min: 100000, max: 10000000, step: 100000, fmt: (v: number) => `₹${(v / 100000).toFixed(0)}L` },
          { label: "Dividend Yield %", val: yield_, set: setYield, min: 0.5, max: 10, step: 0.5, fmt: (v: number) => `${v}%` },
          { label: "Years", val: years, set: setYears, min: 1, max: 30, step: 1, fmt: (v: number) => `${v}y` },
          { label: "Dividend Growth %", val: divGrowth, set: setDivGrowth, min: 0, max: 20, step: 1, fmt: (v: number) => `${v}%` },
          { label: "Price Appreciation %", val: priceGrowth, set: setPriceGrowth, min: 0, max: 25, step: 1, fmt: (v: number) => `${v}%` },
        ].map(f => (
          <div key={f.label}>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-ivory-500">{f.label}</span>
              <span className="text-[10px] text-ivory-200 font-mono font-bold">{f.fmt(f.val)}</span>
            </div>
            <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
              onChange={e => f.set(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-maroon-600 cursor-pointer" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="card-glass rounded-xl p-3">
          <div className="text-sm font-display font-bold text-gold-500">₹{(result.finalValue / 100000).toFixed(1)}L</div>
          <div className="text-[9px] text-ivory-600">Final Portfolio Value</div>
          <div className="text-[9px] text-signal-bull font-mono mt-0.5">{((result.finalValue / investment - 1) * 100).toFixed(0)}% return</div>
        </div>
        <div className="card-glass rounded-xl p-3">
          <div className="text-sm font-display font-bold text-signal-bull">₹{(result.totalDivReceived / 100000).toFixed(1)}L</div>
          <div className="text-[9px] text-ivory-600">Total Dividends Reinvested</div>
        </div>
        <div className="card-glass rounded-xl p-3">
          <div className="text-sm font-display font-bold text-ivory-200">{result.finalShares}</div>
          <div className="text-[9px] text-ivory-600">Final Shares (vs {Math.round(investment / 1000)} initial)</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={result.yearlyData} barSize={12}>
          <XAxis dataKey="year" tick={{ fontSize: 8, fill: "#8b8472" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip formatter={(v: any, name: string) => [`₹${v}K`, name]} contentStyle={{ background: "#1a1814", border: "1px solid #3d3a32", fontSize: 10 }} />
          <Bar dataKey="portfolioVal" fill="#7c2d32" name="Portfolio (₹K)" radius={[2, 2, 0, 0]} opacity={0.85} />
          <Bar dataKey="cumDiv" fill="#22c55e" name="Cum. Div (₹K)" radius={[2, 2, 0, 0]} opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DividendTracker() {
  const [tab, setTab] = useState<DivTab>("portfolio");
  const [histSymbol, setHistSymbol] = useState<"ITC" | "COALINDIA" | "POWERGRID" | "HDFCBANK">("COALINDIA");

  const totalAnnualIncome = DIV_PORTFOLIO.reduce((s, d) => s + d.dps * d.shares, 0);
  const totalInvested = DIV_PORTFOLIO.reduce((s, d) => s + d.price * d.shares, 0);
  const portfolioYield = (totalAnnualIncome / totalInvested) * 100;
  const monthlyIncome = totalAnnualIncome / 12;

  const tabs: { id: DivTab; label: string }[] = [
    { id: "portfolio", label: "Portfolio" },
    { id: "calendar", label: "Div Calendar" },
    { id: "history", label: "Dividend History" },
    { id: "drip", label: "DRIP Calculator" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-maroon-600" />
            Dividend Tracker
          </h2>
          <p className="text-xs text-ivory-500">Dividend portfolio income, ex-date calendar & DRIP calculator</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-ivory-500">Annual Income:</span>
          <span className="text-signal-bull font-bold">₹{Math.round(totalAnnualIncome).toLocaleString()}</span>
          <span className="text-ivory-700">|</span>
          <span className="text-ivory-500">Yield:</span>
          <span className="text-gold-500 font-bold">{portfolioYield.toFixed(2)}%</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Annual Income", value: `₹${Math.round(totalAnnualIncome).toLocaleString()}`, color: "text-signal-bull" },
          { label: "Monthly Income", value: `₹${Math.round(monthlyIncome).toLocaleString()}`, color: "text-signal-bull" },
          { label: "Portfolio Yield", value: `${portfolioYield.toFixed(2)}%`, color: "text-gold-500" },
          { label: "Stocks Tracked", value: DIV_PORTFOLIO.length, color: "text-ivory-200" },
        ].map(k => (
          <div key={k.label} className="card-glass rounded-xl p-3 text-center">
            <div className={cn("text-xl font-display font-bold", k.color)}>{k.value}</div>
            <div className="text-[10px] text-ivory-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-bg-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-3 py-2 text-xs font-semibold transition-colors -mb-px border-b-2",
              tab === t.id ? "text-maroon-300 border-maroon-600" : "text-ivory-600 border-transparent hover:text-ivory-300"
            )}>{t.label}</button>
        ))}
      </div>

      {/* Portfolio Tab */}
      {tab === "portfolio" && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-bg-border bg-bg-secondary/50">
                  {["Symbol", "Sector", "Shares", "Price", "DPS", "Yield", "Annual Income", "Frequency", "Ex-Date", "Payout", "Growth 5Y", "Consec. Yrs", "Safety"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...DIV_PORTFOLIO].sort((a, b) => b.dps * b.shares - a.dps * a.shares).map((d, i) => (
                  <tr key={d.symbol} className={cn("border-b border-bg-border/50 hover:bg-bg-hover transition-colors", i % 2 === 0 && "bg-bg-primary/20")}>
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-ivory-100">{d.symbol}</div>
                      <div className="text-[9px] text-ivory-600">{d.name.slice(0, 12)}</div>
                    </td>
                    <td className="px-3 py-2.5 text-ivory-500 text-[11px]">{d.sector}</td>
                    <td className="px-3 py-2.5 font-mono text-ivory-300">{d.shares}</td>
                    <td className="px-3 py-2.5 font-mono text-ivory-300">₹{d.price}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-gold-500">₹{d.dps}</td>
                    <td className={cn("px-3 py-2.5 font-mono font-bold", d.yield >= 3 ? "text-signal-bull" : d.yield >= 1.5 ? "text-yellow-400" : "text-ivory-400")}>{d.yield}%</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-signal-bull">₹{(d.dps * d.shares).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-ivory-500 text-[11px]">{d.frequency}</td>
                    <td className="px-3 py-2.5 font-mono text-ivory-300">{d.exDate}</td>
                    <td className={cn("px-3 py-2.5 font-mono", d.payoutRatio > 80 ? "text-signal-bear" : d.payoutRatio > 60 ? "text-yellow-400" : "text-signal-bull")}>{d.payoutRatio}%</td>
                    <td className={cn("px-3 py-2.5 font-mono font-bold", d.divGrowth5y >= 10 ? "text-signal-bull" : "text-yellow-400")}>{d.divGrowth5y}%</td>
                    <td className="px-3 py-2.5 font-mono text-ivory-300">{d.consecutive} yrs</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("label-tag text-[9px]", d.isSafe ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear")}>
                        {d.isSafe ? "SAFE" : "RISK"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {tab === "calendar" && (
        <div className="space-y-2">
          <div className="text-[10px] text-ivory-600 mb-2">Upcoming dividend ex-dates and pay dates (next 45 days)</div>
          {DIV_CALENDAR.map((ev, i) => (
            <div key={i} className={cn("flex items-center gap-4 p-3 rounded-xl card-glass border-l-4",
              ev.type === "ex-date" ? "border-gold-500" : ev.type === "pay" ? "border-signal-bull" : "border-maroon-700"
            )}>
              <div className="w-16 flex-shrink-0 text-center">
                <div className="text-xs font-mono font-bold text-ivory-100">{ev.date}</div>
              </div>
              <div className="flex-1">
                <span className="text-xs font-mono font-bold text-ivory-100">{ev.symbol}</span>
                <span className={cn("ml-2 label-tag text-[9px]",
                  ev.type === "ex-date" ? "bg-gold-500/15 text-gold-500" : "bg-signal-bull/15 text-signal-bull"
                )}>{ev.type === "ex-date" ? "EX-DATE" : "PAY DATE"}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-gold-500">₹{ev.amount}/share</div>
                <div className="text-[10px] text-ivory-500">{ev.yield}% yield</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dividend History Tab */}
      {tab === "history" && (
        <div className="space-y-4">
          <div className="flex gap-1">
            {(["ITC", "COALINDIA", "POWERGRID", "HDFCBANK"] as const).map(s => (
              <button key={s} onClick={() => setHistSymbol(s)}
                className={cn("px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-colors",
                  histSymbol === s ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300 hover:bg-bg-hover"
                )}>{s}</button>
            ))}
          </div>
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-1">
              {histSymbol} — DPS History (₹ per share)
              <span className="ml-2 text-[10px] text-signal-bull font-mono">
                5Y CAGR: {DIV_PORTFOLIO.find(d => d.symbol === histSymbol)?.divGrowth5y}%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={DIV_HISTORY} barSize={28}>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#8b8472" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={histSymbol} fill="#7c2d32" radius={[3, 3, 0, 0]} opacity={0.9} name={histSymbol}>
                  {DIV_HISTORY.map((_, i) => <Cell key={i} fill={i === DIV_HISTORY.length - 1 ? "#b45309" : "#7c2d32"} opacity={0.9} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* DRIP Calculator Tab */}
      {tab === "drip" && (
        <div className="card-glass rounded-xl p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-4 flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-maroon-500" />
            Dividend Reinvestment Plan (DRIP) Calculator
          </div>
          <DRIPCalculator />
        </div>
      )}
    </div>
  );
}
