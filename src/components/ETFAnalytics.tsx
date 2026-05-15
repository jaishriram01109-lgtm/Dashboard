"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import {
  BarChart, LineChart, AreaChart,
  Bar, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";

interface ETF {
  id: string; name: string; ticker: string; category: string;
  nav: number; aum: number; expenseRatio: number;
  premium: number; trackingError: number;
  ret1D: number; ret1W: number; ret1M: number; ret3M: number; ret1Y: number;
  rating: number; volume: number;
}

const ETFS: ETF[] = [
  { id: "1", name: "Nippon Nifty 50 BeES",   ticker: "NIFTYBEES",  category: "Large Cap",   nav: 248.32, aum: 21456, expenseRatio: 0.04, premium: 0.02,  trackingError: 0.06, ret1D: 0.42, ret1W: 1.12, ret1M: 3.24, ret3M: 8.45, ret1Y: 18.6, rating: 5, volume: 4521000 },
  { id: "2", name: "HDFC Sensex ETF",         ticker: "HDFCSENSEX", category: "Large Cap",   nav: 812.45, aum: 8934,  expenseRatio: 0.05, premium: -0.01, trackingError: 0.08, ret1D: 0.38, ret1W: 1.08, ret1M: 3.12, ret3M: 8.21, ret1Y: 17.9, rating: 5, volume: 892000 },
  { id: "3", name: "Kotak BankNifty ETF",     ticker: "BANKBEES",   category: "Sectoral",    nav: 472.18, aum: 4567,  expenseRatio: 0.22, premium: 0.08,  trackingError: 0.18, ret1D: 0.65, ret1W: 1.45, ret1M: 4.12, ret3M: 9.87, ret1Y: 22.4, rating: 4, volume: 2134000 },
  { id: "4", name: "ICICI IT ETF",            ticker: "ICICINXT50", category: "Sectoral",    nav: 124.67, aum: 1234,  expenseRatio: 0.18, premium: 0.12,  trackingError: 0.24, ret1D: 0.31, ret1W: 0.82, ret1M: 2.45, ret3M: 6.78, ret1Y: 14.2, rating: 3, volume: 345000 },
  { id: "5", name: "Nippon Junior BeES",      ticker: "JUNIORBEES", category: "Mid Cap",     nav: 642.34, aum: 3456,  expenseRatio: 0.19, premium: 0.15,  trackingError: 0.21, ret1D: 0.58, ret1W: 1.32, ret1M: 4.56, ret3M: 11.2, ret1Y: 28.4, rating: 4, volume: 678000 },
  { id: "6", name: "Mirae Nifty 200 ETF",     ticker: "MFNIFTY",    category: "Broad Mkt",   nav: 89.45,  aum: 2345,  expenseRatio: 0.07, premium: 0.04,  trackingError: 0.09, ret1D: 0.45, ret1W: 1.18, ret1M: 3.67, ret3M: 9.34, ret1Y: 20.1, rating: 4, volume: 234000 },
  { id: "7", name: "SBI Gold ETF",            ticker: "SBIGETS",    category: "Gold",        nav: 6245.0, aum: 7823,  expenseRatio: 0.50, premium: 0.06,  trackingError: 0.35, ret1D: 0.44, ret1W: 0.92, ret1M: 2.12, ret3M: 5.67, ret1Y: 12.8, rating: 4, volume: 123000 },
  { id: "8", name: "Bharat Bond ETF Apr 32",  ticker: "BBETF0432",  category: "Debt",        nav: 1342.8, aum: 12456, expenseRatio: 0.05, premium: 0.01,  trackingError: 0.04, ret1D: 0.02, ret1W: 0.08, ret1M: 0.62, ret3M: 1.87, ret1Y: 7.8,  rating: 5, volume: 56000 },
];

const returnComparison = [
  { period: "1D",  NIFTYBEES: 0.42, BANKBEES: 0.65, JUNIORBEES: 0.58, SBIGETS: 0.44 },
  { period: "1W",  NIFTYBEES: 1.12, BANKBEES: 1.45, JUNIORBEES: 1.32, SBIGETS: 0.92 },
  { period: "1M",  NIFTYBEES: 3.24, BANKBEES: 4.12, JUNIORBEES: 4.56, SBIGETS: 2.12 },
  { period: "3M",  NIFTYBEES: 8.45, BANKBEES: 9.87, JUNIORBEES: 11.2, SBIGETS: 5.67 },
  { period: "1Y",  NIFTYBEES: 18.6, BANKBEES: 22.4, JUNIORBEES: 28.4, SBIGETS: 12.8 },
];

