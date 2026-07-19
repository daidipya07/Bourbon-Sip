import { NextRequest, NextResponse } from 'next/server'
import { fetchTwelveDataCandles } from '@/lib/terminal/twelvedata'

// OHLCV history via Twelve Data (Finnhub candles are paid-only, Yahoo blocks
// Vercel IPs). Charts are user-triggered, so this stays within Twelve Data's
// 800 requests/day free budget; edge-cached 5 min on top of that.
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  const range = req.nextUrl.searchParams.get('range') || '6M'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const key = process.env.TWELVE_DATA_API_KEY
  if (!key) {
    return NextResponse.json({ symbol, range, candles: [], error: 'Chart data not configured' }, { status: 200 })
  }

  try {
    const { candles, meta, error } = await fetchTwelveDataCandles(symbol, range, key)
    if (candles.length === 0) {
      return NextResponse.json({ symbol, range, candles: [], error: error || 'No candle data' }, { status: 200 })
    }
    return NextResponse.json({ symbol, range, candles, meta }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ symbol, range, candles: [], error: 'Failed to fetch candles' }, { status: 200 })
  }
}
