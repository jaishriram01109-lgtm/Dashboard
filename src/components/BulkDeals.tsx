"use client";
import { useState, useMemo } from "react";
import { DollarSign, Filter, TrendingUp, TrendingDown, Search, Building2 } from "lucide-react";
import { cn, fmt, fmtCr, colorFromChange } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────
const BULK_DEALS = [
  { date: "15-May-26", symbol: "HAL", name: "Hindustan Aeronautics", exchange: "NSE", client: "Goldman Sachs India Fund", type: "BUY", qty: 480000, price: 4780, value: 229.44, category: "FII" },
  { date: "15-May-26", symbol: "TCS", name: "Tata Consultancy", exchange: "BSE", client: "Norges Bank", type: "BUY", qty: 620000, price: 4240, value: 262.88, category: "FII" },
  { date: "15-May-26", symbol: "RVNL", name: "Rail Vikas Nigam", exchange: "NSE", client: "SBI Mutual Fund", type: "BUY", qty: 5200000, price: 572, value: 297.44, category: "MF" },
  { date: "15-May-26", symbol: "TATASTEEL", name: "Tata Steel", exchange: "NSE", client: "CLSA Mauritius", type: "SELL", qty: 8400000, price: 152, value: 127.68, category: "FII" },
  { date: "15-May-26", symbol: "SUNPHARMA", name: "Sun Pharma", exchange: "NSE", client: "Axis MF", type: "BUY", qty: 1240000, price: 1824, value: 226.18, category: "MF" },
  { date: "14-May-26", symbol: "DLF", name: "DLF Limited", exchange: "NSE", client: "Mirae Asset", type: "BUY", qty: 2100000, price: 902, value: 189.42, category: "MF" },
  { date: "14-May-26", symbol: "ICICIBANK", name: "ICICI Bank", exchange: "BSE", client: "BlackRock", type: "BUY", qty: 3400000, price: 1172, value: 398.48, category: "FII" },
  { date: "14-May-26", symbol: "HDFCBANK", name: "HDFC Bank", exchange: "NSE", client: "Vanguard EM Fund", type: "SELL", qty: 2800000, price: 1788, value: 500.64, category: "FII" },
  { date: "14-May-26", symbol: "WIPRO", name: "Wipro Limited", exchange: "NSE", client: "HDFC MF", type: "BUY", qty: 3200000, price: 538, value: 172.16, category: "MF" },
  { date: "13-May-26", symbol: "BEL", name: "Bharat Electronics", exchange: "NSE", client: "ICICI Prudential MF", type: "BUY", qty: 6400000, price: 312, value: 199.68, category: "MF" },
  { date: "13-May-26", symbol: "M&M", name: "Mahindra & Mahindra", exchange: "NSE", client: "Fidelity India", type: "BUY", qty: 840000, price: 2842, value: 238.73, category: "FII" },
  { date: "13-May-26", symbol: "BAJAJFINSV", name: "Bajaj Finserv", exchange: "BSE", client: "Motilal Oswal MF", type: "SELL", qty: 1200000, price: 1624, value: 194.88, category: "MF" },
];

const BLOCK_DEALS = [
  { date: "15-May-26", symbol: "HAL", exchange: "NSE", buyer: "Goldman Sachs India Fund", seller: "LIC", qty: 280000, price: 4780, value: 133.84 },
  { date: "15-May-26", symbol: "RVNL", exchange: "NSE", buyer: "SBI MF – Flexi", seller: "Retail sellers", qty: 3200000, price: 574, value: 183.68 },
  { date: "14-May-26", symbol: "ICICIBANK", exchange: "BSE", buyer: "BlackRock EM Fund", seller: "Morgan Stanley", qty: 2400000, price: 1174, value: 281.76 },
  { date: "14-May-26", symbol: "TATAMOTORS", exchange: "NSE", buyer: "Nippon India MF", seller: "Retail", qty: 4800000, price: 1018, value: 488.64 },
  { date: "13-May-26", symbol: "BEL", exchange: "NSE", buyer: "ICICI Prudential", seller: "LIC Partial exit", qty: 5200000, price: 310, value: 161.20 },
];

