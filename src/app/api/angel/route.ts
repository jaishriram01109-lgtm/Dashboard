import { NextRequest, NextResponse } from "next/server";

export const dynamic = (process.env.HOSTINGER === "true" || process.env.GITHUB_PAGES === "true") ? "force-static" : "force-dynamic";

const ANGEL_BASE = "https://apiconnect.angelbroking.com";

// Server-side Angel One proxy — avoids browser CORS restrictions
export async function POST(request: NextRequest) {
  if (process.env.HOSTINGER === "true") {
    return NextResponse.json({ error: "Not available on static host" }, { status: 503 });
  }
  try {
    const { path, method = "GET", headers: clientHeaders = {}, body } = await request.json();

    if (!path || typeof path !== "string" || !path.startsWith("/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...clientHeaders,
      },
    };

    if (body && method !== "GET") {
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(`${ANGEL_BASE}${path}`, fetchOptions);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Angel One proxy failed" }, { status: 500 });
  }
}
