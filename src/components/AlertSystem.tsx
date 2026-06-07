"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, TrendingUp, TrendingDown, Zap, DollarSign, Activity, X, Settings } from "lucide-react";
import { alertData } from "@/lib/mockData";
import type { Alert, AlertSeverity } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { useAngelQuotes } from "@/hooks/useAngelData";

const alertTypeIcons: Record<string, React.ReactNode> = {
  smart_money_entry: <DollarSign className="w-4 h-4" />,
  sector_rotation: <TrendingUp className="w-4 h-4" />,
  volume_explosion: <Activity className="w-4 h-4" />,
  fii_buying: <TrendingUp className="w-4 h-4" />,
  breakdown: <TrendingDown className="w-4 h-4" />,
  macro: <Zap className="w-4 h-4" />,
  delivery_spike: <DollarSign className="w-4 h-4" />,
  default: <Bell className="w-4 h-4" />,
};

const severityConfig: Record<AlertSeverity, { bg: string; border: string; badge: string; dot: string }> = {
  critical: {
    bg: "bg-signal-bear/5",
    border: "border-signal-bear/30",
    badge: "bg-signal-bear/20 text-signal-bear",
    dot: "bg-signal-bear",
  },
  high: {
    bg: "bg-maroon-900/10",
    border: "border-maroon-700/30",
    badge: "bg-maroon-700/20 text-maroon-300",
    dot: "bg-maroon-500",
  },
  medium: {
    bg: "bg-yellow-900/5",
    border: "border-yellow-700/20",
    badge: "bg-yellow-700/20 text-yellow-400",
    dot: "bg-yellow-500",
  },
  low: {
    bg: "bg-bg-secondary",
    border: "border-bg-border",
    badge: "bg-ivory-800/20 text-ivory-500",
    dot: "bg-ivory-600",
  },
};

