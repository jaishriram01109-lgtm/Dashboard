"use client";
import { useState, useEffect, useMemo } from "react";
import { Activity, RefreshCw, Zap } from "lucide-react";
import { cn, fmt, fmtPct, colorFromChange, scoreColor, scoreBg, signalColor, signalLabel } from "@/lib/utils";
import { useAngelQuotes } from "@/hooks/useAngelData";
import { calcAIScore, calcSmartMoneyScore, calcMomentumScore, dayRSI, signalFromScore, getSector } from "@/lib/angelData";
import { STOCK_INSTRUMENTS } from "@/lib/angelOne";

const SCAN_TYPES = [
  { id: "breakout",     label: "Breakout Ready",   desc: "Strong price + high volume surge" },
  { id: "accumulation", label: "Accumulation",      desc: "Smart money building positions quietly" },
  { id: "momentum",     label: "Momentum Surge",    desc: "Top movers by change% today" },
  { id: "hidden_gem",   label: "Hidden Gems",       desc: "Strong positioning, less known stocks" },
  { id: "reversal",     label: "Reversal Setup",    desc: "Negative day, possible bounce candidates" },
];

type ScanResult = {
  symbol: string; name: string; sector: string;
  price: number; changePct: number;
  aiScore: number; smartMoneyScore: number;
  volume: number; rsi: number;
  signal: string; reason: string; conviction: number;
};

