import {
  getAngelSession,
  getAngelQuotes,
  getAngelHoldings,
  getAngelPositions,
  STOCK_INSTRUMENTS,
  INDEX_INSTRUMENTS,
  type AngelQuote,
} from "@/lib/angelOne";

export type QuoteMap = Map<string, AngelQuote>;

// ── Cache (30s TTL) ────────────────────────────────────────────────────────
let _cache: { quotes: QuoteMap; ts: number } | null = null;
const CACHE_TTL = 30_000;

export async function fetchAllQuotes(): Promise<{ quotes: QuoteMap; isLive: boolean }> {
  const session = getAngelSession();
  if (!session) return { quotes: new Map(), isLive: false };

  if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
    return { quotes: _cache.quotes, isLive: true };
  }

  const all = [...Object.values(INDEX_INSTRUMENTS), ...Object.values(STOCK_INSTRUMENTS)];
  const rawQuotes = await getAngelQuotes(session, all);
  if (!rawQuotes.length) return { quotes: _cache?.quotes ?? new Map(), isLive: !!_cache };

  const map: QuoteMap = new Map();
  rawQuotes.forEach(q => {
    map.set(q.token, q);
    map.set(q.name, q);
  });
  // Also index by STOCK_INSTRUMENTS key (symbol name like "RELIANCE")
  Object.entries(STOCK_INSTRUMENTS).forEach(([key, inst]) => {
    const q = map.get(inst.token);
    if (q) map.set(key, q);
  });
  Object.entries(INDEX_INSTRUMENTS).forEach(([key, inst]) => {
    const q = map.get(inst.token);
    if (q) map.set(key, q);
  });

  _cache = { quotes: map, ts: Date.now() };
  return { quotes: map, isLive: true };
}

export function invalidateCache() { _cache = null; }

// ── Score calculations from live quote ────────────────────────────────────
export function calcMomentumScore(q: AngelQuote): number {
  const change = Math.min(Math.max(q.changePct * 6, -30), 30);
  const pos = q.high > q.low ? ((q.ltp - q.low) / (q.high - q.low) - 0.5) * 20 : 0;
  return Math.round(Math.min(100, Math.max(0, 55 + change + pos)));
}

export function calcAIScore(q: AngelQuote): number {
  const mom = calcMomentumScore(q);
  const vBonus = q.volume > 1_000_000 ? 8 : q.volume > 500_000 ? 4 : q.volume > 200_000 ? 2 : 0;
  return Math.min(100, mom + vBonus);
}

export function calcSmartMoneyScore(q: AngelQuote): number {
  const pos = q.high > q.low ? ((q.ltp - q.low) / (q.high - q.low)) : 0.5;
  const base = 40 + pos * 40 + (q.changePct > 0 ? 12 : -8);
  return Math.round(Math.min(100, Math.max(0, base)));
}

// Day RSI proxy — price position within day's high-low range
export function dayRSI(q: AngelQuote): number {
  if (q.high <= q.low) return 50;
  return Math.round(((q.ltp - q.low) / (q.high - q.low)) * 100);
}

export function signalFromScore(score: number): "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell" {
  if (score >= 80) return "strong_buy";
  if (score >= 65) return "buy";
  if (score >= 40) return "neutral";
  if (score >= 25) return "sell";
  return "strong_sell";
}

// ── Portfolio ──────────────────────────────────────────────────────────────
export interface HoldingRow {
  symbol: string;
  token: string;
  qty: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
  pnlPct: number;
  currentValue: number;
  investedValue: number;
  weight: number;
}

export async function fetchHoldings(): Promise<HoldingRow[]> {
  const session = getAngelSession();
  if (!session) return [];
  const raw = await getAngelHoldings(session);
  const rows = (raw ?? [])
    .filter((h: any) => Number(h.quantity ?? h.t1Quantity ?? 0) > 0)
    .map((h: any) => {
      const qty = Number(h.quantity ?? h.t1Quantity ?? 0);
      const avgPrice = Number(h.averageprice ?? 0);
      const ltp = Number(h.ltp ?? h.close ?? 0);
      const investedValue = qty * avgPrice;
      const currentValue = qty * ltp;
      const pnl = currentValue - investedValue;
      const pnlPct = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
      return {
        symbol: (h.tradingsymbol ?? h.tradingSymbol ?? "").replace(/-EQ$/, ""),
        token: h.symboltoken ?? "",
        qty, avgPrice, ltp, pnl, pnlPct, currentValue, investedValue, weight: 0,
      };
    });
  const total = rows.reduce((s: number, r: any) => s + r.currentValue, 0);
  return rows.map((r: any) => ({ ...r, weight: total > 0 ? (r.currentValue / total) * 100 : 0 }));
}

export interface PositionRow {
  symbol: string;
  qty: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
  productType: string;
}

export async function fetchPositions(): Promise<PositionRow[]> {
  const session = getAngelSession();
  if (!session) return [];
  const raw = await getAngelPositions(session);
  return (raw ?? [])
    .filter((p: any) => Number(p.netqty ?? 0) !== 0)
    .map((p: any) => ({
      symbol: (p.tradingsymbol ?? "").replace(/-EQ$/, ""),
      qty: Number(p.netqty ?? 0),
      avgPrice: Number(p.netprice ?? p.buyavgprice ?? 0),
      ltp: Number(p.ltp ?? 0),
      pnl: Number(p.unrealisedprofit ?? 0) + Number(p.realisedprofit ?? 0),
      productType: p.producttype ?? "CNC",
    }));
}

// ── Sector map (for portfolio grouping) ───────────────────────────────────
const SECTOR_MAP: Record<string, string> = {
  RELIANCE: "Energy", ONGC: "Energy", NTPC: "Energy", POWERGRID: "Energy", ADANIENT: "Energy",
  TCS: "IT", INFY: "IT", WIPRO: "IT", HCLTECH: "IT", TECHM: "IT",
  HDFCBANK: "Banking", ICICIBANK: "Banking", SBIN: "Banking", AXISBANK: "Banking", KOTAKBANK: "Banking", BAJFINANCE: "Banking",
  SUNPHARMA: "Pharma", DRREDDY: "Pharma", CIPLA: "Pharma", DIVISLAB: "Pharma",
  TATAMOTORS: "Auto", MARUTI: "Auto", EICHERMOT: "Auto", HEROMOTOCO: "Auto",
  TATASTEEL: "Metal", JSWSTEEL: "Metal",
  HINDUNILVR: "FMCG", ITC: "FMCG", NESTLEIND: "FMCG",
  LT: "Infra", ULTRACEMCO: "Cement",
  ASIANPAINT: "Paints", TITAN: "Lifestyle",
};

export function getSector(symbol: string): string {
  return SECTOR_MAP[symbol.toUpperCase()] ?? "Other";
}
