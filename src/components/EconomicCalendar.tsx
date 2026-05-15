"use client";
import { useState } from "react";
import { Calendar, Clock, AlertTriangle, TrendingUp, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type EventImpact = "high" | "medium" | "low";

interface EconEvent {
  id: string;
  date: string;
  time: string;
  country: "IN" | "US" | "EU" | "CN";
  event: string;
  category: string;
  impact: EventImpact;
  previous: string;
  forecast: string;
  actual?: string;
  affectedSectors: string[];
  aiComment: string;
  marketDirection?: "bullish" | "bearish" | "neutral";
}

const FLAGS: Record<string, string> = { IN: "🇮🇳", US: "🇺🇸", EU: "🇪🇺", CN: "🇨🇳" };

const EVENTS: EconEvent[] = [
  {
    id: "e1", date: "15-May-26", time: "09:00", country: "IN", event: "CPI Inflation (Apr)",
    category: "Inflation", impact: "high",
    previous: "4.60%", forecast: "4.15%", actual: "4.12%",
    affectedSectors: ["FMCG", "Consumer", "Banking", "Realty"],
    aiComment: "CPI below 4.5% threshold supports RBI dovish stance. Positive for rate-sensitive sectors. Realty and NBFC set to rally.",
    marketDirection: "bullish",
  },
  {
    id: "e2", date: "15-May-26", time: "14:30", country: "US", event: "Core PPI (MoM, Apr)",
    category: "Inflation", impact: "high",
    previous: "0.2%", forecast: "0.1%", actual: "0.1%",
    affectedSectors: ["IT", "Pharma", "Metals"],
    aiComment: "US inflation cooling accelerates Fed pivot expectations. DXY weakness benefits Indian IT and pharma exports.",
    marketDirection: "bullish",
  },
  {
    id: "e3", date: "15-May-26", time: "17:30", country: "US", event: "Initial Jobless Claims",
    category: "Employment", impact: "medium",
    previous: "212K", forecast: "218K", actual: "221K",
    affectedSectors: ["IT", "Consumer"],
    aiComment: "Rising jobless claims signals softening US labor market. Neutral for Indian markets. Watch for trend over 4 weeks.",
    marketDirection: "neutral",
  },
  {
    id: "e4", date: "16-May-26", time: "10:00", country: "IN", event: "WPI Inflation (Apr)",
    category: "Inflation", impact: "medium",
    previous: "2.05%", forecast: "1.85%",
    affectedSectors: ["FMCG", "Chemicals", "Metals"],
    aiComment: "WPI below 2% confirms supply-side inflation under control. Supports RBI rate cut path.",
  },
  {
    id: "e5", date: "16-May-26", time: "14:30", country: "US", event: "US Retail Sales (MoM, Apr)",
    category: "Consumer", impact: "high",
    previous: "0.7%", forecast: "0.4%",
    affectedSectors: ["IT", "Consumer"],
    aiComment: "Key indicator for US consumer health. Above-forecast reading benefits IT sector outlook (enterprise spending follows consumer).",
  },
  {
    id: "e6", date: "17-May-26", time: "All Day", country: "IN", event: "RBI MPC Minutes Release",
    category: "Monetary Policy", impact: "high",
    previous: "—", forecast: "—",
    affectedSectors: ["Banking", "NBFC", "Realty", "Auto"],
    aiComment: "MPC minutes will clarify dissent votes and future rate path. Any 5-1 or 6-0 dovish vote → strong rally in rate-sensitives.",
  },
  {
    id: "e7", date: "20-May-26", time: "14:30", country: "US", event: "FOMC Meeting Minutes",
    category: "Monetary Policy", impact: "high",
    previous: "—", forecast: "—",
    affectedSectors: ["IT", "Banking", "Metals"],
    aiComment: "Fed minutes set tone for June meeting. Dovish tilt → FII inflows into EM. Hawkish → DXY strength, INR pressure.",
  },
  {
    id: "e8", date: "22-May-26", time: "09:00", country: "IN", event: "India PMI Manufacturing (Flash, May)",
    category: "Activity", impact: "high",
    previous: "59.1", forecast: "59.5",
    affectedSectors: ["Capital Goods", "Defence", "Auto", "Infra"],
    aiComment: "India PMI at multi-year highs signals capex supercycle. Above 58 = strong buy signal for capital goods, defence, infrastructure.",
  },
  {
    id: "e9", date: "22-May-26", time: "14:45", country: "US", event: "US S&P Global PMI (Flash, May)",
    category: "Activity", impact: "medium",
    previous: "52.3", forecast: "52.8",
    affectedSectors: ["IT", "Metals"],
    aiComment: "US PMI expansion supports IT sector order flow outlook. Metals benefit if manufacturing accelerates above 53.",
  },
  {
    id: "e10", date: "28-May-26", time: "18:00", country: "US", event: "PCE Price Index (Apr)",
    category: "Inflation", impact: "high",
    previous: "2.7%", forecast: "2.5%",
    affectedSectors: ["IT", "Banking", "Metals", "Realty"],
    aiComment: "PCE is Fed's preferred inflation measure. Below 2.5% = June rate cut probability jumps to 80%+. Massive bull catalyst.",
  },
  {
    id: "e11", date: "06-Jun-26", time: "10:00", country: "IN", event: "RBI MPC Rate Decision",
    category: "Monetary Policy", impact: "high",
    previous: "6.25%", forecast: "6.00%",
    affectedSectors: ["Banking", "NBFC", "Realty", "Auto", "Consumer"],
    aiComment: "68% probability of 25bps cut to 6.00%. Banking/NBFC NIM normalization + Realty demand boost expected. Pre-event accumulation ongoing.",
  },
  {
    id: "e12", date: "10-Jun-26", time: "14:30", country: "US", event: "US CPI Inflation (May)",
    category: "Inflation", impact: "high",
    previous: "3.2%", forecast: "3.0%",
    affectedSectors: ["IT", "Pharma", "Banking"],
    aiComment: "US CPI below 3% would confirm disinflation trend. Fed rate cut path secured → DXY weakness → FII EM inflows.",
  },
];

const impactConfig: Record<EventImpact, { bg: string; text: string; dot: string; label: string }> = {
  high: { bg: "bg-signal-bear/10", text: "text-signal-bear", dot: "bg-signal-bear", label: "HIGH" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-500", label: "MED" },
  low: { bg: "bg-ivory-800/10", text: "text-ivory-500", dot: "bg-ivory-600", label: "LOW" },
};

function EventCard({ event }: { event: EconEvent }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = impactConfig[event.impact];
  const hasActual = event.actual !== undefined;
  const actualVsForecast = hasActual
    ? parseFloat(event.actual!.replace("%", "").replace("K", "")) - parseFloat(event.forecast.replace("%", "").replace("K", ""))
    : 0;

  return (
    <div
      className={cn("card-glass rounded-xl overflow-hidden cursor-pointer transition-all",
        expanded ? "glow-border-maroon" : "")}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Time + country */}
        <div className="flex-shrink-0 text-center w-16">
          <div className="text-lg">{FLAGS[event.country]}</div>
          <div className="text-[10px] font-mono text-ivory-500 mt-0.5">{event.time}</div>
          <div className="text-[9px] text-ivory-700">{event.country}</div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className={cn("label-tag text-[10px]", cfg.bg, cfg.text)}>
              <div className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1", cfg.dot)} />
              {cfg.label} IMPACT
            </span>
            <span className="label-tag bg-maroon-800/15 text-maroon-400 text-[10px]">{event.category}</span>
            {hasActual && (
              <span className={cn("label-tag text-[10px]",
                actualVsForecast >= 0 ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear"
              )}>RELEASED</span>
            )}
          </div>
          <div className="text-sm font-semibold text-ivory-100 mt-1">{event.event}</div>
          <div className="flex gap-4 mt-1.5 text-[11px]">
            <div><span className="text-ivory-600">Prev: </span><span className="font-mono text-ivory-300">{event.previous}</span></div>
            <div><span className="text-ivory-600">Fcst: </span><span className="font-mono text-ivory-200">{event.forecast}</span></div>
            {hasActual && (
              <div>
                <span className="text-ivory-600">Actual: </span>
                <span className={cn("font-mono font-bold",
                  event.marketDirection === "bullish" ? "text-signal-bull" : event.marketDirection === "bearish" ? "text-signal-bear" : "text-yellow-400"
                )}>{event.actual}</span>
              </div>
            )}
          </div>
        </div>

        {/* Direction + expand */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {event.marketDirection && (
            <span className={cn("label-tag text-[10px]",
              event.marketDirection === "bullish" ? "bg-signal-bull/15 text-signal-bull" :
              event.marketDirection === "bearish" ? "bg-signal-bear/15 text-signal-bear" :
              "bg-yellow-500/15 text-yellow-400"
            )}>
              {event.marketDirection === "bullish" ? "↑ BULL" : event.marketDirection === "bearish" ? "↓ BEAR" : "→ NEUTRAL"}
            </span>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-ivory-600" /> : <ChevronDown className="w-3.5 h-3.5 text-ivory-600" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-bg-border px-4 py-3 bg-bg-secondary/30 animate-fade-in space-y-2">
          <p className="text-xs text-ivory-300 leading-relaxed">{event.aiComment}</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="text-[10px] text-ivory-600">Sectors:</span>
            {event.affectedSectors.map(s => (
              <span key={s} className="label-tag bg-maroon-800/20 text-maroon-400">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EconomicCalendar() {
  const [filter, setFilter] = useState<"all" | EventImpact>("all");
  const [countryFilter, setCountryFilter] = useState<"all" | "IN" | "US" | "EU" | "CN">("all");

  const grouped = EVENTS.reduce<Record<string, EconEvent[]>>((acc, ev) => {
    const key = ev.date;
    if (!acc[key]) acc[key] = [];
    if ((filter === "all" || ev.impact === filter) &&
        (countryFilter === "all" || ev.country === countryFilter)) {
      acc[key].push(ev);
    }
    return acc;
  }, {});

  const highImpact = EVENTS.filter(e => e.impact === "high").length;
  const upcoming = EVENTS.filter(e => !e.actual).length;
  const released = EVENTS.filter(e => e.actual).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-maroon-600" />
            Economic Calendar
          </h2>
          <p className="text-xs text-ivory-500">Global macro events with AI-powered market impact analysis</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-ivory-500">High Impact:</span>
          <span className="text-signal-bear font-bold">{highImpact}</span>
          <span className="text-ivory-700">|</span>
          <span className="text-ivory-500">Upcoming:</span>
          <span className="text-gold-500 font-bold">{upcoming}</span>
          <span className="text-ivory-700">|</span>
          <span className="text-ivory-500">Released:</span>
          <span className="text-signal-bull font-bold">{released}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {(["all", "high", "medium", "low"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors",
                filter === f ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
              )}>{f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <div className="h-4 w-px bg-bg-border" />
        <div className="flex gap-1">
          {(["all", "IN", "US", "EU", "CN"] as const).map(c => (
            <button key={c} onClick={() => setCountryFilter(c)}
              className={cn("px-2.5 py-1 rounded text-[11px] font-semibold transition-colors",
                countryFilter === c ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
              )}>
              {c === "all" ? "All" : `${FLAGS[c]} ${c}`}
            </button>
          ))}
        </div>
      </div>

      {/* Events grouped by date */}
      {Object.entries(grouped).map(([date, events]) => events.length > 0 && (
        <div key={date}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-bg-border" />
            <span className="text-xs font-mono font-semibold text-ivory-400 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />{date}
              {date === "15-May-26" && <span className="label-tag bg-signal-bull/15 text-signal-bull ml-1">TODAY</span>}
            </span>
            <div className="h-px flex-1 bg-bg-border" />
          </div>
          <div className="space-y-2">
            {events.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        </div>
      ))}

      {/* Impact legend */}
      <div className="card-glass rounded-xl p-3 flex items-center gap-6 flex-wrap">
        <span className="text-[10px] text-ivory-600 font-semibold uppercase">Impact Guide:</span>
        {Object.entries(impactConfig).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-[10px]">
            <div className={cn("w-2 h-2 rounded-full", v.dot)} />
            <span className={v.text}>{v.label}</span>
            <span className="text-ivory-600">— {k === "high" ? "Market moving, high volatility" : k === "medium" ? "Watch, may cause short-term move" : "Low volatility expected"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
