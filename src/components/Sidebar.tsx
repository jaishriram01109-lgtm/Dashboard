"use client";

import { useState, useMemo } from "react";
import {
  Globe, BarChart3, Search, Brain, Zap, TrendingUp,
  Bell, PieChart, Database, Star, Activity, Layers, Target,
  ShieldAlert, CalendarDays, Newspaper, Crosshair,
  LayoutGrid, FlaskConical, BookOpen, GitCompare, DollarSign, RefreshCw,
  BarChart2, Calculator, Gauge, Waves, Flame, ArrowLeftRight,
  Layers2, Scale, Smile, Coins, Landmark, BarChart4, Globe2, FileBarChart,
  UserCheck, Package, ArrowUpCircle, Eye, Receipt, Flag,
  ChevronDown, ChevronRight, Home, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  // ── MARKET DATA ──────────────────────────────────────────────────
  { id: "home",         label: "Home",             icon: Home,         badge: null,   group: "market" },
  { id: "macro",        label: "Macro Intel",       icon: Globe,        badge: null,   group: "market" },
  { id: "sectors",      label: "Sector Rotation",   icon: BarChart3,    badge: "HOT",  group: "market" },
  { id: "stocks",       label: "Stock Engine",      icon: Search,       badge: null,   group: "market" },
  { id: "smart-money",  label: "Smart Money",       icon: Brain,        badge: "AI",   group: "market" },
  { id: "heatmap",      label: "Market Heatmap",    icon: LayoutGrid,   badge: null,   group: "market" },
  { id: "breadth",      label: "Market Breadth",    icon: Waves,        badge: null,   group: "market" },
  { id: "index",        label: "Index Analytics",   icon: Gauge,        badge: null,   group: "market" },
  { id: "global",       label: "Global Markets",    icon: Globe2,       badge: null,   group: "market" },
  { id: "flows",        label: "Capital Flows",     icon: ArrowLeftRight,badge: "LIVE",group: "market" },
  { id: "commodity",    label: "Commodities",       icon: Coins,        badge: null,   group: "market" },
  { id: "bonds",        label: "Bond Market",       icon: Landmark,     badge: null,   group: "market" },
  { id: "currency",     label: "Currency",          icon: Globe2,       badge: null,   group: "market" },
  { id: "macroreport",  label: "Macro Scorecard",   icon: FileBarChart, badge: null,   group: "market" },
  { id: "promoter",     label: "Promoter Activity", icon: UserCheck,    badge: null,   group: "market" },
  { id: "insider",      label: "Insider Registry",  icon: Eye,          badge: "SEBI", group: "market" },
  // ── SIGNALS & AI ─────────────────────────────────────────────────
  { id: "trades",       label: "Trade Setups",      icon: Target,       badge: "6",    group: "signals" },
  { id: "ai-predict",   label: "AI Prediction",     icon: Zap,          badge: null,   group: "signals" },
  { id: "scanner",      label: "Momentum Scanner",  icon: Activity,     badge: null,   group: "signals" },
  { id: "alerts",       label: "Live Alerts",       icon: Bell,         badge: "7",    group: "signals" },
  { id: "patterns",     label: "Chart Patterns",    icon: Crosshair,    badge: "AI",   group: "signals" },
  { id: "quant",        label: "Quant Factor",      icon: Calculator,   badge: "AI",   group: "signals" },
  { id: "sentiment",    label: "Sentiment",         icon: Smile,        badge: "AI",   group: "signals" },
  { id: "volatility",   label: "Volatility Surface",icon: Flame,        badge: null,   group: "signals" },
  { id: "derivatives",  label: "Derivatives",       icon: Zap,          badge: null,   group: "signals" },
  { id: "fiideriv",     label: "FII Derivatives",   icon: Flame,        badge: "SEBI", group: "signals" },
  { id: "delivery",     label: "Delivery Analysis", icon: Package,      badge: null,   group: "signals" },
  { id: "highlows",     label: "52W High/Low",      icon: ArrowUpCircle,badge: null,   group: "signals" },
  // ── F&O ──────────────────────────────────────────────────────────
  { id: "options",      label: "Options Chain",     icon: Layers,       badge: "OI",   group: "fno" },
  { id: "fno",          label: "F&O Analytics",     icon: Activity,     badge: null,   group: "fno" },
  { id: "optionstrategy",label:"Option Strategy",   icon: Layers2,      badge: "NEW",  group: "fno" },
  { id: "bulk-deals",   label: "Bulk Deals",        icon: Database,     badge: null,   group: "fno" },
  // ── PORTFOLIO ────────────────────────────────────────────────────
  { id: "portfolio",    label: "AI Portfolio",      icon: Layers,       badge: null,   group: "portfolio" },
  { id: "watchlist",    label: "Watchlist",         icon: Star,         badge: null,   group: "portfolio" },
  { id: "rebalancer",   label: "Rebalancer",        icon: RefreshCw,    badge: null,   group: "portfolio" },
  { id: "risk",         label: "Risk Dashboard",    icon: ShieldAlert,  badge: null,   group: "portfolio" },
  { id: "dividends",    label: "Dividend Tracker",  icon: DollarSign,   badge: null,   group: "portfolio" },
  { id: "peer",         label: "Peer Comparison",   icon: GitCompare,   badge: null,   group: "portfolio" },
  { id: "sizing",       label: "Position Sizing",   icon: Scale,        badge: null,   group: "portfolio" },
  // ── RESEARCH ─────────────────────────────────────────────────────
  { id: "screener",     label: "Stock Screener",    icon: Search,       badge: null,   group: "research" },
  { id: "earnings",     label: "Earnings Analyzer", icon: BarChart2,    badge: null,   group: "research" },
  { id: "news",         label: "News & Sentiment",  icon: Newspaper,    badge: "LIVE", group: "research" },
  { id: "corporate",    label: "Corp. Actions",     icon: CalendarDays, badge: null,   group: "research" },
  { id: "ipo",          label: "IPO Tracker",       icon: Star,         badge: "GMP",  group: "research" },
  { id: "economic-calendar",label:"Eco Calendar",   icon: Layers,       badge: null,   group: "research" },
  // ── TOOLS ────────────────────────────────────────────────────────
  { id: "charts",       label: "Visualizations",    icon: PieChart,     badge: null,   group: "tools" },
  { id: "advanced-chart",label:"Chart Studio",      icon: BarChart3,    badge: "NEW",  group: "tools" },
  { id: "backtest",     label: "Backtest Engine",   icon: FlaskConical, badge: "NEW",  group: "tools" },
  { id: "journal",      label: "Trade Journal",     icon: BookOpen,     badge: null,   group: "tools" },
  { id: "mf",           label: "Mutual Funds",      icon: Layers,       badge: null,   group: "tools" },
  { id: "etf",          label: "ETF Analytics",     icon: BarChart4,    badge: null,   group: "tools" },
  { id: "tax",          label: "Tax Optimizer",     icon: Receipt,      badge: null,   group: "tools" },
  { id: "goals",        label: "Goal Planner",      icon: Flag,         badge: null,   group: "tools" },
];

