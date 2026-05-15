"use client";
import { useState } from "react";
import { LayoutGrid, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type HeatmapView = "nifty50" | "nifty200" | "sector";
type SortBy = "change" | "mktcap" | "volume";

interface HeatStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  mktCap: number; // relative weight 1–10
  volume: number; // relative 1–5
}

const HEATMAP_DATA: HeatStock[] = [
  // Banking & Finance
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: 1842, change: 0.84, mktCap: 10, volume: 4 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", price: 1284, change: 1.24, mktCap: 9, volume: 5 },
  { symbol: "KOTAKBANK", name: "Kotak Bank", sector: "Banking", price: 1840, change: 0.42, mktCap: 7, volume: 3 },
  { symbol: "AXISBANK", name: "Axis Bank", sector: "Banking", price: 1142, change: 1.84, mktCap: 6, volume: 4 },
  { symbol: "SBIN", name: "SBI", sector: "Banking", price: 812, change: 0.64, mktCap: 8, volume: 5 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "Banking", price: 7420, change: 1.92, mktCap: 7, volume: 3 },
  { symbol: "INDUSINDBK", name: "IndusInd Bank", sector: "Banking", price: 1020, change: -0.48, mktCap: 4, volume: 2 },
  { symbol: "PNB", name: "Punjab Natl Bank", sector: "Banking", price: 112, change: -1.24, mktCap: 3, volume: 4 },
  // IT
  { symbol: "TCS", name: "TCS", sector: "IT", price: 3870, change: -0.42, mktCap: 10, volume: 3 },
  { symbol: "INFY", name: "Infosys", sector: "IT", price: 1580, change: -0.84, mktCap: 9, volume: 3 },
  { symbol: "HCLTECH", name: "HCL Tech", sector: "IT", price: 1642, change: -0.28, mktCap: 7, volume: 2 },
  { symbol: "WIPRO", name: "Wipro", sector: "IT", price: 480, change: -0.62, mktCap: 5, volume: 2 },
  { symbol: "TECHM", name: "Tech Mahindra", sector: "IT", price: 1580, change: 0.24, mktCap: 4, volume: 2 },
  { symbol: "LTIM", name: "LTIMindtree", sector: "IT", price: 5640, change: -1.24, mktCap: 4, volume: 1 },
  // Defence
  { symbol: "HAL", name: "HAL", sector: "Defence", price: 4280, change: 3.82, mktCap: 8, volume: 5 },
  { symbol: "BEL", name: "BEL", sector: "Defence", price: 318, change: 2.42, mktCap: 6, volume: 4 },
  { symbol: "MTAR", name: "MTAR Tech", sector: "Defence", price: 1840, change: 4.28, mktCap: 3, volume: 4 },
  { symbol: "PARAS", name: "Paras Defence", sector: "Defence", price: 880, change: 3.14, mktCap: 2, volume: 3 },
  { symbol: "DATPAT", name: "Data Patterns", sector: "Defence", price: 2840, change: 2.84, mktCap: 2, volume: 3 },
  // Realty
  { symbol: "DLF", name: "DLF", sector: "Realty", price: 918, change: 2.12, mktCap: 7, volume: 4 },
  { symbol: "GODREJPROP", name: "Godrej Props", sector: "Realty", price: 2840, change: 3.18, mktCap: 5, volume: 4 },
  { symbol: "OBEROIRLTY", name: "Oberoi Realty", sector: "Realty", price: 1740, change: 1.84, mktCap: 4, volume: 3 },
  { symbol: "BRIGADE", name: "Brigade Ent", sector: "Realty", price: 1420, change: 2.42, mktCap: 3, volume: 3 },
  { symbol: "MACROTECH", name: "Lodha", sector: "Realty", price: 1240, change: 1.24, mktCap: 4, volume: 3 },
  // Railway & Infra
  { symbol: "RVNL", name: "RVNL", sector: "Railway", price: 415, change: 1.92, mktCap: 5, volume: 5 },
  { symbol: "IRFC", name: "IRFC", sector: "Railway", price: 182, change: 1.48, mktCap: 6, volume: 4 },
  { symbol: "IRCTC", name: "IRCTC", sector: "Railway", price: 840, change: 0.84, mktCap: 5, volume: 3 },
  { symbol: "TITAGARH", name: "Titagarh Rail", sector: "Railway", price: 1240, change: 2.84, mktCap: 2, volume: 4 },
  // Metals
  { symbol: "TATASTEEL", name: "Tata Steel", sector: "Metals", price: 162, change: -1.24, mktCap: 6, volume: 5 },
  { symbol: "JSWSTEEL", name: "JSW Steel", sector: "Metals", price: 924, change: -0.84, mktCap: 7, volume: 4 },
  { symbol: "HINDALCO", name: "Hindalco", sector: "Metals", price: 680, change: -0.48, mktCap: 5, volume: 3 },
  { symbol: "VEDL", name: "Vedanta", sector: "Metals", price: 480, change: -1.84, mktCap: 4, volume: 4 },
  // Auto
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", price: 842, change: 1.42, mktCap: 7, volume: 4 },
  { symbol: "M&M", name: "Mahindra", sector: "Auto", price: 2840, change: 0.84, mktCap: 7, volume: 3 },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", price: 12840, change: 0.42, mktCap: 8, volume: 2 },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto", sector: "Auto", price: 8240, change: 1.24, mktCap: 6, volume: 2 },
  { symbol: "EICHERMOT", name: "Eicher Motors", sector: "Auto", price: 4840, change: 0.64, mktCap: 5, volume: 2 },
  // Pharma
  { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma", price: 1745, change: 0.62, mktCap: 7, volume: 3 },
  { symbol: "DRREDDY", name: "Dr Reddy's", sector: "Pharma", price: 1280, change: 0.28, mktCap: 5, volume: 2 },
  { symbol: "CIPLA", name: "Cipla", sector: "Pharma", price: 1480, change: 0.84, mktCap: 5, volume: 2 },
  { symbol: "DIVISLAB", name: "Divi's Lab", sector: "Pharma", price: 5840, change: 1.24, mktCap: 4, volume: 2 },
  // FMCG
  { symbol: "ITC", name: "ITC", sector: "FMCG", price: 428, change: 0.42, mktCap: 8, volume: 3 },
  { symbol: "HINDUNILVR", name: "HUL", sector: "FMCG", price: 2384, change: -0.28, mktCap: 8, volume: 2 },
  { symbol: "NESTLEIND", name: "Nestle India", sector: "FMCG", price: 24840, change: 0.18, mktCap: 5, volume: 1 },
  { symbol: "DABUR", name: "Dabur", sector: "FMCG", price: 540, change: 0.84, mktCap: 4, volume: 2 },
  // Energy & Power
  { symbol: "RELIANCE", name: "Reliance", sector: "Energy", price: 2984, change: 0.84, mktCap: 10, volume: 4 },
  { symbol: "NTPC", name: "NTPC", sector: "Energy", price: 384, change: 1.24, mktCap: 7, volume: 3 },
  { symbol: "POWERGRID", name: "Power Grid", sector: "Energy", price: 280, change: 0.64, mktCap: 6, volume: 3 },
  { symbol: "ADANIGREEN", name: "Adani Green", sector: "Energy", price: 1040, change: -3.24, mktCap: 5, volume: 5 },
  // Capital Goods
  { symbol: "L&T", name: "L&T", sector: "Capital Goods", price: 3580, change: 1.12, mktCap: 8, volume: 3 },
  { symbol: "SIEMENS", name: "Siemens", sector: "Capital Goods", price: 7240, change: 0.84, mktCap: 5, volume: 2 },
  { symbol: "ABB", name: "ABB India", sector: "Capital Goods", price: 8840, change: 1.42, mktCap: 4, volume: 2 },
];

