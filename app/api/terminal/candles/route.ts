import { NextRequest, NextResponse } from 'next/server'
import { fetchTwelveDataCandles, TD_RANGE_MAP } from '@/lib/terminal/twelvedata'

// Twelve Data interval → normalized bar interval used by client-side stats.
const INTERVAL_MAP: Record<string, string> = {
  '5min': '5m', '15min': '15m', '30min': '30m', '1h': '60m',
  '1day': '1d', '1week': '1wk', '1month': '1mo',
}

// OHLCV history via Twelve Data (Finnhub candles are paid-only, Yahoo blocks
// Vercel IPs). Charts are user-triggered, so this stays within Twelve Data's
// 800 requests/day free budget; edge-cached 5 min on top of that.
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  const range = req.nextUrl.searchParams.get('range') || '6M'
  // adjust=all → dividend-adjusted (total-return) closes; default split-adjusted
  const adjust = req.nextUrl.searchParams.get('adjust') === 'all' ? 'all' : 'splits'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const key = process.env.TWELVE_DATA_API_KEY
  if (!key) {
    return NextResponse.json({ symbol, range, candles: [], error: 'Chart data not configured' }, { status: 200 })
  }

  try {
    const { candles, meta, error } = await fetchTwelveDataCandles(symbol, range, key, adjust)
    if (candles.length === 0) {
      return NextResponse.json({ symbol, range, candles: [], error: error || 'No candle data' }, { status: 200 })
    }
    const tdInterval = (TD_RANGE_MAP[range] || TD_RANGE_MAP['6M']).interval
    return NextResponse.json({ symbol, range, interval: INTERVAL_MAP[tdInterval] || '1d', candles, meta }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ symbol, range, candles: [], error: 'Failed to fetch candles' }, { status: 200 })
  }
}
