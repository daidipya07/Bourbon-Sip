import { NextRequest, NextResponse } from 'next/server'
import { toYahooSymbol, toFinnhubSymbol, toFinnhubQuoteSymbol, fetchYahooChart } from '@/lib/terminal/yahoo'

const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }

interface QuoteStats {
  high52: number | null
  low52: number | null
  pe: number | null
  beta: number | null
  divYield: number | null
}

// Indices, FX, futures, crypto — Finnhub free tier can't quote these.
function isNonEquity(symbol: string): boolean {
  return /[\^=]/.test(symbol) || symbol.endsWith('-USD') || symbol.includes(':')
}

async function yahooQuote(symbol: string) {
  const result = await fetchYahooChart(toYahooSymbol(symbol), '1d', '1d', 60)
  const meta = result.meta || {}
  const price = meta.regularMarketPrice
  const prev = meta.chartPreviousClose ?? meta.previousClose
  if (price == null || prev == null || prev === 0) return null

  const q = result.indicators?.quote?.[0]
  const opens = (q?.open || []).filter((v): v is number => v != null)
  const highs = (q?.high || []).filter((v): v is number => v != null)
  const lows = (q?.low || []).filter((v): v is number => v != null)

  return {
    symbol,
    price,
    change: parseFloat((price - prev).toFixed(4)),
    pctChange: parseFloat((((price - prev) / prev) * 100).toFixed(2)),
    prevClose: prev,
    open: opens[0] ?? null,
    high: meta.regularMarketDayHigh ?? (highs.length ? Math.max(...highs) : null),
    low: meta.regularMarketDayLow ?? (lows.length ? Math.min(...lows) : null),
    name: meta.shortName || meta.longName || symbol,
    exchange: meta.fullExchangeName || meta.exchangeName || '',
    industry: '',
    marketCap: null,
    logo: null,
    stats: null,
  }
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const key = process.env.FINNHUB_API_KEY

  // Non-equity symbols (or missing Finnhub key) go straight to Yahoo,
  // with a Finnhub/Binance fallback for crypto if Yahoo is throttling
  if (isNonEquity(symbol) || !key) {
    try {
      const quote = await yahooQuote(symbol)
      if (quote) return NextResponse.json(quote, { headers: CACHE_HEADERS })
    } catch {}

    const fhCrypto = key ? toFinnhubQuoteSymbol(symbol) : null
    if (fhCrypto) {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(fhCrypto)}&token=${key}`, { next: { revalidate: 60 } })
        const q = res.ok ? await res.json() : {}
        if (q.c && q.pc) {
          return NextResponse.json({
            symbol,
            price: q.c,
            change: parseFloat((q.c - q.pc).toFixed(2)),
            pctChange: parseFloat((((q.c - q.pc) / q.pc) * 100).toFixed(2)),
            prevClose: q.pc,
            open: q.o ?? null,
            high: q.h ?? null,
            low: q.l ?? null,
            name: symbol,
            exchange: '',
            industry: '',
            marketCap: null,
            logo: null,
            stats: null,
          }, { headers: CACHE_HEADERS })
        }
      } catch {}
    }
    return NextResponse.json({ error: 'No data for symbol' }, { status: 404 })
  }

  const fhSymbol = toFinnhubSymbol(symbol)

  try {
    const [quoteRes, profileRes, metricRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(fhSymbol)}&token=${key}`, { next: { revalidate: 60 } }),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(fhSymbol)}&token=${key}`, { next: { revalidate: 3600 } }),
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(fhSymbol)}&metric=all&token=${key}`, { next: { revalidate: 3600 } }),
    ])

    const q = quoteRes.ok ? await quoteRes.json() : {}

    // Finnhub had nothing — fall back to Yahoo
    if (!q.c || q.c === 0) {
      const quote = await yahooQuote(symbol)
      if (!quote) return NextResponse.json({ error: 'No data for symbol' }, { status: 404 })
      return NextResponse.json(quote, { headers: CACHE_HEADERS })
    }

    const profile = profileRes.ok ? await profileRes.json() : {}
    const metricData = metricRes.ok ? await metricRes.json() : {}
    const m = metricData.metric || {}

    const stats: QuoteStats = {
      high52: m['52WeekHigh'] ?? null,
      low52: m['52WeekLow'] ?? null,
      pe: m['peTTM'] ?? m['peBasicExclExtraTTM'] ?? null,
      beta: m['beta'] ?? null,
      divYield: m['dividendYieldIndicatedAnnual'] ?? null,
    }
    const hasStats = Object.values(stats).some(v => v != null)

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
      name: profile.name || symbol,
      exchange: profile.exchange || '',
      industry: profile.finnhubIndustry || '',
      marketCap: profile.marketCapitalization || null,
      logo: profile.logo || null,
      stats: hasStats ? stats : null,
    }, { headers: CACHE_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
