"use client";
import {
  Globe, BarChart3, Search, Brain, Zap, TrendingUp,
  Bell, PieChart, Database, Star, Activity, Layers, Target,
  ShieldAlert, CalendarDays, Newspaper, Crosshair,
  LayoutGrid, FlaskConical, BookOpen, GitCompare, DollarSign, RefreshCw,
  BarChart2, Calculator, Gauge, Waves, Flame, ArrowLeftRight,
  Layers2, Scale, Smile,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { id: "macro", label: "Macro Intel", icon: Globe, badge: null, group: "market" },
  { id: "sectors", label: "Sector Rotation", icon: BarChart3, badge: "HOT", group: "market" },
  { id: "stocks", label: "Stock Engine", icon: Search, badge: null, group: "market" },
  { id: "smart-money", label: "Smart Money", icon: Brain, badge: "AI", group: "market" },
  { id: "options", label: "Options Chain", icon: Layers, badge: "OI", group: "market" },
  { id: "bulk-deals", label: "Bulk Deals", icon: Database, badge: null, group: "market" },
  { id: "trades", label: "Trade Setups", icon: Target, badge: "6", group: "signals" },
  { id: "ai-predict", label: "AI Prediction", icon: Zap, badge: null, group: "signals" },
  { id: "scanner", label: "Momentum Scanner", icon: Activity, badge: null, group: "signals" },
  { id: "alerts", label: "Live Alerts", icon: Bell, badge: "7", group: "signals" },
  { id: "charts", label: "Visualizations", icon: PieChart, badge: null, group: "tools" },
  { id: "advanced-chart", label: "Chart Studio", icon: BarChart3, badge: "NEW", group: "tools" },
  { id: "economic-calendar", label: "Eco Calendar", icon: Layers, badge: null, group: "tools" },
  { id: "ipo", label: "IPO Tracker", icon: Star, badge: "GMP", group: "tools" },
  { id: "portfolio", label: "AI Portfolio", icon: Layers, badge: null, group: "tools" },
  { id: "watchlist", label: "Watchlist", icon: Star, badge: null, group: "tools" },
  { id: "news", label: "News & Sentiment", icon: Newspaper, badge: "LIVE", group: "tools" },
  { id: "fno", label: "F&O Analytics", icon: Activity, badge: null, group: "tools" },
  { id: "screener", label: "Stock Screener", icon: Search, badge: null, group: "tools" },
  { id: "global", label: "Global Markets", icon: Globe, badge: null, group: "tools" },
  { id: "corporate", label: "Corp. Actions", icon: CalendarDays, badge: null, group: "tools" },
  { id: "risk", label: "Risk Dashboard", icon: ShieldAlert, badge: null, group: "tools" },
  { id: "mf", label: "Mutual Funds", icon: Layers, badge: null, group: "tools" },
  { id: "patterns", label: "Chart Patterns", icon: Crosshair, badge: "AI", group: "signals" },
  { id: "derivatives", label: "Derivatives", icon: Zap, badge: null, group: "signals" },
  { id: "heatmap", label: "Market Heatmap", icon: LayoutGrid, badge: null, group: "market" },
  { id: "backtest", label: "Backtest Engine", icon: FlaskConical, badge: "NEW", group: "tools" },
  { id: "journal", label: "Trade Journal", icon: BookOpen, badge: null, group: "tools" },
  { id: "peer", label: "Peer Comparison", icon: GitCompare, badge: null, group: "tools" },
  { id: "dividends", label: "Dividend Tracker", icon: DollarSign, badge: null, group: "tools" },
  { id: "rebalancer", label: "Rebalancer", icon: RefreshCw, badge: null, group: "tools" },
  { id: "earnings", label: "Earnings Analyzer", icon: BarChart2, badge: "NEW", group: "market" },
  { id: "quant", label: "Quant Factor Model", icon: Calculator, badge: "AI", group: "signals" },
  { id: "index", label: "Index Analytics", icon: Gauge, badge: null, group: "market" },
  { id: "breadth", label: "Market Breadth", icon: Waves, badge: null, group: "market" },
  { id: "volatility", label: "Volatility Surface", icon: Flame, badge: null, group: "signals" },
  { id: "flows", label: "Capital Flows", icon: ArrowLeftRight, badge: "LIVE", group: "market" },
  { id: "optionstrategy", label: "Option Strategy", icon: Layers2, badge: "NEW", group: "signals" },
  { id: "sizing", label: "Position Sizing", icon: Scale, badge: null, group: "tools" },
  { id: "sentiment", label: "Sentiment", icon: Smile, badge: "AI", group: "signals" },
];

interface SidebarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-52 bg-bg-secondary border-r border-bg-border flex-shrink-0">
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {(["market", "signals", "tools"] as const).map(group => {
          const groupItems = navItems.filter(i => i.group === group);
          const groupLabel: Record<string, string> = { market: "MARKET DATA", signals: "SIGNALS & AI", tools: "TOOLS" };
          return (
            <div key={group}>
              <div className="text-[9px] font-bold text-ivory-700 uppercase tracking-widest px-3 pt-3 pb-1">
                {groupLabel[group]}
              </div>
              {groupItems.map(item => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-xs font-medium group",
                      isActive
                        ? "bg-maroon-800/25 border border-maroon-800/50 text-ivory-100 shadow-glow-maroon"
                        : "text-ivory-500 hover:text-ivory-200 hover:bg-bg-hover border border-transparent"
                    )}
                  >
                    <Icon className={cn(
                      "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                      isActive ? "text-maroon-400" : "text-ivory-600 group-hover:text-ivory-400"
                    )} />
                    <span className="flex-1 tracking-wide">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "label-tag text-[9px]",
                        item.badge === "HOT" ? "bg-signal-bear/20 text-signal-bear" :
                        item.badge === "AI" || item.badge === "NEW" ? "bg-signal-accumulate/20 text-signal-accumulate" :
                        item.badge === "GMP" ? "bg-gold-500/20 text-gold-500" :
                        item.badge === "OI" ? "bg-signal-accumulate/20 text-signal-accumulate" :
                        item.badge === "LIVE" ? "bg-signal-bull/20 text-signal-bull" :
                        "bg-maroon-800/30 text-maroon-400"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom status */}
      <div className="px-3 py-3 border-t border-bg-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-signal-bull live-dot" />
          <span className="text-[11px] text-ivory-500">Data Stream Active</span>
        </div>
        <div className="text-[10px] text-ivory-700 font-mono">
          NSE • BSE • FII/DII • Options
        </div>
        <div className="text-[10px] text-maroon-700 font-mono font-semibold">
          SmartFlow AI v2.0.0
        </div>
      </div>
    </aside>
  );
}