const SECTORS = Array.from(new Set(HEATMAP_DATA.map(s => s.sector)));

function getColor(change: number): string {
  if (change >= 4)    return "bg-emerald-600 text-white";
  if (change >= 2.5)  return "bg-emerald-500 text-white";
  if (change >= 1.5)  return "bg-green-500 text-white";
  if (change >= 0.5)  return "bg-green-400 text-black";
  if (change >= 0)    return "bg-green-300/60 text-black";
  if (change >= -0.5) return "bg-red-300/60 text-black";
  if (change >= -1.5) return "bg-red-400 text-white";
  if (change >= -2.5) return "bg-red-500 text-white";
  return "bg-red-700 text-white";
}

function getSizeClass(mktCap: number): string {
  if (mktCap >= 9)  return "col-span-2 row-span-2";
  if (mktCap >= 7)  return "col-span-2 row-span-1";
  if (mktCap >= 5)  return "col-span-1 row-span-1";
  return "col-span-1 row-span-1";
}

interface TooltipData { stock: HeatStock; x: number; y: number }

function SectorBlock({ sector, stocks }: { sector: string; stocks: HeatStock[] }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const sorted = [...stocks].sort((a, b) => b.mktCap - a.mktCap);
  const sectorChange = stocks.reduce((s, st) => s + st.change * st.mktCap, 0) / stocks.reduce((s, st) => s + st.mktCap, 0);

  return (
    <div className="card-glass rounded-xl overflow-hidden">
      <div className={cn("px-3 py-1.5 flex items-center justify-between border-b border-bg-border")}>
        <span className="text-[10px] font-bold text-ivory-400 uppercase tracking-wider">{sector}</span>
        <span className={cn("text-[10px] font-mono font-bold", sectorChange >= 0 ? "text-signal-bull" : "text-signal-bear")}>
          {sectorChange >= 0 ? "+" : ""}{sectorChange.toFixed(2)}%
        </span>
      </div>
      <div className="p-1.5 grid grid-cols-4 gap-0.5 auto-rows-[36px]">
        {sorted.map(st => {
          const sizeClass = getSizeClass(st.mktCap);
          const colorClass = getColor(st.change);
          return (
            <div
              key={st.symbol}
              className={cn(
                "rounded cursor-pointer transition-all hover:opacity-90 hover:scale-[1.02] flex flex-col items-center justify-center p-1 relative overflow-hidden",
                colorClass, sizeClass
              )}
              onMouseEnter={e => setTooltip({ stock: st, x: e.clientX, y: e.clientY })}
              onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className="text-[9px] font-mono font-bold leading-none text-center">{st.symbol.length > 7 ? st.symbol.slice(0, 7) : st.symbol}</div>
              {st.mktCap >= 5 && (
                <div className="text-[8px] font-mono leading-none mt-0.5 text-center opacity-90">
                  {st.change >= 0 ? "+" : ""}{st.change.toFixed(2)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
      {tooltip && (
        <div
          className="fixed z-50 card-glass rounded-lg px-3 py-2 text-xs pointer-events-none shadow-glow-maroon border border-maroon-800/40"
          style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
        >
          <div className="font-mono font-bold text-ivory-100">{tooltip.stock.symbol}</div>
          <div className="text-[10px] text-ivory-500">{tooltip.stock.name}</div>
          <div className="flex gap-3 mt-1 text-[10px]">
            <span className="text-ivory-400">₹{tooltip.stock.price.toLocaleString()}</span>
            <span className={cn("font-mono font-bold", tooltip.stock.change >= 0 ? "text-signal-bull" : "text-signal-bear")}>
              {tooltip.stock.change >= 0 ? "+" : ""}{tooltip.stock.change.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketHeatmap() {
  const [view, setView] = useState<HeatmapView>("nifty50");
  const [selectedSector, setSelectedSector] = useState<string>("all");

  const displayStocks = HEATMAP_DATA.filter(s =>
    (view === "nifty50" ? s.mktCap >= 5 : true) &&
    (selectedSector === "all" || s.sector === selectedSector)
  );

  const displaySectors = selectedSector === "all"
    ? SECTORS
    : SECTORS.filter(s => s === selectedSector);

  const advancers = displayStocks.filter(s => s.change > 0).length;
  const decliners = displayStocks.filter(s => s.change < 0).length;
  const unchanged = displayStocks.length - advancers - decliners;

  const topGainers = [...displayStocks].sort((a, b) => b.change - a.change).slice(0, 5);
  const topLosers = [...displayStocks].sort((a, b) => a.change - b.change).slice(0, 5);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-maroon-600" />
            Market Heatmap
          </h2>
          <p className="text-xs text-ivory-500">Sector-wise heatmap — tile size = market cap, color = % change</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-signal-bull font-bold">{advancers}▲</span>
          <span className="text-ivory-600">{unchanged}—</span>
          <span className="text-signal-bear font-bold">{decliners}▼</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {([["nifty50", "Nifty 50"], ["nifty200", "Nifty 200"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setView(id)}
              className={cn("px-2.5 py-1 rounded text-[11px] font-semibold transition-colors",
                view === id ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
              )}>{label}</button>
          ))}
        </div>
        <div className="h-4 w-px bg-bg-border" />
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setSelectedSector("all")}
            className={cn("px-2.5 py-1 rounded text-[11px] font-semibold transition-colors",
              selectedSector === "all" ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
            )}>All Sectors</button>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSelectedSector(s === selectedSector ? "all" : s)}
              className={cn("px-2.5 py-1 rounded text-[11px] font-semibold transition-colors",
                selectedSector === s ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
              )}>{s}</button>
          ))}
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-glass rounded-xl p-3">
          <div className="text-[10px] font-bold text-signal-bull uppercase tracking-wider mb-2">Top Gainers</div>
          <div className="space-y-1.5">
            {topGainers.map(s => (
              <div key={s.symbol} className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-ivory-100 w-20 flex-shrink-0">{s.symbol}</span>
                <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-signal-bull rounded-full" style={{ width: `${Math.min(s.change * 15, 100)}%` }} />
                </div>
                <span className="text-[10px] font-mono font-bold text-signal-bull w-12 text-right">+{s.change.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-glass rounded-xl p-3">
          <div className="text-[10px] font-bold text-signal-bear uppercase tracking-wider mb-2">Top Losers</div>
          <div className="space-y-1.5">
            {topLosers.map(s => (
              <div key={s.symbol} className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-ivory-100 w-20 flex-shrink-0">{s.symbol}</span>
                <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden flex justify-end">
                  <div className="h-full bg-signal-bear rounded-full" style={{ width: `${Math.min(Math.abs(s.change) * 15, 100)}%` }} />
                </div>
                <span className="text-[10px] font-mono font-bold text-signal-bear w-12 text-right">{s.change.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {displaySectors.map(sector => {
          const stocks = displayStocks.filter(s => s.sector === sector);
          if (stocks.length === 0) return null;
          return <SectorBlock key={sector} sector={sector} stocks={stocks} />;
        })}
      </div>

      {/* Color Legend */}
      <div className="card-glass rounded-xl p-3 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-ivory-600 font-semibold">Change %:</span>
        {[
          ["bg-red-700", "< -2.5"],
          ["bg-red-500", "-2.5 to -1.5"],
          ["bg-red-400", "-1.5 to -0.5"],
          ["bg-red-300/60", "-0.5 to 0"],
          ["bg-green-300/60", "0 to +0.5"],
          ["bg-green-400", "+0.5 to +1.5"],
          ["bg-green-500", "+1.5 to +2.5"],
          ["bg-emerald-600", "> +2.5"],
        ].map(([cls, label]) => (
          <div key={label} className="flex items-center gap-1">
            <div className={cn("w-3 h-3 rounded", cls)} />
            <span className="text-[9px] text-ivory-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
