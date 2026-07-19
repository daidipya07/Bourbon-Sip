import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query || query.length < 1) return NextResponse.json({ results: [] })

  const key = process.env.FINNHUB_API_KEY
  if (!key) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${key}`
    )
    if (!res.ok) return NextResponse.json({ results: [] })

    const data = await res.json()

    // Filter to common stock types, limit to 12 results
    const results = (data.result || [])
      .filter((r: { type: string }) => ['Common Stock', 'ETP', 'ADR', 'ETF'].includes(r.type))
      .slice(0, 12)
      .map((r: { symbol: string; description: string; type: string; displaySymbol: string }) => ({
        symbol: r.displaySymbol || r.symbol,
        name: r.description,
        type: r.type,
      }))

    return NextResponse.json({ results }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
