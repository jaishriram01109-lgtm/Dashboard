// Sections that have real/live data sources wired up
export const LIVE_SECTION_IDS = new Set<string>(["home"]);

import {
  getAngelSession, getAngelQuotes, getAngelCandles,
  INDEX_INSTRUMENTS, STOCK_INSTRUMENTS,
} from "@/lib/angelOne";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LiveQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
}

export interface IndexQuote {
  name: string;
  symbol: string;
  value: number;
  change: number;
  pct: number;
}

export interface ChartPoint { t: number; v: number }

export interface HomeData {
  indices: IndexQuote[];
  isReal: boolean;
  usdInr: number | null;
  chartData: ChartPoint[];
}

// ─── Symbol lists ─────────────────────────────────────────────────────────────
const HOME_INDEX_SYMBOLS = [
  { symbol: "^NSEI",      name: "NIFTY 50",     fallback: 22850.45 },
  { symbol: "^NSEBANK",   name: "BANK NIFTY",   fallback: 48234.60 },
  { symbol: "^BSESN",     name: "SENSEX",        fallback: 75432.10 },
  { symbol: "^CNXIT",     name: "NIFTY IT",      fallback: 38456.30 },
  { symbol: "^CNXPHARMA", name: "NIFTY PHARMA",  fallback: 21345.80 },
  { symbol: "^INDIAVIX",  name: "INDIA VIX",     fallback: 13.42    },
];

export const TICKER_SYMBOLS: { symbol: string; name: string }[] = [
  { symbol: "^NSEI",        name: "NIFTY 50"     },
  { symbol: "^BSESN",       name: "SENSEX"       },
  { symbol: "^NSEBANK",     name: "BANKNIFTY"    },
  { symbol: "^CNXIT",       name: "NIFTY IT"     },
  { symbol: "^CNXPHARMA",   name: "NIFTY PHARMA" },
  { symbol: "^CNXAUTO",     name: "NIFTY AUTO"   },
  { symbol: "RELIANCE.NS",  name: "RELIANCE"     },
  { symbol: "TCS.NS",       name: "TCS"          },
  { symbol: "HDFCBANK.NS",  name: "HDFC BK"      },
  { symbol: "INFY.NS",      name: "INFY"         },
  { symbol: "ICICIBANK.NS", name: "ICICI BK"     },
  { symbol: "BHARTIARTL.NS",name: "AIRTEL"       },
  { symbol: "WIPRO.NS",     name: "WIPRO"        },
  { symbol: "SBIN.NS",      name: "SBI"          },
  { symbol: "GC=F",         name: "GOLD"         },
  { symbol: "USDINR=X",     name: "USD/INR"      },
];

// ─── Fetch helpers ────────────────────────────────────────────────────────────
interface YFMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
}

function parseV8Meta(data: unknown, sym: { symbol: string; name: string }): LiveQuote | null {
  const meta: YFMeta = (data as any)?.chart?.result?.[0]?.meta ?? {};
  const price = meta.regularMarketPrice ?? 0;
  if (!price) return null;
  const prev = meta.previousClose ?? meta.chartPreviousClose ?? price;
  const change = meta.regularMarketChange ?? (price - prev);
  const changePct = meta.regularMarketChangePercent ?? (prev ? (change / prev) * 100 : 0);
  return { symbol: sym.symbol, name: sym.name, price, change, changePct };
}

// Try multiple Yahoo Finance endpoints for a single symbol
async function fetchSingleQuote(sym: { symbol: string; name: string }): Promise<LiveQuote | null> {
  const encoded = encodeURIComponent(sym.symbol);
  const v8Urls = [
    `https://query2.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=1d`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=1d`,
  ];

  for (const url of v8Urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const quote = parseV8Meta(data, sym);
      if (quote) return quote;
    } catch { /* try next */ }
  }

  // Last resort: public CORS proxy
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(v8Urls[0])}`;
    const res = await fetch(proxyUrl, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return parseV8Meta(data, sym);
  } catch { return null; }
}

// Batch-fetch via v7 quote API (fastest — one request for all symbols)
async function fetchBatchQuotes(
  symbols: { symbol: string; name: string }[]
): Promise<LiveQuote[]> {
  const nameMap = Object.fromEntries(symbols.map(s => [s.symbol, s.name]));
  const symsStr = symbols.map(s => s.symbol).join(",");
  const fields = "regularMarketPrice,regularMarketChange,regularMarketChangePercent";
  const batchUrls = [
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symsStr)}&fields=${fields}`,
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symsStr)}&fields=${fields}`,
  ];

  for (const url of batchUrls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const results: unknown[] = (data as any)?.quoteResponse?.result ?? [];
      if (!results.length) continue;
      const quotes = results
        .map((q: any) => ({
          symbol: q.symbol as string,
          name: nameMap[q.symbol as string] ?? (q.shortName as string) ?? (q.symbol as string),
          price: (q.regularMarketPrice as number) ?? 0,
          change: (q.regularMarketChange as number) ?? 0,
          changePct: (q.regularMarketChangePercent as number) ?? 0,
        }))
        .filter((q: LiveQuote) => q.price > 0);
      if (quotes.length) return quotes;
    } catch { /* try next */ }
  }
  return [];
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function fetchTickerQuotes(): Promise<LiveQuote[]> {
  // Angel One — highest quality
  const session = getAngelSession();
  if (session) {
    const allInst = [
      ...Object.values(INDEX_INSTRUMENTS).slice(0, 6),
      ...Object.values(STOCK_INSTRUMENTS).slice(0, 14),
    ];
    const quotes = await getAngelQuotes(session, allInst);
    if (quotes.length >= 8)
      return quotes.map(q => ({
        symbol: q.token, name: q.name, price: q.ltp,
        change: q.change, changePct: q.changePct,
      }));
  }

  // Yahoo Finance fallback — batch first
  const batch = await fetchBatchQuotes(TICKER_SYMBOLS);
  if (batch.length >= 8) return batch;

  const results = await Promise.allSettled(TICKER_SYMBOLS.map(s => fetchSingleQuote(s)));
  return results
    .filter((r): r is PromiseFulfilledResult<LiveQuote | null> => r.status === "fulfilled")
    .map(r => r.value)
    .filter((v): v is LiveQuote => v !== null);
}

