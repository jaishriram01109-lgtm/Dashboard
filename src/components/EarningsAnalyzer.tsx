"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar, Target, BarChart2 } from "lucide-react";
import {
  ComposedChart, BarChart, LineChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type BeatMiss = "BEAT" | "MISS" | "INLINE";
type Guidance = "RAISED" | "MAINTAINED" | "LOWERED";
type TabKey = "Revenue" | "Net Profit" | "Margins" | "EPS";

interface QuarterlyPoint {
  quarter: string;
  revenue: number;
  netProfit: number;
  ebitda: number;
  patMargin: number;
  ebitdaMargin: number;
  epsActual: number;
  epsEstimate: number;
  qoqGrowth: number;
}

interface Stock {
  name: string;
  sector: string;
  mcap: string;
  analystBuy: number;
  analystHold: number;
  analystSell: number;
  targetPrice: number;
  currentPrice: number;
  upside: number;
  beatMissStreak: BeatMiss[];
  guidance: Guidance;
  upcomingEarnings: string;
  quarterlyData: QuarterlyPoint[];
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const STOCKS_DATA: Record<string, Stock> = {
  RELIANCE: {
    name: "RELIANCE", sector: "Energy", mcap: "₹18.9L Cr", analystBuy: 28, analystHold: 8, analystSell: 2,
    targetPrice: 3240, currentPrice: 2948, upside: 9.9,
    beatMissStreak: ["BEAT", "BEAT", "MISS", "BEAT", "BEAT", "INLINE", "BEAT", "BEAT"],
    guidance: "RAISED", upcomingEarnings: "Apr 25, 2026",
    quarterlyData: [
      { quarter: "Q1FY23", revenue: 214950, netProfit: 17955, ebitda: 38400, patMargin: 8.3, ebitdaMargin: 17.9, epsActual: 26.7, epsEstimate: 24.8, qoqGrowth: 0 },
      { quarter: "Q2FY23", revenue: 227000, netProfit: 18650, ebitda: 40100, patMargin: 8.2, ebitdaMargin: 17.7, epsActual: 27.7, epsEstimate: 27.0, qoqGrowth: 5.6 },
      { quarter: "Q3FY23", revenue: 210000, netProfit: 17650, ebitda: 37200, patMargin: 8.4, ebitdaMargin: 17.7, epsActual: 26.2, epsEstimate: 26.8, qoqGrowth: -7.5 },
      { quarter: "Q4FY23", revenue: 218000, netProfit: 19299, ebitda: 39300, patMargin: 8.9, ebitdaMargin: 18.0, epsActual: 28.7, epsEstimate: 27.4, qoqGrowth: 3.8 },
      { quarter: "Q1FY24", revenue: 208560, netProfit: 18234, ebitda: 38900, patMargin: 8.7, ebitdaMargin: 18.7, epsActual: 27.1, epsEstimate: 26.5, qoqGrowth: -4.3 },
      { quarter: "Q2FY24", revenue: 219520, netProfit: 19878, ebitda: 41200, patMargin: 9.1, ebitdaMargin: 18.8, epsActual: 29.5, epsEstimate: 29.5, qoqGrowth: 5.3 },
      { quarter: "Q3FY24", revenue: 225000, netProfit: 20900, ebitda: 42800, patMargin: 9.3, ebitdaMargin: 19.0, epsActual: 31.1, epsEstimate: 30.0, qoqGrowth: 2.5 },
      { quarter: "Q4FY25", revenue: 236000, netProfit: 22000, ebitda: 45200, patMargin: 9.3, ebitdaMargin: 19.2, epsActual: 32.7, epsEstimate: 31.5, qoqGrowth: 4.9 },
    ],
  },
  TCS: {
    name: "TCS", sector: "IT", mcap: "₹14.1L Cr", analystBuy: 22, analystHold: 12, analystSell: 4,
    targetPrice: 4150, currentPrice: 3870, upside: 7.2,
    beatMissStreak: ["BEAT", "INLINE", "BEAT", "MISS", "BEAT", "BEAT", "MISS", "BEAT"],
    guidance: "MAINTAINED", upcomingEarnings: "Apr 10, 2026",
    quarterlyData: [
      { quarter: "Q1FY23", revenue: 52758, netProfit: 10883, ebitda: 13850, patMargin: 20.6, ebitdaMargin: 26.3, epsActual: 29.4, epsEstimate: 28.1, qoqGrowth: 0 },
      { quarter: "Q2FY23", revenue: 55309, netProfit: 11342, ebitda: 14400, patMargin: 20.5, ebitdaMargin: 26.0, epsActual: 30.7, epsEstimate: 30.7, qoqGrowth: 4.8 },
      { quarter: "Q3FY23", revenue: 58229, netProfit: 11735, ebitda: 15200, patMargin: 20.2, ebitdaMargin: 26.1, epsActual: 31.7, epsEstimate: 32.5, qoqGrowth: 5.3 },
      { quarter: "Q4FY23", revenue: 59162, netProfit: 11392, ebitda: 15500, patMargin: 19.3, ebitdaMargin: 26.2, epsActual: 30.8, epsEstimate: 30.0, qoqGrowth: 1.6 },
      { quarter: "Q1FY24", revenue: 59381, netProfit: 11748, ebitda: 15740, patMargin: 19.8, ebitdaMargin: 26.5, epsActual: 31.8, epsEstimate: 31.5, qoqGrowth: 0.4 },
      { quarter: "Q2FY24", revenue: 60583, netProfit: 11909, ebitda: 16100, patMargin: 19.7, ebitdaMargin: 26.6, epsActual: 32.2, epsEstimate: 32.0, qoqGrowth: 2.0 },
      { quarter: "Q3FY24", revenue: 63973, netProfit: 12380, ebitda: 16800, patMargin: 19.4, ebitdaMargin: 26.3, epsActual: 33.5, epsEstimate: 34.0, qoqGrowth: 5.6 },
      { quarter: "Q4FY25", revenue: 65290, netProfit: 12429, ebitda: 17100, patMargin: 19.0, ebitdaMargin: 26.2, epsActual: 33.6, epsEstimate: 33.0, qoqGrowth: 2.1 },
    ],
  },
  HDFCBANK: {
    name: "HDFCBANK", sector: "Banking", mcap: "₹13.4L Cr", analystBuy: 31, analystHold: 6, analystSell: 1,
    targetPrice: 2050, currentPrice: 1768, upside: 15.9,
    beatMissStreak: ["BEAT", "BEAT", "BEAT", "INLINE", "BEAT", "MISS", "BEAT", "BEAT"],
    guidance: "RAISED", upcomingEarnings: "Apr 19, 2026",
    quarterlyData: [
      { quarter: "Q1FY23", revenue: 42200, netProfit: 9579, ebitda: 18400, patMargin: 22.7, ebitdaMargin: 43.6, epsActual: 17.3, epsEstimate: 16.8, qoqGrowth: 0 },
      { quarter: "Q2FY23", revenue: 44300, netProfit: 10605, ebitda: 19800, patMargin: 23.9, ebitdaMargin: 44.7, epsActual: 19.2, epsEstimate: 18.9, qoqGrowth: 5.0 },
      { quarter: "Q3FY23", revenue: 47400, netProfit: 12259, ebitda: 21200, patMargin: 25.9, ebitdaMargin: 44.7, epsActual: 22.1, epsEstimate: 21.5, qoqGrowth: 7.0 },
      { quarter: "Q4FY23", revenue: 49900, netProfit: 12594, ebitda: 22100, patMargin: 25.2, ebitdaMargin: 44.3, epsActual: 22.8, epsEstimate: 22.8, qoqGrowth: 5.3 },
      { quarter: "Q1FY24", revenue: 63500, netProfit: 11952, ebitda: 28200, patMargin: 18.8, ebitdaMargin: 44.4, epsActual: 15.9, epsEstimate: 15.4, qoqGrowth: 27.3 },
      { quarter: "Q2FY24", revenue: 68200, netProfit: 15975, ebitda: 31100, patMargin: 23.4, ebitdaMargin: 45.6, epsActual: 21.2, epsEstimate: 23.5, qoqGrowth: 7.4 },
      { quarter: "Q3FY24", revenue: 71800, netProfit: 16736, ebitda: 32900, patMargin: 23.3, ebitdaMargin: 45.8, epsActual: 22.2, epsEstimate: 22.0, qoqGrowth: 5.3 },
      { quarter: "Q4FY25", revenue: 74500, netProfit: 17621, ebitda: 34200, patMargin: 23.7, ebitdaMargin: 45.9, epsActual: 23.4, epsEstimate: 23.0, qoqGrowth: 3.8 },
    ],
  },
  INFY: {
    name: "INFY", sector: "IT", mcap: "₹6.8L Cr", analystBuy: 19, analystHold: 14, analystSell: 5,
    targetPrice: 1820, currentPrice: 1640, upside: 11.0,
    beatMissStreak: ["MISS", "BEAT", "BEAT", "BEAT", "MISS", "BEAT", "INLINE", "BEAT"],
    guidance: "MAINTAINED", upcomingEarnings: "Apr 17, 2026",
    quarterlyData: [
      { quarter: "Q1FY23", revenue: 34470, netProfit: 5945, ebitda: 7800, patMargin: 17.2, ebitdaMargin: 22.6, epsActual: 14.0, epsEstimate: 15.1, qoqGrowth: 0 },
      { quarter: "Q2FY23", revenue: 36538, netProfit: 6021, ebitda: 8100, patMargin: 16.5, ebitdaMargin: 22.2, epsActual: 14.2, epsEstimate: 14.0, qoqGrowth: 6.0 },
      { quarter: "Q3FY23", revenue: 38318, netProfit: 6586, ebitda: 8500, patMargin: 17.2, ebitdaMargin: 22.2, epsActual: 15.5, epsEstimate: 15.2, qoqGrowth: 4.8 },
      { quarter: "Q4FY23", revenue: 37441, netProfit: 6128, ebitda: 8200, patMargin: 16.4, ebitdaMargin: 21.9, epsActual: 14.4, epsEstimate: 14.1, qoqGrowth: -2.3 },
      { quarter: "Q1FY24", revenue: 37933, netProfit: 5945, ebitda: 7960, patMargin: 15.7, ebitdaMargin: 21.0, epsActual: 14.0, epsEstimate: 14.5, qoqGrowth: 1.3 },
      { quarter: "Q2FY24", revenue: 38994, netProfit: 6215, ebitda: 8350, patMargin: 15.9, ebitdaMargin: 21.4, epsActual: 14.6, epsEstimate: 14.4, qoqGrowth: 2.8 },
      { quarter: "Q3FY24", revenue: 40986, netProfit: 6660, ebitda: 8900, patMargin: 16.2, ebitdaMargin: 21.7, epsActual: 15.7, epsEstimate: 15.7, qoqGrowth: 5.1 },
      { quarter: "Q4FY25", revenue: 42660, netProfit: 7023, ebitda: 9400, patMargin: 16.5, ebitdaMargin: 22.0, epsActual: 16.5, epsEstimate: 16.1, qoqGrowth: 4.1 },
    ],
  },
  ICICIBANK: {
    name: "ICICIBANK", sector: "Banking", mcap: "₹9.8L Cr", analystBuy: 34, analystHold: 4, analystSell: 0,
    targetPrice: 1560, currentPrice: 1385, upside: 12.6,
    beatMissStreak: ["BEAT", "BEAT", "BEAT", "BEAT", "BEAT", "BEAT", "BEAT", "INLINE"],
    guidance: "RAISED", upcomingEarnings: "Apr 26, 2026",
    quarterlyData: [
      { quarter: "Q1FY23", revenue: 28600, netProfit: 7792, ebitda: 14200, patMargin: 27.2, ebitdaMargin: 49.7, epsActual: 11.2, epsEstimate: 10.8, qoqGrowth: 0 },
      { quarter: "Q2FY23", revenue: 31100, netProfit: 8312, ebitda: 15600, patMargin: 26.7, ebitdaMargin: 50.2, epsActual: 11.9, epsEstimate: 11.5, qoqGrowth: 8.7 },
      { quarter: "Q3FY23", revenue: 34100, netProfit: 9853, ebitda: 17200, patMargin: 28.9, ebitdaMargin: 50.4, epsActual: 14.1, epsEstimate: 13.7, qoqGrowth: 9.6 },
      { quarter: "Q4FY23", revenue: 35800, netProfit: 9122, ebitda: 18100, patMargin: 25.5, ebitdaMargin: 50.6, epsActual: 13.1, epsEstimate: 12.8, qoqGrowth: 5.0 },
      { quarter: "Q1FY24", revenue: 38700, netProfit: 10708, ebitda: 19500, patMargin: 27.7, ebitdaMargin: 50.4, epsActual: 15.3, epsEstimate: 14.9, qoqGrowth: 8.1 },
      { quarter: "Q2FY24", revenue: 41200, netProfit: 11015, ebitda: 20800, patMargin: 26.7, ebitdaMargin: 50.5, epsActual: 15.8, epsEstimate: 15.4, qoqGrowth: 6.5 },
      { quarter: "Q3FY24", revenue: 43800, netProfit: 11792, ebitda: 22200, patMargin: 26.9, ebitdaMargin: 50.7, epsActual: 16.9, epsEstimate: 16.5, qoqGrowth: 6.3 },
      { quarter: "Q4FY25", revenue: 46100, netProfit: 12629, ebitda: 23600, patMargin: 27.4, ebitdaMargin: 51.2, epsActual: 18.1, epsEstimate: 18.1, qoqGrowth: 5.3 },
    ],
  },
  WIPRO: {
    name: "WIPRO", sector: "IT", mcap: "₹2.8L Cr", analystBuy: 12, analystHold: 18, analystSell: 8,
    targetPrice: 540, currentPrice: 481, upside: 12.3,
    beatMissStreak: ["MISS", "MISS", "BEAT", "INLINE", "MISS", "BEAT", "BEAT", "MISS"],
    guidance: "LOWERED", upcomingEarnings: "Apr 16, 2026",
    quarterlyData: [
      { quarter: "Q1FY23", revenue: 21700, netProfit: 2994, ebitda: 4200, patMargin: 13.8, ebitdaMargin: 19.4, epsActual: 5.4, epsEstimate: 5.7, qoqGrowth: 0 },
      { quarter: "Q2FY23", revenue: 22539, netProfit: 2659, ebitda: 4000, patMargin: 11.8, ebitdaMargin: 17.8, epsActual: 4.8, epsEstimate: 5.2, qoqGrowth: 3.9 },
      { quarter: "Q3FY23", revenue: 23229, netProfit: 2969, ebitda: 4300, patMargin: 12.8, ebitdaMargin: 18.5, epsActual: 5.4, epsEstimate: 5.3, qoqGrowth: 3.1 },
      { quarter: "Q4FY23", revenue: 23190, netProfit: 3087, ebitda: 4400, patMargin: 13.3, ebitdaMargin: 19.0, epsActual: 5.6, epsEstimate: 5.6, qoqGrowth: -0.2 },
      { quarter: "Q1FY24", revenue: 22831, netProfit: 2870, ebitda: 4150, patMargin: 12.6, ebitdaMargin: 18.2, epsActual: 5.2, epsEstimate: 5.5, qoqGrowth: -1.5 },
      { quarter: "Q2FY24", revenue: 22517, netProfit: 2945, ebitda: 4280, patMargin: 13.1, ebitdaMargin: 19.0, epsActual: 5.3, epsEstimate: 5.2, qoqGrowth: -1.4 },
      { quarter: "Q3FY24", revenue: 22209, netProfit: 3165, ebitda: 4500, patMargin: 14.3, ebitdaMargin: 20.3, epsActual: 5.7, epsEstimate: 5.6, qoqGrowth: -1.4 },
      { quarter: "Q4FY25", revenue: 21964, netProfit: 3048, ebitda: 4380, patMargin: 13.9, ebitdaMargin: 20.0, epsActual: 5.5, epsEstimate: 5.9, qoqGrowth: -1.1 },
    ],
  },
  BAJFINANCE: {
    name: "BAJFINANCE", sector: "NBFC", mcap: "₹4.5L Cr", analystBuy: 26, analystHold: 9, analystSell: 3,
    targetPrice: 8200, currentPrice: 7280, upside: 12.6,
    beatMissStreak: ["BEAT", "BEAT", "BEAT", "BEAT", "BEAT", "MISS", "BEAT", "BEAT"],
    guidance: "RAISED", upcomingEarnings: "Apr 28, 2026",
    quarterlyData: [
      { quarter: "Q1FY23", revenue: 9850, netProfit: 2596, ebitda: 4800, patMargin: 26.4, ebitdaMargin: 48.7, epsActual: 43.0, epsEstimate: 41.5, qoqGrowth: 0 },
      { quarter: "Q2FY23", revenue: 10840, netProfit: 2781, ebitda: 5300, patMargin: 25.7, ebitdaMargin: 48.9, epsActual: 46.0, epsEstimate: 45.0, qoqGrowth: 10.1 },
      { quarter: "Q3FY23", revenue: 11900, netProfit: 3052, ebitda: 5800, patMargin: 25.6, ebitdaMargin: 48.7, epsActual: 50.6, epsEstimate: 49.8, qoqGrowth: 9.8 },
      { quarter: "Q4FY23", revenue: 12900, netProfit: 3158, ebitda: 6200, patMargin: 24.5, ebitdaMargin: 48.1, epsActual: 52.3, epsEstimate: 51.5, qoqGrowth: 8.4 },
      { quarter: "Q1FY24", revenue: 13200, netProfit: 3437, ebitda: 6500, patMargin: 26.0, ebitdaMargin: 49.2, epsActual: 57.0, epsEstimate: 56.0, qoqGrowth: 2.3 },
      { quarter: "Q2FY24", revenue: 14400, netProfit: 3550, ebitda: 6900, patMargin: 24.7, ebitdaMargin: 47.9, epsActual: 58.9, epsEstimate: 62.0, qoqGrowth: 9.1 },
      { quarter: "Q3FY24", revenue: 15700, netProfit: 4043, ebitda: 7700, patMargin: 25.8, ebitdaMargin: 49.0, epsActual: 67.0, epsEstimate: 65.5, qoqGrowth: 9.0 },
      { quarter: "Q4FY25", revenue: 16600, netProfit: 4469, ebitda: 8300, patMargin: 26.9, ebitdaMargin: 50.0, epsActual: 74.1, epsEstimate: 72.5, qoqGrowth: 5.7 },
    ],
  },
  TATASTEEL: {
    name: "TATASTEEL", sector: "Metals", mcap: "₹2.1L Cr", analystBuy: 18, analystHold: 14, analystSell: 6,
    targetPrice: 195, currentPrice: 168, upside: 16.1,
    beatMissStreak: ["MISS", "BEAT", "MISS", "BEAT", "INLINE", "MISS", "BEAT", "INLINE"],
    guidance: "MAINTAINED", upcomingEarnings: "May 6, 2026",
    quarterlyData: [
      { quarter: "Q1FY23", revenue: 63430, netProfit: 7765, ebitda: 14200, patMargin: 12.2, ebitdaMargin: 22.4, epsActual: 6.3, epsEstimate: 7.1, qoqGrowth: 0 },
      { quarter: "Q2FY23", revenue: 57600, netProfit: 1297, ebitda: 8200, patMargin: 2.3, ebitdaMargin: 14.2, epsActual: 1.0, epsEstimate: 0.8, qoqGrowth: -9.2 },
      { quarter: "Q3FY23", revenue: 55200, netProfit: 522, ebitda: 6400, patMargin: 0.9, ebitdaMargin: 11.6, epsActual: 0.4, epsEstimate: 0.6, qoqGrowth: -4.2 },
      { quarter: "Q4FY23", revenue: 59500, netProfit: 1242, ebitda: 7800, patMargin: 2.1, ebitdaMargin: 13.1, epsActual: 1.0, epsEstimate: 0.9, qoqGrowth: 7.8 },
      { quarter: "Q1FY24", revenue: 57600, netProfit: 960, ebitda: 7200, patMargin: 1.7, ebitdaMargin: 12.5, epsActual: 0.8, epsEstimate: 0.9, qoqGrowth: -3.2 },
      { quarter: "Q2FY24", revenue: 53400, netProfit: -4691, ebitda: 3900, patMargin: -8.8, ebitdaMargin: 7.3, epsActual: -3.8, epsEstimate: -4.5, qoqGrowth: -7.3 },
      { quarter: "Q3FY24", revenue: 55800, netProfit: 327, ebitda: 5900, patMargin: 0.6, ebitdaMargin: 10.6, epsActual: 0.3, epsEstimate: 0.2, qoqGrowth: 4.5 },
      { quarter: "Q4FY25", revenue: 58400, netProfit: 611, ebitda: 7100, patMargin: 1.0, ebitdaMargin: 12.2, epsActual: 0.5, epsEstimate: 0.5, qoqGrowth: 4.7 },
    ],
  },
};

const STOCK_KEYS = Object.keys(STOCKS_DATA) as Array<keyof typeof STOCKS_DATA>;

// ─── Helper ───────────────────────────────────────────────────────────────────

function getBeatColor(bm: BeatMiss): string {
  if (bm === "BEAT") return "bg-signal-bull";
  if (bm === "MISS") return "bg-signal-bear";
  return "bg-gold-500";
}

function getGuidanceStyle(g: Guidance): string {
  if (g === "RAISED") return "bg-signal-bull/20 text-signal-bull border border-signal-bull/30";
  if (g === "LOWERED") return "bg-signal-bear/20 text-signal-bear border border-signal-bear/30";
  return "bg-gold-500/20 text-gold-400 border border-gold-500/30";
}

function getUpsideColor(u: number): string {
  if (u >= 15) return "text-signal-bull";
  if (u >= 5) return "text-gold-400";
  return "text-signal-bear";
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps): JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-bg-card border border-bg-border rounded px-3 py-2 text-xs">
      <p className="text-ivory-300 font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EarningsAnalyzer(): JSX.Element {
  const [selectedStock, setSelectedStock] = useState<string>("RELIANCE");
  const [activeTab, setActiveTab] = useState<TabKey>("Revenue");

  const stock = STOCKS_DATA[selectedStock];
  const totalAnalysts = stock.analystBuy + stock.analystHold + stock.analystSell;
  const buyPct = (stock.analystBuy / totalAnalysts) * 100;
  const holdPct = (stock.analystHold / totalAnalysts) * 100;
  const sellPct = (stock.analystSell / totalAnalysts) * 100;

  const tabs: TabKey[] = ["Revenue", "Net Profit", "Margins", "EPS"];

  const barColors = stock.beatMissStreak.map((bm) =>
    bm === "BEAT" ? "#00E676" : bm === "MISS" ? "#FF1744" : "#DAA520"
  );

  return (
    <div className="bg-bg-primary min-h-screen font-sans">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-bg-border px-6 py-4 flex items-center gap-3">
        <BarChart2 className="text-maroon-800" size={22} />
        <h1 className="text-ivory-100 text-xl font-display font-bold tracking-wide">Earnings Analyzer</h1>
        <span className="ml-2 text-xs text-ivory-500 bg-bg-card border border-bg-border px-2 py-0.5 rounded">
          Q4FY25 Season
        </span>
      </div>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* ── Left panel: stock list ─────────────────────────────────────────── */}
        <div className="w-1/3 border-r border-bg-border overflow-y-auto bg-bg-secondary">
          <div className="p-3 border-b border-bg-border">
            <p className="text-xs text-ivory-500 uppercase tracking-widest">8 Stocks</p>
          </div>
          {STOCK_KEYS.map((key) => {
            const s = STOCKS_DATA[key];
            const tot = s.analystBuy + s.analystHold + s.analystSell;
            const bPct = (s.analystBuy / tot) * 100;
            const hPct = (s.analystHold / tot) * 100;
            const isSelected = selectedStock === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedStock(key)}
                className={
                  isSelected
                    ? "w-full text-left px-4 py-3 border-b border-bg-border bg-bg-hover border-l-2 border-l-maroon-800"
                    : "w-full text-left px-4 py-3 border-b border-bg-border hover:bg-bg-hover transition-colors"
                }
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-ivory-100 font-mono font-semibold text-sm">{s.name}</span>
                    <span className="text-xs text-ivory-500 bg-bg-card px-1.5 py-0.5 rounded">{s.sector}</span>
                  </div>
                  <span className={getGuidanceStyle(s.guidance) + " text-xs px-1.5 py-0.5 rounded font-semibold"}>
                    {s.guidance === "RAISED" ? "▲ RAISED" : s.guidance === "LOWERED" ? "▼ LOWERED" : "→ MAINT."}
                  </span>
                </div>
                {/* Analyst mini bar */}
                <div className="flex h-1.5 rounded overflow-hidden mb-1.5">
                  <div className="bg-signal-bull" style={{ width: `${bPct}%` }} />
                  <div className="bg-gold-500" style={{ width: `${hPct}%` }} />
                  <div className="bg-signal-bear" style={{ width: `${100 - bPct - hPct}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ivory-500 text-xs">
                    B:{s.analystBuy} H:{s.analystHold} S:{s.analystSell}
                  </span>
                  <span className={getUpsideColor(s.upside) + " text-xs font-mono font-semibold"}>
                    TP ₹{s.targetPrice.toLocaleString("en-IN")} ({s.upside > 0 ? "+" : ""}{s.upside}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Right panel: detail ──────────────────────────────────────────────── */}
        <div className="w-2/3 overflow-y-auto bg-bg-primary px-6 py-5 space-y-5">
          {/* Stock header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-ivory-50 text-2xl font-display font-bold">{stock.name}</h2>
              <p className="text-ivory-500 text-sm">{stock.sector} · MCap {stock.mcap}</p>
            </div>
            <div className="text-right">
              <p className="text-ivory-100 font-mono text-xl font-bold">₹{stock.currentPrice.toLocaleString("en-IN")}</p>
              <p className={getUpsideColor(stock.upside) + " text-sm font-semibold"}>
                TP ₹{stock.targetPrice.toLocaleString("en-IN")} &nbsp;
                <span className="text-xs">({stock.upside > 0 ? "+" : ""}{stock.upside}% upside)</span>
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-ivory-500 justify-end">
                <Calendar size={12} />
                <span>Earnings: {stock.upcomingEarnings}</span>
              </div>
            </div>
          </div>

          {/* Beat / Miss streak */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <p className="text-xs text-ivory-500 uppercase tracking-widest mb-3">EPS Beat/Miss Streak — Last 8 Quarters</p>
            <div className="flex items-center gap-2">
              {stock.beatMissStreak.map((bm, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={getBeatColor(bm) + " w-8 h-8 rounded flex items-center justify-center"}>
                    {bm === "BEAT" && <TrendingUp size={14} className="text-bg-primary" />}
                    {bm === "MISS" && <TrendingDown size={14} className="text-bg-primary" />}
                    {bm === "INLINE" && <Minus size={14} className="text-bg-primary" />}
                  </div>
                  <span className="text-ivory-600 text-xs">{stock.quarterlyData[i]?.quarter.slice(0, 4)}</span>
                </div>
              ))}
              <div className="ml-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-signal-bull" />
                  <span className="text-xs text-ivory-400">Beat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-signal-bear" />
                  <span className="text-xs text-ivory-400">Miss</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gold-500" />
                  <span className="text-xs text-ivory-400">Inline</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-bg-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={
                  activeTab === tab
                    ? "px-5 py-2 text-sm font-semibold text-ivory-100 border-b-2 border-maroon-800 -mb-px"
                    : "px-5 py-2 text-sm text-ivory-500 hover:text-ivory-300 transition-colors"
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Charts */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            {activeTab === "Revenue" && (
              <>
                <p className="text-xs text-ivory-500 uppercase tracking-widest mb-3">Revenue (₹ Cr) + QoQ Growth %</p>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={stock.quarterlyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                    <XAxis dataKey="quarter" tick={{ fill: "#9C8C58", fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: "#9C8C58", fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#9C8C58", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#B8A870" }} />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹ Cr)" fill="#8B0000" radius={[3, 3, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="qoqGrowth" name="QoQ Growth %" stroke="#00E676" strokeWidth={2} dot={{ r: 3, fill: "#00E676" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </>
            )}

            {activeTab === "Net Profit" && (
              <>
                <p className="text-xs text-ivory-500 uppercase tracking-widest mb-3">Net Profit (₹ Cr) — Colored by Beat/Miss</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stock.quarterlyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                    <XAxis dataKey="quarter" tick={{ fill: "#9C8C58", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9C8C58", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="netProfit" name="Net Profit (₹ Cr)" radius={[3, 3, 0, 0]}>
                      {stock.quarterlyData.map((_, idx) => (
                        <Cell key={idx} fill={barColors[idx]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}

            {activeTab === "Margins" && (
              <>
                <p className="text-xs text-ivory-500 uppercase tracking-widest mb-3">PAT Margin % &amp; EBITDA Margin %</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stock.quarterlyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                    <XAxis dataKey="quarter" tick={{ fill: "#9C8C58", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9C8C58", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#B8A870" }} />
                    <Line type="monotone" dataKey="patMargin" name="PAT Margin %" stroke="#00E676" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="ebitdaMargin" name="EBITDA Margin %" stroke="#DAA520" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}

            {activeTab === "EPS" && (
              <>
                <p className="text-xs text-ivory-500 uppercase tracking-widest mb-3">EPS Actual vs Estimate</p>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={stock.quarterlyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E24" />
                    <XAxis dataKey="quarter" tick={{ fill: "#9C8C58", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9C8C58", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#B8A870" }} />
                    <Bar dataKey="epsActual" name="EPS Actual" radius={[3, 3, 0, 0]}>
                      {stock.quarterlyData.map((_, idx) => (
                        <Cell key={idx} fill={barColors[idx]} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="epsEstimate" name="EPS Estimate" stroke="#DAA520" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

          {/* Analyst section */}
          <div className="bg-bg-card border border-bg-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} className="text-ivory-400" />
              <p className="text-xs text-ivory-500 uppercase tracking-widest">Analyst Consensus — {totalAnalysts} Analysts</p>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-signal-bull text-xs w-8">BUY</span>
                <div className="flex-1 bg-bg-border rounded h-2 overflow-hidden">
                  <div className="bg-signal-bull h-full rounded" style={{ width: `${buyPct}%` }} />
                </div>
                <span className="text-signal-bull font-mono text-xs w-12 text-right">{stock.analystBuy} ({Math.round(buyPct)}%)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gold-400 text-xs w-8">HOLD</span>
                <div className="flex-1 bg-bg-border rounded h-2 overflow-hidden">
                  <div className="bg-gold-500 h-full rounded" style={{ width: `${holdPct}%` }} />
                </div>
                <span className="text-gold-400 font-mono text-xs w-12 text-right">{stock.analystHold} ({Math.round(holdPct)}%)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-signal-bear text-xs w-8">SELL</span>
                <div className="flex-1 bg-bg-border rounded h-2 overflow-hidden">
                  <div className="bg-signal-bear h-full rounded" style={{ width: `${sellPct}%` }} />
                </div>
                <span className="text-signal-bear font-mono text-xs w-12 text-right">{stock.analystSell} ({Math.round(sellPct)}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ivory-500">Target Price</span>
              <span className="text-ivory-100 font-mono font-semibold">₹{stock.targetPrice.toLocaleString("en-IN")}</span>
              <span className={getUpsideColor(stock.upside) + " font-semibold"}>
                {stock.upside > 0 ? "+" : ""}{stock.upside}% Upside
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
