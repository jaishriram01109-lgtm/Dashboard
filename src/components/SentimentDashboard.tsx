"use client";

import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import {
  AreaChart, BarChart, RadarChart, LineChart,
  Area, Bar, Line, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SentimentSource {
  source: string;
  bullish: number;
  bearish: number;
  neutral: number;
  score: number;
  trend: "UP" | "DOWN" | "FLAT";
}

interface StockSentiment {
  symbol: string;
  sector: string;
  social: number;
  news: number;
  analyst: number;
  insider: number;
  composite: number;
  signal: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  mentions24h: number;
  change1d: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const FEAR_GREED = 68;

const fgHistory = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}M`,
  fg: 35 + Math.round(Math.sin(i * 0.4) * 18 + Math.cos(i * 0.2) * 12 + i * 1.1),
}));

const sources: SentimentSource[] = [
  { source: "Twitter / X",     bullish: 58, bearish: 22, neutral: 20, score: 72, trend: "UP" },
  { source: "Reddit / WSB",    bullish: 51, bearish: 31, neutral: 18, score: 61, trend: "UP" },
  { source: "Telegram Groups", bullish: 64, bearish: 18, neutral: 18, score: 78, trend: "UP" },
  { source: "News Headlines",  bullish: 47, bearish: 33, neutral: 20, score: 57, trend: "FLAT" },
  { source: "Analyst Reports", bullish: 62, bearish: 20, neutral: 18, score: 74, trend: "UP" },
  { source: "Options Flow",    bullish: 55, bearish: 28, neutral: 17, score: 65, trend: "DOWN" },
];

const stocks: StockSentiment[] = [
  { symbol: "RELIANCE",   sector: "Energy",   social: 78, news: 72, analyst: 82, insider: 65, composite: 76, signal: "BUY",        mentions24h: 2340, change1d: 1.2 },
  { symbol: "TCS",        sector: "IT",       social: 71, news: 68, analyst: 74, insider: 70, composite: 71, signal: "BUY",        mentions24h: 1876, change1d: 0.8 },
  { symbol: "HDFCBANK",   sector: "Finance",  social: 65, news: 70, analyst: 79, insider: 60, composite: 69, signal: "BUY",        mentions24h: 1543, change1d: 0.4 },
  { symbol: "BAJFINANCE", sector: "Finance",  social: 82, news: 65, analyst: 71, insider: 74, composite: 74, signal: "BUY",        mentions24h: 3210, change1d: 2.1 },
  { symbol: "ADANIPORTS", sector: "Infra",    social: 55, news: 48, analyst: 52, insider: 44, composite: 50, signal: "HOLD",       mentions24h: 987,  change1d: -0.3 },
  { symbol: "TATASTEEL",  sector: "Metals",   social: 38, news: 35, analyst: 41, insider: 30, composite: 36, signal: "SELL",       mentions24h: 654,  change1d: -1.8 },
  { symbol: "ZOMATO",     sector: "Consumer", social: 88, news: 74, analyst: 68, insider: 71, composite: 78, signal: "STRONG_BUY", mentions24h: 5432, change1d: 3.4 },
  { symbol: "PAYTM",      sector: "Fintech",  social: 22, news: 18, analyst: 15, insider: 12, composite: 17, signal: "STRONG_SELL",mentions24h: 2109, change1d: -4.2 },
  { symbol: "NYKAA",      sector: "Consumer", social: 61, news: 55, analyst: 58, insider: 52, composite: 57, signal: "HOLD",       mentions24h: 876,  change1d: 0.6 },
  { symbol: "WIPRO",      sector: "IT",       social: 48, news: 52, analyst: 61, insider: 45, composite: 52, signal: "HOLD",       mentions24h: 543,  change1d: -0.2 },
];

const sentimentRadar = [
  { factor: "Social Media",  score: 71 },
  { factor: "News",          score: 63 },
  { factor: "Analyst",       score: 74 },
  { factor: "Options Flow",  score: 65 },
  { factor: "Insider Buy",   score: 58 },
  { factor: "FII Activity",  score: 69 },
];

const sentimentHistory = Array.from({ length: 14 }, (_, i) => ({
  date: `${14 - i}D`,
  bull: 45 + Math.round(Math.sin(i * 0.5) * 12 + i * 1.2),
  bear: 35 - Math.round(Math.sin(i * 0.5) * 8 + i * 0.6),
  neutral: 20,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fgLabel(v: number): string {
  if (v >= 80) return "Extreme Greed";
  if (v >= 60) return "Greed";
  if (v >= 45) return "Neutral";
  if (v >= 25) return "Fear";
  return "Extreme Fear";
}

function fgColor(v: number): string {
  if (v >= 80) return "text-signal-bear";
  if (v >= 60) return "text-gold-500";
  if (v >= 45) return "text-ivory-400";
  if (v >= 25) return "text-signal-bull";
  return "text-signal-bull";
}

function signalBadge(s: StockSentiment["signal"]) {
  const map: Record<StockSentiment["signal"], string> = {
    STRONG_BUY:  "bg-signal-bull/30 text-signal-bull",
    BUY:         "bg-signal-bull/20 text-signal-bull",
    HOLD:        "bg-ivory-700/20 text-ivory-500",
    SELL:        "bg-signal-bear/20 text-signal-bear",
    STRONG_SELL: "bg-signal-bear/30 text-signal-bear",
  };
  return map[s];
}

function signalLabel(s: StockSentiment["signal"]) {
  return s.replace("_", " ");
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SentimentDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "stocks" | "sources">("overview");

  const sortedStocks = [...stocks].sort((a, b) => b.composite - a.composite);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Sentiment Dashboard</h2>
          <p className="text-xs text-ivory-500 mt-0.5">Social · News · Analyst · Options · Insider — aggregated AI sentiment</p>
        </div>
        <div className="flex gap-2 text-[10px]">
          {(["overview", "stocks", "sources"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded capitalize border transition-all ${
                activeTab === t ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Fear & Greed + Radar */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Fear & Greed Gauge */}
            <div className="card-base p-6 flex flex-col items-center justify-center gap-3">
              <div className="text-[10px] text-ivory-600 uppercase tracking-wider">Market Fear &amp; Greed Index</div>
              <div className={`text-6xl font-bold font-mono ${fgColor(FEAR_GREED)}`}>{FEAR_GREED}</div>
              <div className={`text-sm font-semibold ${fgColor(FEAR_GREED)}`}>{fgLabel(FEAR_GREED)}</div>
              {/* Gauge bar */}
              <div className="w-full space-y-1">
                <div className="h-3 rounded-full overflow-hidden bg-gradient-to-r from-signal-bear via-gold-500 to-signal-bull relative">
                  <div
                    className="absolute top-0 w-2 h-3 bg-ivory-100 rounded-full shadow transform -translate-x-1/2"
                    style={{ left: `${FEAR_GREED}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-ivory-700">
                  <span>Fear</span><span>Neutral</span><span>Greed</span>
                </div>
              </div>
              <div className="text-[10px] text-ivory-600 text-center">
                Previous: <span className="text-ivory-300">58</span> · 1W Ago: <span className="text-ivory-300">51</span>
              </div>
            </div>

            {/* Sentiment Radar */}
            <div className="card-base p-4 xl:col-span-2">
              <div className="text-xs font-semibold text-ivory-300 mb-2">Multi-Source Sentiment Radar</div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={sentimentRadar} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#2a1a1a" />
                  <PolarAngleAxis dataKey="factor" tick={{ fill: "#8a7a6a", fontSize: 9 }} />
                  <Radar name="Sentiment" dataKey="score" stroke="#7c1d1d" fill="#7c1d1d" fillOpacity={0.35} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* F&G History + Sentiment Trend */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="card-base p-4">
              <div className="text-xs font-semibold text-ivory-300 mb-3">Fear &amp; Greed — 30 Day History</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={fgHistory} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                  <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} interval={4} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                  <ReferenceLine y={50} stroke="#4a3a3a" strokeDasharray="4 4" />
                  <ReferenceLine y={25} stroke="#7c1d1d" strokeDasharray="3 3" label={{ value: "Fear", fill: "#7c1d1d", fontSize: 8, position: "right" }} />
                  <ReferenceLine y={75} stroke="#166534" strokeDasharray="3 3" label={{ value: "Greed", fill: "#166534", fontSize: 8, position: "right" }} />
                  <Area dataKey="fg" stroke="#d4af37" fill="#d4af37" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card-base p-4">
              <div className="text-xs font-semibold text-ivory-300 mb-3">Market Sentiment Trend — 14D</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={sentimentHistory} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                  <XAxis dataKey="date" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 9, color: "#8a7a6a" }} />
                  <Area dataKey="bull" name="Bullish %" stackId="a" stroke="#166534" fill="#166534" fillOpacity={0.5} strokeWidth={1} />
                  <Area dataKey="neutral" name="Neutral %" stackId="a" stroke="#4a3a3a" fill="#4a3a3a" fillOpacity={0.4} strokeWidth={1} />
                  <Area dataKey="bear" name="Bearish %" stackId="a" stroke="#7c1d1d" fill="#7c1d1d" fillOpacity={0.5} strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── STOCKS TAB ── */}
      {activeTab === "stocks" && (
        <div className="space-y-3">
          {/* Top sentiment chart */}
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Composite Sentiment Score by Stock</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sortedStocks} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                <XAxis dataKey="symbol" tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} angle={-30} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} />
                <ReferenceLine y={50} stroke="#4a3a3a" strokeDasharray="4 4" />
                <Bar dataKey="composite" radius={[3, 3, 0, 0]}>
                  {sortedStocks.map((s, i) => (
                    <Cell key={i} fill={s.composite >= 70 ? "#166534" : s.composite >= 50 ? "#d4af37" : "#7c1d1d"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stocks table */}
          <div className="card-base p-4">
            <div className="grid grid-cols-9 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-1 border-b border-bg-border">
              {["Symbol", "Sector", "Social", "News", "Analyst", "Insider", "Score", "Mentions", "Signal"].map((h) => (
                <div key={h}>{h}</div>
              ))}
            </div>
            {sortedStocks.map((s) => (
              <div key={s.symbol} className="grid grid-cols-9 gap-2 text-[10px] px-2 py-2 border-b border-bg-border/40 hover:bg-bg-hover transition-colors items-center">
                <div className="font-semibold text-ivory-200">{s.symbol}</div>
                <div className="text-ivory-500">{s.sector}</div>
                {[s.social, s.news, s.analyst, s.insider].map((v, i) => (
                  <div key={i} className={`font-mono ${v >= 70 ? "text-signal-bull" : v >= 50 ? "text-gold-500" : "text-signal-bear"}`}>{v}</div>
                ))}
                <div className={`font-bold font-mono text-sm ${s.composite >= 70 ? "text-signal-bull" : s.composite >= 50 ? "text-gold-500" : "text-signal-bear"}`}>{s.composite}</div>
                <div className="text-ivory-500 font-mono">{s.mentions24h.toLocaleString()}</div>
                <div className={`text-[9px] px-1.5 py-0.5 rounded font-semibold text-center ${signalBadge(s.signal)}`}>{signalLabel(s.signal)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SOURCES TAB ── */}
      {activeTab === "sources" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {sources.map((src) => {
            const trendIcon = src.trend === "UP" ? TrendingUp : src.trend === "DOWN" ? TrendingDown : Minus;
            const TrendIcon = trendIcon;
            return (
              <div key={src.source} className="card-base p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-maroon-400" />
                    <span className="text-xs font-semibold text-ivory-200">{src.source}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`w-3.5 h-3.5 ${src.trend === "UP" ? "text-signal-bull" : src.trend === "DOWN" ? "text-signal-bear" : "text-ivory-500"}`} />
                    <span className={`text-sm font-bold font-mono ${src.score >= 70 ? "text-signal-bull" : src.score >= 50 ? "text-gold-500" : "text-signal-bear"}`}>{src.score}</span>
                  </div>
                </div>
                {/* Stacked sentiment bar */}
                <div className="h-5 rounded-lg overflow-hidden flex">
                  <div className="bg-signal-bull/70 h-full flex items-center justify-center text-[9px] text-white font-semibold" style={{ width: `${src.bullish}%` }}>{src.bullish}%</div>
                  <div className="bg-ivory-700/30 h-full flex items-center justify-center text-[9px] text-ivory-600" style={{ width: `${src.neutral}%` }}>{src.neutral}%</div>
                  <div className="bg-signal-bear/70 h-full flex items-center justify-center text-[9px] text-white font-semibold" style={{ width: `${src.bearish}%` }}>{src.bearish}%</div>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="flex items-center gap-1 text-signal-bull"><ThumbsUp className="w-3 h-3" /> Bullish {src.bullish}%</span>
                  <span className="text-ivory-600">Neutral {src.neutral}%</span>
                  <span className="flex items-center gap-1 text-signal-bear"><ThumbsDown className="w-3 h-3" /> Bearish {src.bearish}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
