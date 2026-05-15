"use client";

import { useState } from "react";
import { Shield, TrendingUp, TrendingDown, Eye } from "lucide-react";
import {
  BarChart, LineChart,
  Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";

interface InsiderTrade {
  id: number; date: string; symbol: string; sector: string;
  insiderName: string; designation: string; tradeType: "BUY" | "SELL";
  qty: number; price: number; value: number; priceVsCMP: number;
  mode: "MARKET" | "OFF-MARKET" | "ESOPs";
  postTradeHolding: number; convictionScore: number;
}

interface ClusterSignal {
  symbol: string; sector: string; totalBuys: number; totalSells: number;
  netQty: number; uniqueInsiders: number; avgConviction: number;
  signal: "CLUSTER_BUY" | "CLUSTER_SELL" | "MIXED";
}

const TRADES: InsiderTrade[] = [
  { id: 1,  date: "14-May", symbol: "ZOMATO",     sector: "Consumer", insiderName: "Deepinder Goyal",    designation: "CEO & MD",    tradeType: "BUY",  qty: 1200000, price: 241.5, value: 28.98, priceVsCMP: -1.6, mode: "MARKET",     postTradeHolding: 12.4, convictionScore: 92 },
  { id: 2,  date: "13-May", symbol: "RELIANCE",   sector: "Energy",   insiderName: "Mukesh Ambani",      designation: "CMD",         tradeType: "BUY",  qty: 890000,  price: 2965,  value: 263.9, priceVsCMP: -0.7, mode: "MARKET",     postTradeHolding: 50.3, convictionScore: 88 },
  { id: 3,  date: "13-May", symbol: "HDFCBANK",   sector: "Finance",  insiderName: "Sashidhar Jagdishan",designation: "MD & CEO",    tradeType: "BUY",  qty: 450000,  price: 1715,  value: 77.2,  priceVsCMP: -0.5, mode: "MARKET",     postTradeHolding: 0.08, convictionScore: 84 },
  { id: 4,  date: "12-May", symbol: "SUNPHARMA",  sector: "Pharma",   insiderName: "Dilip Shanghvi",     designation: "MD",          tradeType: "BUY",  qty: 234000,  price: 1645,  value: 38.5,  priceVsCMP: -2.0, mode: "MARKET",     postTradeHolding: 54.7, convictionScore: 91 },
  { id: 5,  date: "12-May", symbol: "TCS",        sector: "IT",       insiderName: "N Chandrasekaran",   designation: "Chairman",    tradeType: "SELL", qty: 560000,  price: 3895,  value: 218.1, priceVsCMP: 0.1,  mode: "MARKET",     postTradeHolding: 0.04, convictionScore: 45 },
  { id: 6,  date: "11-May", symbol: "BAJFINANCE", sector: "Finance",  insiderName: "Rajeev Jain",        designation: "MD & CEO",    tradeType: "BUY",  qty: 120000,  price: 7180,  value: 86.2,  priceVsCMP: -0.7, mode: "MARKET",     postTradeHolding: 0.12, convictionScore: 87 },
  { id: 7,  date: "10-May", symbol: "TATAMOTORS", sector: "Auto",     insiderName: "Tata Sons Ltd",      designation: "Promoter",    tradeType: "SELL", qty: 890000,  price: 892,   value: 79.4,  priceVsCMP: 1.8,  mode: "OFF-MARKET",  postTradeHolding: 46.4, convictionScore: 38 },
  { id: 8,  date: "10-May", symbol: "PAYTM",      sector: "Fintech",  insiderName: "Ant Group",          designation: "Promoter",    tradeType: "SELL", qty: 2345000, price: 348,   value: 81.6,  priceVsCMP: 0.9,  mode: "MARKET",     postTradeHolding: 11.2, convictionScore: 22 },
  { id: 9,  date: "09-May", symbol: "MARUTI",     sector: "Auto",     insiderName: "Kenichi Ayukawa",    designation: "MD & CEO",    tradeType: "BUY",  qty: 45000,   price: 12380, value: 55.7,  priceVsCMP: -0.6, mode: "ESOPs",      postTradeHolding: 0.02, convictionScore: 76 },
  { id: 10, date: "08-May", symbol: "WIPRO",      sector: "IT",       insiderName: "Azim Premji Trust",  designation: "Promoter",    tradeType: "SELL", qty: 1234000, price: 462,   value: 57.0,  priceVsCMP: 1.3,  mode: "MARKET",     postTradeHolding: 72.7, convictionScore: 41 },
  { id: 11, date: "07-May", symbol: "COALINDIA",  sector: "Mining",   insiderName: "DIPAM, Govt India",  designation: "Promoter",    tradeType: "BUY",  qty: 1890000, price: 448,   value: 84.7,  priceVsCMP: -1.8, mode: "MARKET",     postTradeHolding: 63.1, convictionScore: 82 },
  { id: 12, date: "06-May", symbol: "BAJFINANCE", sector: "Finance",  insiderName: "Bajaj Holdings",     designation: "Promoter",    tradeType: "BUY",  qty: 450000,  price: 7120,  value: 320.4, priceVsCMP: -1.6, mode: "OFF-MARKET", postTradeHolding: 55.9, convictionScore: 90 },
];

const CLUSTER_SIGNALS: ClusterSignal[] = [
  { symbol: "ZOMATO",    sector: "Consumer", totalBuys: 3, totalSells: 0, netQty: 3200000,  uniqueInsiders: 3, avgConviction: 88, signal: "CLUSTER_BUY"  },
  { symbol: "BAJFINANCE",sector: "Finance",  totalBuys: 3, totalSells: 0, netQty: 1020000,  uniqueInsiders: 2, avgConviction: 89, signal: "CLUSTER_BUY"  },
  { symbol: "RELIANCE",  sector: "Energy",   totalBuys: 2, totalSells: 0, netQty: 2124567,  uniqueInsiders: 2, avgConviction: 90, signal: "CLUSTER_BUY"  },
  { symbol: "TCS",       sector: "IT",       totalBuys: 0, totalSells: 2, netQty: -1450000, uniqueInsiders: 2, avgConviction: 43, signal: "CLUSTER_SELL" },
  { symbol: "PAYTM",     sector: "Fintech",  totalBuys: 0, totalSells: 3, netQty: -4545000, uniqueInsiders: 2, avgConviction: 22, signal: "CLUSTER_SELL" },
  { symbol: "WIPRO",     sector: "IT",       totalBuys: 0, totalSells: 2, netQty: -2234000, uniqueInsiders: 1, avgConviction: 41, signal: "CLUSTER_SELL" },
];

const insiderActivityByMonth = [
  { month: "Dec", buys: 45, sells: 28 }, { month: "Jan", buys: 38, sells: 42 },
  { month: "Feb", buys: 52, sells: 31 }, { month: "Mar", buys: 67, sells: 24 },
  { month: "Apr", buys: 71, sells: 19 }, { month: "May", buys: 48, sells: 22 },
];

export default function InsiderRegistry() {
  const [tab, setTab] = useState<"recent" | "cluster" | "trend">("recent");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");

  const filtered = typeFilter === "ALL" ? TRADES : TRADES.filter((t) => t.tradeType === typeFilter);

  const buyValue = TRADES.filter((t) => t.tradeType === "BUY").reduce((s, t) => s + t.value, 0);
  const sellValue = TRADES.filter((t) => t.tradeType === "SELL").reduce((s, t) => s + t.value, 0);
  const clusterBuys = CLUSTER_SIGNALS.filter((c) => c.signal === "CLUSTER_BUY").length;
  const clusterSells = CLUSTER_SIGNALS.filter((c) => c.signal === "CLUSTER_SELL").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Insider Trading Registry</h2>
          <p className="text-xs text-ivory-500 mt-0.5">SEBI disclosures · Cluster signals · Conviction scoring</p>
        </div>
        <div className="flex gap-1.5">
          {(["recent", "cluster", "trend"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-[10px] px-3 py-1.5 rounded border capitalize transition-all ${tab === t ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Buy Value", value: `₹${buyValue.toFixed(0)} Cr`, color: "text-signal-bull" },
          { label: "Sell Value", value: `₹${sellValue.toFixed(0)} Cr`, color: "text-signal-bear" },
          { label: "Cluster Buys", value: clusterBuys, color: "text-signal-bull" },
          { label: "Cluster Sells", value: clusterSells, color: "text-signal-bear" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-base p-3">
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider">{label}</div>
            <div className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {tab === "recent" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["ALL", "BUY", "SELL"] as const).map((f) => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={`text-[10px] px-3 py-1 rounded-full border transition-all ${typeFilter === f ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="card-base p-4">
            <div className="grid grid-cols-9 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border">
              {["Date", "Symbol", "Insider", "Role", "Type", "Qty", "Value (Cr)", "vs CMP", "Conviction"].map((h) => <div key={h}>{h}</div>)}
            </div>
            {filtered.map((t) => (
              <div key={t.id} className="grid grid-cols-9 gap-2 text-[10px] px-2 py-2.5 border-b border-bg-border/40 hover:bg-bg-hover items-center">
                <div className="text-ivory-600">{t.date}</div>
                <div className="font-bold text-ivory-100">{t.symbol}</div>
                <div className="text-ivory-400 truncate">{t.insiderName}</div>
                <div className="text-ivory-600 truncate">{t.designation}</div>
                <div className={`font-semibold ${t.tradeType === "BUY" ? "text-signal-bull" : "text-signal-bear"}`}>{t.tradeType}</div>
                <div className="font-mono text-ivory-400">{t.qty.toLocaleString()}</div>
                <div className="font-mono text-ivory-300">₹{t.value.toFixed(1)}</div>
                <div className={`font-mono text-[9px] ${t.priceVsCMP <= 0 ? "text-signal-bull" : "text-signal-bear"}`}>{t.priceVsCMP > 0 ? "+" : ""}{t.priceVsCMP}%</div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-2 bg-bg-primary rounded overflow-hidden">
                    <div className={`h-full rounded ${t.convictionScore > 75 ? "bg-signal-bull" : t.convictionScore > 50 ? "bg-gold-500" : "bg-signal-bear"}`}
                      style={{ width: `${t.convictionScore}%` }} />
                  </div>
                  <span className="text-[9px] text-ivory-600 w-5">{t.convictionScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "cluster" && (
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Cluster Signals — Multiple Insiders Trading Same Stock</div>
          <div className="space-y-2">
            {CLUSTER_SIGNALS.map((c) => (
              <div key={c.symbol} className="flex items-center gap-3 p-3 bg-bg-primary rounded-lg border border-bg-border">
                <div className={`w-2 h-full min-h-8 rounded-full ${c.signal === "CLUSTER_BUY" ? "bg-signal-bull" : "bg-signal-bear"}`} />
                <div className="flex-1 grid grid-cols-6 gap-2 text-[10px] items-center">
                  <div className="font-bold text-ivory-100">{c.symbol}</div>
                  <div className="text-ivory-500">{c.sector}</div>
                  <div className="text-signal-bull">Buys: {c.totalBuys}</div>
                  <div className="text-signal-bear">Sells: {c.totalSells}</div>
                  <div className="text-ivory-400">{c.uniqueInsiders} insiders</div>
                  <div className={`text-[9px] px-2 py-0.5 rounded font-semibold text-center ${c.signal === "CLUSTER_BUY" ? "bg-signal-bull/20 text-signal-bull" : "bg-signal-bear/20 text-signal-bear"}`}>
                    {c.signal.replace("_", " ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-ivory-600">Avg Conviction</div>
                  <div className={`text-sm font-bold font-mono ${c.avgConviction > 75 ? "text-signal-bull" : c.avgConviction > 50 ? "text-gold-500" : "text-signal-bear"}`}>{c.avgConviction}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "trend" && (
        <div className="card-base p-4">
          <div className="text-xs font-semibold text-ivory-300 mb-3">Monthly Insider Activity — Buys vs Sells (Count)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={insiderActivityByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
              <XAxis dataKey="month" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
              <Bar dataKey="buys" name="Insider Buys" fill="#166534" radius={[3, 3, 0, 0]} />
              <Bar dataKey="sells" name="Insider Sells" fill="#7c1d1d" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