const premiumHistory = Array.from({ length: 30 }, (_, i) => ({
  date: `D${i + 1}`,
  NIFTYBEES: +(Math.sin(i * 0.3) * 0.08 + 0.02).toFixed(3),
  BANKBEES: +(Math.sin(i * 0.25 + 1) * 0.12 + 0.06).toFixed(3),
}));

const categories = ["All", "Large Cap", "Sectoral", "Mid Cap", "Broad Mkt", "Gold", "Debt"];

export default function ETFAnalytics() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"ret1Y" | "aum" | "trackingError">("ret1Y");

  const filtered = (activeCategory === "All" ? ETFS : ETFS.filter((e) => e.category === activeCategory))
    .sort((a, b) => sortBy === "trackingError" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">ETF Analytics</h2>
          <p className="text-xs text-ivory-500 mt-0.5">Tracking error · Premium/Discount · Returns · AUM comparison</p>
        </div>
        <div className="flex gap-1.5 text-[10px]">
          {(["ret1Y", "aum", "trackingError"] as const).map((s) => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 rounded border transition-all ${sortBy === s ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {s === "ret1Y" ? "1Y Return" : s === "aum" ? "AUM" : "Track.Err"}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((c) => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${activeCategory === c ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* ETF Table */}
      <div className="card-base p-4 overflow-x-auto">
        <div className="grid grid-cols-10 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border min-w-max">
          {["ETF", "Category", "NAV", "AUM(Cr)", "Exp.Ratio", "Premium%", "Track.Err", "1M%", "1Y%", "Rating"].map((h) => <div key={h}>{h}</div>)}
        </div>
        {filtered.map((e) => (
          <div key={e.id} className="grid grid-cols-10 gap-2 text-[10px] px-2 py-2.5 border-b border-bg-border/40 hover:bg-bg-hover items-center min-w-max">
            <div>
              <div className="font-semibold text-ivory-200">{e.ticker}</div>
              <div className="text-[9px] text-ivory-600 truncate max-w-28">{e.name}</div>
            </div>
            <div className="text-ivory-500">{e.category}</div>
            <div className="font-mono text-ivory-200">₹{e.nav.toLocaleString()}</div>
            <div className="font-mono text-ivory-400">{e.aum.toLocaleString()}</div>
            <div className="font-mono text-ivory-400">{e.expenseRatio}%</div>
            <div className={`font-mono font-semibold ${Math.abs(e.premium) < 0.05 ? "text-signal-bull" : Math.abs(e.premium) < 0.15 ? "text-gold-500" : "text-signal-bear"}`}>
              {e.premium >= 0 ? "+" : ""}{e.premium.toFixed(2)}%
            </div>
            <div className={`font-mono ${e.trackingError < 0.1 ? "text-signal-bull" : e.trackingError < 0.25 ? "text-gold-500" : "text-signal-bear"}`}>
              {e.trackingError.toFixed(2)}%
            </div>
            <div className={`font-mono font-semibold ${e.ret1M >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>{e.ret1M >= 0 ? "+" : ""}{e.ret1M}%</div>
            <div className={`font-mono font-semibold ${e.ret1Y >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>{e.ret1Y >= 0 ? "+" : ""}{e.ret1Y}%</div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`w-2.5 h-2.5 ${i < e.rating ? "text-gold-500 fill-gold-500" : "text-ivory-700"}`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Return Comparison */}
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Return Comparison — Top ETFs</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={returnComparison} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="period" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v}%`, ""]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <Bar dataKey="NIFTYBEES" fill="#7c1d1d" radius={[2, 2, 0, 0]} />
              <Bar dataKey="BANKBEES" fill="#1e40af" radius={[2, 2, 0, 0]} />
              <Bar dataKey="JUNIORBEES" fill="#166534" radius={[2, 2, 0, 0]} />
              <Bar dataKey="SBIGETS" fill="#d4af37" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Premium/Discount History */}
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Premium / Discount History — 30D</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={premiumHistory} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={5} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`${v}%`, ""]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <Line dataKey="NIFTYBEES" stroke="#7c1d1d" strokeWidth={1.5} dot={false} />
              <Line dataKey="BANKBEES" stroke="#1e40af" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