function AlertCard({ alert, onRead }: { alert: Alert; onRead: (id: string) => void }) {
  const cfg = severityConfig[alert.severity];
  const icon = alertTypeIcons[alert.type] ?? alertTypeIcons.default;

  return (
    <div className={cn(
      "rounded-xl border p-3 transition-all",
      cfg.bg, cfg.border,
      !alert.read ? "opacity-100" : "opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          alert.severity === "critical" ? "bg-signal-bear/20 text-signal-bear" :
          alert.severity === "high" ? "bg-maroon-700/20 text-maroon-400" :
          "bg-yellow-700/20 text-yellow-400"
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {!alert.read && (
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                )}
                <span className="text-xs font-semibold text-ivory-100">{alert.title}</span>
                <span className={cn("label-tag text-[10px]", cfg.badge)}>
                  {alert.severity.toUpperCase()}
                </span>
                {alert.actionable && (
                  <span className="label-tag bg-signal-accumulate/15 text-signal-accumulate text-[10px]">ACTIONABLE</span>
                )}
                {alert.symbol && (
                  <span className="label-tag bg-maroon-800/20 text-maroon-400">{alert.symbol}</span>
                )}
              </div>
              <p className="text-xs text-ivory-400 leading-relaxed mt-1">{alert.message}</p>
              <div className="text-[10px] text-ivory-600 mt-1 font-mono">{timeAgo(alert.timestamp)}</div>
            </div>
            {!alert.read && (
              <button
                onClick={() => onRead(alert.id)}
                className="text-ivory-600 hover:text-ivory-300 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Alert configuration panel
const alertChannels = [
  { id: "web", label: "Web Notifications", active: true, icon: "🌐" },
  { id: "telegram", label: "Telegram Bot", active: false, icon: "📱" },
  { id: "email", label: "Email Alerts", active: false, icon: "📧" },
  { id: "push", label: "Mobile Push", active: false, icon: "🔔" },
];

const alertTypes = [
  { id: "smart_money", label: "Smart Money Entry", active: true },
  { id: "sector_rotation", label: "Sector Rotation", active: true },
  { id: "volume_explosion", label: "Volume Explosion", active: true },
  { id: "breakout", label: "Breakout/Breakdown", active: true },
  { id: "fii", label: "FII Buying/Selling", active: true },
  { id: "bulk_deals", label: "Bulk Deals", active: false },
  { id: "insider", label: "Insider Activity", active: false },
  { id: "delivery", label: "Delivery Spike", active: true },
  { id: "oi_shift", label: "OI Shift", active: false },
  { id: "momentum", label: "Momentum Ignition", active: true },
];

function Toggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={cn(
        "w-9 h-5 rounded-full relative transition-colors",
        active ? "bg-maroon-700" : "bg-bg-border"
      )}
    >
      <div className={cn(
        "absolute top-0.5 w-4 h-4 rounded-full bg-ivory-100 transition-transform shadow",
        active ? "translate-x-4" : "translate-x-0.5"
      )} />
    </button>
  );
}

function buildLiveAlerts(quotes: ReturnType<typeof useAngelQuotes>["quotes"]): Alert[] {
  const alerts: Alert[] = [];
  let id = 9000;
  const now = Date.now();
  quotes.forEach(q => {
    const pct = q.changePct;
    if (Math.abs(pct) < 1.5) return;
    const up = pct > 0;
    alerts.push({
      id: String(id++),
      type: Math.abs(pct) >= 3 ? (up ? "smart_money_entry" : "breakdown") : (up ? "volume_explosion" : "breakdown"),
      title: `${q.name} ${up ? "surge" : "drop"} ${up ? "+" : ""}${pct.toFixed(1)}%`,
      message: `${q.name} trading at ₹${q.ltp.toLocaleString("en-IN", { maximumFractionDigits: 1 })} — ${up ? "strong buying" : "selling pressure"} with ${Math.abs(pct).toFixed(1)}% move. Vol: ${(q.volume / 1000).toFixed(0)}K.`,
      symbol: q.name,
      severity: (Math.abs(pct) >= 4 ? "critical" : Math.abs(pct) >= 2.5 ? "high" : "medium") as AlertSeverity,
      timestamp: new Date(now - Math.floor(Math.random() * 600_000)).toISOString(),
      read: false,
      actionable: Math.abs(pct) >= 2.5,
    });
  });
  return alerts.sort((a, b) => Math.abs(Number(b.id) - 9000) - Math.abs(Number(a.id) - 9000)).slice(0, 12);
}

export default function AlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>(alertData);
  const [channels, setChannels] = useState(alertChannels);
  const [types, setTypes] = useState(alertTypes);
  const [activeTab, setActiveTab] = useState<"alerts" | "settings">("alerts");
  const [filterSeverity, setFilterSeverity] = useState<"all" | AlertSeverity>("all");
  const { quotes, isLive } = useAngelQuotes();
  const seededRef = useRef(false);

  // When live quotes arrive, prepend real price-movement alerts (once per session)
  useEffect(() => {
    if (!isLive || seededRef.current || quotes.size === 0) return;
    seededRef.current = true;
    const liveAlerts = buildLiveAlerts(quotes);
    if (liveAlerts.length > 0) {
      setAlerts(prev => [...liveAlerts, ...prev]);
    }
  }, [isLive, quotes]);

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const filtered = alerts.filter(a =>
    filterSeverity === "all" || a.severity === filterSeverity
  );

  const unread = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-maroon-600" />
            Live Alert System
          </h2>
          <p className="text-xs text-ivory-500">
            Real-time institutional alerts • Smart money signals • Volume explosions
            {isLive && <span className="ml-2 text-signal-bull font-semibold">● Live — Angel One</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="label-tag bg-signal-bear/20 text-signal-bear">{unread} UNREAD</span>
          )}
          <div className="w-2 h-2 rounded-full bg-signal-bull live-dot" />
          <span className="text-xs text-signal-bull font-mono">STREAMING</span>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 border-b border-bg-border pb-0.5">
        {[
          { id: "alerts", label: "Live Alerts", count: unread },
          { id: "settings", label: "Alert Settings" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-b-2 -mb-0.5",
              activeTab === t.id
                ? "text-maroon-400 border-maroon-700"
                : "text-ivory-600 border-transparent hover:text-ivory-300"
            )}
          >
            {t.label}
            {t.count && t.count > 0 ? (
              <span className="w-4 h-4 bg-signal-bear rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                {t.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {activeTab === "alerts" && (
        <>
          {/* Stats + filters */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              {(["all", "critical", "high", "medium", "low"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors",
                    filterSeverity === s
                      ? "bg-maroon-800/40 text-maroon-300"
                      : "text-ivory-600 hover:text-ivory-300"
                  )}
                >{s}</button>
              ))}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-ivory-500 hover:text-ivory-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Alerts list */}
          <div className="space-y-2">
            {filtered.map(alert => (
              <AlertCard key={alert.id} alert={alert} onRead={markRead} />
            ))}
            {filtered.length === 0 && (
              <div className="card-glass rounded-xl h-24 flex items-center justify-center text-ivory-600 text-sm">
                No alerts match current filter
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "settings" && (
        <div className="space-y-4">
          {/* Channels */}
          <div className="card-glass rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-bg-border flex items-center gap-2">
              <Settings className="w-4 h-4 text-ivory-500" />
              <span className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">Alert Channels</span>
            </div>
            <div className="divide-y divide-bg-border/50">
              {channels.map((ch, i) => (
                <div key={ch.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-lg">{ch.icon}</span>
                  <span className="text-xs text-ivory-300 flex-1">{ch.label}</span>
                  <Toggle
                    active={ch.active}
                    onChange={v => setChannels(prev => prev.map((c, j) => j === i ? { ...c, active: v } : c))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Alert types */}
          <div className="card-glass rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-bg-border">
              <span className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">Alert Types</span>
            </div>
            <div className="divide-y divide-bg-border/50">
              {types.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-xs text-ivory-300 flex-1">{t.label}</span>
                  <Toggle
                    active={t.active}
                    onChange={v => setTypes(prev => prev.map((x, j) => j === i ? { ...x, active: v } : x))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Thresholds */}
          <div className="card-glass rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">Alert Thresholds</div>
            {[
              { label: "Volume Alert (×avg)", value: "2.0", unit: "×" },
              { label: "Price Move Alert", value: "3.0", unit: "%" },
              { label: "Delivery % Alert", value: "65", unit: "%" },
              { label: "Smart Money Score", value: "75", unit: "/100" },
            ].map(t => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="text-xs text-ivory-500">{t.label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={t.value}
                    className="w-16 bg-bg-card border border-bg-border rounded px-2 py-1 text-xs text-ivory-200 font-mono text-right outline-none focus:border-maroon-700"
                  />
                  <span className="text-xs text-ivory-600">{t.unit}</span>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 rounded-lg bg-maroon-800/40 border border-maroon-800/50 text-xs text-maroon-300 font-semibold hover:bg-maroon-800/60 transition-colors">
              Save Thresholds
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
