"use client";
import { useState } from "react";
import { Star, Plus, X } from "lucide-react";
import { stockData } from "@/lib/mockData";
import { cn, fmt, fmtPct, colorFromChange, signalColor, signalLabel, scoreColor } from "@/lib/utils";
import { useAngelQuotes } from "@/hooks/useAngelData";
import { calcAIScore } from "@/lib/angelData";

// Map from mockData symbol → STOCK_INSTRUMENTS key (same symbol names)
function getLivePrice(symbol: string, quotes: ReturnType<typeof useAngelQuotes>["quotes"]) {
  return quotes.get(symbol) ?? quotes.get(symbol.toUpperCase()) ?? null;
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState(
    stockData.filter(s => s.inWatchlist).map(s => s.symbol)
  );
  const { quotes, isLive } = useAngelQuotes(30_000);

  const watchlistStocks = stockData.filter(s => watchlist.includes(s.symbol));
  const allStocks = stockData.filter(s => !watchlist.includes(s.symbol));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-ivory-100 flex items-center gap-2">
            <Star className="w-5 h-5 text-maroon-600" />
            Watchlist
          </h2>
          <p className="text-xs text-ivory-500 flex items-center gap-1">
            {isLive
              ? <><span className="w-1.5 h-1.5 rounded-full bg-signal-bull live-dot inline-block" /> Live prices from Angel One</>
              : "Connect Angel One for live prices"
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {watchlistStocks.map(stock => {
          const liveQ = getLivePrice(stock.symbol, quotes);
          const livePrice = liveQ?.ltp ?? stock.price;
          const changePct = liveQ?.changePct ?? stock.changePct;
          const change = liveQ?.change ?? (stock.price * stock.changePct / 100);
          const aiScore = liveQ ? calcAIScore(liveQ) : stock.aiScore;
          const rsi = liveQ
            ? (liveQ.high > liveQ.low ? Math.round(((liveQ.ltp - liveQ.low) / (liveQ.high - liveQ.low)) * 100) : 50)
            : stock.technicals.rsi;
          const volMultiple = liveQ && liveQ.volume > 0
            ? (liveQ.volume / 500_000).toFixed(1)
            : (stock.technicals.volume / stock.technicals.avgVolume20D).toFixed(1);

          return (
            <div key={stock.symbol} className="card-glass rounded-xl p-4 hover:glow-border-maroon transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-ivory-100">{stock.symbol}</span>
                    <span className={cn("label-tag border text-[10px]", signalColor(stock.signal))}>
                      {signalLabel(stock.signal)}
                    </span>
                    {isLive && <span className="text-[8px] font-mono text-signal-bull bg-signal-bull/10 px-1 py-0.5 rounded">LIVE</span>}
                  </div>
                  <div className="text-[10px] text-ivory-600">{stock.name}</div>
                </div>
                <button onClick={() => setWatchlist(prev => prev.filter(s => s !== stock.symbol))}
                  className="text-ivory-600 hover:text-signal-bear transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="text-xl font-mono font-bold text-ivory-100">₹{fmt(livePrice)}</div>
                  <div className={cn("text-xs font-mono", changePct >= 0 ? "text-signal-bull" : "text-signal-bear")}>
                    {changePct >= 0 ? "+" : ""}{change.toFixed(2)} ({fmtPct(changePct)})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ivory-600">AI Score</div>
                  <div className={cn("text-lg font-mono font-bold", scoreColor(aiScore))}>{aiScore}</div>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div>
                  <div className="text-ivory-600">RSI</div>
                  <div className={cn("font-mono", rsi >= 70 ? "text-signal-bear" : rsi >= 55 ? "text-signal-bull" : "text-yellow-400")}>
                    {rsi.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-ivory-600">Volume×</div>
                  <div className="font-mono text-ivory-200">{volMultiple}x</div>
                </div>
                <div>
                  <div className="text-ivory-600">High</div>
                  <div className="font-mono text-ivory-200">{liveQ ? `₹${fmt(liveQ.high)}` : "—"}</div>
                </div>
              </div>

              {stock.aiAlert && (
                <div className="mt-2 pt-2 border-t border-bg-border text-[10px] text-gold-500">
                  {stock.aiAlert}
                </div>
              )}
            </div>
          );
        })}

        <div className="card-glass rounded-xl p-4 border-2 border-dashed border-bg-border hover:border-maroon-700 transition-colors cursor-pointer flex items-center justify-center gap-2 text-ivory-600 hover:text-ivory-400 min-h-36">
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add Stock</span>
        </div>
      </div>

      {allStocks.length > 0 && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-bg-border">
            <div className="text-xs font-semibold text-ivory-400 uppercase tracking-wider">Add to Watchlist</div>
          </div>
          <div className="divide-y divide-bg-border/50">
            {allStocks.map(stock => {
              const liveQ = getLivePrice(stock.symbol, quotes);
              const changePct = liveQ?.changePct ?? stock.changePct;
              return (
                <div key={stock.symbol} className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-hover">
                  <div className="flex-1">
                    <span className="font-mono font-bold text-xs text-ivory-100 mr-2">{stock.symbol}</span>
                    <span className="text-xs text-ivory-500">{stock.name}</span>
                  </div>
                  <div className={cn("text-xs font-mono", colorFromChange(changePct))}>{fmtPct(changePct)}</div>
                  <button onClick={() => setWatchlist(prev => [...prev, stock.symbol])}
                    className="p-1.5 rounded-lg text-ivory-600 hover:text-signal-bull hover:bg-signal-bull/10 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
