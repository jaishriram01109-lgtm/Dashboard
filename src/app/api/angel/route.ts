import { NextRequest, NextResponse } from "next/server";

const ANGEL_BASE = "https://apiconnect.angelbroking.com";

// Server-side Angel One proxy — avoids browser CORS restrictions
export async function POST(request: NextRequest) {
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
