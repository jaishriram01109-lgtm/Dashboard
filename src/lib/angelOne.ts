const ANGEL_BASE = "https://apiconnect.angelbroking.com";
export const ANGEL_API_KEY = "l6A6Prbb";
export const ANGEL_CLIENT_ID = "A329549";

// ─── Session management ────────────────────────────────────────────────────
export interface AngelSession {
  jwtToken: string;
  feedToken: string;
  refreshToken: string;
}

let _session: AngelSession | null = null;

export function getAngelSession(): AngelSession | null {
  if (_session) return _session;
  try {
    const stored = sessionStorage.getItem("angel_session");
    const ts = sessionStorage.getItem("angel_session_ts");
    if (!stored || !ts) return null;
    if (Date.now() - Number(ts) > 23 * 3600 * 1000) {
      clearAngelSession();
      return null;
    }
    _session = JSON.parse(stored);
    return _session;
  } catch { return null; }
}

export function clearAngelSession() {
  _session = null;
  sessionStorage.removeItem("angel_session");
  sessionStorage.removeItem("angel_session_ts");
  sessionStorage.removeItem("angel_skipped");
}

export function isLoginSkipped() {
  return sessionStorage.getItem("angel_skipped") === "1";
}

export function setLoginSkipped() {
  sessionStorage.setItem("angel_skipped", "1");
}

async function getPublicIP(): Promise<string> {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const d = await r.json();
    return d.ip ?? "127.0.0.1";
  } catch { return "127.0.0.1"; }
}

