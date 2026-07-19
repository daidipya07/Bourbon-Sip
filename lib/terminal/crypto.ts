// Crypto quotes via CoinGecko — keyless, works from Vercel, one call covers
// all pairs with 24h change. Finnhub free doesn't serve crypto spot quotes,
// and Binance geo-blocks US datacenter IPs, so CoinGecko is the reliable path.

import type { FinnhubQuote } from '@/lib/terminal/finnhub'

// Internal Binance-style symbol → CoinGecko id
const COINGECKO_IDS: Record<string, string> = {
  'BINANCE:BTCUSDT': 'bitcoin',
  'BINANCE:ETHUSDT': 'ethereum',
  'BINANCE:SOLUSDT': 'solana',
  'BINANCE:BNBUSDT': 'binancecoin',
  'BINANCE:XRPUSDT': 'ripple',
  'BINANCE:ADAUSDT': 'cardano',
  'BINANCE:DOGEUSDT': 'dogecoin',
  'BINANCE:AVAXUSDT': 'avalanche-2',
}

export function isCryptoSymbol(symbol: string): boolean {
  return symbol.includes(':')
}

export async function fetchCryptoQuotes(symbols: string[]): Promise<FinnhubQuote[]> {
  const ids = symbols.map(s => COINGECKO_IDS[s]).filter(Boolean)
  if (ids.length === 0) {
    return symbols.map(s => ({ symbol: s, price: null, change: null, pctChange: null }))
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent([...new Set(ids)].join(','))}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
    const data = await res.json()

    return symbols.map(symbol => {
      const id = COINGECKO_IDS[symbol]
      const row = id ? data[id] : null
      if (!row || row.usd == null) return { symbol, price: null, change: null, pctChange: null }
      const price = row.usd as number
      const pct = (row.usd_24h_change as number) ?? 0
      const prev = price / (1 + pct / 100)
      return {
        symbol,
        price,
        prevClose: prev,
        change: parseFloat((price - prev).toFixed(4)),
        pctChange: parseFloat(pct.toFixed(2)),
      }
    })
  } catch {
    return symbols.map(s => ({ symbol: s, price: null, change: null, pctChange: null }))
  }
}
