import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Trend, Signal } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtCr(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L Cr`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(2)}K Cr`;
  return `₹${n.toFixed(0)} Cr`;
}

export function fmtPct(n: number, sign = true): string {
  const formatted = Math.abs(n).toFixed(2) + "%";
  if (!sign) return formatted;
  return n >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function fmtPrice(n: number): string {
  return `₹${fmt(n)}`;
}

export function colorFromChange(val: number): string {
  if (val > 0) return "text-signal-bull";
  if (val < 0) return "text-signal-bear";
  return "text-ivory-400";
}

export function bgColorFromChange(val: number): string {
  if (val > 2) return "bg-signal-bull/20 text-signal-bull";
  if (val > 0) return "bg-signal-bull/10 text-signal-bull";
  if (val < -2) return "bg-signal-bear/20 text-signal-bear";
  if (val < 0) return "bg-signal-bear/10 text-signal-bear";
  return "bg-ivory-900/20 text-ivory-400";
}

export function trendColor(trend: Trend): string {
  const map: Record<Trend, string> = {
    bullish: "text-signal-bull",
    bearish: "text-signal-bear",
    neutral: "text-ivory-400",
    accumulation: "text-signal-accumulate",
    distribution: "text-signal-distribute",
  };
  return map[trend];
}

export function signalLabel(signal: Signal): string {
  const map: Record<Signal, string> = {
    strong_buy: "STRONG BUY",
    buy: "BUY",
    hold: "HOLD",
    sell: "SELL",
    strong_sell: "STRONG SELL",
  };
  return map[signal];
}

export function signalColor(signal: Signal): string {
  const map: Record<Signal, string> = {
    strong_buy: "text-signal-bull bg-signal-bull/20 border-signal-bull/40",
    buy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    hold: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    sell: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    strong_sell: "text-signal-bear bg-signal-bear/20 border-signal-bear/40",
  };
  return map[signal];
}

export function scoreColor(score: number): string {
  if (score >= 85) return "text-signal-bull";
  if (score >= 70) return "text-emerald-400";
  if (score >= 55) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-signal-bear";
}

export function scoreBg(score: number): string {
  if (score >= 85) return "bg-signal-bull";
  if (score >= 70) return "bg-emerald-500";
  if (score >= 55) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-signal-bear";
}

export function phaseColor(phase: string): string {
  const map: Record<string, string> = {
    accumulation: "text-signal-accumulate",
    markup: "text-signal-bull",
    distribution: "text-signal-distribute",
    markdown: "text-signal-bear",
  };
  return map[phase] ?? "text-ivory-400";
}

export function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function rsiColor(rsi: number): string {
  if (rsi >= 70) return "text-signal-bear";
  if (rsi >= 60) return "text-yellow-400";
  if (rsi >= 40) return "text-signal-bull";
  if (rsi >= 30) return "text-yellow-400";
  return "text-signal-accumulate";
}
