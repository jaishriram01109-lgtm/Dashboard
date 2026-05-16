// Yahoo Finance live data fetcher — global markets, currencies, commodities, bonds

export interface YFQuote { price: number; change: number; changePct: number }

async function batchFetch(symbols: string[]): Promise<Map<string, YFQuote>> {
  const symsStr = symbols.map(encodeURIComponent).join(",");
  const fields = "regularMarketPrice,regularMarketChange,regularMarketChangePercent";
  const urls = [
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symsStr}&fields=${fields}`,
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symsStr}&fields=${fields}`,
  ];

  const parse = (data: unknown): Map<string, YFQuote> => {
    const map = new Map<string, YFQuote>();
    const results: any[] = (data as any)?.quoteResponse?.result ?? [];
    results.forEach(q => {
      if (q.regularMarketPrice)
        map.set(q.symbol, { price: q.regularMarketPrice, change: q.regularMarketChange ?? 0, changePct: q.regularMarketChangePercent ?? 0 });
    });
    return map;
  };

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const map = parse(await res.json());
      if (map.size) return map;
    } catch { /* next */ }
  }
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(urls[0])}`;
    const res = await fetch(proxyUrl, { cache: "no-store" });
    if (res.ok) { const map = parse(await res.json()); if (map.size) return map; }
  } catch { /* ignore */ }
  return new Map();
}

// ── Symbol tables ──────────────────────────────────────────────────────────
// Maps component display-symbol → Yahoo Finance symbol
export const INDEX_YF: Record<string, string> = {
  SPX: "^GSPC", NDX: "^IXIC", DJIA: "^DJI",
  UKX: "^FTSE", DAX: "^GDAXI", CAC: "^FCHI",
  NKY: "^N225", HSI: "^HSI", SHCOMP: "000001.SS",
  NIFTY: "^NSEI", SENSEX: "^BSESN",
  KOSPI: "^KS11", ASX: "^AXJO",
};

export const CURRENCY_YF: Record<string, string> = {
  "USD/INR": "USDINR=X", "DXY": "DX-Y.NYB",
  "EUR/USD": "EURUSD=X", "GBP/USD": "GBPUSD=X",
  "USD/JPY": "USDJPY=X", "USD/CNY": "USDCNY=X",
  "EUR/INR": "EURINR=X", "GBP/INR": "GBPINR=X",
  "JPY/INR": "JPYINR=X", "CNY/INR": "CNYINR=X", "AED/INR": "AEDINR=X",
};

export const COMMODITY_YF: Record<string, string> = {
  Gold: "GC=F", Silver: "SI=F",
  "Brent Crude": "BZ=F", "WTI Crude": "CL=F",
  "Natural Gas": "NG=F", Copper: "HG=F",
};

export const BOND_YF: Record<string, string> = {
  "US 10Y": "^TNX", "US 30Y": "^TYX",
  "US 5Y": "^FVX", "US 2Y": "^FVX", "US 3M": "^IRX",
  "India 10Y": "IN10YT=XX",
};

// Maps sector display-name (from sectorData.index) → Yahoo Finance symbol
export const SECTOR_YF: Record<string, string> = {
  "NIFTY IT": "^CNXIT",
  "BANK NIFTY": "^NSEBANK",
  "NIFTY PHARMA": "^CNXPHARMA",
  "NIFTY AUTO": "^CNXAUTO",
  "NIFTY METAL": "^CNXMETAL",
  "NIFTY FMCG": "^CNXFMCG",
  "NIFTY REALTY": "^CNXREALTY",
  "NIFTY ENERGY": "^CNXENERGY",
  "NIFTY PSE": "^CNXPSE",
  "NIFTY MEDIA": "^CNXMEDIA",
  "NIFTY INFRA": "^CNXINFRA",
  "NIFTY CONSUMPTION": "^CNXCONSUMPTION",
};

// ── Public fetch functions ─────────────────────────────────────────────────
export async function fetchSectorData(): Promise<Map<string, YFQuote>> {
  const unique = Array.from(new Set(Object.values(SECTOR_YF)));
  return batchFetch(unique);
}

export async function fetchGlobalMarkets(): Promise<Map<string, YFQuote>> {
  const allYF = [
    ...Object.values(INDEX_YF),
    ...Object.values(CURRENCY_YF),
    ...Object.values(COMMODITY_YF),
  ];
  return batchFetch(Array.from(new Set(allYF)));
}

export async function fetchBondYields(): Promise<Map<string, YFQuote>> {
  return batchFetch(Object.values(BOND_YF));
}

// Helper: resolve display-symbol to YFQuote from a fetched map
export function resolve(
  displaySym: string,
  yfMap: Map<string, YFQuote>,
  lookupTable: Record<string, string>
): YFQuote | null {
  const yfSym = lookupTable[displaySym];
  if (!yfSym) return null;
  return yfMap.get(yfSym) ?? null;
}
