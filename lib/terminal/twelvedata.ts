// Twelve Data helpers — used ONLY for candles/time-series (charts).
// Free tier is 800 requests/day, so it must never be used for polling quotes;
// live quotes go through Finnhub (see lib/terminal/finnhub.ts). Charts are
// user-triggered and low-volume, which fits the daily budget.

const TD_BASE = 'https://api.twelvedata.com'

// Map an internal app symbol to Twelve Data's symbol convention.
// Equities/ETFs pass through. Finnhub crypto (BINANCE:BTCUSDT) → BTC/USD.
// Class shares (BRK.B) stay dotted, which Twelve Data accepts.
export function toTwelveDataSymbol(sym: string): string {
  const s = sym.trim().toUpperCase()
  if (s.startsWith('BINANCE:')) {
    const pair = s.slice(8)
    return pair.endsWith('USDT') ? `${pair.slice(0, -4)}/USD` : pair
  }
  if (s.includes(':')) return s.split(':')[1]
  return s
}

export interface TDCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// interval + outputsize per UI range. Twelve Data charges 1 credit per call
// regardless of outputsize, so we pull generous history in one request.
export const TD_RANGE_MAP: Record<string, { interval: string; outputsize: number }> = {
  '1D':  { interval: '5min',   outputsize: 78 },
  '5D':  { interval: '15min',  outputsize: 130 },
  '1M':  { interval: '1h',     outputsize: 150 },
  '3M':  { interval: '1day',   outputsize: 66 },
  '6M':  { interval: '1day',   outputsize: 130 },
  'YTD': { interval: '1day',   outputsize: 250 },
  '1Y':  { interval: '1day',   outputsize: 252 },
  '5Y':  { interval: '1week',  outputsize: 260 },
  'MAX': { interval: '1month', outputsize: 240 },
}

interface TDTimeSeriesValue {
  datetime: string
  open: string
  high: string
  low: string
  close: string
  volume?: string
}

export interface TDCandleResult {
  candles: TDCandle[]
  meta: { name: string; exchange: string; currency: string } | null
  error?: string
}

export async function fetchTwelveDataCandles(
  symbol: string,
  range: string,
  apiKey: string
): Promise<TDCandleResult> {
  const { interval, outputsize } = TD_RANGE_MAP[range] || TD_RANGE_MAP['6M']
  const tdSymbol = toTwelveDataSymbol(symbol)

  const url =
    `${TD_BASE}/time_series?symbol=${encodeURIComponent(tdSymbol)}` +
    `&interval=${interval}&outputsize=${outputsize}&order=ASC&apikey=${apiKey}`

  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) return { candles: [], meta: null, error: `Twelve Data ${res.status}` }

  const data = await res.json()
  // Twelve Data returns { status: "error", message } on failure
  if (data.status === 'error' || !Array.isArray(data.values)) {
    return { candles: [], meta: null, error: data.message || 'No time series' }
  }

  const candles: TDCandle[] = (data.values as TDTimeSeriesValue[])
    .map(v => ({
      time: Math.floor(new Date(v.datetime.replace(' ', 'T') + 'Z').getTime() / 1000),
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
      volume: v.volume ? parseFloat(v.volume) : 0,
    }))
    .filter(c => Number.isFinite(c.close) && Number.isFinite(c.open))
    .sort((a, b) => a.time - b.time)

  const m = data.meta || {}
  return {
    candles,
    meta: { name: m.symbol || tdSymbol, exchange: m.exchange || '', currency: m.currency || 'USD' },
  }
}

// On-demand single quote fallback (1 credit) for symbols Finnhub can't cover.
export async function fetchTwelveDataQuote(symbol: string, apiKey: string) {
  const tdSymbol = toTwelveDataSymbol(symbol)
  const res = await fetch(
    `${TD_BASE}/quote?symbol=${encodeURIComponent(tdSymbol)}&apikey=${apiKey}`,
    { next: { revalidate: 300 } }
  )
  if (!res.ok) return null
  const q = await res.json()
  if (q.status === 'error' || q.close == null) return null

  const price = parseFloat(q.close)
  const prev = parseFloat(q.previous_close)
  if (!Number.isFinite(price) || !Number.isFinite(prev) || prev === 0) return null

  return {
    symbol,
    price,
    change: parseFloat((price - prev).toFixed(4)),
    pctChange: parseFloat((((price - prev) / prev) * 100).toFixed(2)),
    prevClose: prev,
    open: q.open ? parseFloat(q.open) : null,
    high: q.high ? parseFloat(q.high) : null,
    low: q.low ? parseFloat(q.low) : null,
    name: q.name || symbol,
    exchange: q.exchange || '',
  }
}
