"use client";
import { useState } from "react";
import { Newspaper, TrendingUp, TrendingDown, Minus, Clock, ChevronDown, ChevronUp, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

type Sentiment = "bullish" | "bearish" | "neutral";
type Category = "all" | "market" | "macro" | "sectors" | "stocks" | "global";

interface NewsItem {
  id: string;
  headline: string;
  source: "ET Markets" | "Mint" | "Reuters" | "Bloomberg" | "MoneyControl" | "CNBC-TV18";
  time: string;
  sentiment: Sentiment;
  score: number;
  sectors: string[];
  stocks: string[];
  category: Exclude<Category, "all">;
  summary: string;
}

const NEWS: NewsItem[] = [
  {
    id: "n1", headline: "RBI expected to cut repo rate by 25bps in June MPC meet; inflation trajectory remains benign",
    source: "ET Markets", time: "09:42", sentiment: "bullish", score: 78,
    sectors: ["Banking", "NBFC", "Realty", "Auto"], stocks: ["HDFCBANK", "BAJFINANCE", "DLF"],
    category: "macro",
    summary: "India's retail inflation at 4.12% for April gives RBI adequate room for a 25bps rate cut in the June policy. Economists at HDFC Securities and Kotak Mahindra Bank see the cut as near-certain, with a potential follow-up cut in August if WPI remains below 2%.",
  },
  {
    id: "n2", headline: "FIIs pump ₹8,240 Cr into Indian equities in May; largest 3-day inflow since Oct 2023",
    source: "Bloomberg", time: "09:15", sentiment: "bullish", score: 85,
    sectors: ["Banking", "IT", "Pharma"], stocks: ["INFY", "TCS", "HDFCBANK"],
    category: "market",
    summary: "Foreign institutional investors have net purchased ₹8,240 crore worth of Indian equities over the last three sessions, driven by a weakening US dollar and improving EM risk appetite following soft US CPI data. CLSA and Morgan Stanley both upgraded India to Overweight this week.",
  },
  {
    id: "n3", headline: "US Fed minutes signal two rate cuts in 2026; DXY falls to 102.4 — tailwind for Indian IT",
    source: "Reuters", time: "08:55", sentiment: "bullish", score: 72,
    sectors: ["IT", "Pharma"], stocks: ["TCS", "INFY", "WIPRO", "SUNPHARMA"],
    category: "global",
    summary: "Federal Reserve meeting minutes released overnight confirmed policymakers see two rate cuts this year if inflation continues declining. The DXY index dropped 0.6% to 102.4. A weaker dollar historically boosts Indian IT revenues in rupee terms and improves EM fund flows.",
  },
  {
    id: "n4", headline: "Defence ministry clears ₹42,000 Cr order for HAL; largest single contract in company history",
    source: "CNBC-TV18", time: "10:15", sentiment: "bullish", score: 91,
    sectors: ["Defence", "Capital Goods"], stocks: ["HAL", "BEL", "BHEL", "MTAR"],
    category: "sectors",
    summary: "The Defence Acquisition Council has cleared a ₹42,000 crore procurement order for Hindustan Aeronautics Ltd covering 97 Tejas Mk-1A fighter jets and upgrade kits. Deliveries are expected between 2027–2032. Analysts at ICICI Securities see 35% upside in HAL from current levels.",
  },
  {
    id: "n5", headline: "Crude oil slips to $78.2/bbl on OPEC+ production increase speculation; OMCs to benefit",
    source: "Mint", time: "11:02", sentiment: "bullish", score: 65,
    sectors: ["Oil & Gas", "FMCG", "Aviation"], stocks: ["BPCL", "IOC", "INDIGO"],
    category: "global",
    summary: "Brent crude fell 1.8% to $78.2 per barrel on reports that OPEC+ is considering a 400k bpd production increase from July. Lower crude prices reduce India's import bill, ease inflationary pressure, and improve margins for OMCs (BPCL, HPCL, IOC). Aviation sector also stands to benefit from lower ATF costs.",
  },
  {
    id: "n6", headline: "India PMI Manufacturing at 59.1 in April — 14-year high; capex cycle in full swing",
    source: "ET Markets", time: "10:30", sentiment: "bullish", score: 88,
    sectors: ["Capital Goods", "Infra", "Auto", "Defence"], stocks: ["L&T", "RVNL", "TATAMOTORS"],
    category: "macro",
    summary: "India's Manufacturing PMI surged to 59.1 in April, the highest since February 2012, driven by new orders, strong output growth, and improving export demand. Input prices eased marginally. Capital goods and infrastructure sectors are seeing the strongest order book expansion in a decade.",
  },
  {
    id: "n7", headline: "SEBI tightens F&O position limits; weekly expiry restrictions effective June 1",
    source: "MoneyControl", time: "12:18", sentiment: "bearish", score: -55,
    sectors: ["Banking", "Broking"], stocks: ["ICICIBANK", "ZERODHA"],
    category: "market",
    summary: "SEBI's circular mandating stricter position limits for index F&O and restricting same-day weekly expiry trades is expected to reduce options premium income for brokers and dampen near-term retail derivatives volumes. Analysts warn of 8–12% revenue headwind for discount brokers in Q2.",
  },
  {
    id: "n8", headline: "China PMI misses estimates at 49.8 — contraction territory; metals sector under pressure",
    source: "Bloomberg", time: "08:30", sentiment: "bearish", score: -62,
    sectors: ["Metals", "Mining"], stocks: ["TATASTEEL", "JSWSTEEL", "HINDALCO"],
    category: "global",
    summary: "China's official Manufacturing PMI fell to 49.8 in April, below the 50-point expansion threshold for the second consecutive month. Weak Chinese industrial activity typically depresses commodity prices including steel, aluminium, and copper, creating headwinds for Indian metals companies.",
  },
  {
    id: "n9", headline: "IT sector Q4 results season begins; TCS, Infosys guide for cautious FY27 outlook",
    source: "CNBC-TV18", time: "13:45", sentiment: "neutral", score: -8,
    sectors: ["IT"], stocks: ["TCS", "INFY", "HCLTECH", "WIPRO"],
    category: "sectors",
    summary: "Large IT companies are guiding for 6–8% revenue growth in FY27 — in line with street estimates but not showing acceleration. Deal wins remain healthy but ramp-up timelines have extended. AI-related projects are growing but not yet large enough to offset weakness in legacy transformation deals.",
  },
  {
    id: "n10", headline: "Realty sector up 4.2% this week; DLF, Godrej Properties hit fresh 52-week highs",
    source: "Mint", time: "14:20", sentiment: "bullish", score: 76,
    sectors: ["Realty"], stocks: ["DLF", "GODREJPROP", "PRESTIGE", "BRIGADE"],
    category: "sectors",
    summary: "The Nifty Realty index is the top-performing sectoral index this week, gaining 4.2% as investors bet on rate cuts boosting housing demand. DLF and Godrej Properties hit fresh 52-week highs. Pre-sales volumes in Q4 remained strong across top 7 cities, with Mumbai and Hyderabad leading.",
  },
  {
    id: "n11", headline: "Monsoon forecast: IMD predicts 106% of LPA — above normal; Agri + FMCG positive",
    source: "ET Markets", time: "15:05", sentiment: "bullish", score: 68,
    sectors: ["FMCG", "Agri", "Consumer", "Rural"], stocks: ["ITC", "DABUR", "MARICO", "EMAMILTD"],
    category: "macro",
    summary: "India Meteorological Department's second-stage forecast predicts monsoon rainfall at 106% of Long Period Average — above normal for the third consecutive year. Good monsoon boosts rural income, agricultural output, and FMCG volumes. Analysts expect rural consumption to outpace urban growth in H2 FY27.",
  },
  {
    id: "n12", headline: "Adani Group stocks down 3–5% on US DoJ subpoena reports; contagion fear in PSU infra",
    source: "Reuters", time: "11:30", sentiment: "bearish", score: -71,
    sectors: ["Infra", "Power", "Port"], stocks: ["ADANIPORTS", "ADANIGREEN", "ADANITRANS"],
    category: "stocks",
    summary: "Adani Group stocks fell sharply after reports emerged of fresh US Department of Justice subpoenas related to the ongoing investigation into alleged bribery. Analysts caution investors to avoid the group until legal clarity emerges. PSU infrastructure stocks also saw sympathy selling.",
  },
];

const SENTIMENT_HISTORY = [
  { date: "09-May", score: 42 },
  { date: "10-May", score: 55 },
  { date: "11-May", score: 38 },
  { date: "12-May", score: -12 },
  { date: "13-May", score: 28 },
  { date: "14-May", score: 61 },
  { date: "15-May", score: 52 },
];

const SECTOR_SENTIMENT = [
  { sector: "Defence", score: 88 },
  { sector: "Realty", score: 76 },
  { sector: "Banking", score: 65 },
  { sector: "FMCG", score: 60 },
  { sector: "IT", score: -8 },
  { sector: "Metals", score: -62 },
];

const SOURCES: Record<string, string> = {
  "ET Markets": "bg-blue-500/20 text-blue-400",
  "Mint": "bg-green-500/20 text-green-400",
  "Reuters": "bg-orange-500/20 text-orange-400",
  "Bloomberg": "bg-purple-500/20 text-purple-400",
  "MoneyControl": "bg-red-500/20 text-red-400",
  "CNBC-TV18": "bg-yellow-500/20 text-yellow-400",
};

function SentimentIcon({ s, size = "w-3.5 h-3.5" }: { s: Sentiment; size?: string }) {
  if (s === "bullish") return <TrendingUp className={cn(size, "text-signal-bull")} />;
  if (s === "bearish") return <TrendingDown className={cn(size, "text-signal-bear")} />;
  return <Minus className={cn(size, "text-yellow-400")} />;
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.abs(score);
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-20 h-1.5 bg-bg-border rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", score > 0 ? "bg-signal-bull" : score < 0 ? "bg-signal-bear" : "bg-yellow-500")}
          style={{ width: `${pct}%`, marginLeft: score < 0 ? `${100 - pct}%` : 0 }}
        />
      </div>
      <span className={cn("text-[10px] font-mono font-bold", score > 0 ? "text-signal-bull" : score < 0 ? "text-signal-bear" : "text-yellow-400")}>
        {score > 0 ? "+" : ""}{score}
      </span>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={cn("card-glass rounded-xl overflow-hidden cursor-pointer transition-all", expanded && "glow-border-maroon")}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-3 flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <SentimentIcon s={item.sentiment} size="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn("label-tag text-[9px] font-bold", SOURCES[item.source])}>{item.source}</span>
            <span className="text-[10px] text-ivory-600 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{item.time}</span>
            <span className={cn("label-tag text-[9px]",
              item.sentiment === "bullish" ? "bg-signal-bull/15 text-signal-bull" :
              item.sentiment === "bearish" ? "bg-signal-bear/15 text-signal-bear" :
              "bg-yellow-500/15 text-yellow-400"
            )}>{item.sentiment.toUpperCase()}</span>
          </div>
          <p className="text-[12px] font-medium text-ivory-100 leading-snug">{item.headline}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <ScoreBar score={item.score} />
            <div className="flex gap-1 flex-wrap">
              {item.sectors.slice(0, 3).map(s => (
                <span key={s} className="label-tag bg-maroon-800/20 text-maroon-400 text-[9px]">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-ivory-600" /> : <ChevronDown className="w-3.5 h-3.5 text-ivory-600" />}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-bg-border px-4 py-3 bg-bg-secondary/30 animate-fade-in space-y-2">
          <p className="text-xs text-ivory-300 leading-relaxed">{item.summary}</p>
          {item.stocks.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-ivory-600">Stocks mentioned:</span>
              {item.stocks.map(s => (
                <span key={s} className="label-tag bg-gold-500/15 text-gold-500 text-[9px]">{s}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px]">
      <div className="text-ivory-400">{label}</div>
      <div className={cn("font-bold font-mono", v >= 0 ? "text-signal-bull" : "text-signal-bear")}>{v >= 0 ? "+" : ""}{v}</div>
    </div>
  );
};

export default function NewsSentiment() {
  const [category, setCategory] = useState<Category>("all");

  const filtered = NEWS.filter(n => category === "all" || n.category === category);
  const bullishCount = NEWS.filter(n => n.sentiment === "bullish").length;
  const bearishCount = NEWS.filter(n => n.sentiment === "bearish").length;
  const neutralCount = NEWS.filter(n => n.sentiment === "neutral").length;
  const overallScore = Math.round(NEWS.reduce((s, n) => s + n.score, 0) / NEWS.length);

  const categories: { id: Category; label: string }[] = [
    { id: "all", label: "All" },
    { id: "market", label: "Market" },
    { id: "macro", label: "Macro" },
    { id: "sectors", label: "Sectors" },
    { id: "stocks", label: "Stocks" },
    { id: "global", label: "Global" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-maroon-600" />
            News & Sentiment
          </h2>
          <p className="text-xs text-ivory-500">AI-powered market news with real-time sentiment scoring</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-signal-bull animate-pulse" />
          <span className="text-[11px] text-ivory-500 font-mono">Live Feed</span>
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-glass rounded-xl p-3 text-center">
          <div className={cn("text-2xl font-display font-bold", overallScore >= 0 ? "text-signal-bull" : "text-signal-bear")}>
            {overallScore >= 0 ? "+" : ""}{overallScore}
          </div>
          <div className="text-[10px] text-ivory-500 mt-0.5">Market Sentiment Score</div>
          <div className={cn("label-tag text-[9px] mt-1.5 mx-auto w-fit",
            overallScore > 30 ? "bg-signal-bull/15 text-signal-bull" :
            overallScore < -30 ? "bg-signal-bear/15 text-signal-bear" :
            "bg-yellow-500/15 text-yellow-400"
          )}>
            {overallScore > 30 ? "↑ BULLISH" : overallScore < -30 ? "↓ BEARISH" : "→ NEUTRAL"}
          </div>
        </div>
        <div className="card-glass rounded-xl p-3 text-center">
          <div className="text-2xl font-display font-bold text-signal-bull">{bullishCount}</div>
          <div className="text-[10px] text-ivory-500 mt-0.5">Bullish Stories</div>
          <div className="text-[9px] text-ivory-700 font-mono mt-1">{Math.round(bullishCount / NEWS.length * 100)}% of total</div>
        </div>
        <div className="card-glass rounded-xl p-3 text-center">
          <div className="text-2xl font-display font-bold text-signal-bear">{bearishCount}</div>
          <div className="text-[10px] text-ivory-500 mt-0.5">Bearish Stories</div>
          <div className="text-[9px] text-ivory-700 font-mono mt-1">{Math.round(bearishCount / NEWS.length * 100)}% of total</div>
        </div>
        <div className="card-glass rounded-xl p-3 text-center">
          <div className="text-2xl font-display font-bold text-yellow-400">{neutralCount}</div>
          <div className="text-[10px] text-ivory-500 mt-0.5">Neutral Stories</div>
          <div className="text-[9px] text-ivory-700 font-mono mt-1">{Math.round(neutralCount / NEWS.length * 100)}% of total</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* News Feed */}
        <div className="xl:col-span-2 space-y-3">
          {/* Category Filter */}
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={cn("px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors",
                  category === c.id ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
                )}>{c.label}</button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map(item => <NewsCard key={item.id} item={item} />)}
            {filtered.length === 0 && (
              <div className="card-glass rounded-xl p-8 text-center text-ivory-600 text-sm">No news in this category</div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Sentiment History */}
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">7-Day Sentiment Trend</div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={SENTIMENT_HISTORY} barSize={14}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#8b8472" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[-100, 100]} />
                <ReferenceLine y={0} stroke="#3d3a32" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                  {SENTIMENT_HISTORY.map((d, i) => (
                    <Cell key={i} fill={d.score >= 0 ? "#22c55e" : "#ef4444"} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sector Sentiment */}
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Sentiment by Sector</div>
            <div className="space-y-2">
              {SECTOR_SENTIMENT.map(s => (
                <div key={s.sector} className="flex items-center gap-2">
                  <span className="text-[11px] text-ivory-400 w-20 flex-shrink-0">{s.sector}</span>
                  <div className="flex-1 h-3 bg-bg-border rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-bg-border z-10" />
                    {s.score >= 0 ? (
                      <div className="absolute left-1/2 top-0 bottom-0 bg-signal-bull/70 rounded-r"
                        style={{ width: `${s.score / 2}%` }} />
                    ) : (
                      <div className="absolute right-1/2 top-0 bottom-0 bg-signal-bear/70 rounded-l"
                        style={{ width: `${Math.abs(s.score) / 2}%` }} />
                    )}
                  </div>
                  <span className={cn("text-[10px] font-mono font-bold w-8 text-right flex-shrink-0",
                    s.score >= 0 ? "text-signal-bull" : "text-signal-bear"
                  )}>{s.score >= 0 ? "+" : ""}{s.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Stocks */}
          <div className="card-glass rounded-xl p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Most Mentioned Stocks</div>
            <div className="space-y-1.5">
              {[
                { symbol: "HDFCBANK", count: 3, sentiment: "bullish" as Sentiment },
                { symbol: "TCS", count: 3, sentiment: "neutral" as Sentiment },
                { symbol: "HAL", count: 2, sentiment: "bullish" as Sentiment },
                { symbol: "DLF", count: 2, sentiment: "bullish" as Sentiment },
                { symbol: "TATASTEEL", count: 2, sentiment: "bearish" as Sentiment },
                { symbol: "ADANIPORTS", count: 1, sentiment: "bearish" as Sentiment },
              ].map(s => (
                <div key={s.symbol} className="flex items-center gap-2">
                  <SentimentIcon s={s.sentiment} size="w-3 h-3" />
                  <span className="text-[11px] text-ivory-200 font-mono flex-1">{s.symbol}</span>
                  <span className="text-[10px] text-ivory-500">{s.count} mentions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
