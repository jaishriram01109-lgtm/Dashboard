"use client";
import { useState } from "react";
import { Rocket, TrendingUp, Calendar, Star, AlertCircle } from "lucide-react";
import { cn, fmt, fmtCr, scoreColor, scoreBg } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface IPO {
  id: string;
  company: string;
  sector: string;
  issueSize: number;
  priceRange: [number, number];
  gmp: number;
  gmpPct: number;
  openDate: string;
  closeDate: string;
  listingDate: string;
  subscriptionDay1?: number;
  subscriptionDay2?: number;
  subscriptionDay3?: number;
  totalSubscription?: number;
  retailSub?: number;
  qibSub?: number;
  niiSub?: number;
  issueType: "Book Built" | "Fixed Price" | "SME";
  lotSize: number;
  status: "upcoming" | "open" | "closed" | "listed";
  listingGain?: number;
  aiRating: number;
  aiComment: string;
  promoterHolding: number;
  pe: number;
  roe: number;
  revenue: number;
  profit: number;
  revenueGrowth: number;
  profitGrowth: number;
  debtToEquity: number;
  strengths: string[];
  risks: string[];
}

const IPOS: IPO[] = [
  {
    id: "i1", company: "SpaceTech India Ltd", sector: "Defence / Space", issueSize: 2400, priceRange: [840, 880],
    gmp: 180, gmpPct: 20.45, openDate: "19-May-26", closeDate: "21-May-26", listingDate: "24-May-26",
    issueType: "Book Built", lotSize: 17, status: "upcoming",
    aiRating: 88, aiComment: "Rare space & satellite play. ISRO commercialisation beneficiary. Excellent order book ₹4,200 Cr. Apply for listing gains + hold.",
    promoterHolding: 68.4, pe: 42.8, roe: 18.4, revenue: 1240, profit: 186, revenueGrowth: 42.4, profitGrowth: 58.4, debtToEquity: 0.14,
    strengths: ["ISRO partner", "₹4,200Cr order book", "Defence PLI eligible", "Zero listed peers"],
    risks: ["High valuation", "Government policy risk", "Limited track record"],
  },
  {
    id: "i2", company: "QuickCommerce Express", sector: "Logistics / E-commerce", issueSize: 3800, priceRange: [420, 445],
    gmp: 85, gmpPct: 19.10, openDate: "20-May-26", closeDate: "22-May-26", listingDate: "27-May-26",
    issueType: "Book Built", lotSize: 33, status: "upcoming",
    aiRating: 72, aiComment: "10-min delivery leader. Profitable unlike peers. High growth but competitive moat concerns. Apply for short-term listing gain.",
    promoterHolding: 52.8, pe: 68.4, roe: 12.4, revenue: 2840, profit: 142, revenueGrowth: 84.4, profitGrowth: 124.8, debtToEquity: 0.32,
    strengths: ["Profitable at EBITDA", "84% revenue growth", "800+ cities"],
    risks: ["Intense competition", "High PE valuation", "Margin pressure"],
  },
  {
    id: "i3", company: "Bharat Semiconductor Ltd", sector: "Semiconductor / Electronics", issueSize: 1800, priceRange: [520, 550],
    gmp: 220, gmpPct: 40.00, openDate: "15-May-26", closeDate: "17-May-26", listingDate: "20-May-26",
    subscriptionDay1: 4.2, subscriptionDay2: 18.6, subscriptionDay3: 142.8,
    totalSubscription: 142.8, retailSub: 68.4, qibSub: 284.2, niiSub: 124.8,
    issueType: "Book Built", lotSize: 27, status: "closed",
    aiRating: 94, aiComment: "India's first pure-play semiconductor ATMP company. Strategic national asset. Massive oversubscription — allotment lucky. Strong listing gain expected.",
    promoterHolding: 74.2, pe: 84.8, roe: 22.4, revenue: 840, profit: 126, revenueGrowth: 124.8, profitGrowth: 168.4, debtToEquity: 0.08,
    strengths: ["Only domestic semiconductor player", "PLI scheme ₹760Cr", "Global chip shortage beneficiary", "142x oversubscribed"],
    risks: ["Very high valuation", "Capital intensive", "Execution risk"],
  },
  {
    id: "i4", company: "GreenH2 Energy Corp", sector: "Renewable / Green Hydrogen", issueSize: 5200, priceRange: [280, 295],
    gmp: 42, gmpPct: 14.24, openDate: "25-May-26", closeDate: "27-May-26", listingDate: "30-May-26",
    issueType: "Book Built", lotSize: 50, status: "upcoming",
    aiRating: 76, aiComment: "Green hydrogen sunrise sector. Strong government backing. Revenue yet to scale. Long-term compounding bet, not short-term listing play.",
    promoterHolding: 62.4, pe: 180.0, roe: 4.2, revenue: 480, profit: 24, revenueGrowth: 284.8, profitGrowth: 0, debtToEquity: 0.84,
    strengths: ["Sunrise sector", "₹2,100Cr govt contract", "Carbon credit eligible"],
    risks: ["Pre-revenue scale", "Very high PE", "Policy dependency", "High debt"],
  },
  {
    id: "i5", company: "Indus Pharma CDMO", sector: "Pharmaceuticals / CDMO", issueSize: 1600, priceRange: [380, 400],
    gmp: 68, gmpPct: 17.00, openDate: "12-May-26", closeDate: "14-May-26", listingDate: "19-May-26",
    totalSubscription: 84.2, retailSub: 42.8, qibSub: 168.4, niiSub: 78.4,
    issueType: "Book Built", lotSize: 37, status: "closed",
    listingGain: 19.2,
    aiRating: 84, aiComment: "CDMO segment fastest-growing in pharma. 85x subscribed. Listed at ₹476 vs issue ₹400 — 19.2% listing gain. Hold for 3-6 months target ₹560.",
    promoterHolding: 58.8, pe: 38.4, roe: 24.8, revenue: 680, profit: 102, revenueGrowth: 32.4, profitGrowth: 48.4, debtToEquity: 0.18,
    strengths: ["CDMO model", "US FDA approved", "48% profit growth"],
    risks: ["Client concentration", "Currency risk"],
  },
  {
    id: "i6", company: "UrbanNest Realty", sector: "Real Estate", issueSize: 2800, priceRange: [220, 235],
    gmp: -8, gmpPct: -3.40, openDate: "08-May-26", closeDate: "10-May-26", listingDate: "15-May-26",
    totalSubscription: 12.4, retailSub: 8.2, qibSub: 28.4, niiSub: 6.2,
    listingGain: -4.8,
    issueType: "Book Built", lotSize: 63, status: "listed",
    aiRating: 38, aiComment: "Disappointing listing. Weak subscription, negative GMP confirmed market concerns. Avoid fresh buying. Listing at ₹224 (-4.8%). Structural concerns on land bank.",
    promoterHolding: 38.4, pe: 42.8, roe: 6.2, revenue: 1240, profit: 62, revenueGrowth: 8.4, profitGrowth: 4.2, debtToEquity: 2.84,
    strengths: ["Tier-2 city presence"],
    risks: ["High debt", "Weak subscription", "Low promoter hold", "Execution risk"],
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  upcoming: { label: "UPCOMING", color: "bg-signal-accumulate/15 text-signal-accumulate" },
  open: { label: "OPEN NOW", color: "bg-signal-bull/20 text-signal-bull" },
  closed: { label: "ALLOTMENT", color: "bg-yellow-500/15 text-yellow-400" },
  listed: { label: "LISTED", color: "bg-ivory-800/20 text-ivory-400" },
};

function IPOCard({ ipo }: { ipo: IPO }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[ipo.status];
  const isPositiveGMP = ipo.gmp >= 0;
  const estimatedListingPrice = ipo.priceRange[1] + ipo.gmp;

  return (
    <div className={cn("card-glass rounded-xl overflow-hidden cursor-pointer transition-all",
      expanded ? "glow-border-maroon" : "")}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("label-tag text-[10px]", statusCfg.color)}>{statusCfg.label}</span>
              <span className="label-tag bg-maroon-800/15 text-maroon-400 text-[10px]">{ipo.sector}</span>
              <span className="label-tag bg-ivory-800/15 text-ivory-500 text-[10px]">{ipo.issueType}</span>
            </div>
            <h3 className="font-display font-bold text-sm text-ivory-100 mt-1">{ipo.company}</h3>
            <div className="flex gap-3 mt-1 text-[11px] text-ivory-500 font-mono flex-wrap">
              <span>Price: <strong className="text-ivory-200">₹{ipo.priceRange[0]}–{ipo.priceRange[1]}</strong></span>
              <span>Size: <strong className="text-ivory-200">₹{(ipo.issueSize / 100).toFixed(0)} Cr</strong></span>
              <span>Lot: <strong className="text-ivory-200">{ipo.lotSize} shares</strong></span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs text-ivory-600">GMP</div>
            <div className={cn("text-lg font-mono font-bold", isPositiveGMP ? "text-signal-bull" : "text-signal-bear")}>
              {isPositiveGMP ? "+" : ""}₹{ipo.gmp}
            </div>
            <div className={cn("text-[11px] font-mono", isPositiveGMP ? "text-signal-bull" : "text-signal-bear")}>
              {isPositiveGMP ? "+" : ""}{ipo.gmpPct.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Subscription if available */}
        {ipo.totalSubscription && (
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px]">
            {[
              { label: "Total", value: ipo.totalSubscription, color: ipo.totalSubscription > 50 ? "text-signal-bull" : ipo.totalSubscription > 10 ? "text-yellow-400" : "text-signal-bear" },
              { label: "Retail", value: ipo.retailSub!, color: "text-ivory-300" },
              { label: "QIB", value: ipo.qibSub!, color: "text-signal-bull" },
              { label: "NII/HNI", value: ipo.niiSub!, color: "text-signal-accumulate" },
            ].map(s => (
              <div key={s.label} className="bg-bg-secondary rounded-lg p-1.5">
                <div className={cn("text-sm font-mono font-bold", s.color)}>{s.value.toFixed(1)}x</div>
                <div className="text-ivory-600">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Listing gain */}
        {ipo.listingGain !== undefined && (
          <div className={cn("mt-2 rounded-lg p-2 text-center text-xs",
            ipo.listingGain >= 0 ? "bg-signal-bull/10 border border-signal-bull/20" : "bg-signal-bear/10 border border-signal-bear/20"
          )}>
            <span className="text-ivory-500">Listing Gain: </span>
            <span className={cn("font-mono font-bold", ipo.listingGain >= 0 ? "text-signal-bull" : "text-signal-bear")}>
              {ipo.listingGain >= 0 ? "+" : ""}{ipo.listingGain}%
            </span>
          </div>
        )}

        {/* AI Rating + dates */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ivory-600">AI Rating:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-bg-border rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", scoreBg(ipo.aiRating))} style={{ width: `${ipo.aiRating}%` }} />
              </div>
              <span className={cn("text-xs font-mono font-bold", scoreColor(ipo.aiRating))}>{ipo.aiRating}/100</span>
            </div>
          </div>
          <div className="text-[10px] text-ivory-500 font-mono">
            Open: {ipo.openDate} → List: {ipo.listingDate}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-bg-border p-4 bg-bg-secondary/30 space-y-4 animate-fade-in">
          {/* AI Comment */}
          <div className="bg-maroon-900/20 border border-maroon-800/30 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Star className="w-3.5 h-3.5 text-maroon-400" />
              <span className="text-[10px] font-semibold text-maroon-400 uppercase">AI Analysis</span>
            </div>
            <p className="text-xs text-ivory-300 leading-relaxed">{ipo.aiComment}</p>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "PE Ratio", value: `${ipo.pe}x` },
              { label: "ROE", value: `${ipo.roe}%` },
              { label: "Revenue Growth", value: `+${ipo.revenueGrowth}%` },
              { label: "Profit Growth", value: `+${ipo.profitGrowth}%` },
              { label: "Revenue (Cr)", value: `₹${ipo.revenue}` },
              { label: "Net Profit (Cr)", value: `₹${ipo.profit}` },
              { label: "Promoter Hold", value: `${ipo.promoterHolding}%` },
              { label: "Debt/Equity", value: `${ipo.debtToEquity}x` },
            ].map(f => (
              <div key={f.label} className="text-center bg-bg-card rounded-lg p-2">
                <div className="text-xs font-mono font-bold text-ivory-200">{f.value}</div>
                <div className="text-[10px] text-ivory-600">{f.label}</div>
              </div>
            ))}
          </div>

          {/* Strengths + Risks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-signal-bull uppercase tracking-wider mb-2 font-semibold">✓ Strengths</div>
              <ul className="space-y-1">
                {ipo.strengths.map(s => (
                  <li key={s} className="text-xs text-ivory-400 flex items-start gap-1.5">
                    <span className="text-signal-bull mt-0.5">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] text-signal-bear uppercase tracking-wider mb-2 font-semibold">⚠ Risks</div>
              <ul className="space-y-1">
                {ipo.risks.map(r => (
                  <li key={r} className="text-xs text-ivory-400 flex items-start gap-1.5">
                    <span className="text-signal-bear mt-0.5">•</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Estimated listing */}
          {ipo.gmp !== 0 && ipo.status !== "listed" && (
            <div className={cn("rounded-lg p-3 text-sm text-center",
              isPositiveGMP ? "bg-signal-bull/10 border border-signal-bull/20" : "bg-signal-bear/10 border border-signal-bear/20"
            )}>
              <span className="text-ivory-400">Est. Listing Price (via GMP): </span>
              <span className={cn("font-mono font-bold text-base", isPositiveGMP ? "text-signal-bull" : "text-signal-bear")}>
                ₹{fmt(estimatedListingPrice)}
              </span>
              <span className={cn("ml-2 text-xs", isPositiveGMP ? "text-signal-bull" : "text-signal-bear")}>
                ({isPositiveGMP ? "+" : ""}{ipo.gmpPct.toFixed(1)}% gain)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Subscription chart
function SubscriptionChart() {
  const data = IPOS.filter(i => i.totalSubscription).map(i => ({
    name: i.company.split(" ")[0],
    total: i.totalSubscription!,
    retail: i.retailSub!,
    qib: i.qibSub!,
  }));
  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">Subscription Comparison (×)</div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <XAxis dataKey="name" tick={{ fill: "#A09278", fontSize: 10 }} />
            <YAxis tick={{ fill: "#A09278", fontSize: 9 }} tickFormatter={v => `${v}x`} />
            <Tooltip contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
              formatter={(v: number) => [`${v.toFixed(1)}x`, ""]} />
            <Bar dataKey="qib" name="QIB" fill="#DC143C" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
            <Bar dataKey="retail" name="Retail" fill="#00E676" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function IPOTracker() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "open" | "closed" | "listed">("all");
  const [sortBy, setSortBy] = useState<"gmp" | "aiRating" | "issueSize">("aiRating");

  const filtered = IPOS
    .filter(i => filter === "all" || i.status === filter)
    .sort((a, b) => {
      if (sortBy === "gmp") return b.gmpPct - a.gmpPct;
      if (sortBy === "aiRating") return b.aiRating - a.aiRating;
      if (sortBy === "issueSize") return b.issueSize - a.issueSize;
      return 0;
    });

  const openIPOs = IPOS.filter(i => i.status === "open" || i.status === "upcoming").length;
  const avgGMP = (IPOS.filter(i => i.gmp > 0).reduce((s, i) => s + i.gmpPct, 0) / IPOS.filter(i => i.gmp > 0).length).toFixed(1);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-maroon-600" />
            IPO Tracker & GMP Monitor
          </h2>
          <p className="text-xs text-ivory-500">Grey Market Premium • Subscription data • AI ratings • Fundamental analysis</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-ivory-500">Active IPOs: <span className="text-signal-bull font-bold">{openIPOs}</span></span>
          <span className="text-ivory-500">Avg GMP: <span className="text-gold-500 font-bold">+{avgGMP}%</span></span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Upcoming", value: IPOS.filter(i => i.status === "upcoming").length, color: "text-signal-accumulate" },
          { label: "Open / Live", value: IPOS.filter(i => i.status === "open").length, color: "text-signal-bull" },
          { label: "Allotment Pending", value: IPOS.filter(i => i.status === "closed").length, color: "text-yellow-400" },
          { label: "Recently Listed", value: IPOS.filter(i => i.status === "listed").length, color: "text-ivory-400" },
        ].map(s => (
          <div key={s.label} className="card-glass rounded-xl p-3 text-center">
            <div className={cn("text-3xl font-mono font-bold", s.color)}>{s.value}</div>
            <div className="text-xs text-ivory-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <SubscriptionChart />

      {/* Filter + sort */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {(["all", "upcoming", "open", "closed", "listed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors",
                filter === f ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
              )}>{f}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs bg-bg-card border border-bg-border rounded px-2 py-1 text-ivory-300 outline-none">
          <option value="aiRating">Sort: AI Rating</option>
          <option value="gmp">Sort: GMP %</option>
          <option value="issueSize">Sort: Issue Size</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(ipo => <IPOCard key={ipo.id} ipo={ipo} />)}
      </div>

      <div className="card-glass rounded-xl p-3 border-l-2 border-maroon-800">
        <p className="text-[11px] text-ivory-500">
          <strong className="text-maroon-400">GMP Disclaimer:</strong> Grey Market Premium is an unofficial price indicator from the unofficial market and does not guarantee listing price. AI ratings are based on fundamental analysis and market conditions. Not financial advice.
        </p>
      </div>
    </div>
  );
}