export async function loginAngelOne(
  password: string,
  totp: string
): Promise<{ session: AngelSession | null; error: string }> {
  try {
    const ip = await getPublicIP();
    const res = await fetch(
      `${ANGEL_BASE}/rest/auth/angelbroking/user/v1/loginByPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-ClientLocalIP": ip,
          "X-ClientPublicIP": ip,
          "X-MACAddress": "00:00:00:00:00:00",
          "X-PrivateKey": ANGEL_API_KEY,
        },
        body: JSON.stringify({ clientcode: ANGEL_CLIENT_ID, password, totp }),
      }
    );
    const data = await res.json();
    if (!data.status || !data.data?.jwtToken) {
      return { session: null, error: data.message ?? "Login failed" };
    }
    const session: AngelSession = {
      jwtToken: data.data.jwtToken,
      feedToken: data.data.feedToken ?? "",
      refreshToken: data.data.refreshToken ?? "",
    };
    _session = session;
    sessionStorage.setItem("angel_session", JSON.stringify(session));
    sessionStorage.setItem("angel_session_ts", Date.now().toString());
    return { session, error: "" };
  } catch (e) {
    return { session: null, error: "Network error. Check internet connection." };
  }
}

// ─── Instrument tokens ─────────────────────────────────────────────────────
export interface Instrument {
  token: string;
  exchange: string;
  name: string;
}

export const INDEX_INSTRUMENTS: Record<string, Instrument> = {
  "NIFTY":       { token: "26000", exchange: "NSE", name: "NIFTY 50"     },
  "BANKNIFTY":   { token: "26009", exchange: "NSE", name: "BANK NIFTY"   },
  "FINNIFTY":    { token: "26037", exchange: "NSE", name: "FIN NIFTY"    },
  "MIDCPNIFTY":  { token: "26074", exchange: "NSE", name: "MIDCAP NIFTY" },
  "INDIA_VIX":   { token: "26017", exchange: "NSE", name: "INDIA VIX"    },
  "NIFTY_IT":    { token: "26011", exchange: "NSE", name: "NIFTY IT"     },
  "NIFTY_PHARMA":{ token: "26013", exchange: "NSE", name: "NIFTY PHARMA" },
  "NIFTY_AUTO":  { token: "26003", exchange: "NSE", name: "NIFTY AUTO"   },
  "NIFTY_FMCG":  { token: "26014", exchange: "NSE", name: "NIFTY FMCG"  },
  "NIFTY_METAL": { token: "26015", exchange: "NSE", name: "NIFTY METAL"  },
  "NIFTY_REALTY":{ token: "26018", exchange: "NSE", name: "NIFTY REALTY" },
  "NIFTY_ENERGY":{ token: "26029", exchange: "NSE", name: "NIFTY ENERGY" },
  "NIFTY_MID":   { token: "26028", exchange: "NSE", name: "NIFTY MID"    },
};

export const STOCK_INSTRUMENTS: Record<string, Instrument> = {
  "RELIANCE":   { token: "2885",  exchange: "NSE", name: "RELIANCE"   },
  "TCS":        { token: "11536", exchange: "NSE", name: "TCS"        },
  "HDFCBANK":   { token: "1333",  exchange: "NSE", name: "HDFC BK"    },
  "INFY":       { token: "1594",  exchange: "NSE", name: "INFY"       },
  "ICICIBANK":  { token: "4963",  exchange: "NSE", name: "ICICI BK"   },
  "BHARTIARTL": { token: "10604", exchange: "NSE", name: "AIRTEL"     },
  "WIPRO":      { token: "3787",  exchange: "NSE", name: "WIPRO"      },
  "SBIN":       { token: "3045",  exchange: "NSE", name: "SBI"        },
  "BAJFINANCE": { token: "317",   exchange: "NSE", name: "BAJ FIN"    },
  "KOTAKBANK":  { token: "1922",  exchange: "NSE", name: "KOTAK BK"   },
  "LT":         { token: "11483", exchange: "NSE", name: "L&T"        },
  "AXISBANK":   { token: "5900",  exchange: "NSE", name: "AXIS BK"    },
  "ITC":        { token: "1660",  exchange: "NSE", name: "ITC"        },
  "MARUTI":     { token: "10999", exchange: "NSE", name: "MARUTI"     },
  "HINDUNILVR": { token: "1394",  exchange: "NSE", name: "HUL"        },
  "ASIANPAINT": { token: "236",   exchange: "NSE", name: "ASIANPAINT" },
  "TITAN":      { token: "3506",  exchange: "NSE", name: "TITAN"      },
  "SUNPHARMA":  { token: "3351",  exchange: "NSE", name: "SUN PHARMA" },
  "DRREDDY":    { token: "881",   exchange: "NSE", name: "DR REDDY"   },
  "HCLTECH":    { token: "7229",  exchange: "NSE", name: "HCL TECH"   },
  "TECHM":      { token: "13538", exchange: "NSE", name: "TECH M"     },
  "ONGC":       { token: "2475",  exchange: "NSE", name: "ONGC"       },
  "NTPC":       { token: "11630", exchange: "NSE", name: "NTPC"       },
  "POWERGRID":  { token: "14977", exchange: "NSE", name: "POWERGRID"  },
  "TATASTEEL":  { token: "3499",  exchange: "NSE", name: "TATA STEEL" },
  "TATAMOTORS": { token: "3456",  exchange: "NSE", name: "TATA MOT"   },
  "JSWSTEEL":   { token: "11723", exchange: "NSE", name: "JSW STEEL"  },
  "ADANIENT":   { token: "25",    exchange: "NSE", name: "ADANI ENT"  },
  "CIPLA":      { token: "694",   exchange: "NSE", name: "CIPLA"      },
  "DIVISLAB":   { token: "10940", exchange: "NSE", name: "DIVIS LAB"  },
  "EICHERMOT":  { token: "910",   exchange: "NSE", name: "EICHER"     },
  "HEROMOTOCO": { token: "1348",  exchange: "NSE", name: "HERO MOTO"  },
  "ULTRACEMCO": { token: "11532", exchange: "NSE", name: "ULTRACEM"   },
  "NESTLEIND":  { token: "17963", exchange: "NSE", name: "NESTLE"     },
};

// ─── Quote fetch ───────────────────────────────────────────────────────────
export interface AngelQuote {
  token: string;
  name: string;
  ltp: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function buildHeaders(session: AngelSession): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${session.jwtToken}`,
    "X-UserType": "USER",
    "X-SourceID": "WEB",
    "X-ClientLocalIP": "127.0.0.1",
    "X-ClientPublicIP": "127.0.0.1",
    "X-MACAddress": "00:00:00:00:00:00",
    "X-PrivateKey": ANGEL_API_KEY,
  };
}

export async function getAngelQuotes(
  session: AngelSession,
  instruments: Instrument[]
): Promise<AngelQuote[]> {
  // Group tokens by exchange
  const byExchange: Record<string, string[]> = {};
  const tokenNameMap: Record<string, string> = {};

  for (const inst of instruments) {
    if (!byExchange[inst.exchange]) byExchange[inst.exchange] = [];
    byExchange[inst.exchange].push(inst.token);
    tokenNameMap[inst.token] = inst.name;
  }

  try {
    const res = await fetch(
      `${ANGEL_BASE}/rest/secure/angelbroking/market/v1/quote/`,
      {
        method: "POST",
        headers: buildHeaders(session),
        body: JSON.stringify({ mode: "FULL", exchangeTokens: byExchange }),
      }
    );
    const data = await res.json();
    if (!data.status) return [];

    return (data.data?.fetched ?? []).map((q: any) => {
      const ltp   = Number(q.ltp)   || 0;
      const close = Number(q.close) || ltp;
      const chg   = ltp - close;
      const chgPct = close ? (chg / close) * 100 : 0;
      return {
        token:    q.symbolToken ?? q.token,
        name:     tokenNameMap[q.symbolToken ?? q.token] ?? q.tradingSymbol,
        ltp,
        change:   chg,
        changePct: chgPct,
        open:   Number(q.open)  || 0,
        high:   Number(q.high)  || 0,
        low:    Number(q.low)   || 0,
        close,
        volume: Number(q.tradeVolume) || 0,
      };
    });
  } catch { return []; }
}

// ─── Historical candles ────────────────────────────────────────────────────
export async function getAngelCandles(
  session: AngelSession,
  exchange: string,
  symboltoken: string,
  interval: "ONE_MINUTE" | "FIVE_MINUTE" | "FIFTEEN_MINUTE" | "ONE_DAY",
  fromDate: string,
  toDate: string
): Promise<{ t: number; o: number; h: number; l: number; c: number; v: number }[]> {
  try {
    const res = await fetch(
      `${ANGEL_BASE}/rest/secure/angelbroking/historical/v1/getCandleData`,
      {
        method: "POST",
        headers: buildHeaders(session),
        body: JSON.stringify({ exchange, symboltoken, interval, fromdate: fromDate, todate: toDate }),
      }
    );
    const data = await res.json();
    if (!data.status || !data.data) return [];
    return (data.data as any[][]).map((c, i) => ({
      t: i, o: c[1], h: c[2], l: c[3], c: c[4], v: c[5]
    }));
  } catch { return []; }
}

// ─── Portfolio ─────────────────────────────────────────────────────────────
export async function getAngelHoldings(session: AngelSession) {
  try {
    const res = await fetch(
      `${ANGEL_BASE}/rest/secure/angelbroking/portfolio/v1/holdings`,
      { headers: buildHeaders(session) }
    );
    const data = await res.json();
    return data.data ?? [];
  } catch { return []; }
}

export async function getAngelPositions(session: AngelSession) {
  try {
    const res = await fetch(
      `${ANGEL_BASE}/rest/secure/angelbroking/order/v1/getPosition`,
      { headers: buildHeaders(session) }
    );
    const data = await res.json();
    return data.data ?? [];
  } catch { return []; }
}

// ─── Options chain ─────────────────────────────────────────────────────────
export async function getAngelOptionChain(
  session: AngelSession,
  name: "NIFTY" | "BANKNIFTY" | "FINNIFTY",
  expiryDate: string, // "25JUN2025"
  strikePrice: number
) {
  try {
    const res = await fetch(
      `${ANGEL_BASE}/rest/secure/angelbroking/derivatives/v1/getCandleData`,
      {
        method: "POST",
        headers: buildHeaders(session),
        body: JSON.stringify({ name, expirydate: expiryDate, strikeprice: strikePrice.toString() }),
      }
    );
    const data = await res.json();
    return data.data ?? null;
  } catch { return null; }
}
