import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  const resolution = req.nextUrl.searchParams.get('resolution') || 'D' // D, W, M, 1, 5, 15, 30, 60
  const range = req.nextUrl.searchParams.get('range') || '6M' // 1D, 5D, 1M, 3M, 6M, 1Y, 5Y

  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const key = process.env.FINNHUB_API_KEY
  if (!key) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  const now = Math.floor(Date.now() / 1000)
  const rangeMap: Record<string, number> = {
    '1D':  86400,
    '5D':  5 * 86400,
    '1M':  30 * 86400,
    '3M':  90 * 86400,
    '6M':  180 * 86400,
    '1Y':  365 * 86400,
    '5Y':  5 * 365 * 86400,
  }
  const from = now - (rangeMap[range] || rangeMap['6M'])

  // Map range to appropriate resolution if not specified
  const autoResolution: Record<string, string> = {
    '1D': '5',
    '5D': '15',
    '1M': '60',
    '3M': 'D',
    '6M': 'D',
    '1Y': 'D',
    '5Y': 'W',
  }
  const finalRes = resolution === 'auto' ? (autoResolution[range] || 'D') : resolution

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${finalRes}&from=${from}&to=${now}&token=${key}`
    )
    if (!res.ok) return NextResponse.json({ error: 'Candle fetch failed' }, { status: 502 })

    const data = await res.json()
    if (data.s !== 'ok' || !data.c) {
      return NextResponse.json({ error: 'No candle data', candles: [] }, { status: 200 })
    }

    // Transform to array of { time, open, high, low, close, volume }
    const candles = data.t.map((t: number, i: number) => ({
      time: t,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }))

    return NextResponse.json({ symbol, resolution: finalRes, range, candles }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch candles' }, { status: 500 })
  }
}
