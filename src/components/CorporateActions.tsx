"use client";
import { useState } from "react";
import { CalendarDays, DollarSign, Users, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type ActionTab = "earnings" | "dividends" | "board" | "insider";

interface EarningsItem {
  symbol: string;
  name: string;
  sector: string;
  date: string;
  timing: "Pre-market" | "Post-market" | "During market";
  revEst: string;
  epsEst: string;
  revPrev: string;
  epsPrev: string;
  actual?: { rev: string; eps: string; surprise: number };
  aiOutlook: "beat" | "in-line" | "miss";
  aiComment: string;
  watchCount: number;
}

interface DividendItem {
  symbol: string;
  name: string;
  sector: string;
  dividendAmt: number;
  dividendType: "interim" | "final" | "special";
  exDate: string;
  recordDate: string;
  payDate: string;
  yield: number;
  frequency: string;
}

interface BoardMeeting {
  symbol: string;
  name: string;
  date: string;
  agenda: string[];
  significance: "high" | "medium" | "low";
  aiComment: string;
}

interface InsiderTrade {
  symbol: string;
  name: string;
  sector: string;
  trader: string;
  role: string;
  tradeType: "buy" | "sell";
  shares: number;
  value: number;
  price: number;
  date: string;
  postHolding: number;
}

const EARNINGS: EarningsItem[] = [
  {
    symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", date: "19-May-26",
    timing: "Post-market", revEst: "₹62,800 Cr", epsEst: "₹28.4", revPrev: "₹59,160 Cr", epsPrev: "₹26.4",
    aiOutlook: "in-line", watchCount: 2841,
    aiComment: "Q4 results expected to be in-line. Deal TCV likely ₹12,000-14,000 Cr. BFSI vertical under pressure from US bank consolidation. FY27 guidance crucial — consensus expects 6–8% cc growth.",
  },
  {
    symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", date: "19-May-26",
    timing: "During market", revEst: "₹36,400 Cr NII", epsEst: "₹20.8", revPrev: "₹29,080 Cr NII", epsPrev: "₹18.4",
    aiOutlook: "beat",
    actual: { rev: "₹37,240 Cr", eps: "₹21.4", surprise: 2.9 },
    watchCount: 4182,
    aiComment: "NII beat at ₹37,240 Cr (+2.3% vs est). GNPA stable at 1.24%. Credit growth at 14.2% YoY. NIMs holding at 3.44%. Strong result likely to trigger sector rally.",
  },
  {
    symbol: "INFY", name: "Infosys", sector: "IT", date: "22-May-26",
    timing: "Post-market", revEst: "₹38,200 Cr", epsEst: "₹17.2", revPrev: "₹37,923 Cr", epsPrev: "₹16.8",
    aiOutlook: "in-line", watchCount: 1920,
    aiComment: "Margins likely 20.5–21.5%. FY27 guidance of 4.5–6.5% growth (cc) expected. Large deal wins in Q4 set to underpin confidence. Watch management commentary on AI revenue.",
  },
  {
    symbol: "HAL", name: "Hindustan Aeronautics", sector: "Defence", date: "23-May-26",
    timing: "Post-market", revEst: "₹8,200 Cr", epsEst: "₹84.2", revPrev: "₹6,840 Cr", epsPrev: "₹68.4",
    aiOutlook: "beat", watchCount: 3240,
    aiComment: "Order book at record ₹98,000 Cr. Revenue likely to beat estimates due to accelerated LCA deliveries. New ₹42,000 Cr order will boost FY27-28 outlook significantly.",
  },
  {
    symbol: "DLF", name: "DLF Limited", sector: "Realty", date: "26-May-26",
    timing: "Post-market", revEst: "₹1,840 Cr", epsEst: "₹4.2", revPrev: "₹1,640 Cr", epsPrev: "₹3.8",
    aiOutlook: "beat", watchCount: 1480,
    aiComment: "Pre-sales bookings of ₹21,000 Cr in FY26 expected to drive PAT growth. Luxury housing segment performing exceptionally. Rental arm GIC JV delivering steady income.",
  },
  {
    symbol: "RVNL", name: "Rail Vikas Nigam", sector: "Railway", date: "28-May-26",
    timing: "Pre-market", revEst: "₹6,840 Cr", epsEst: "₹7.4", revPrev: "₹5,920 Cr", epsPrev: "₹6.2",
    aiOutlook: "beat", watchCount: 2180,
    aiComment: "Order book ₹95,000 Cr growing 22% YoY. Railway capex budget at all-time high. Execution pace improving. Strong beat likely due to project completion in Q4.",
  },
];

const DIVIDENDS: DividendItem[] = [
  { symbol: "ITC", name: "ITC Limited", sector: "FMCG", dividendAmt: 7.5, dividendType: "final", exDate: "20-May-26", recordDate: "21-May-26", payDate: "05-Jun-26", yield: 1.75, frequency: "Annual" },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", dividendAmt: 19.5, dividendType: "final", exDate: "22-May-26", recordDate: "23-May-26", payDate: "10-Jun-26", yield: 1.06, frequency: "Annual" },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", dividendAmt: 10.0, dividendType: "interim", exDate: "25-May-26", recordDate: "26-May-26", payDate: "12-Jun-26", yield: 0.26, frequency: "Quarterly" },
  { symbol: "COALINDIA", name: "Coal India", sector: "Mining", dividendAmt: 5.0, dividendType: "interim", exDate: "17-May-26", recordDate: "18-May-26", payDate: "02-Jun-26", yield: 3.84, frequency: "Semi-annual" },
  { symbol: "POWERGRID", name: "Power Grid Corp", sector: "Power", dividendAmt: 4.5, dividendType: "interim", exDate: "18-May-26", recordDate: "19-May-26", payDate: "04-Jun-26", yield: 3.21, frequency: "Quarterly" },
  { symbol: "HAL", name: "Hindustan Aeronautics", sector: "Defence", dividendAmt: 35.0, dividendType: "special", exDate: "30-May-26", recordDate: "31-May-26", payDate: "18-Jun-26", yield: 0.82, frequency: "Special" },
];

