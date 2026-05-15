"use client";
import { useEffect, useRef, useState } from "react";
import { tickerData, generateLivePrice } from "@/lib/mockData";
import type { TickerItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>(tickerData);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev =>
        prev.map(item => {
          const newPrice = generateLivePrice(item.price, 0.0015);
          const newChange = newPrice - (tickerData.find(t => t.symbol === item.symbol)?.price ?? newPrice);
          const newChangePct = (newChange / item.price) * 100;
          return { ...item, price: newPrice, change: newChange, changePct: newChangePct };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className="bg-bg-secondary border-b border-bg-border overflow-hidden ticker-fade-left h-8 flex items-center">
      <div className="flex whitespace-nowrap animate-[ticker_60s_linear_infinite]">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-4 text-xs font-mono">
            <span className="text-ivory-300 font-semibold tracking-wide">{item.symbol}</span>
            <span className="text-ivory-100">{item.price.toFixed(2)}</span>
            <span className={cn("text-[11px]", item.changePct >= 0 ? "text-signal-bull" : "text-signal-bear")}>
              {item.changePct >= 0 ? "▲" : "▼"}{Math.abs(item.changePct).toFixed(2)}%
            </span>
            <span className="text-bg-border ml-1">│</span>
          </span>
        ))}
      </div>
    </div>
  );
}
