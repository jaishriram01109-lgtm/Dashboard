"use client";

import { useState, useMemo } from "react";
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import {
  BarChart, PieChart,
  Bar, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Holding {
  symbol: string; sector: string; buyPrice: number; currentPrice: number;
  qty: number; buyDate: string; holdingDays: number;
  gainLoss: number; gainLossPct: number; taxType: "LTCG" | "STCG";
}

const HOLDINGS: Holding[] = [
  { symbol: "RELIANCE",   sector: "Energy",    buyPrice: 2450, currentPrice: 2987, qty: 50,  buyDate: "12-Mar-24", holdingDays: 430, gainLoss: 26850,  gainLossPct: 21.9, taxType: "LTCG" },
  { symbol: "TCS",        sector: "IT",        buyPrice: 3200, currentPrice: 3890, qty: 30,  buyDate: "05-Feb-24", holdingDays: 465, gainLoss: 20700,  gainLossPct: 21.6, taxType: "LTCG" },
  { symbol: "HDFCBANK",   sector: "Finance",   buyPrice: 1520, currentPrice: 1723, qty: 80,  buyDate: "20-Nov-23", holdingDays: 542, gainLoss: 16240,  gainLossPct: 13.4, taxType: "LTCG" },
  { symbol: "ZOMATO",     sector: "Consumer",  buyPrice: 178,  currentPrice: 245,  qty: 500, buyDate: "15-Jan-25", holdingDays: 120, gainLoss: 33500,  gainLossPct: 37.6, taxType: "STCG" },
  { symbol: "BAJFINANCE", sector: "Finance",   buyPrice: 6800, currentPrice: 7234, qty: 20,  buyDate: "08-Mar-25", holdingDays: 68,  gainLoss: 8680,   gainLossPct: 6.4,  taxType: "STCG" },
  { symbol: "TATASTEEL",  sector: "Metals",    buyPrice: 1012, currentPrice: 876,  qty: 100, buyDate: "22-Apr-24", holdingDays: 389, gainLoss: -13600, gainLossPct: -13.4,taxType: "LTCG" },
  { symbol: "WIPRO",      sector: "IT",        buyPrice: 534,  currentPrice: 456,  qty: 150, buyDate: "10-Feb-25", holdingDays: 94,  gainLoss: -11700, gainLossPct: -14.6,taxType: "STCG" },
  { symbol: "SUNPHARMA",  sector: "Pharma",    buyPrice: 1345, currentPrice: 1678, qty: 40,  buyDate: "01-Aug-23", holdingDays: 653, gainLoss: 13320,  gainLossPct: 24.8, taxType: "LTCG" },
  { symbol: "PAYTM",      sector: "Fintech",   buyPrice: 612,  currentPrice: 345,  qty: 100, buyDate: "14-May-24", holdingDays: 366, gainLoss: -26700, gainLossPct: -43.6,taxType: "LTCG" },
  { symbol: "MARUTI",     sector: "Auto",      buyPrice: 10500,currentPrice: 12450,qty: 10,  buyDate: "30-Jun-24", holdingDays: 320, gainLoss: 19500,  gainLossPct: 18.6, taxType: "LTCG" },
];

const LTCG_EXEMPT = 125000;
const LTCG_RATE = 0.125;
const STCG_RATE = 0.20;

const COLORS = ["#166534", "#7c1d1d", "#d4af37", "#1e40af", "#4a2020"];

export default function TaxOptimizer() {
  const [tab, setTab] = useState<"summary" | "harvest" | "calculator">("summary");
  const [customGain, setCustomGain] = useState(500000);
  const [customType, setCustomType] = useState<"LTCG" | "STCG">("LTCG");
  const [yearsHeld, setYearsHeld] = useState(2);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const ltcgGains = HOLDINGS.filter((h) => h.taxType === "LTCG" && h.gainLoss > 0).reduce((s, h) => s + h.gainLoss, 0);
  const ltcgLosses = Math.abs(HOLDINGS.filter((h) => h.taxType === "LTCG" && h.gainLoss < 0).reduce((s, h) => s + h.gainLoss, 0));
  const stcgGains = HOLDINGS.filter((h) => h.taxType === "STCG" && h.gainLoss > 0).reduce((s, h) => s + h.gainLoss, 0);
  const stcgLosses = Math.abs(HOLDINGS.filter((h) => h.taxType === "STCG" && h.gainLoss < 0).reduce((s, h) => s + h.gainLoss, 0));

  const netLTCG = Math.max(0, ltcgGains - ltcgLosses);
  const netSTCG = Math.max(0, stcgGains - stcgLosses);
  const taxableLTCG = Math.max(0, netLTCG - LTCG_EXEMPT);
  const ltcgTax = taxableLTCG * LTCG_RATE;
  const stcgTax = netSTCG * STCG_RATE;
  const totalTax = ltcgTax + stcgTax;

  const harvestCandidates = HOLDINGS.filter((h) => h.gainLoss < 0).sort((a, b) => a.gainLoss - b.gainLoss);

  const potentialSavings = harvestCandidates.reduce((s, h) => {
    const rate = h.taxType === "LTCG" ? LTCG_RATE : STCG_RATE;
    return s + Math.abs(h.gainLoss) * rate;
  }, 0);

  const taxBreakdown = [
    { name: "LTCG Tax", value: Math.round(ltcgTax), fill: "#7c1d1d" },
    { name: "STCG Tax", value: Math.round(stcgTax), fill: "#d4af37" },
  ].filter((d) => d.value > 0);

  const holdingsBreakdown = [
    { name: "LTCG Gains", value: ltcgGains },
    { name: "LTCG Losses", value: ltcgLosses },
    { name: "STCG Gains", value: stcgGains },
    { name: "STCG Losses", value: stcgLosses },
  ];

  const calcTax = useMemo(() => {
    if (customType === "LTCG") {
      const taxable = Math.max(0, customGain - LTCG_EXEMPT);
      return { tax: taxable * LTCG_RATE, effective: (taxable * LTCG_RATE / customGain * 100).toFixed(2) };
    }
    return { tax: customGain * STCG_RATE, effective: (STCG_RATE * 100).toFixed(2) };
  }, [customGain, customType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ivory-100 tracking-wide">Tax Optimizer</h2>
          <p className="text-xs text-ivory-500 mt-0.5">LTCG 12.5% · STCG 20% · Exemption ₹1.25L · Tax-loss harvesting</p>
        </div>
        <div className="flex gap-1.5">
          {(["summary", "harvest", "calculator"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-[10px] px-3 py-1.5 rounded border capitalize transition-all ${tab === t ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500 hover:text-ivory-200"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total LTCG", value: `₹${netLTCG.toLocaleString()}`, color: "text-signal-bull", sub: `₹${taxableLTCG.toLocaleString()} taxable` },
          { label: "Total STCG", value: `₹${netSTCG.toLocaleString()}`, color: "text-gold-500",    sub: "Fully taxable" },
          { label: "Tax Liability", value: `₹${Math.round(totalTax).toLocaleString()}`, color: "text-signal-bear", sub: "FY 2024-25" },
          { label: "Harvest Savings", value: `₹${Math.round(potentialSavings).toLocaleString()}`, color: "text-signal-accumulate", sub: "If losses booked" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card-base p-3">
            <div className="text-[10px] text-ivory-600 uppercase tracking-wider">{label}</div>
            <div className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</div>
            <div className="text-[9px] text-ivory-700 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {tab === "summary" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card-base p-4">
            <div className="text-xs font-semibold text-ivory-300 mb-3">Portfolio Holdings Tax Status</div>
            <div className="grid grid-cols-7 gap-2 text-[9px] text-ivory-600 uppercase tracking-wider px-2 pb-2 border-b border-bg-border">
              {["Symbol", "Buy Px", "CMP", "Qty", "P&L", "Type", "Tax"].map((h) => <div key={h}>{h}</div>)}
            </div>
            {HOLDINGS.map((h) => {
              const taxRate = h.taxType === "LTCG" ? LTCG_RATE : STCG_RATE;
              const tax = h.gainLoss > 0 ? (h.taxType === "LTCG" ? Math.max(0, h.gainLoss - (h.gainLoss === ltcgGains ? LTCG_EXEMPT : 0)) * taxRate : h.gainLoss * taxRate) : 0;
              return (
                <div key={h.symbol} className="grid grid-cols-7 gap-2 text-[10px] px-2 py-2 border-b border-bg-border/40 hover:bg-bg-hover items-center">
                  <div className="font-bold text-ivory-100">{h.symbol}</div>
                  <div className="font-mono text-ivory-500">₹{h.buyPrice.toLocaleString()}</div>
                  <div className="font-mono text-ivory-300">₹{h.currentPrice.toLocaleString()}</div>
                  <div className="font-mono text-ivory-500">{h.qty}</div>
                  <div className={`font-mono font-semibold ${h.gainLoss >= 0 ? "text-signal-bull" : "text-signal-bear"}`}>
                    {h.gainLoss >= 0 ? "+" : ""}₹{h.gainLoss.toLocaleString()}
                  </div>
                  <div className={`text-[9px] px-1 py-0.5 rounded text-center ${h.taxType === "LTCG" ? "bg-signal-bull/15 text-signal-bull" : "bg-gold-500/15 text-gold-500"}`}>{h.taxType}</div>
                  <div className={`font-mono text-[9px] ${tax > 0 ? "text-signal-bear" : "text-signal-bull"}`}>{tax > 0 ? `₹${Math.round(tax).toLocaleString()}` : "NIL"}</div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="card-base p-4">
              <div className="text-xs font-semibold text-ivory-300 mb-3">Tax Breakdown</div>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={taxBreakdown} cx="50%" cy="50%" outerRadius={55} dataKey="value" label={({ name, value }: { name: string; value: number }) => `${name}: ₹${value.toLocaleString()}`} labelLine={false}>
                    {taxBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card-base p-4">
              <div className="text-xs font-semibold text-ivory-300 mb-3">Gains &amp; Losses Summary</div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={holdingsBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1a1a" />
                  <XAxis dataKey="name" tick={{ fill: "#8a7a6a", fontSize: 8 }} tickLine={false} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fill: "#8a7a6a", fontSize: 9 }} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: "#1a0a0a", border: "1px solid #4a2020", borderRadius: 6 }} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {holdingsBreakdown.map((d, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "harvest" && (
        <div className="card-base p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-ivory-300">Tax-Loss Harvesting Candidates</div>
            <div className="text-[10px] text-gold-500 font-semibold">Potential savings: ₹{Math.round(potentialSavings).toLocaleString()}</div>
          </div>
          <div className="text-[10px] text-ivory-600 bg-bg-primary rounded p-3 border border-bg-border">
            <AlertTriangle className="w-3 h-3 inline mr-1 text-gold-500" />
            Book losses to offset gains. Rebuy after 30+ days to avoid wash sale. STCG losses can offset STCG/LTCG gains; LTCG losses only offset LTCG gains.
          </div>
          {harvestCandidates.map((h) => {
            const saving = Math.abs(h.gainLoss) * (h.taxType === "LTCG" ? LTCG_RATE : STCG_RATE);
            return (
              <div key={h.symbol} className="flex items-center gap-4 p-3 bg-bg-primary rounded-lg border border-bg-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ivory-100">{h.symbol}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-signal-bear/20 text-signal-bear">{h.taxType} Loss</span>
                    <span className="text-[9px] text-ivory-600">{h.holdingDays}D held</span>
                  </div>
                  <div className="text-[10px] text-signal-bear font-mono mt-1">Loss: ₹{Math.abs(h.gainLoss).toLocaleString()} ({h.gainLossPct.toFixed(1)}%)</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-ivory-600">Tax saved</div>
                  <div className="text-sm font-bold font-mono text-signal-bull">₹{Math.round(saving).toLocaleString()}</div>
                </div>
                <CheckCircle className="w-4 h-4 text-signal-bull" />
              </div>
            );
          })}
        </div>
      )}

      {tab === "calculator" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="card-base p-4 space-y-4">
            <div className="text-xs font-semibold text-ivory-300">Quick Tax Calculator</div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-ivory-600 uppercase tracking-wider">Gain Amount</span>
                <span className="text-ivory-300 font-semibold font-mono">₹{customGain.toLocaleString()}</span>
              </div>
              <input type="range" min={10000} max={5000000} step={10000} value={customGain} onChange={(e) => setCustomGain(Number(e.target.value))}
                className="w-full h-1.5 rounded appearance-none bg-bg-border accent-maroon-600 cursor-pointer" />
            </div>
            <div className="flex gap-2">
              {(["LTCG", "STCG"] as const).map((t) => (
                <button key={t} onClick={() => setCustomType(t)}
                  className={`flex-1 text-[10px] py-2 rounded border transition-all ${customType === t ? "bg-maroon-800/40 border-maroon-600 text-maroon-300" : "border-bg-border text-ivory-500"}`}>
                  {t} ({t === "LTCG" ? "12.5%" : "20%"})
                </button>
              ))}
            </div>
            <div className="space-y-2 bg-bg-primary rounded-lg p-3">
              {[
                { label: "Gain Amount", value: `₹${customGain.toLocaleString()}` },
                { label: customType === "LTCG" ? "Exemption (1.25L)" : "Exemption", value: customType === "LTCG" ? `₹${Math.min(LTCG_EXEMPT, customGain).toLocaleString()}` : "NIL" },
                { label: "Taxable Gain", value: `₹${Math.max(0, customType === "LTCG" ? customGain - LTCG_EXEMPT : customGain).toLocaleString()}` },
                { label: "Tax Rate", value: customType === "LTCG" ? "12.5%" : "20%" },
                { label: "Tax Payable", value: `₹${Math.round(calcTax.tax).toLocaleString()}`, highlight: true },
                { label: "Effective Rate", value: `${calcTax.effective}%` },
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`flex justify-between text-[10px] ${highlight ? "border-t border-bg-border pt-2 mt-2" : ""}`}>
                  <span className="text-ivory-600">{label}</span>
                  <span className={`font-mono font-semibold ${highlight ? "text-signal-bear text-sm" : "text-ivory-300"}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-base p-4 space-y-3">
            <div className="text-xs font-semibold text-ivory-300">Holding Period Impact</div>
            <div className="text-[10px] text-ivory-500 bg-bg-primary rounded p-3">
              Holding &gt; 1 year converts STCG (20%) to LTCG (12.5%) with ₹1.25L exemption. Significant savings on large positions.
            </div>
            <div className="space-y-2">
              {[500000, 1000000, 2000000, 5000000].map((amt) => {
                const stcg = amt * STCG_RATE;
                const ltcg = Math.max(0, amt - LTCG_EXEMPT) * LTCG_RATE;
                const saved = stcg - ltcg;
                return (
                  <div key={amt} className="flex items-center gap-3 p-2 bg-bg-primary rounded border border-bg-border">
                    <div className="w-20 text-[10px] font-mono text-ivory-400">₹{(amt / 100000).toFixed(0)}L gain</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-[9px] text-ivory-600">
                        <span>STCG: ₹{stcg.toLocaleString()}</span>
                        <span>LTCG: ₹{ltcg.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-bg-border rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-signal-bull rounded-full" style={{ width: `${(saved / stcg) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold text-signal-bull w-20 text-right">Save ₹{saved.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
