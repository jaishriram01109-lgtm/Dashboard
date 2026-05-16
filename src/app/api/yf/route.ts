import { NextRequest, NextResponse } from "next/server";

// Server-side Yahoo Finance proxy — avoids browser CORS restrictions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get("symbols") ?? "";
  if (!symbols) return NextResponse.json({ error: "symbols required" }, { status: 400 });

  const fields = "regularMarketPrice,regularMarketChange,regularMarketChangePercent";
  const urls = [
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=${fields}`,
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=${fields}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)" },
        next: { revalidate: 30 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      const results = (data as any)?.quoteResponse?.result ?? [];
      if (results.length > 0) {
        return NextResponse.json(data, {
          headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
        });
      }
    } catch { continue; }
  }

  return NextResponse.json({ error: "Yahoo Finance unavailable" }, { status: 502 });
}
