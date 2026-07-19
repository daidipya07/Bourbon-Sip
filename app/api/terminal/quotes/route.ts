import { NextRequest, NextResponse } from 'next/server'
import { toYahooSymbol, toFinnhubQuoteSymbol, fetchYahooSparkBatch } from '@/lib/terminal/yahoo'

interface Quote {
  symbol: string
  price: number | null
  prevClose?: number
  change: number | null
  pctChange: number | null
}

function buildQuote(symbol: string, price: number, prev: number): Quote {
  const change = price - prev
  return {
    symbol,
    price,
    prevClose: prev,
    change: parseFloat(change.toFixed(4)),
    pctChange: parseFloat(((change / prev) * 100).toFixed(2)),
  }
}

// Batch quotes: Yahoo spark first (one request per 20 symbols — supports
// indices, FX, futures, crypto), then Finnhub per-symbol fallback for
// anything Yahoo missed. One client request per panel.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('symbols')
  if (!raw) return NextResponse.json({ error: 'symbols required' }, { status: 400 })

  const symbols = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 60)
  const sparkMap = await fetchYahooSparkBatch(symbols.map(toYahooSymbol), 60)
  const key = process.env.FINNHUB_API_KEY

  const quotes: Quote[] = await Promise.all(
    symbols.map(async original => {
      const y = sparkMap.get(toYahooSymbol(original))
      if (y?.price != null && y.prevClose != null && y.prevClose !== 0) {
        return buildQuote(original, y.price, y.prevClose)
      }

      const fhSymbol = toFinnhubQuoteSymbol(original)
      if (fhSymbol && key) {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(fhSymbol)}&token=${key}`,
            { next: { revalidate: 60 } }
          )
          if (res.ok) {
            const q = await res.json()
            if (q.c && q.pc) return buildQuote(original, q.c, q.pc)
          }
        } catch {}
      }

      return { symbol: original, price: null, change: null, pctChange: null }
    })
  )

  return NextResponse.json({ quotes }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}
