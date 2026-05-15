"use client";
import {
  Globe, BarChart3, Search, Brain, Zap, TrendingUp,
  Bell, PieChart, Database, Star, Activity, Layers, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "macro", label: "Macro Intel", icon: Globe, badge: null },
  { id: "sectors", label: "Sector Rotation", icon: BarChart3, badge: "HOT" },
  { id: "stocks", label: "Stock Engine", icon: Search, badge: null },
  { id: "smart-money", label: "Smart Money", icon: Brain, badge: "AI" },
  { id: "trades", label: "Trade Setups", icon: Target, badge: "6" },
  { id: "ai-predict", label: "AI Prediction", icon: Zap, badge: null },
  { id: "alerts", label: "Live Alerts", icon: Bell, badge: "7" },
  { id: "charts", label: "Visualizations", icon: PieChart, badge: null },
  { id: "scanner", label: "Momentum Scanner", icon: Activity, badge: null },
  { id: "portfolio", label: "AI Portfolio", icon: Layers, badge: null },
  { id: "watchlist", label: "Watchlist", icon: Star, badge: null },
];

interface SidebarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-52 bg-bg-secondary border-r border-bg-border flex-shrink-0">
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-medium group",
                isActive
                  ? "bg-maroon-800/25 border border-maroon-800/50 text-ivory-100 shadow-glow-maroon"
                  : "text-ivory-500 hover:text-ivory-200 hover:bg-bg-hover border border-transparent"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 flex-shrink-0 transition-colors",
                isActive ? "text-maroon-400" : "text-ivory-600 group-hover:text-ivory-400"
              )} />
              <span className="flex-1 tracking-wide">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "label-tag",
                  item.badge === "HOT" ? "bg-signal-bear/20 text-signal-bear" :
                  item.badge === "AI" ? "bg-signal-accumulate/20 text-signal-accumulate" :
                  "bg-maroon-800/30 text-maroon-400"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
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