const GROUPS: { id: string; label: string }[] = [
  { id: "market",    label: "MARKET DATA" },
  { id: "signals",   label: "SIGNALS & AI" },
  { id: "fno",       label: "F&O" },
  { id: "portfolio", label: "PORTFOLIO" },
  { id: "research",  label: "RESEARCH" },
  { id: "tools",     label: "TOOLS" },
];

interface SidebarProps {
  active: string;
  onChange: (id: string) => void;
  onClose?: () => void;
}

export default function Sidebar({ active, onChange, onClose }: SidebarProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (gid: string) =>
    setCollapsed((prev) => ({ ...prev, [gid]: !prev[gid] }));

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(q));
  }, [query]);

  const badgeClass = (badge: string | null) => {
    if (!badge) return "";
    if (badge === "HOT") return "bg-signal-bear/20 text-signal-bear";
    if (badge === "AI" || badge === "NEW") return "bg-signal-accumulate/20 text-signal-accumulate";
    if (badge === "GMP") return "bg-gold-500/20 text-gold-500";
    if (badge === "OI" || badge === "SEBI") return "bg-signal-accumulate/20 text-signal-accumulate";
    if (badge === "LIVE") return "bg-signal-bull/20 text-signal-bull";
    return "bg-maroon-800/30 text-maroon-400";
  };

  const NavButton = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const Icon = item.icon;
    const isActive = active === item.id;
    return (
      <button
        onClick={() => onChange(item.id)}
        className={cn(
          "w-full flex items-center gap-3 lg:gap-2.5 px-3 py-3 lg:py-1.5 rounded-lg text-left transition-all text-[13px] lg:text-[11px] font-medium group",
          isActive
            ? "bg-maroon-800/25 border border-maroon-800/50 text-ivory-100 shadow-glow-maroon"
            : "text-ivory-500 hover:text-ivory-200 hover:bg-bg-hover border border-transparent"
        )}
      >
        <Icon className={cn("w-4 h-4 lg:w-3.5 lg:h-3.5 flex-shrink-0 transition-colors", isActive ? "text-maroon-400" : "text-ivory-600 group-hover:text-ivory-400")} />
        <span className="flex-1 tracking-wide truncate">{item.label}</span>
        {item.badge && (
          <span className={cn("label-tag text-[8px] px-1 py-0.5 rounded flex-shrink-0", badgeClass(item.badge))}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="flex flex-col w-[280px] lg:w-52 bg-bg-secondary border-r border-bg-border flex-shrink-0 h-full">
      {/* Mobile header with close button */}
      {onClose && (
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-bg-border">
          <span className="text-sm font-semibold text-ivory-200 font-display">Navigation</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-bg-hover text-ivory-400 hover:text-ivory-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ivory-600" />
          <input
            type="text"
            placeholder="Search sections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-bg-primary border border-bg-border rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-ivory-300 placeholder-ivory-700 focus:outline-none focus:border-maroon-700 transition-colors"
          />
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5">
        {filtered ? (
          /* Search results */
          <div>
            {filtered.length === 0 ? (
              <div className="text-[10px] text-ivory-700 px-3 py-4 text-center">No sections found</div>
            ) : (
              filtered.map((item) => <NavButton key={item.id} item={item} />)
            )}
          </div>
        ) : (
          /* Grouped nav */
          GROUPS.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group.id);
            const isCollapsed = collapsed[group.id] ?? false;
            const hasActive = items.some((i) => i.id === active);
            return (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-full flex items-center gap-1.5 px-3 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest transition-colors",
                    hasActive ? "text-maroon-400" : "text-ivory-700 hover:text-ivory-500"
                  )}
                >
                  {isCollapsed
                    ? <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    : <ChevronDown className="w-3 h-3 flex-shrink-0" />}
                  <span>{group.label}</span>
                  <span className="ml-auto text-[8px] text-ivory-800 font-normal">{items.length}</span>
                </button>
                {!isCollapsed && items.map((item) => <NavButton key={item.id} item={item} />)}
              </div>
            );
          })
        )}
      </div>

      {/* Status */}
      <div className="px-3 py-3 border-t border-bg-border space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-signal-bull live-dot" />
          <span className="text-[10px] text-ivory-500">Data Stream Active</span>
        </div>
        <div className="text-[10px] text-ivory-700 font-mono">NSE · BSE · FII/DII · Options</div>
        <div className="text-[10px] text-maroon-700 font-mono font-semibold">SmartFlow AI v2.0.0 · 52 Modules</div>
      </div>
    </aside>
  );
}
