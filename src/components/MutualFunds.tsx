"use client";
import { useState, useMemo } from "react";
import { Layers, TrendingUp, TrendingDown, Calculator, Star, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type FundCategory = "all" | "equity" | "debt" | "hybrid" | "index" | "sectoral";

interface MutualFund {
  id: string;
  name: string;
  shortName: string;
  amc: string;
  category: Exclude<FundCategory, "all">;
  subCategory: string;
  nav: number;
  navDate: string;
  aum: number;
  returns: { ytd: number; yr1: number; yr3: number; yr5: number };
  expense: number;
  risk: "Low" | "Moderate" | "High" | "Very High";
  rating: number;
  minSip: number;
  holdings: { name: string; pct: number; sector: string }[];
  sectorAlloc: { sector: string; pct: number }[];
  aiComment: string;
}

const FUNDS: MutualFund[] = [
  {
    id: "f1", name: "Nippon India Defence Fund - Direct Growth", shortName: "Nippon Defence", amc: "Nippon India",
    category: "sectoral", subCategory: "Defence & Aerospace", nav: 28.42, navDate: "14-May-26", aum: 8420, rating: 5,
    returns: { ytd: 24.8, yr1: 48.2, yr3: 42.1, yr5: 0 }, expense: 0.72, risk: "Very High", minSip: 100,
    holdings: [
      { name: "HAL", pct: 18.4, sector: "Defence" }, { name: "BEL", pct: 14.2, sector: "Defence" },
      { name: "MTAR Tech", pct: 8.4, sector: "Defence" }, { name: "Data Patterns", pct: 7.2, sector: "Defence" },
      { name: "Paras Defence", pct: 6.8, sector: "Defence" }, { name: "Cochin Shipyard", pct: 5.4, sector: "Maritime" },
    ],
    sectorAlloc: [
      { sector: "Aerospace & Defence", pct: 58 }, { sector: "Electronics", pct: 18 },
      { sector: "Engineering", pct: 12 }, { sector: "Maritime", pct: 8 }, { sector: "Others", pct: 4 },
    ],
    aiComment: "Top performing sectoral fund. Capex supercycle in defence + Atmanirbhar Bharat policy tailwind. Continue SIP; avoid lumpsum at current highs — wait for 10% correction.",
  },
  {
    id: "f2", name: "Mirae Asset Large Cap Fund - Direct Growth", shortName: "Mirae Large Cap", amc: "Mirae Asset",
    category: "equity", subCategory: "Large Cap", nav: 118.42, navDate: "14-May-26", aum: 42800, rating: 5,
    returns: { ytd: 8.4, yr1: 18.2, yr3: 16.8, yr5: 15.4 }, expense: 0.54, risk: "High", minSip: 1000,
    holdings: [
      { name: "HDFCBANK", pct: 9.2, sector: "Banking" }, { name: "ICICIBANK", pct: 7.8, sector: "Banking" },
      { name: "INFY", pct: 6.4, sector: "IT" }, { name: "RELIANCE", pct: 6.2, sector: "Energy" },
      { name: "TCS", pct: 5.8, sector: "IT" }, { name: "AXISBANK", pct: 4.2, sector: "Banking" },
    ],
    sectorAlloc: [
      { sector: "Banking & Finance", pct: 32 }, { sector: "IT", pct: 18 }, { sector: "Energy", pct: 14 },
      { sector: "Consumer", pct: 10 }, { sector: "Healthcare", pct: 8 }, { sector: "Others", pct: 18 },
    ],
    aiComment: "Consistent 5-star performer. Low expense ratio for large cap. Ideal core portfolio holding. FII inflows into large caps are positive for this fund's NAV.",
  },
  {
    id: "f3", name: "Parag Parikh Flexi Cap Fund - Direct Growth", shortName: "PPFAS Flexi Cap", amc: "PPFAS",
    category: "equity", subCategory: "Flexi Cap", nav: 82.14, navDate: "14-May-26", aum: 86400, rating: 5,
    returns: { ytd: 9.8, yr1: 22.4, yr3: 18.4, yr5: 19.2 }, expense: 0.62, risk: "High", minSip: 1000,
    holdings: [
      { name: "HDFCBANK", pct: 8.4, sector: "Banking" }, { name: "Coal India", pct: 6.8, sector: "Mining" },
      { name: "ITC", pct: 6.2, sector: "FMCG" }, { name: "Alphabet (GOOGL)", pct: 4.8, sector: "Global Tech" },
      { name: "Meta (META)", pct: 3.8, sector: "Global Tech" }, { name: "Microsoft (MSFT)", pct: 3.4, sector: "Global Tech" },
    ],
    sectorAlloc: [
      { sector: "Banking & Finance", pct: 22 }, { sector: "Global Tech", pct: 18 }, { sector: "Energy", pct: 12 },
      { sector: "FMCG", pct: 10 }, { sector: "Mining", pct: 8 }, { sector: "Others", pct: 30 },
    ],
    aiComment: "Unique global diversification with US tech exposure (up to 35% overseas). Benefits from USD/INR weakness hedging. Best flexi cap for long-term wealth creation.",
  },
  {
    id: "f4", name: "SBI Nifty 50 Index Fund - Direct Growth", shortName: "SBI Nifty 50", amc: "SBI Mutual Fund",
    category: "index", subCategory: "Large Cap Index", nav: 214.82, navDate: "14-May-26", aum: 28400, rating: 4,
    returns: { ytd: 7.2, yr1: 16.4, yr3: 14.8, yr5: 13.8 }, expense: 0.10, risk: "High", minSip: 500,
    holdings: [
      { name: "HDFCBANK", pct: 13.2, sector: "Banking" }, { name: "RELIANCE", pct: 9.8, sector: "Energy" },
      { name: "ICICIBANK", pct: 8.4, sector: "Banking" }, { name: "INFY", pct: 6.2, sector: "IT" },
      { name: "TCS", pct: 5.8, sector: "IT" }, { name: "AXISBANK", pct: 4.4, sector: "Banking" },
    ],
    sectorAlloc: [
      { sector: "Banking & Finance", pct: 38 }, { sector: "IT", pct: 16 }, { sector: "Energy", pct: 12 },
      { sector: "Consumer", pct: 9 }, { sector: "Healthcare", pct: 7 }, { sector: "Others", pct: 18 },
    ],
    aiComment: "Lowest expense ratio. Pure passive. Best for long-term SIP investors who want market returns without fund manager risk. Recommended for 5+ year horizon.",
  },
  {
    id: "f5", name: "Quant Small Cap Fund - Direct Growth", shortName: "Quant Small Cap", amc: "Quant MF",
    category: "equity", subCategory: "Small Cap", nav: 248.42, navDate: "14-May-26", aum: 24800, rating: 4,
    returns: { ytd: 12.4, yr1: 32.8, yr3: 38.4, yr5: 42.8 }, expense: 0.64, risk: "Very High", minSip: 1000,
    holdings: [
      { name: "RVNL", pct: 6.4, sector: "Railway" }, { name: "IRFC", pct: 5.8, sector: "Finance" },
      { name: "HUDCO", pct: 5.2, sector: "Infra" }, { name: "Jupiter Wagons", pct: 4.8, sector: "Railway" },
      { name: "REC Ltd", pct: 4.4, sector: "Finance" }, { name: "NHPC", pct: 4.2, sector: "Power" },
    ],
    sectorAlloc: [
      { sector: "Railway & Infra", pct: 28 }, { sector: "Power & Energy", pct: 18 }, { sector: "Finance", pct: 16 },
      { sector: "Defence", pct: 12 }, { sector: "PSU/Govt", pct: 14 }, { sector: "Others", pct: 12 },
    ],
    aiComment: "Best 5-year small cap performer. QUANT model uses VLRT (Valuation, Liquidity, Risk, Timing) framework. Very high risk — suitable only for 7+ year investors. Avoid during market peaks.",
  },
  {
    id: "f6", name: "ICICI Pru Balanced Advantage Fund - Direct Growth", shortName: "ICICI BAF", amc: "ICICI Prudential",
    category: "hybrid", subCategory: "Balanced Advantage", nav: 68.42, navDate: "14-May-26", aum: 64800, rating: 4,
    returns: { ytd: 6.8, yr1: 14.2, yr3: 12.8, yr5: 12.4 }, expense: 0.82, risk: "Moderate", minSip: 1000,
    holdings: [
      { name: "Equity Hedged", pct: 48, sector: "Mixed" }, { name: "Debt", pct: 32, sector: "Bonds" },
      { name: "Equity Unhedged", pct: 12, sector: "Mixed" }, { name: "Arbitrage", pct: 8, sector: "Arb" },
      { name: "Others", pct: 0, sector: "" }, { name: "Liquid", pct: 0, sector: "" },
    ],
    sectorAlloc: [
      { sector: "Equity (Hedged)", pct: 48 }, { sector: "Government Bonds", pct: 18 },
      { sector: "Corporate Bonds", pct: 14 }, { sector: "Equity (Unhedged)", pct: 12 }, { sector: "Arbitrage", pct: 8 },
    ],
    aiComment: "Dynamic equity allocation model — reduces equity when valuations are expensive. Good for conservative investors. Current equity allocation ~60% (moderately bullish positioning).",
  },
];

const NFOS = [
  { name: "Motilal Oswal Nifty India Railways Index Fund", amc: "Motilal Oswal", open: "12-May-26", close: "20-May-26", minInv: 1000, type: "Index", rating: "Unrated", aiNote: "Pure railway theme index — sector at 52W high. Consider waiting for market-linked correction before entry." },
  { name: "Axis Quant Fund - Direct Growth", amc: "Axis MF", open: "18-May-26", close: "30-May-26", minInv: 5000, type: "Equity", rating: "Unrated", aiNote: "Quantitative model-driven equity fund. Unique strategy — diversification from traditional active funds." },
  { name: "HDFC Defence & Aerospace Fund", amc: "HDFC MF", open: "22-May-26", close: "05-Jun-26", minInv: 1000, type: "Sectoral", rating: "Unrated", aiNote: "Second defence fund launch this year — late entry into theme. Nippon Defence has head start. Compare before investing." },
];

const COLORS = ["#7c2d32", "#b45309", "#15803d", "#1d4ed8", "#7c3aed", "#0e7490"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg px-2.5 py-1.5 text-[11px]">
      <div className="text-ivory-400">{payload[0].name}</div>
      <div className="font-bold text-ivory-100">{payload[0].value}%</div>
    </div>
  );
};

