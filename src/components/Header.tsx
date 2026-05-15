"use client";
import { useState, useEffect } from "react";
import { Bell, Activity, Cpu, TrendingUp, Shield, ChevronDown } from "lucide-react";
import { alertData } from "@/lib/mockData";
import { cn, timeAgo } from "@/lib/utils";

interface HeaderProps {
  unreadCount: number;
  onAlertClick: () => void;
}

export default function Header({ unreadCount, onAlertClick }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const hr = new Date().getHours();
    setMarketOpen(hr >= 9 && hr < 16);
    return () => clearInterval(t);
  }, []);

  const ist = time.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });

  return (
    <header className="bg-bg-secondary border-b border-bg-border px-4 py-3 flex items-center justify-between relative z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-lg bg-gradient-maroon flex items-center justify-center shadow-glow-maroon">
            <TrendingUp className="w-5 h-5 text-ivory-100" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-signal-bull live-dot" />
        </div>
        <div>
          <div className="text-sm font-display font-bold tracking-tight text-ivory-100">
            SmartFlow<span className="text-gradient-maroon"> AI</span>
          </div>
          <div className="text-[10px] text-ivory-600 font-mono tracking-widest uppercase">
            Institutional Intelligence Terminal
          </div>
        </div>
      </div>

      {/* Center — market status */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "w-2 h-2 rounded-full",
            marketOpen ? "bg-signal-bull live-dot" : "bg-ivory-600"
          )} />
          <span className="font-mono text-ivory-300">NSE</span>
          <span className={cn("font-semibold", marketOpen ? "text-signal-bull" : "text-ivory-500")}>
            {marketOpen ? "LIVE" : "CLOSED"}
          </span>
        </div>
        <div className="h-4 w-px bg-bg-border" />
        <div className="text-xs font-mono text-ivory-400 flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-maroon-700" />
          IST {ist}
        </div>
        <div className="h-4 w-px bg-bg-border" />
        <div className="flex items-center gap-2 text-xs">
          <Cpu className="w-3 h-3 text-signal-accumulate" />
          <span className="text-ivory-400">AI Engine</span>
          <span className="text-signal-bull font-mono">ACTIVE</span>
        </div>
        <div className="h-4 w-px bg-bg-border" />
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-3 h-3 text-gold-500" />
          <span className="text-ivory-400">Smart Money</span>
          <span className="text-gold-500 font-mono font-semibold">TRACKING</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAlertClick}
          className="relative p-2 rounded-lg bg-bg-card border border-bg-border hover:border-maroon-800 transition-colors"
        >
          <Bell className="w-4 h-4 text-ivory-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-signal-bear rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-bg-border cursor-pointer hover:border-maroon-800 transition-colors">
          <div className="w-6 h-6 rounded-full bg-gradient-maroon flex items-center justify-center text-[10px] font-bold text-ivory-100">
            HF
          </div>
          <span className="text-xs text-ivory-300 hidden sm:block">Hedge Fund View</span>
          <ChevronDown className="w-3 h-3 text-ivory-500" />
        </div>
      </div>
    </header>
  );
}
