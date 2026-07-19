import { NextRequest, NextResponse } from 'next/server'
import { fetchFinnhubQuotes } from '@/lib/terminal/finnhub'

// Batch quotes via Finnhub (60/min, no daily cap, works from Vercel).
// All terminal symbols are Finnhub-quotable equities/ETFs/crypto.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('symbols')
  if (!raw) return NextResponse.json({ error: 'symbols required' }, { status: 400 })

  const key = process.env.FINNHUB_API_KEY
  if (!key) return NextResponse.json({ quotes: [] })

  const symbols = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 60)
  const quotes = await fetchFinnhubQuotes(symbols, key)

  return NextResponse.json({ quotes }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}
