import { NextRequest, NextResponse } from 'next/server'
import { toYahooSymbol, fetchYahooChart } from '@/lib/terminal/yahoo'

// OHLCV history via Yahoo's chart API. Finnhub's /stock/candle is paid-only,
// so this route is fully keyless.
const RANGE_MAP: Record<string, { range: string; interval: string }> = {
  '1D':  { range: '1d',  interval: '5m' },
  '5D':  { range: '5d',  interval: '15m' },
  '1M':  { range: '1mo', interval: '60m' },
  '3M':  { range: '3mo', interval: '1d' },
  '6M':  { range: '6mo', interval: '1d' },
  'YTD': { range: 'ytd', interval: '1d' },
  '1Y':  { range: '1y',  interval: '1d' },
  '5Y':  { range: '5y',  interval: '1wk' },
  'MAX': { range: 'max', interval: '1mo' },
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  const range = req.nextUrl.searchParams.get('range') || '6M'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const { range: yRange, interval } = RANGE_MAP[range] || RANGE_MAP['6M']

  try {
    const result = await fetchYahooChart(toYahooSymbol(symbol), yRange, interval, 300)
    const meta = result.meta || {}
    const timestamps = result.timestamp || []
    const q = result.indicators?.quote?.[0] || {}

    const candles = timestamps
      .map((t, i) => ({
        time: t,
        open: q.open?.[i] ?? null,
        high: q.high?.[i] ?? null,
        low: q.low?.[i] ?? null,
        close: q.close?.[i] ?? null,
        volume: q.volume?.[i] ?? 0,
      }))
      .filter(c => c.close != null && c.open != null && c.high != null && c.low != null)

    return NextResponse.json({
      symbol,
      range,
      interval,
      candles,
      meta: {
        name: meta.shortName || meta.longName || symbol,
        exchange: meta.fullExchangeName || meta.exchangeName || '',
        currency: meta.currency || 'USD',
        prevClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ symbol, range, candles: [], error: 'No candle data' }, { status: 200 })
  }
}
