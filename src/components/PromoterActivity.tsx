"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  BarChart, LineChart, ComposedChart,
  Bar, Line, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine,
} from "recharts";

interface PromoterStock {
  symbol: string; sector: string; promoterHolding: number; pledgePct: number;
  pledgeChange3M: number; buyQty: number; sellQty: number; netQty: number;
  conviction: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "ALERT";
  lastFilingDate: string; currentPrice: number; change1M: number;
}

interface Filing {
  date: string; symbol: string; filingType: "BUY" | "SELL" | "PLEDGE" | "UNPLEDGE";
  qty: number; value: number; name: string; designation: string;
}

const STOCKS: PromoterStock[] = [
  { symbol: "RELIANCE",   sector: "Energy",    promoterHolding: 50.3, pledgePct: 0.0,  pledgeChange3M: 0.0,   buyQty: 1234567, sellQty: 0,       netQty: 1234567,  conviction: "STRONG_BUY", lastFilingDate: "12-May-25", currentPrice: 2987, change1M: 4.2  },
  { symbol: "BAJFINANCE", sector: "Finance",   promoterHolding: 56.1, pledgePct: 0.8,  pledgeChange3M: -1.2,  buyQty: 456789,  sellQty: 0,       netQty: 456789,   conviction: "BUY",        lastFilingDate: "10-May-25", currentPrice: 7234, change1M: 2.8  },
  { symbol: "TCS",        sector: "IT",        promoterHolding: 72.3, pledgePct: 0.0,  pledgeChange3M: 0.0,   buyQty: 0,       sellQty: 890123,  netQty: -890123,  conviction: "NEUTRAL",    lastFilingDate: "08-May-25", currentPrice: 3890, change1M: 1.1  },
  { symbol: "ZOMATO",     sector: "Consumer",  promoterHolding: 18.4, pledgePct: 0.0,  pledgeChange3M: 0.0,   buyQty: 2345678, sellQty: 0,       netQty: 2345678,  conviction: "STRONG_BUY", lastFilingDate: "14-May-25", currentPrice: 245,  change1M: 8.4  },
  { symbol: "ADANIPORTS", sector: "Infra",     promoterHolding: 65.2, pledgePct: 8.4,  pledgeChange3M: 2.1,   buyQty: 0,       sellQty: 0,       netQty: 0,        conviction: "ALERT",      lastFilingDate: "05-May-25", currentPrice: 1234, change1M: -2.1 },
  { symbol: "SUNPHARMA",  sector: "Pharma",    promoterHolding: 54.7, pledgePct: 0.0,  pledgeChange3M: 0.0,   buyQty: 345678,  sellQty: 0,       netQty: 345678,   conviction: "BUY",        lastFilingDate: "11-May-25", currentPrice: 1678, change1M: 3.4  },
  { symbol: "TATAMOTORS", sector: "Auto",      promoterHolding: 46.4, pledgePct: 12.3, pledgeChange3M: 3.4,   buyQty: 0,       sellQty: 567890,  netQty: -567890,  conviction: "SELL",       lastFilingDate: "07-May-25", currentPrice: 876,  change1M: -3.8 },
  { symbol: "COALINDIA",  sector: "Mining",    promoterHolding: 63.1, pledgePct: 0.0,  pledgeChange3M: 0.0,   buyQty: 1234000, sellQty: 0,       netQty: 1234000,  conviction: "BUY",        lastFilingDate: "09-May-25", currentPrice: 456,  change1M: 1.9  },
  { symbol: "PAYTM",      sector: "Fintech",   promoterHolding: 19.3, pledgePct: 4.2,  pledgeChange3M: 1.8,   buyQty: 0,       sellQty: 2345000, netQty: -2345000, conviction: "SELL",       lastFilingDate: "06-May-25", currentPrice: 345,  change1M: -6.2 },
  { symbol: "HDFCBANK",   sector: "Finance",   promoterHolding: 26.1, pledgePct: 0.0,  pledgeChange3M: 0.0,   buyQty: 678900,  sellQty: 0,       netQty: 678900,   conviction: "BUY",        lastFilingDate: "13-May-25", currentPrice: 1723, change1M: 2.4  },
];

