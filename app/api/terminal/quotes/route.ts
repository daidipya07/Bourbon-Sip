import { NextRequest, NextResponse } from 'next/server'
import { fetchFinnhubQuotes, type FinnhubQuote } from '@/lib/terminal/finnhub'
import { fetchCryptoQuotes, isCryptoSymbol } from '@/lib/terminal/crypto'

// Batch quotes. Equities/ETFs → Finnhub (60/min, works from Vercel);
// crypto → CoinGecko (keyless, one call). All terminal symbols resolve here.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('symbols')
  if (!raw) return NextResponse.json({ error: 'symbols required' }, { status: 400 })

  const key = process.env.FINNHUB_API_KEY
  const symbols = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 60)

  const cryptoSymbols = symbols.filter(isCryptoSymbol)
  const equitySymbols = symbols.filter(s => !isCryptoSymbol(s))

  const [cryptoQuotes, equityQuotes] = await Promise.all([
    cryptoSymbols.length ? fetchCryptoQuotes(cryptoSymbols) : Promise.resolve([]),
    equitySymbols.length && key ? fetchFinnhubQuotes(equitySymbols, key) : Promise.resolve([]),
  ])

  const bySymbol = new Map<string, FinnhubQuote>()
  for (const q of [...cryptoQuotes, ...equityQuotes]) bySymbol.set(q.symbol, q)

  const quotes = symbols.map(s => bySymbol.get(s) || { symbol: s, price: null, change: null, pctChange: null })

  return NextResponse.json({ quotes }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}