function FundCard({ fund, selected, onClick }: { fund: MutualFund; selected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick}
      className={cn("card-glass rounded-xl p-4 cursor-pointer transition-all border",
        selected ? "border-maroon-600 glow-border-maroon" : "border-transparent hover:border-maroon-900"
      )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="label-tag bg-maroon-800/20 text-maroon-400 text-[9px]">{fund.subCategory}</span>
            <span className={cn("label-tag text-[9px]",
              fund.risk === "Very High" ? "bg-signal-bear/15 text-signal-bear" :
              fund.risk === "High" ? "bg-orange-500/15 text-orange-400" :
              "bg-yellow-500/15 text-yellow-400"
            )}>{fund.risk}</span>
          </div>
          <div className="text-[11px] font-semibold text-ivory-100 leading-snug">{fund.shortName}</div>
          <div className="text-[9px] text-ivory-600 mt-0.5">{fund.amc}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-sm font-display font-bold text-ivory-100">₹{fund.nav}</div>
          <div className="text-[9px] text-ivory-600 mt-0.5">{fund.navDate}</div>
          <div className="flex gap-0.5 mt-1 justify-end">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("w-2.5 h-2.5", i < fund.rating ? "text-gold-500 fill-gold-500" : "text-ivory-800")} />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 mt-2">
        {[["YTD", fund.returns.ytd], ["1Y", fund.returns.yr1], ["3Y", fund.returns.yr3], ["5Y", fund.returns.yr5]].map(([label, val]) => (
          <div key={label as string} className="text-center bg-bg-primary/40 rounded-lg py-1.5">
            <div className={cn("text-xs font-mono font-bold", (val as number) >= 0 ? "text-signal-bull" : "text-signal-bear")}>
              {(val as number) > 0 ? "+" : ""}{val}%
            </div>
            <div className="text-[9px] text-ivory-600">{label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px]">
        <span className="text-ivory-600">AUM: <span className="text-ivory-300 font-mono">₹{(fund.aum / 100).toFixed(0)} Cr</span></span>
        <span className="text-ivory-600">ER: <span className="text-ivory-300 font-mono">{fund.expense}%</span></span>
        <span className="text-ivory-600">Min SIP: <span className="text-ivory-300 font-mono">₹{fund.minSip}</span></span>
      </div>
    </div>
  );
}

function SIPCalculator() {
  const [monthly, setMonthly] = useState(10000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(15);
  const [stepUp, setStepUp] = useState(10);

  const calcSIP = (monthly: number, years: number, rate: number, stepUpPct: number) => {
    let corpus = 0;
    let totalInvested = 0;
    let currentSIP = monthly;
    const monthlyRate = rate / 100 / 12;
    for (let y = 0; y < years; y++) {
      for (let m = 0; m < 12; m++) {
        corpus = (corpus + currentSIP) * (1 + monthlyRate);
        totalInvested += currentSIP;
      }
      currentSIP *= (1 + stepUpPct / 100);
    }
    return { corpus: Math.round(corpus), invested: Math.round(totalInvested), gains: Math.round(corpus - totalInvested) };
  };

  const result = calcSIP(monthly, years, rate, stepUp);
  const chartData = Array.from({ length: years }, (_, y) => {
    const r = calcSIP(monthly, y + 1, rate, stepUp);
    return { year: `Y${y + 1}`, invested: Math.round(r.invested / 100000), corpus: Math.round(r.corpus / 100000) };
  });

  return (
    <div className="card-glass rounded-xl p-4 space-y-4">
      <div className="text-xs font-semibold text-ivory-300 flex items-center gap-2">
        <Calculator className="w-3.5 h-3.5 text-maroon-500" />SIP Calculator
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Monthly SIP (₹)", val: monthly, set: setMonthly, min: 500, max: 100000, step: 500 },
          { label: "Tenure (years)", val: years, set: setYears, min: 1, max: 30, step: 1 },
          { label: "Expected Return %", val: rate, set: setRate, min: 5, max: 30, step: 0.5 },
          { label: "Step-Up % (annual)", val: stepUp, set: setStepUp, min: 0, max: 30, step: 1 },
        ].map(f => (
          <div key={f.label}>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-ivory-500">{f.label}</span>
              <span className="text-[10px] text-ivory-200 font-mono font-bold">{f.val}{f.label.includes("%") || f.label.includes("years") ? (f.label.includes("%") ? "%" : "y") : ""}</span>
            </div>
            <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
              onChange={e => f.set(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-bg-border [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-maroon-600 cursor-pointer"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-bg-primary/40 rounded-lg p-2">
          <div className="text-xs font-mono font-bold text-ivory-200">₹{(result.invested / 100000).toFixed(1)}L</div>
          <div className="text-[9px] text-ivory-600">Total Invested</div>
        </div>
        <div className="bg-bg-primary/40 rounded-lg p-2">
          <div className="text-xs font-mono font-bold text-signal-bull">₹{(result.gains / 100000).toFixed(1)}L</div>
          <div className="text-[9px] text-ivory-600">Gains</div>
        </div>
        <div className="bg-bg-primary/40 rounded-lg p-2">
          <div className="text-xs font-mono font-bold text-gold-500">₹{(result.corpus / 100000).toFixed(1)}L</div>
          <div className="text-[9px] text-ivory-600">Corpus</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={chartData} barSize={8}>
          <XAxis dataKey="year" tick={{ fontSize: 8, fill: "#8b8472" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip formatter={(v: any) => `₹${v}L`} contentStyle={{ background: "#1a1814", border: "1px solid #3d3a32", fontSize: 10 }} />
          <Bar dataKey="invested" fill="#3d3a32" name="Invested" radius={[1, 1, 0, 0]} />
          <Bar dataKey="corpus" fill="#7c2d32" name="Corpus" radius={[1, 1, 0, 0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MutualFunds() {
  const [category, setCategory] = useState<FundCategory>("all");
  const [selectedId, setSelectedId] = useState<string>("f1");
  const [view, setView] = useState<"funds" | "nfo" | "sip">("funds");

  const selectedFund = FUNDS.find(f => f.id === selectedId) ?? FUNDS[0];
  const filtered = FUNDS.filter(f => category === "all" || f.category === category);

  const categories: { id: FundCategory; label: string }[] = [
    { id: "all", label: "All" }, { id: "equity", label: "Equity" }, { id: "hybrid", label: "Hybrid" },
    { id: "index", label: "Index" }, { id: "sectoral", label: "Sectoral" }, { id: "debt", label: "Debt" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-maroon-600" />
            Mutual Fund Tracker
          </h2>
          <p className="text-xs text-ivory-500">Top performing funds, holdings, sector allocation & SIP calculator</p>
        </div>
        <div className="flex gap-1">
          {(["funds", "nfo", "sip"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                view === v ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300 hover:bg-bg-hover"
              )}>{v === "nfo" ? "NFO Tracker" : v === "sip" ? "SIP Calculator" : "All Funds"}</button>
          ))}
        </div>
      </div>

      {view === "funds" && (
        <div className="space-y-4">
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={cn("px-2.5 py-1 rounded text-[11px] font-semibold transition-colors",
                  category === c.id ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
                )}>{c.label}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="space-y-2">
              {filtered.map(f => (
                <FundCard key={f.id} fund={f} selected={f.id === selectedId} onClick={() => setSelectedId(f.id)} />
              ))}
            </div>

            <div className="space-y-4">
              <div className="card-glass rounded-xl p-4">
                <div className="text-xs font-semibold text-ivory-300 mb-1">{selectedFund.name}</div>
                <p className="text-[11px] text-ivory-400 leading-relaxed mb-4">{selectedFund.aiComment}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-semibold text-ivory-500 mb-2">Sector Allocation</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={selectedFund.sectorAlloc} dataKey="pct" nameKey="sector" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                          {selectedFund.sectorAlloc.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />)}
                        </Pie>
                        <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: "#1a1814", border: "1px solid #3d3a32", fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1 mt-1">
                      {selectedFund.sectorAlloc.slice(0, 4).map((s, i) => (
                        <div key={s.sector} className="flex items-center gap-1.5 text-[10px]">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-ivory-400 flex-1 truncate">{s.sector}</span>
                          <span className="font-mono text-ivory-200">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-ivory-500 mb-2">Top Holdings</div>
                    <div className="space-y-2">
                      {selectedFund.holdings.slice(0, 6).map((h, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-ivory-300 font-mono">{h.name}</span>
                            <span className="text-ivory-400">{h.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-maroon-600 rounded-full" style={{ width: `${h.pct * 5}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <SIPCalculator />
            </div>
          </div>
        </div>
      )}

      {view === "nfo" && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-maroon-950/30 text-[11px] text-ivory-400">
            New Fund Offers currently open or opening soon. NFOs carry additional uncertainty as they have no track record.
          </div>
          {NFOS.map(nfo => (
            <div key={nfo.name} className="card-glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex gap-2 mb-1.5 flex-wrap">
                    <span className="label-tag bg-gold-500/15 text-gold-500 text-[9px]">NFO OPEN</span>
                    <span className="label-tag bg-maroon-800/20 text-maroon-400 text-[9px]">{nfo.type}</span>
                  </div>
                  <div className="text-xs font-semibold text-ivory-100 mb-1">{nfo.name}</div>
                  <div className="text-[10px] text-ivory-500 mb-3">{nfo.amc}</div>
                  <div className="flex gap-4 text-[10px] mb-3">
                    <div><span className="text-ivory-600">Opens: </span><span className="text-ivory-300 font-mono">{nfo.open}</span></div>
                    <div><span className="text-ivory-600">Closes: </span><span className="text-ivory-300 font-mono">{nfo.close}</span></div>
                    <div><span className="text-ivory-600">Min: </span><span className="text-ivory-300 font-mono">₹{nfo.minInv}</span></div>
                  </div>
                  <p className="text-[11px] text-ivory-400 leading-relaxed">{nfo.aiNote}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "sip" && (
        <div className="max-w-xl">
          <SIPCalculator />
        </div>
      )}
    </div>
  );
}