const FILINGS: Filing[] = [
  { date: "14-May", symbol: "ZOMATO",    filingType: "BUY",     qty: 1200000, value: 29.4,  name: "Deepinder Goyal",      designation: "CEO & MD" },
  { date: "13-May", symbol: "HDFCBANK",  filingType: "BUY",     qty: 450000,  value: 77.5,  name: "Sashidhar Jagdishan",  designation: "MD & CEO" },
  { date: "12-May", symbol: "RELIANCE",  filingType: "BUY",     qty: 890000,  value: 265.8, name: "Mukesh Ambani (HUF)",  designation: "Promoter" },
  { date: "11-May", symbol: "SUNPHARMA", filingType: "BUY",     qty: 234000,  value: 39.3,  name: "Dilip Shanghvi",       designation: "Promoter" },
  { date: "10-May", symbol: "BAJFINANCE",filingType: "BUY",     qty: 180000,  value: 130.2, name: "Bajaj Holdings",       designation: "Promoter" },
  { date: "09-May", symbol: "COALINDIA", filingType: "BUY",     qty: 890000,  value: 40.6,  name: "Govt of India (DIPAM)",designation: "Promoter" },
  { date: "08-May", symbol: "TCS",       filingType: "SELL",    qty: 560000,  value: 218.0, name: "Tata Sons Pvt Ltd",    designation: "Promoter" },
  { date: "07-May", symbol: "TATAMOTORS",filingType: "PLEDGE",  qty: 345000,  value: 30.2,  name: "Tata Sons Pvt Ltd",    designation: "Promoter" },
  { date: "07-May", symbol: "PAYTM",     filingType: "SELL",    qty: 1200000, value: 41.4,  name: "Ant Group",            designation: "Promoter" },
  { date: "06-May", symbol: "ADANIPORTS",filingType: "PLEDGE",  qty: 234000,  value: 28.9,  name: "S.B. Adani Family",    designation: "Promoter" },
  { date: "05-May", symbol: "BAJFINANCE",filingType: "UNPLEDGE",qty: 123000,  value: 89.1,  name: "Bajaj Holdings",       designation: "Promoter" },
  { date: "04-May", symbol: "ZOMATO",    filingType: "BUY",     qty: 800000,  value: 19.6,  name: "Deepinder Goyal",      designation: "CEO & MD" },
];

const pledgeTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"][i],
  avgPledge: +(4.2 - i * 0.18 + Math.sin(i * 0.4) * 0.6).toFixed(2),
  alerts: [2, 1, 3, 0, 1, 2, 0, 1, 2, 1, 0, 2][i],
}));

const convictionColor: Record<PromoterStock["conviction"], string> = {
  STRONG_BUY: "bg-signal-bull/30 text-signal-bull",
  BUY:        "bg-signal-bull/20 text-signal-bull",
  NEUTRAL:    "bg-ivory-700/20 text-ivory-500",
  SELL:       "bg-signal-bear/20 text-signal-bear",
  ALERT:      "bg-gold-500/20 text-gold-500",
};

const filingColor: Record<Filing["filingType"], string> = {
  BUY:     "text-signal-bull",
  SELL:    "text-signal-bear",
  PLEDGE:  "text-gold-500",
  UNPLEDGE:"text-signal-accumulate",
};