const BOARD_MEETINGS: BoardMeeting[] = [
  {
    symbol: "RELIANCE", name: "Reliance Industries", date: "20-May-26",
    agenda: ["Q4 FY26 Results", "Final Dividend Declaration", "JioMart IPO Update"],
    significance: "high",
    aiComment: "Key meeting — JioMart IPO timeline and Jio Financial Services stake sale expected to dominate investor focus. Any positive surprise could trigger 5–8% upside.",
  },
  {
    symbol: "TATAMOTORS", name: "Tata Motors", date: "21-May-26",
    agenda: ["Q4 Results", "JLR Outlook FY27", "EV Capex Plan"],
    significance: "high",
    aiComment: "JLR margin trajectory and India EV market share will be key. Management guidance on Range Rover delivery backlog critical for stock direction.",
  },
  {
    symbol: "SUNPHARMA", name: "Sun Pharmaceutical", date: "23-May-26",
    agenda: ["Q4 Results", "US FDA Update", "R&D Pipeline"],
    significance: "medium",
    aiComment: "Specialty business US performance key. Any positive FDA resolution for Halol plant could trigger re-rating. Global specialty revenue guidance for FY27 awaited.",
  },
  {
    symbol: "BAJAJFINSV", name: "Bajaj Finserv", date: "24-May-26",
    agenda: ["Q4 Results", "Insurance Float Update", "Bonus Issue Discussion"],
    significance: "medium",
    aiComment: "Insurance subsidiary performance and AUM growth in Bajaj Allianz key. Any bonus issue announcement could trigger short-term momentum.",
  },
  {
    symbol: "NTPC", name: "NTPC Limited", date: "28-May-26",
    agenda: ["Q4 Results", "Renewable Capacity Addition", "Green Hydrogen Update"],
    significance: "medium",
    aiComment: "Renewable energy pipeline crossing 10 GW will be a key narrative. Thermal capacity utilization and PLF levels will determine quarterly earnings.",
  },
];

