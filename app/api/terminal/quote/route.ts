import { NextRequest, NextResponse } from 'next/server'
import { isCrypto } from '@/lib/terminal/finnhub'
import { fetchTwelveDataQuote } from '@/lib/terminal/twelvedata'

const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }

interface QuoteStats {
  high52: number | null
  low52: number | null
  pe: number | null
  beta: number | null
  divYield: number | null
}

// Single quote with profile + key stats. Finnhub for equities/ETFs/crypto
// (works from Vercel); Twelve Data as a last-resort on-demand fallback.
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })

  const key = process.env.FINNHUB_API_KEY
  const tdKey = process.env.TWELVE_DATA_API_KEY

  if (!key) {
    if (tdKey) {
      const q = await fetchTwelveDataQuote(symbol, tdKey)
      if (q) return NextResponse.json({ ...q, marketCap: null, industry: '', logo: null, stats: null }, { headers: CACHE_HEADERS })
    }
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const crypto = isCrypto(symbol)

  try {
    const requests: Promise<Response>[] = [
      fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`, { next: { revalidate: 60 } }),
    ]
    if (!crypto) {
      requests.push(
        fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${key}`, { next: { revalidate: 3600 } }),
        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${key}`, { next: { revalidate: 3600 } }),
      )
    }

    const [quoteRes, profileRes, metricRes] = await Promise.all(requests)
    const q = quoteRes.ok ? await quoteRes.json() : {}

    if (!q.c || q.c === 0) {
      // Finnhub had nothing — try Twelve Data once
      if (tdKey) {
        const tq = await fetchTwelveDataQuote(symbol, tdKey)
        if (tq) return NextResponse.json({ ...tq, marketCap: null, industry: '', logo: null, stats: null }, { headers: CACHE_HEADERS })
      }
      return NextResponse.json({ error: 'No data for symbol' }, { status: 404 })
    }

    const profile = profileRes && profileRes.ok ? await profileRes.json() : {}
    const metricData = metricRes && metricRes.ok ? await metricRes.json() : {}
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
      pctChange: parseFloat(q.dp?.toFixed(2) ?? (((q.c - q.pc) / q.pc) * 100).toFixed(2)),
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
