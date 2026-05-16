"use client";
import { useState, useEffect, useCallback } from "react";
import { getAngelSession } from "@/lib/angelOne";
import {
  fetchAllQuotes, fetchHoldings, fetchPositions,
  type QuoteMap, type HoldingRow, type PositionRow,
} from "@/lib/angelData";

export function useAngelQuotes(intervalMs = 30_000) {
  const [quotes, setQuotes] = useState<QuoteMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    const { quotes: q, isLive: live } = await fetchAllQuotes();
    if (q.size > 0) setQuotes(q);
    setIsLive(live);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, intervalMs);
    return () => clearInterval(t);
  }, [refresh, intervalMs]);

  return { quotes, loading, isLive };
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const refresh = useCallback(async () => {
    const session = getAngelSession();
    if (!session) { setLoading(false); return; }
    setHasSession(true);
    const [h, p] = await Promise.all([fetchHoldings(), fetchPositions()]);
    setHoldings(h);
    setPositions(p);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { holdings, positions, loading, hasSession, refresh };
}
