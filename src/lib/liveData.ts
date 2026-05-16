const YF_V8 = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YFMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
}

export interface LiveQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
}

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

async function fetchSingleQuote(sym: { symbol: string; name: string }): Promise<LiveQuote | null> {
  try {
    const res = await fetch(
      `${YF_V8}/${encodeURIComponent(sym.symbol)}?interval=1d&range=1d`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const meta: YFMeta = data?.chart?.result?.[0]?.meta ?? {};
    const price = meta.regularMarketPrice ?? 0;
    if (!price) return null;
    const prev = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const change = meta.regularMarketChange ?? (price - prev);
    const changePct = meta.regularMarketChangePercent ?? (prev ? (change / prev) * 100 : 0);
    return { symbol: sym.symbol, name: sym.name, price, change, changePct };
  } catch {
    return null;
  }
}

export async function fetchTickerQuotes(): Promise<LiveQuote[]> {
  const results = await Promise.allSettled(
    TICKER_SYMBOLS.map(s => fetchSingleQuote(s))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<LiveQuote | null> => r.status === "fulfilled")
    .map(r => r.value)
    .filter((v): v is LiveQuote => v !== null);
}
