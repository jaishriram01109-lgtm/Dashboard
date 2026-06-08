"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Bell, Activity, Brain, BarChart3, Shield, Target, Zap, Globe, PieChart, Search, BookOpen, Calculator, Flag, Eye } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  fetchHomeData,
  type IndexQuote, type ChartPoint,
} from "@/lib/liveData";
import { fetchBondYields, BOND_YF } from "@/lib/yahooData";
import { useAngelQuotes } from "@/hooks/useAngelData";

// Fallback mock data
const MOCK_INDICES: IndexQuote[] = [
  { name: "NIFTY 50",    symbol: "^NSEI",      value: 23123.00, change: -241.80, pct: -1.04 },
  { name: "BANK NIFTY",  symbol: "^NSEBANK",   value: 51480.50, change: -586.30, pct: -1.12 },
  { name: "SENSEX",      symbol: "^BSESN",     value: 76245.30, change: -312.40, pct: -0.41 },
  { name: "NIFTY IT",    symbol: "^CNXIT",     value: 36124.60, change:  182.40, pct:  0.51 },
  { name: "NIFTY PHARMA",symbol: "^CNXPHARMA", value: 21284.50, change:  142.30, pct:  0.67 },
  { name: "INDIA VIX",   symbol: "^INDIAVIX",  value: 17.03,    change:   1.24,  pct:  7.86 },
];