function formatAngelDate(d: Date, startOfDay: boolean): string {
  const ist = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const y = ist.getFullYear();
  const mo = String(ist.getMonth() + 1).padStart(2, "0");
  const dd = String(ist.getDate()).padStart(2, "0");
  return startOfDay ? `${y}-${mo}-${dd} 09:15` : `${y}-${mo}-${dd} 15:30`;
}

export async function fetchHomeData(): Promise<HomeData> {
  // ── Angel One path ────────────────────────────────────────────────────────
  const session = getAngelSession();
  if (session) {
    const homeInst = [
      INDEX_INSTRUMENTS["NIFTY"],
      INDEX_INSTRUMENTS["BANKNIFTY"],
      { token: "1", exchange: "BSE", name: "SENSEX" },
      INDEX_INSTRUMENTS["NIFTY_IT"],
      INDEX_INSTRUMENTS["NIFTY_PHARMA"],
      INDEX_INSTRUMENTS["INDIA_VIX"],
    ];
    const [quotes, candles] = await Promise.all([
      getAngelQuotes(session, homeInst),
      getAngelCandles(
        session, "NSE", "26000", "FIVE_MINUTE",
        formatAngelDate(new Date(), true),
        formatAngelDate(new Date(), false)
      ),
    ]);

    if (quotes.length >= 4) {
      const indices: IndexQuote[] = quotes.map(q => ({
        name: q.name, symbol: q.token,
        value: q.ltp, change: q.change, pct: q.changePct,
      }));
      const usdQuote = await fetchSingleQuote({ symbol: "USDINR=X", name: "USD/INR" });
      return {
        indices,
        isReal: true,
        usdInr: usdQuote?.price ?? null,
        chartData: candles.length > 5 ? candles.map((c, i) => ({ t: i, v: c.c })) : [],
      };
    }
  }
  // ── Yahoo Finance path (fallback) ─────────────────────────────────────────
  // Batch-fetch all home indices + USDINR in one call
  const all = [...HOME_INDEX_SYMBOLS, { symbol: "USDINR=X", name: "USD/INR", fallback: 83.42 }];
  const batch = await fetchBatchQuotes(all);
  const batchMap = Object.fromEntries(batch.map(q => [q.symbol, q]));

  // Build indices — if batch had no data, try individual
  const indices: IndexQuote[] = [];
  let realCount = 0;

  for (const idx of HOME_INDEX_SYMBOLS) {
    const bq = batchMap[idx.symbol];
    if (bq && bq.price > 0) {
      realCount++;
      indices.push({ name: idx.name, symbol: idx.symbol, value: bq.price, change: bq.change, pct: bq.changePct });
    } else {
      // Try individual fetch
      const q = await fetchSingleQuote(idx);
      if (q && q.price > 0) {
        realCount++;
        indices.push({ name: idx.name, symbol: idx.symbol, value: q.price, change: q.change, pct: q.changePct });
      } else {
        indices.push({ name: idx.name, symbol: idx.symbol, value: idx.fallback, change: 0, pct: 0 });
      }
    }
  }

  // USD/INR
  const usdBq = batchMap["USDINR=X"];
  let usdInr: number | null = usdBq?.price ?? null;
  if (!usdInr) {
    const q = await fetchSingleQuote({ symbol: "USDINR=X", name: "USD/INR" });
    usdInr = q?.price ?? null;
  }

  // Nifty intraday chart
  const chartData = await fetchNiftyIntraday();

  return { indices, isReal: realCount >= 2, usdInr, chartData };
}

async function fetchNiftyIntraday(): Promise<ChartPoint[]> {
  const encoded = encodeURIComponent("^NSEI");
  const urls = [
    `https://query2.finance.yahoo.com/v8/finance/chart/${encoded}?interval=5m&range=1d`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=5m&range=1d`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const result = (data as any)?.chart?.result?.[0];
      if (!result) continue;
      const timestamps: number[] = result.timestamp ?? [];
      const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
      const points = timestamps
        .map((_, i) => ({ t: i, v: closes[i] ?? 0 }))
        .filter(p => p.v > 0);
      if (points.length > 5) return points;
    } catch { /* try next */ }
  }
  return [];
}
