"use client";
import { useEffect, useState } from "react";
import { tickerData, generateLivePrice } from "@/lib/mockData";
import { fetchTickerQuotes, type LiveQuote } from "@/lib/liveData";
import { cn } from "@/lib/utils";

interface TickerEntry {
  key: string;
  name: string;
  price: number;
  changePct: number;
}

export default function MarketTicker() {
  const [entries, setEntries] = useState<TickerEntry[]>(
    tickerData.map(t => ({ key: t.symbol, name: t.symbol, price: t.price, changePct: t.changePct }))
  );
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const load = () =>
      fetchTickerQuotes().then(quotes => {
        if (quotes.length > 0) {
          setEntries(quotes.map(q => ({ key: q.symbol, name: q.name, price: q.price, changePct: q.changePct })));
          setIsLive(true);
        }
      });

    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Animate mock prices while real data is loading
  useEffect(() => {
    if (isLive) return;
    const interval = setInterval(() => {
      setEntries(prev =>
        prev.map(e => {
          const base = tickerData.find(t => t.symbol === e.key);
          const newPrice = generateLivePrice(e.price, 0.0015);
          const basePrice = base?.price ?? newPrice;
          const changePct = ((newPrice - basePrice) / basePrice) * 100;
          return { ...e, price: newPrice, changePct };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [isLive]);

  const doubled = [...entries, ...entries];

  return (
    <div className="bg-bg-secondary border-b border-bg-border overflow-hidden ticker-fade-left h-8 flex items-center relative">
      {isLive && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-mono font-bold text-signal-bull bg-signal-bull/10 px-1.5 py-0.5 rounded z-10 pointer-events-none select-none">
          ● LIVE
        </span>
      )}
      <div className="flex whitespace-nowrap animate-[ticker_160s_linear_infinite]">
        {doubled.map((e, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-4 text-xs font-mono">
            <span className="text-ivory-300 font-semibold tracking-wide">{e.name}</span>
            <span className="text-ivory-100">
              {e.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
            <span className={cn("text-[11px]", e.changePct >= 0 ? "text-signal-bull" : "text-signal-bear")}>
              {e.changePct >= 0 ? "▲" : "▼"}{Math.abs(e.changePct).toFixed(2)}%
            </span>
            <span className="text-bg-border ml-1">│</span>
          </span>
        ))}
      </div>
    </div>
  );
}
