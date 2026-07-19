// Finnhub is the workhorse for live quotes — 60 calls/min, no daily cap on the
// free tier, and it works from Vercel's datacenter IPs (Yahoo does not).
// The terminal's symbol universe is chosen so everything here is quotable on
// the free tier: US equities, ETFs (used as index/FX/global proxies), and
// crypto via Binance pairs.

const FH_BASE = 'https://finnhub.io/api/v1'

export interface FinnhubQuote {
  symbol: string
  price: number | null
  change: number | null
  pctChange: number | null
  prevClose?: number
}

// Company-news / profile endpoints want the raw ticker; crypto has neither.
export function isCrypto(symbol: string): boolean {
  return symbol.includes(':')
}

// Symbol used for company-news lookups (null when it has none).
export function toNewsSymbol(symbol: string): string | null {
  if (isCrypto(symbol)) return null
  return symbol.trim().toUpperCase()
}

export async function fetchFinnhubQuote(symbol: string, key: string): Promise<FinnhubQuote> {
  try {
    const res = await fetch(
      `${FH_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return { symbol, price: null, change: null, pctChange: null }
    const q = await res.json()
    if (!q.c || !q.pc) return { symbol, price: null, change: null, pctChange: null }
    const change = q.c - q.pc
    return {
      symbol,
      price: q.c,
      prevClose: q.pc,
      change: parseFloat(change.toFixed(4)),
      pctChange: parseFloat(((change / q.pc) * 100).toFixed(2)),
    }
  } catch {
    return { symbol, price: null, change: null, pctChange: null }
  }
}

// Batch quotes: Finnhub has no batch endpoint on free tier, so we fan out
// with bounded concurrency to respect the 60/min ceiling.
export async function fetchFinnhubQuotes(symbols: string[], key: string): Promise<FinnhubQuote[]> {
  const out: FinnhubQuote[] = []
  const BATCH = 10
  for (let i = 0; i < symbols.length; i += BATCH) {
    const chunk = symbols.slice(i, i + BATCH)
    const results = await Promise.all(chunk.map(s => fetchFinnhubQuote(s, key)))
    out.push(...results)
  }
  return out
}
