"use client";
import { useState, useEffect } from "react";
import { Activity, Search, RefreshCw, Zap, TrendingUp } from "lucide-react";
import { stockData, generateLivePrice } from "@/lib/mockData";
import { cn, fmt, fmtPct, colorFromChange, scoreColor, scoreBg, signalColor, signalLabel } from "@/lib/utils";

const SCAN_TYPES = [
  { id: "breakout", label: "Breakout Ready", desc: "Stocks near key breakout zones with volume support" },
  { id: "accumulation", label: "Accumulation", desc: "Smart money quietly building positions" },
  { id: "momentum", label: "Momentum Surge", desc: "Volume + price momentum acceleration" },
  { id: "hidden_gem", label: "Hidden Gems", desc: "Undercover institutional activity before public breakout" },
  { id: "reversal", label: "Reversal Setup", desc: "Oversold stocks with smart money reversal signals" },
];

type ScanResult = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePct: number;
  aiScore: number;
  smartMoneyScore: number;
  volume: number;
  avgVolume: number;
  rsi: number;
  deliveryPct: number;
  signal: string;
  reason: string;
  conviction: number;
};

function generateScanResults(type: string): ScanResult[] {
  return stockData
    .filter(s => {
      if (type === "breakout") return s.technicals.momentumStrength >= 80 && s.changePct > 0;
      if (type === "accumulation") return s.accumulating && s.smartMoneyScore >= 70;
      if (type === "momentum") return s.technicals.volume > s.technicals.avgVolume20D * 1.8;
      if (type === "hidden_gem") return s.smartMoneyScore >= 78 && s.institutionalScore >= 70;
      if (type === "reversal") return s.technicals.rsi < 45 && s.signal !== "sell";
      return true;
    })
    .map(s => ({
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      price: s.price,
      changePct: s.changePct,
      aiScore: s.aiScore,
      smartMoneyScore: s.smartMoneyScore,
      volume: s.technicals.volume,
      avgVolume: s.technicals.avgVolume20D,
      rsi: s.technicals.rsi,
      deliveryPct: s.technicals.deliveryPct,
      signal: s.signal,
      reason: s.aiAlert ?? "AI pattern detected",
      conviction: s.aiScore,
    }));
}

export default function MomentumScanner() {
  const [activeScan, setActiveScan] = useState("breakout");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string>("");

  const runScan = () => {
    setScanning(true);
    setTimeout(() => {
      setResults(generateScanResults(activeScan));
      setLastScan(new Date().toLocaleTimeString("en-IN"));
      setScanning(false);
    }, 800);
  };

  useEffect(() => {
    runScan();
  }, [activeScan]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-maroon-600" />
            Momentum Scanner
          </h2>
          <p className="text-xs text-ivory-500">AI-powered stock scanner with institutional footprint detection</p>
        </div>
        <div className="flex items-center gap-2">
          {lastScan && <span className="text-xs text-ivory-600 font-mono">Last scan: {lastScan}</span>}
          <button
            onClick={runScan}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-maroon-800/30 border border-maroon-800/50 text-xs text-maroon-300 hover:bg-maroon-800/50 transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", scanning && "animate-spin")} />
            {scanning ? "Scanning..." : "Re-scan"}
          </button>
        </div>
      </div>

      {/* Scan type selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {SCAN_TYPES.map(scan => (
          <button
            key={scan.id}
            onClick={() => setActiveScan(scan.id)}
            className={cn(
              "rounded-xl p-3 text-left transition-all border",
              activeScan === scan.id
                ? "bg-maroon-800/25 border-maroon-700/50 glow-border-maroon"
                : "card-glass border-bg-border hover:border-bg-border"
            )}
          >
            <div className="text-xs font-semibold text-ivory-100">{scan.label}</div>
            <div className="text-[10px] text-ivory-600 mt-0.5 leading-tight">{scan.desc}</div>
          </button>
        ))}
      </div>

      {/* Scanner stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Stocks Scanned", value: "2,847", color: "text-ivory-100" },
          { label: "Matches Found", value: results.length, color: "text-signal-bull" },
          { label: "High Conviction", value: results.filter(r => r.conviction >= 80).length, color: "text-gold-500" },
          { label: "Avg AI Score", value: results.length ? Math.round(results.reduce((s, r) => s + r.aiScore, 0) / results.length) : 0, color: "text-signal-accumulate" },
          { label: "Avg SM Score", value: results.length ? Math.round(results.reduce((s, r) => s + r.smartMoneyScore, 0) / results.length) : 0, color: "text-maroon-400" },
          { label: "Scan Time", value: "0.8s", color: "text-ivory-400" },
        ].map(s => (
          <div key={s.label} className="card-glass rounded-lg p-2 text-center">
            <div className={cn("text-lg font-mono font-bold", s.color)}>{s.value}</div>
            <div className="text-[10px] text-ivory-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Results table */}
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
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-bg-border">
                  {["#", "Symbol", "Sector", "Price", "Change", "AI Score", "SM Score", "Volume×", "RSI", "Delivery", "Signal", "Reason"].map(h => (
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
                    <td className={cn("px-3 py-2.5 font-mono text-xs", colorFromChange(r.changePct))}>
                      {fmtPct(r.changePct)}
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
                    <td className={cn("px-3 py-2.5 font-mono text-xs", r.volume > r.avgVolume * 2 ? "text-signal-bull" : "text-ivory-400")}>
                      {(r.volume / r.avgVolume).toFixed(1)}x
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn(
                        "font-mono text-xs",
                        r.rsi >= 70 ? "text-signal-bear" : r.rsi >= 55 ? "text-signal-bull" : "text-yellow-400"
                      )}>{r.rsi.toFixed(1)}</span>
                    </td>
                    <td className={cn("px-3 py-2.5 font-mono text-xs", r.deliveryPct >= 65 ? "text-signal-bull" : "text-ivory-400")}>
                      {r.deliveryPct}%
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
            {scanning ? "Scanning markets..." : "No results found"}
          </div>
        )}
      </div>
    </div>
  );
}
