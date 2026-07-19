import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const key = process.env.FINNHUB_API_KEY
  if (!key) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  try {
    // Fetch quote + profile in parallel
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${key}`),
    ])

    if (!quoteRes.ok) return NextResponse.json({ error: 'Quote fetch failed' }, { status: 502 })

    const q = await quoteRes.json()
    const profile = profileRes.ok ? await profileRes.json() : {}

    if (!q.c || q.c === 0) return NextResponse.json({ error: 'No data for symbol' }, { status: 404 })

    return NextResponse.json({
      symbol,
      price: q.c,
      change: parseFloat((q.c - q.pc).toFixed(2)),
      pctChange: parseFloat(q.dp?.toFixed(2) ?? '0'),
      prevClose: q.pc,
      open: q.o,
      high: q.h,
      low: q.l,
      timestamp: q.t,
      // Profile data
      name: profile.name || symbol,
      exchange: profile.exchange || '',
      industry: profile.finnhubIndustry || '',
      marketCap: profile.marketCapitalization || null,
      logo: profile.logo || null,
      weburl: profile.weburl || null,
      country: profile.country || '',
      ipo: profile.ipo || '',
      ticker: profile.ticker || symbol,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