const INSIDER_TRADES: InsiderTrade[] = [
  { symbol: "HAL", name: "Hindustan Aeronautics", sector: "Defence", trader: "Govt of India (MoD)", role: "Promoter", tradeType: "buy", shares: 200000, value: 856, price: 4280, date: "12-May-26", postHolding: 71.64 },
  { symbol: "RVNL", name: "Rail Vikas Nigam", sector: "Railway", trader: "Ministry of Railways", role: "Promoter", tradeType: "buy", shares: 500000, value: 207.5, price: 415, date: "10-May-26", postHolding: 72.84 },
  { symbol: "DLF", name: "DLF Limited", sector: "Realty", trader: "K.P. Singh (Promoter)", role: "Promoter", tradeType: "buy", shares: 100000, value: 91.8, price: 918, date: "08-May-26", postHolding: 74.12 },
  { symbol: "INFY", name: "Infosys", sector: "IT", trader: "Nandan Nilekani", role: "Non-exec Chairman", tradeType: "sell", shares: 150000, value: 237, price: 1580, date: "14-May-26", postHolding: 2.14 },
  { symbol: "TATASTEEL", name: "Tata Steel", sector: "Metals", trader: "Tata Sons (Promoter)", role: "Promoter", tradeType: "sell", shares: 800000, value: 129.6, price: 162, date: "13-May-26", postHolding: 33.14 },
  { symbol: "BEL", name: "Bharat Electronics", sector: "Defence", trader: "Govt of India (MoD)", role: "Promoter", tradeType: "buy", shares: 300000, value: 95.4, price: 318, date: "09-May-26", postHolding: 51.14 },
];

const OUTLOOK_CONFIG = {
  beat: { label: "BEAT EST", bg: "bg-signal-bull/15", text: "text-signal-bull" },
  "in-line": { label: "IN-LINE", bg: "bg-yellow-500/15", text: "text-yellow-400" },
  miss: { label: "MISS EST", bg: "bg-signal-bear/15", text: "text-signal-bear" },
};

function EarningsCard({ item }: { item: EarningsItem }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = OUTLOOK_CONFIG[item.aiOutlook];
  const hasActual = !!item.actual;
  return (
    <div className={cn("card-glass rounded-xl overflow-hidden cursor-pointer transition-all", expanded && "glow-border-maroon")}
      onClick={() => setExpanded(e => !e)}>
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono font-bold text-ivory-100">{item.symbol}</span>
            <span className="label-tag bg-maroon-800/20 text-maroon-400 text-[9px]">{item.sector}</span>
            <span className={cn("label-tag text-[9px]", cfg.bg, cfg.text)}>{cfg.label}</span>
            {hasActual && <span className="label-tag bg-signal-bull/15 text-signal-bull text-[9px]">REPORTED</span>}
          </div>
          <div className="text-[11px] text-ivory-400 mb-2">{item.name}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
            <div>
              <span className="text-ivory-600">Rev Est: </span>
              <span className="font-mono text-ivory-200">{item.revEst}</span>
            </div>
            <div>
              <span className="text-ivory-600">EPS Est: </span>
              <span className="font-mono text-ivory-200">{item.epsEst}</span>
            </div>
            {hasActual ? (
              <>
                <div>
                  <span className="text-ivory-600">Actual Rev: </span>
                  <span className="font-mono text-signal-bull font-bold">{item.actual!.rev}</span>
                </div>
                <div>
                  <span className="text-ivory-600">Surprise: </span>
                  <span className="font-mono text-signal-bull font-bold">+{item.actual!.surprise}%</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-ivory-600">Rev Prev: </span>
                  <span className="font-mono text-ivory-400">{item.revPrev}</span>
                </div>
                <div>
                  <span className="text-ivory-600">EPS Prev: </span>
                  <span className="font-mono text-ivory-400">{item.epsPrev}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-[10px] font-mono text-ivory-400">{item.date}</div>
          <div className="text-[9px] text-ivory-600">{item.timing}</div>
          <div className="flex items-center gap-1 text-[9px] text-ivory-600">
            <Star className="w-2.5 h-2.5" />{item.watchCount.toLocaleString()}
          </div>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-ivory-600" /> : <ChevronDown className="w-3.5 h-3.5 text-ivory-600" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-bg-border px-4 py-3 bg-bg-secondary/30 animate-fade-in">
          <p className="text-xs text-ivory-300 leading-relaxed">{item.aiComment}</p>
        </div>
      )}
    </div>
  );
}