export default function MomentumScanner() {
  const [activeScan, setActiveScan] = useState("breakout");
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState("");
  const { quotes, isLive, loading } = useAngelQuotes(60_000);

  // Build scan results from real quotes
  const results: ScanResult[] = useMemo(() => {
    if (quotes.size === 0) return [];

    const stockEntries = Object.entries(STOCK_INSTRUMENTS);
    const all = stockEntries
      .map(([key, inst]) => {
        const q = quotes.get(inst.token) ?? quotes.get(key);
        if (!q) return null;
        const aiScore = calcAIScore(q);
        const smScore = calcSmartMoneyScore(q);
        const rsi = dayRSI(q);
        return {
          symbol: key,
          name: inst.name,
          sector: getSector(key),
          price: q.ltp,
          changePct: q.changePct,
          aiScore,
          smartMoneyScore: smScore,
          volume: q.volume,
          rsi,
          signal: signalFromScore(aiScore),
          conviction: aiScore,
          q,
        };
      })
      .filter(Boolean) as (ScanResult & { q: any })[];

    let filtered: typeof all;
    if (activeScan === "breakout") {
      filtered = all.filter(s => s.changePct > 1.5 && s.rsi > 60);
    } else if (activeScan === "accumulation") {
      filtered = all.filter(s => s.changePct > 0 && s.changePct < 2 && s.volume > 200_000);
    } else if (activeScan === "momentum") {
      filtered = [...all].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 10);
    } else if (activeScan === "hidden_gem") {
      filtered = all.filter(s => s.smartMoneyScore >= 60 && s.aiScore >= 65 && s.changePct > 0);
    } else {
      // reversal — negative change candidates
      filtered = all.filter(s => s.changePct < -0.5 && s.rsi < 45);
    }

    return filtered
      .sort((a, b) => b.conviction - a.conviction)
      .map(s => ({
        ...s,
        reason: activeScan === "breakout" ? `Strong momentum +${s.changePct.toFixed(2)}%, RSI ${s.rsi}`
          : activeScan === "accumulation" ? `Steady buying, vol ${(s.volume / 1000).toFixed(0)}K`
          : activeScan === "momentum" ? `Top mover ${s.changePct >= 0 ? "+" : ""}${s.changePct.toFixed(2)}%`
          : activeScan === "hidden_gem" ? `AI ${s.aiScore} + SM ${s.smartMoneyScore}`
          : `Oversold RSI ${s.rsi}, watch for bounce`,
      }));
  }, [quotes, activeScan]);

  // Trigger scanning animation on scan type change
  useEffect(() => {
    setScanning(true);
    const t = setTimeout(() => {
      setScanning(false);
      setLastScan(new Date().toLocaleTimeString("en-IN"));
    }, 600);
    return () => clearTimeout(t);
  }, [activeScan, quotes]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-maroon-600" />
            Momentum Scanner
          </h2>
          <p className="text-xs text-ivory-500 flex items-center gap-1">
            {isLive
              ? <><span className="w-1.5 h-1.5 rounded-full bg-signal-bull live-dot inline-block" /> Live scan — Angel One SmartAPI</>
              : "Connect Angel One for real-time scanning"
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastScan && <span className="text-xs text-ivory-600 font-mono">Last: {lastScan}</span>}
          <span className={cn("text-[10px] px-2 py-0.5 rounded font-mono font-bold",
            isLive ? "bg-signal-bull/10 text-signal-bull" : "bg-gold-500/10 text-gold-500"
          )}>
            {isLive ? "● LIVE" : "★ DEMO"}
          </span>
        </div>
      </div>

      {/* Scan type selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {SCAN_TYPES.map(scan => (
          <button key={scan.id} onClick={() => setActiveScan(scan.id)}
            className={cn("rounded-xl p-3 text-left transition-all border",
              activeScan === scan.id
                ? "bg-maroon-800/25 border-maroon-700/50 glow-border-maroon"
                : "card-glass border-bg-border hover:border-bg-border"
            )}>
            <div className="text-xs font-semibold text-ivory-100">{scan.label}</div>
            <div className="text-[10px] text-ivory-600 mt-0.5 leading-tight">{scan.desc}</div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Stocks Scanned", value: isLive ? Object.keys(STOCK_INSTRUMENTS).length : "—", color: "text-ivory-100" },
          { label: "Matches Found", value: results.length, color: "text-signal-bull" },
          { label: "High Conviction", value: results.filter(r => r.conviction >= 75).length, color: "text-gold-500" },
          { label: "Avg AI Score", value: results.length ? Math.round(results.reduce((s, r) => s + r.aiScore, 0) / results.length) : "—", color: "text-signal-accumulate" },
          { label: "Avg SM Score", value: results.length ? Math.round(results.reduce((s, r) => s + r.smartMoneyScore, 0) / results.length) : "—", color: "text-maroon-400" },
          { label: "Data Source", value: isLive ? "LIVE" : "DEMO", color: isLive ? "text-signal-bull" : "text-gold-500" },
        ].map(s => (
          <div key={s.label} className="card-glass rounded-lg p-2 text-center">
            <div className={cn("text-lg font-mono font-bold", s.color)}>{s.value}</div>
            <div className="text-[10px] text-ivory-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-bg-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-maroon-500" />
            <span className="text-xs font-semibold text-ivory-300 uppercase tracking-wider">
              {SCAN_TYPES.find(s => s.id === activeScan)?.label} Results
            </span>
          </div>
          {scanning && (
            <div className="flex items-center gap-1.5 text-xs text-ivory-500">
              <div className="w-2 h-2 rounded-full bg-signal-bull live-dot" />
              Scanning...
            </div>
          )}
        </div>

        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-bg-border">
                  {["#", "Symbol", "Sector", "Price", "Change", "AI Score", "SM Score", "Volume", "RSI", "Signal", "AI Reason"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] text-ivory-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.symbol} className="border-b border-bg-border/50 hover:bg-bg-hover transition-colors">
                    <td className="px-3 py-2.5 text-xs text-ivory-600 font-mono">{i + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-mono font-bold text-xs text-ivory-100">{r.symbol}</div>
                      <div className="text-[10px] text-ivory-600 truncate max-w-24">{r.name}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="label-tag bg-maroon-800/15 text-maroon-400 text-[10px]">{r.sector}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-ivory-200">₹{fmt(r.price)}</td>
                    <td className={cn("px-3 py-2.5 font-mono text-xs font-bold", colorFromChange(r.changePct))}>
                      {r.changePct >= 0 ? "+" : ""}{r.changePct.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-1.5 bg-bg-border rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", scoreBg(r.aiScore))} style={{ width: `${r.aiScore}%` }} />
                        </div>
                        <span className={cn("text-xs font-mono", scoreColor(r.aiScore))}>{r.aiScore}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-xs font-mono font-bold", scoreColor(r.smartMoneyScore))}>{r.smartMoneyScore}</span>
                    </td>
                    <td className={cn("px-3 py-2.5 font-mono text-xs", r.volume > 1_000_000 ? "text-signal-bull" : "text-ivory-400")}>
                      {r.volume > 1_000_000 ? `${(r.volume / 1_000_000).toFixed(1)}M` : `${(r.volume / 1000).toFixed(0)}K`}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("font-mono text-xs",
                        r.rsi >= 70 ? "text-signal-bear" : r.rsi >= 55 ? "text-signal-bull" : "text-yellow-400"
                      )}>{r.rsi}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("label-tag border text-[10px]", signalColor(r.signal as any))}>
                        {signalLabel(r.signal as any)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-[10px] text-ivory-500 max-w-48 truncate">{r.reason}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-ivory-600 text-sm">
            {loading || scanning ? "Scanning markets..." : isLive ? "No matches for this scan" : "Connect Angel One for live scanning"}
          </div>
        )}
      </div>
    </div>
  );
}
