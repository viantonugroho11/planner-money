import { NextRequest, NextResponse } from "next/server";

// Proxy for Yahoo Finance (no CORS for browsers, so we call it server-side).
// GET /api/market?search=bbca  -> IDX stock suggestions
// GET /api/market?symbol=BBCA.JK -> { price } in IDR
// GET /api/market?gold=1 -> { price } IDR per gram (COMEX gold x USDIDR / 31.1035)

const UA = { "User-Agent": "Mozilla/5.0" };
const TROY_OZ_GRAMS = 31.1035;

async function chartPrice(symbol: string): Promise<number | null> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
    { headers: UA, next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
  return typeof price === "number" ? price : null;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  try {
    const search = sp.get("search")?.trim();
    if (search) {
      const res = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(search)}&quotesCount=15&newsCount=0`,
        { headers: UA, next: { revalidate: 300 } }
      );
      const json = await res.json();
      const results = (json?.quotes ?? [])
        .filter((q: { symbol?: string; quoteType?: string }) => q.symbol?.endsWith(".JK") && q.quoteType === "EQUITY")
        .slice(0, 8)
        .map((q: { symbol: string; shortname?: string; longname?: string }) => ({
          symbol: q.symbol,
          ticker: q.symbol.replace(/\.JK$/, ""),
          name: q.longname ?? q.shortname ?? q.symbol,
        }));
      return NextResponse.json({ results });
    }

    const symbol = sp.get("symbol")?.trim();
    if (symbol) {
      const price = await chartPrice(symbol);
      if (price == null) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return NextResponse.json({ price });
    }

    if (sp.get("gold")) {
      const [usdOz, fx] = await Promise.all([chartPrice("GC=F"), chartPrice("USDIDR=X")]);
      if (usdOz == null || fx == null) return NextResponse.json({ error: "unavailable" }, { status: 502 });
      return NextResponse.json({ price: Math.round((usdOz * fx) / TROY_OZ_GRAMS) });
    }

    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