// ─── SUMMARY BY ENTITY ───────────────────────────────────────
function FIIDIISummary({ deals }: { deals: typeof BULK_DEALS }) {
  const byCategory: Record<string, { buy: number; sell: number }> = {};
  deals.forEach(d => {
    if (!byCategory[d.category]) byCategory[d.category] = { buy: 0, sell: 0 };
    if (d.type === "BUY") byCategory[d.category].buy += d.value;
    else byCategory[d.category].sell += d.value;
  });
  const data = Object.entries(byCategory).map(([cat, v]) => ({
    cat, buy: +v.buy.toFixed(1), sell: +v.sell.toFixed(1), net: +(v.buy - v.sell).toFixed(1),
  }));
  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">Bulk Deal Flow by Category</div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <XAxis dataKey="cat" tick={{ fill: "#A09278", fontSize: 10 }} />
            <YAxis tick={{ fill: "#A09278", fontSize: 9 }} tickFormatter={v => `₹${v}Cr`} />
            <Tooltip contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
              formatter={(v: number) => [`₹${v} Cr`, ""]} />
            <Bar dataKey="buy" name="Buy" fill="#00E676" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
            <Bar dataKey="sell" name="Sell" fill="#FF1744" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4">
        {data.map(d => (
          <div key={d.cat} className="flex-1 text-center">
            <div className="text-[10px] text-ivory-600">{d.cat} Net</div>
            <div className={cn("text-sm font-mono font-bold", d.net >= 0 ? "text-signal-bull" : "text-signal-bear")}>
              {d.net >= 0 ? "+" : ""}₹{d.net}Cr
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOP STOCKS BAR ───────────────────────────────────────────
function TopStocksBar({ deals }: { deals: typeof BULK_DEALS }) {
  const byStock: Record<string, number> = {};
  deals.forEach(d => {
    byStock[d.symbol] = (byStock[d.symbol] ?? 0) + (d.type === "BUY" ? d.value : -d.value);
  });
  const data = Object.entries(byStock)
    .map(([sym, net]) => ({ sym, net: +net.toFixed(1) }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    .slice(0, 8);
  return (
    <div className="card-glass rounded-xl p-4">
      <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider mb-3">Net Institutional Flow by Stock (₹ Cr)</div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 40 }}>
            <XAxis type="number" tick={{ fill: "#A09278", fontSize: 9 }} tickFormatter={v => `₹${v}`} />
            <YAxis dataKey="sym" type="category" tick={{ fill: "#A09278", fontSize: 10 }} width={38} />
            <Tooltip contentStyle={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: "8px", fontSize: "11px" }}
              formatter={(v: number) => [`₹${v} Cr`, "Net"]} />
            <Bar dataKey="net" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.net >= 0 ? "#00E676" : "#FF1744"} fillOpacity={0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const categoryColor: Record<string, string> = {
  FII: "bg-signal-bull/15 text-signal-bull",
  MF: "bg-signal-accumulate/15 text-signal-accumulate",
  DII: "bg-gold-500/15 text-gold-500",
};

export default function BulkDeals() {
  const [tab, setTab] = useState<"bulk" | "block">("bulk");
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "BUY" | "SELL">("all");
  const [filterCat, setFilterCat] = useState<"all" | "FII" | "MF">("all");

  const filteredBulk = useMemo(() =>
    BULK_DEALS.filter(d =>
      (filterType === "all" || d.type === filterType) &&
      (filterCat === "all" || d.category === filterCat) &&
      (d.symbol.toLowerCase().includes(query.toLowerCase()) || d.client.toLowerCase().includes(query.toLowerCase()))
    ), [query, filterType, filterCat]);

  const totalBuy = BULK_DEALS.filter(d => d.type === "BUY").reduce((s, d) => s + d.value, 0);
  const totalSell = BULK_DEALS.filter(d => d.type === "SELL").reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-maroon-600" />
            Bulk & Block Deals Tracker
          </h2>
          <p className="text-xs text-ivory-500">Institutional trade registry — FII, MF, DII large deals on NSE/BSE</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-signal-bull live-dot" />
          <span className="text-xs text-signal-bull font-mono">LIVE FEED</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Buy Value", value: `₹${totalBuy.toFixed(0)} Cr`, color: "text-signal-bull" },
          { label: "Total Sell Value", value: `₹${totalSell.toFixed(0)} Cr`, color: "text-signal-bear" },
          { label: "Net Institutional", value: `₹${(totalBuy - totalSell).toFixed(0)} Cr`, color: totalBuy > totalSell ? "text-signal-bull" : "text-signal-bear" },
          { label: "Deals Today", value: BULK_DEALS.filter(d => d.date === "15-May-26").length, color: "text-gold-500" },
        ].map(k => (
          <div key={k.label} className="card-glass rounded-xl p-3 text-center">
            <div className={cn("text-xl font-mono font-bold", k.color)}>{k.value}</div>
            <div className="text-xs text-ivory-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FIIDIISummary deals={BULK_DEALS} />
        <TopStocksBar deals={BULK_DEALS} />
      </div>

      {/* Tabs + filters */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {(["bulk", "block"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border",
                tab === t ? "bg-maroon-800/40 text-maroon-300 border-maroon-800/50" : "text-ivory-600 border-transparent hover:text-ivory-300"
              )}>{t} Deals</button>
          ))}
        </div>
        {tab === "bulk" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-ivory-600" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search symbol / client..."
                className="pl-7 pr-3 py-1.5 text-xs bg-bg-card border border-bg-border rounded-lg text-ivory-200 placeholder-ivory-600 outline-none focus:border-maroon-700 w-44" />
            </div>
            {(["all", "BUY", "SELL"] as const).map(f => (
              <button key={f} onClick={() => setFilterType(f)}
                className={cn("px-2 py-1 rounded text-[11px] font-semibold uppercase transition-colors",
                  filterType === f ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
                )}>{f}</button>
            ))}
            {(["all", "FII", "MF"] as const).map(f => (
              <button key={f} onClick={() => setFilterCat(f)}
                className={cn("px-2 py-1 rounded text-[11px] font-semibold uppercase transition-colors",
                  filterCat === f ? "bg-maroon-800/40 text-maroon-300" : "text-ivory-600 hover:text-ivory-300"
                )}>{f}</button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Deals table */}
      {tab === "bulk" && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-bg-border">
                  {["Date", "Symbol", "Client / Institution", "Type", "Category", "Qty", "Price", "Value (Cr)"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBulk.map((d, i) => (
                  <tr key={i} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors">
                    <td className="px-3 py-2.5 text-[11px] text-ivory-500 font-mono">{d.date}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-xs text-ivory-100">{d.symbol}</div>
                      <div className="text-[10px] text-ivory-600">{d.exchange}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-ivory-300 max-w-48 truncate">{d.client}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("label-tag font-bold text-[11px]",
                        d.type === "BUY" ? "bg-signal-bull/15 text-signal-bull" : "bg-signal-bear/15 text-signal-bear"
                      )}>{d.type}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("label-tag text-[10px]", categoryColor[d.category] ?? "bg-ivory-800/15 text-ivory-400")}>{d.category}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-ivory-300">{(d.qty / 100000).toFixed(1)}L</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-ivory-200">₹{fmt(d.price)}</td>
                    <td className={cn("px-3 py-2.5 font-mono text-xs font-bold",
                      d.type === "BUY" ? "text-signal-bull" : "text-signal-bear")}>
                      ₹{d.value.toFixed(2)} Cr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Block Deals table */}
      {tab === "block" && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-bg-border">
                  {["Date", "Symbol", "Exchange", "Buyer", "Seller", "Qty", "Price", "Value (Cr)"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOCK_DEALS.map((d, i) => (
                  <tr key={i} className="border-b border-bg-border/40 hover:bg-bg-hover">
                    <td className="px-3 py-2.5 text-[11px] text-ivory-500 font-mono">{d.date}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-xs text-ivory-100">{d.symbol}</td>
                    <td className="px-3 py-2.5 text-[10px] text-ivory-500">{d.exchange}</td>
                    <td className="px-3 py-2.5 text-xs text-signal-bull">{d.buyer}</td>
                    <td className="px-3 py-2.5 text-xs text-ivory-400">{d.seller}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-ivory-300">{(d.qty / 100000).toFixed(1)}L</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-ivory-200">₹{fmt(d.price)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs font-bold text-gold-500">₹{d.value.toFixed(2)} Cr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