export default function PromoterActivity() {
  const [tab, setTab] = useState<"holdings" | "filings" | "pledge">("holdings");
  const [filter, setFilter] = useState<"ALL" | "BUY" | "SELL" | "ALERT">("ALL");

  const filtered = STOCKS.filter((s) => {
    if (filter === "BUY") return s.conviction === "BUY" || s.conviction === "STRONG_BUY";
    if (filter === "SELL") return s.conviction === "SELL";
    if (filter === "ALERT") return s.conviction === "ALERT" || s.pledgeChange3M > 1;
    return true;
  });

  const buyCount = STOCKS.filter((s) => s.netQty > 0).length;
  const sellCount = STOCKS.filter((s) => s.netQty < 0).length;
  const alertCount = STOCKS.filter((s) => s.pledgePct > 5 || s.pledgeChange3M > 2).length;
  const avgPledge = (STOCKS.reduce((a, s) => a + s.pledgePct, 0) / STOCKS.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Promoter Activity Tracker</h2>
          <p className="text-xs text-ivory-500 mt-0.5">SEBI insider filings · Promoter buy/sell · Pledge alerts</p>
        </div>
        <div className="flex gap-1.5">
          {(["holdings", "filings", "pledge"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-[10px] px-3 py-1.5 rounded border capitalize transition-all ${tab === t ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Promoter Buys", value: buyCount, icon: TrendingUp, color: "text-signal-bull", sub: "Last 30 days" },
          { label: "Promoter Sells", value: sellCount, icon: TrendingDown, color: "text-signal-bear", sub: "Last 30 days" },
          { label: "Pledge Alerts", value: alertCount, icon: AlertTriangle, color: "text-gold-500", sub: "Pledge rising" },
          { label: "Avg Pledge %", value: `${avgPledge}%`, icon: ShieldCheck, color: Number(avgPledge) > 5 ? "text-signal-bear" : "text-signal-bull", sub: "Portfolio avg" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="card-base p-3 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <div className="text-[10px] text-ivory-600 uppercase tracking-wider">{label}</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${color}`}>{value}</div>
              <div className="text-[9px] text-ivory-700">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {tab === "holdings" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["ALL", "BUY", "SELL", "ALERT"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-[10px] px-3 py-1 rounded-full border transition-all ${filter === f ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="card-base p-4">
            <div className="grid grid-cols-9 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border">
              {["Symbol", "Sector", "Promoter%", "Pledge%", "Pledge Δ3M", "Net Qty", "1M %", "Last Filing", "Conviction"].map((h) => <div key={h}>{h}</div>)}
            </div>
            {filtered.map((s) => (
              <div key={s.symbol} className="grid grid-cols-9 gap-2 text-[10px] px-2 py-2.5 border-b border-bg-border/40 hover:bg-bg-hover items-center">
                <div className="font-bold text-ivory-100">{s.symbol}</div>
                <div className="text-ivory-500">{s.sector}</div>
                <div className="font-mono text-ivory-300">{s.promoterHolding}%</div>
                <div className={`font-mono font-semibold ${s.pledgePct > 5 ? "text-signal-bear" : s.pledgePct > 0 ? "text-gold-500" : "text-signal-bull"}`}>{s.pledgePct}%</div>
                <div className={`font-mono ${s.pledgeChange3M > 0 ? "text-signal-bear" : s.pledgeChange3M < 0 ? "text-signal-bull" : "text-ivory-600"}`}>
                  {s.pledgeChange3M > 0 ? "+" : ""}{s.pledgeChange3M}%
                </div>
                <div className={`font-mono font-semibold ${s.netQty > 0 ? "text-signal-bull" : s.netQty < 0 ? "text-signal-bear" : "text-ivory-600"}`}>
                  {s.netQty > 0 ? "+" : ""}{s.netQty.toLocaleString()}
                </div>
                <div className={`font-mono ${s.change1M >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>{s.change1M >= 0 ? "+" : ""}{s.change1M}%</div>
                <div className="text-ivory-600 text-[9px]">{s.lastFilingDate}</div>
                <div className={`text-[9px] px-1.5 py-0.5 rounded text-center font-semibold ${convictionColor[s.conviction]}`}>{s.conviction.replace("_", " ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "filings" && (
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Recent SEBI Insider Filings</div>
          <div className="grid grid-cols-7 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border">
            {["Date", "Symbol", "Type", "Name", "Designation", "Qty", "Value (Cr)"].map((h) => <div key={h}>{h}</div>)}
          </div>
          {FILINGS.map((f, i) => (
            <div key={i} className="grid grid-cols-7 gap-2 text-[10px] px-2 py-2.5 border-b border-bg-border/40 hover:bg-bg-hover items-center">
              <div className="text-ivory-600">{f.date}</div>
              <div className="font-bold text-ivory-200">{f.symbol}</div>
              <div className={`font-semibold ${filingColor[f.filingType]}`}>{f.filingType}</div>
              <div className="text-ivory-300">{f.name}</div>
              <div className="text-ivory-600">{f.designation}</div>
              <div className="font-mono text-ivory-400">{f.qty.toLocaleString()}</div>
              <div className="font-mono text-ivory-300">₹{f.value} Cr</div>
            </div>
          ))}
        </div>
      )}

      {tab === "pledge" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Average Pledge % Trend — 12 Months</div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={pledgeTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="month" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <YAxis yAxisId="pct" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                <YAxis yAxisId="alerts" orientation="right" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                <Area yAxisId="pct" dataKey="avgPledge" name="Avg Pledge %" stroke="#d4af37" fill="#d4af37" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
                <Bar yAxisId="alerts" dataKey="alerts" name="Pledge Alerts" fill="#7c1d1d" radius={[2, 2, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Current Pledge by Stock</div>
            <div className="space-y-2">
              {STOCKS.filter((s) => s.pledgePct > 0 || s.promoterHolding > 50).map((s) => (
                <div key={s.symbol} className="flex items-center gap-2">
                  <div className="w-24 text-[10px] font-semibold text-ivory-200">{s.symbol}</div>
                  <div className="flex-1 h-4 bg-bg-primary rounded overflow-hidden flex">
                    <div className="bg-signal-bull/40 h-full" style={{ width: `${s.promoterHolding - s.pledgePct}%` }} />
                    {s.pledgePct > 0 && <div className="bg-signal-bear/60 h-full" style={{ width: `${s.pledgePct}%` }} />}
                  </div>
                  <div className="w-16 text-right text-[9px] text-ivory-500">{s.promoterHolding}% held</div>
                  {s.pledgePct > 0 && <div className="w-14 text-right text-[9px] font-semibold text-signal-bear">{s.pledgePct}% pledged</div>}
                </div>
              ))}
            </div>
            <div className="mt-3 text-[9px] text-ivory-700 flex gap-4">
              <span><span className="inline-block w-2 h-2 rounded bg-signal-bull/40 mr-1" />Unpledged holding</span>
              <span><span className="inline-block w-2 h-2 rounded bg-signal-bear/60 mr-1" />Pledged</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
