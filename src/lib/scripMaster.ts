// Angel One scrip master — resolves any NSE symbol to its instrument token
// Source: https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json

const SCRIP_URL =
  "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json";

interface ScripEntry {
  token: string;
  symbol: string;
  name: string;
  exch_seg: string;
  instrumenttype: string;
}

export interface SymbolToken {
  token: string;
  exchange: string;
}

let _map: Map<string, SymbolToken> | null = null;
let _loadPromise: Promise<void> | null = null;

async function doLoad(): Promise<void> {
  const urls = [
    SCRIP_URL,
    `https://corsproxy.io/?${encodeURIComponent(SCRIP_URL)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(SCRIP_URL)}`,
  ];

  let data: ScripEntry[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json();
      if (Array.isArray(json) && json.length > 100) {
        data = json as ScripEntry[];
        break;
      }
    } catch { /* try next */ }
  }

  const map = new Map<string, SymbolToken>();
  for (const e of data) {
    if (e.exch_seg === "NSE" && e.instrumenttype === "EQ" && e.token && e.symbol) {
      const sym = e.symbol.replace(/-EQ$/, "").toUpperCase();
      map.set(sym, { token: e.token, exchange: "NSE" });
    }
  }
  _map = map;
}

function ensureLoaded(): Promise<void> {
  if (_map !== null) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = doLoad().finally(() => { _loadPromise = null; });
  }
  return _loadPromise;
}

/** Fire-and-forget preload — call early in the app lifecycle so data is ready */
export function preloadScripMaster(): void {
  void ensureLoaded();
}

/**
 * Resolve a list of NSE equity symbols to their Angel One instrument tokens.
 * Returns only the symbols that were successfully resolved.
 */
export async function resolveTokens(
  symbols: string[]
): Promise<Map<string, SymbolToken>> {
  await ensureLoaded();
  const result = new Map<string, SymbolToken>();
  for (const sym of symbols) {
    const entry = _map?.get(sym.toUpperCase());
    if (entry) result.set(sym.toUpperCase(), entry);
  }
  return result;
}

export function clearScripCache(): void {
  _map = null;
}