export default function CorporateActions() {
  const [tab, setTab] = useState<ActionTab>("earnings");

  const tabs: { id: ActionTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: "earnings", label: "Earnings", icon: <TrendingUp className="w-3.5 h-3.5" />, count: EARNINGS.length },
    { id: "dividends", label: "Dividends", icon: <DollarSign className="w-3.5 h-3.5" />, count: DIVIDENDS.length },
    { id: "board", label: "Board Meetings", icon: <CalendarDays className="w-3.5 h-3.5" />, count: BOARD_MEETINGS.length },
    { id: "insider", label: "Insider Trading", icon: <Users className="w-3.5 h-3.5" />, count: INSIDER_TRADES.length },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-maroon-600" />
            Corporate Actions
          </h2>
          <p className="text-xs text-ivory-500">Earnings calendar, dividends, board meetings & insider trades</p>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-bg-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors -mb-px border-b-2",
              tab === t.id ? "text-maroon-300 border-maroon-600" : "text-ivory-600 border-transparent hover:text-ivory-300"
            )}>
            {t.icon}{t.label}
            <span className={cn("label-tag text-[9px] ml-1",
              tab === t.id ? "bg-maroon-800/40 text-maroon-400" : "bg-bg-border text-ivory-600"
            )}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Earnings Tab */}
      {tab === "earnings" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-signal-bull">{EARNINGS.filter(e => e.aiOutlook === "beat").length}</div>
              <div className="text-[10px] text-ivory-500">Beat Estimate</div>
            </div>
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-yellow-400">{EARNINGS.filter(e => e.aiOutlook === "in-line").length}</div>
              <div className="text-[10px] text-ivory-500">In-Line</div>
            </div>
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-signal-bear">{EARNINGS.filter(e => e.aiOutlook === "miss").length}</div>
              <div className="text-[10px] text-ivory-500">Miss Estimate</div>
            </div>
          </div>
          <div className="space-y-2">
            {EARNINGS.map(e => <EarningsCard key={e.symbol} item={e} />)}
          </div>
        </div>
      )}

      {/* Dividends Tab */}
      {tab === "dividends" && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-bg-border bg-bg-secondary/50">
                  {["Symbol", "Type", "Dividend", "Yield", "Ex-Date", "Record Date", "Pay Date", "Frequency"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DIVIDENDS.sort((a, b) => b.yield - a.yield).map((d, i) => (
                  <tr key={d.symbol} className={cn("border-b border-bg-border/50 hover:bg-bg-hover transition-colors", i % 2 === 0 && "bg-bg-primary/20")}>
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-ivory-100">{d.symbol}</div>
                      <div className="text-[9px] text-ivory-600">{d.sector}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("label-tag text-[9px]",
                        d.dividendType === "special" ? "bg-gold-500/15 text-gold-500" :
                        d.dividendType === "final" ? "bg-maroon-800/20 text-maroon-400" :
                        "bg-signal-accumulate/15 text-signal-accumulate"
                      )}>{d.dividendType.toUpperCase()}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-ivory-100">₹{d.dividendAmt}/sh</td>
                    <td className={cn("px-3 py-2.5 font-mono font-bold", d.yield >= 2 ? "text-signal-bull" : "text-ivory-300")}>
                      {d.yield.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2.5 font-mono text-ivory-300">{d.exDate}</td>
                    <td className="px-3 py-2.5 font-mono text-ivory-400">{d.recordDate}</td>
                    <td className="px-3 py-2.5 font-mono text-ivory-400">{d.payDate}</td>
                    <td className="px-3 py-2.5 text-ivory-500 text-[11px]">{d.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Board Meetings Tab */}
      {tab === "board" && (
        <div className="space-y-3">
          {BOARD_MEETINGS.map(m => (
            <div key={m.symbol} className="card-glass rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-bold text-ivory-100">{m.symbol}</span>
                    <span className={cn("label-tag text-[9px]",
                      m.significance === "high" ? "bg-signal-bear/15 text-signal-bear" :
                      m.significance === "medium" ? "bg-yellow-500/15 text-yellow-400" :
                      "bg-ivory-800/20 text-ivory-600"
                    )}>{m.significance.toUpperCase()} IMPACT</span>
                    <span className="text-[10px] font-mono text-ivory-500">{m.date}</span>
                  </div>
                  <div className="text-[11px] text-ivory-400 mb-2">{m.name}</div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {m.agenda.map(a => (
                      <span key={a} className="label-tag bg-bg-border text-ivory-400 text-[9px]">{a}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-ivory-500 leading-relaxed">{m.aiComment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insider Trading Tab */}
      {tab === "insider" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-signal-bull">{INSIDER_TRADES.filter(t => t.tradeType === "buy").length}</div>
              <div className="text-[10px] text-ivory-500">Insider Buys</div>
              <div className="text-[10px] text-signal-bull font-mono mt-0.5">
                ₹{INSIDER_TRADES.filter(t => t.tradeType === "buy").reduce((s, t) => s + t.value, 0).toFixed(0)} Cr
              </div>
            </div>
            <div className="card-glass rounded-xl p-3">
              <div className="text-xl font-display font-bold text-signal-bear">{INSIDER_TRADES.filter(t => t.tradeType === "sell").length}</div>
              <div className="text-[10px] text-ivory-500">Insider Sells</div>
              <div className="text-[10px] text-signal-bear font-mono mt-0.5">
                ₹{INSIDER_TRADES.filter(t => t.tradeType === "sell").reduce((s, t) => s + t.value, 0).toFixed(0)} Cr
              </div>
            </div>
          </div>
          <div className="card-glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-bg-border bg-bg-secondary/50">
                    {["Symbol", "Insider", "Role", "Type", "Shares", "Value", "Price", "Post Holding", "Date"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] text-ivory-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INSIDER_TRADES.map((t, i) => (
                    <tr key={`${t.symbol}-${i}`} className={cn("border-b border-bg-border/50 hover:bg-bg-hover transition-colors", i % 2 === 0 && "bg-bg-primary/20")}>
                      <td className="px-3 py-2.5">
                        <div className="font-mono font-bold text-ivory-100">{t.symbol}</div>
                        <div className="text-[9px] text-ivory-600">{t.sector}</div>
                      </td>
                      <td className="px-3 py-2.5 text-ivory-300 text-[11px] max-w-[120px] truncate">{t.trader}</td>
                      <td className="px-3 py-2.5 text-ivory-500 text-[11px]">{t.role}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn("label-tag text-[9px]",
                          t.tradeType === "buy" ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear"
                        )}>
                          {t.tradeType === "buy" ? "↑ BUY" : "↓ SELL"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-ivory-300">{t.shares.toLocaleString()}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-ivory-100">₹{t.value} Cr</td>
                      <td className="px-3 py-2.5 font-mono text-ivory-400">₹{t.price}</td>
                      <td className="px-3 py-2.5 font-mono text-ivory-300">{t.postHolding}%</td>
                      <td className="px-3 py-2.5 font-mono text-ivory-500">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
