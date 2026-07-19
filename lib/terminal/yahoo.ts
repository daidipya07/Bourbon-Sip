// Server-side helpers for Yahoo Finance's public chart API.
// Keyless — used for candles and batch quotes because Finnhub's free tier
// does not include /stock/candle (returns 403).

const YAHOO_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'application/json',
}

// Normalize Finnhub-style or class-share symbols to Yahoo's format.
// BINANCE:BTCUSDT → BTC-USD · OANDA:EUR_USD → EURUSD=X · BRK.B → BRK-B
// Leaves index (^GSPC), FX (EURUSD=X), and multi-letter suffixes (DX-Y.NYB) alone.
export function toYahooSymbol(sym: string): string {
  const s = sym.trim().toUpperCase()
  if (s.startsWith('BINANCE:')) {
    const pair = s.slice(8)
    return pair.endsWith('USDT') ? `${pair.slice(0, -4)}-USD` : pair
  }
  if (s.startsWith('OANDA:')) return `${s.slice(6).replace('_', '')}=X`
  return s.replace(/\.([A-Z])$/, '-$1')
}

// Yahoo class-share back to Finnhub: BRK-B → BRK.B
export function toFinnhubSymbol(sym: string): string {
  return sym.trim().toUpperCase().replace(/-([A-Z])$/, '.$1')
}

// Finnhub-quotable equivalent for fallback, or null when Finnhub's free tier
// can't quote it (indices, FX, futures). Crypto maps to Binance pairs.
export function toFinnhubQuoteSymbol(sym: string): string | null {
  const s = sym.trim().toUpperCase()
  if (s.endsWith('-USD')) return `BINANCE:${s.slice(0, -4)}USDT`
  if (/[\^=]/.test(s) || s.includes('.') || s.includes(':')) return null
  return toFinnhubSymbol(s)
}

export interface YahooChartResult {
  meta: {
    symbol?: string
    shortName?: string
    longName?: string
    fullExchangeName?: string
    exchangeName?: string
    currency?: string
    instrumentType?: string
    regularMarketPrice?: number
    chartPreviousClose?: number
    previousClose?: number
    regularMarketDayHigh?: number
    regularMarketDayLow?: number
    regularMarketVolume?: number
  }
  timestamp?: number[]
  indicators?: {
    quote?: Array<{
      open?: Array<number | null>
      high?: Array<number | null>
      low?: Array<number | null>
      close?: Array<number | null>
      volume?: Array<number | null>
    }>
  }
}

export interface SparkQuote {
  price: number | null
  prevClose: number | null
}

// Batch quotes via the spark endpoint — up to 20 symbols per HTTP request,
// which keeps us far under Yahoo's burst limits.
export async function fetchYahooSparkBatch(
  yahooSymbols: string[],
  revalidate: number
): Promise<Map<string, SparkQuote>> {
  const out = new Map<string, SparkQuote>()
  const chunks: string[][] = []
  for (let i = 0; i < yahooSymbols.length; i += 20) chunks.push(yahooSymbols.slice(i, i + 20))

  await Promise.all(chunks.map(async chunk => {
    try {
      const path = `/v8/finance/spark?symbols=${encodeURIComponent(chunk.join(','))}&range=1d&interval=1d`
      let res = await fetch(`https://query1.finance.yahoo.com${path}`, {
        headers: YAHOO_HEADERS,
        next: { revalidate },
      })
      if (!res.ok) {
        res = await fetch(`https://query2.finance.yahoo.com${path}`, {
          headers: YAHOO_HEADERS,
          next: { revalidate },
        })
      }
      if (!res.ok) return
      const json = await res.json()
      for (const r of json?.spark?.result || []) {
        const meta = r?.response?.[0]?.meta
        if (!meta || !r.symbol) continue
        out.set(r.symbol, {
          price: meta.regularMarketPrice ?? null,
          prevClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
        })
      }
    } catch {
      // chunk failed — callers fall back per-symbol
    }
  }))

  return out
}

export async function fetchYahooChart(
  yahooSymbol: string,
  range: string,
  interval: string,
  revalidate: number
): Promise<YahooChartResult> {
  const path = `/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${range}&interval=${interval}&includePrePost=false`
  let res = await fetch(`https://query1.finance.yahoo.com${path}`, {
    headers: YAHOO_HEADERS,
    next: { revalidate },
  })
  if (!res.ok) {
    res = await fetch(`https://query2.finance.yahoo.com${path}`, {
      headers: YAHOO_HEADERS,
      next: { revalidate },
    })
  }
  if (!res.ok) throw new Error(`Yahoo chart ${res.status} for ${yahooSymbol}`)
  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error(`No chart result for ${yahooSymbol}`)
  return result as YahooChartResult
}
