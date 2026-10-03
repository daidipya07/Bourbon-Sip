// Builds the factual DATA CONTEXT block handed to the AI analyst. Pure and
// null-safe: any source may be missing (free-tier gaps, crypto, outages) — those
// sections are omitted or marked unavailable rather than invented. The model is
// instructed that this block is the ONLY set of facts it may cite.

import type { TechnicalRead } from './technical-read'

export interface AnalystQuote {
  price: number | null
  change: number | null
  pctChange: number | null
}

export interface AnalystMetrics {
  marketCap: number | null
  pe: number | null
  beta: number | null
  high52: number | null
  low52: number | null
  revenueGrowth: number | null
  epsGrowth: number | null
  grossMargin: number | null
  netMargin: number | null
  roe: number | null
}

export interface AnalystConsensus {
  strongBuy: number
  buy: number
  hold: number
  sell: number
  strongSell: number
}

export interface AnalystNewsItem {
  headline: string
  source: string
  datetime: number
}

export interface AnalystData {
  symbol: string
  name?: string | null
  isCrypto: boolean
  read: TechnicalRead | null
  quote: AnalystQuote | null
  metrics: AnalystMetrics | null
  consensus: AnalystConsensus | null
  news: AnalystNewsItem[]
}

function num(n: number | null | undefined, suffix = '', dec = 2): string {
  if (n == null || !Number.isFinite(n)) return 'unavailable'
  return `${n.toFixed(dec)}${suffix}`
}

function marketCap(m: number | null): string {
  if (m == null || !Number.isFinite(m)) return 'unavailable'
  if (m >= 1_000_000) return `$${(m / 1_000_000).toFixed(2)}T`
  if (m >= 1_000) return `$${(m / 1_000).toFixed(1)}B`
  return `$${m.toFixed(0)}M`
}

function dateStr(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function buildAnalystContext(data: AnalystData): string {
  const { symbol, name, isCrypto, read, quote, metrics, consensus, news } = data
  const lines: string[] = []

  const asOf = read ? ` — technicals as of ${dateStr(read.asOf)} close` : ''
  lines.push(`DATA CONTEXT for ${symbol}${name ? ` (${name})` : ''}${asOf}`)
  lines.push(`These figures are from live market-data feeds (Finnhub, Twelve Data). Treat them as the ONLY facts you may cite. Do not invent any other numbers, prices, dates, or headlines.`)
  lines.push('')

  // Price
  if (quote?.price != null) {
    const chg = quote.pctChange != null ? ` (${quote.pctChange >= 0 ? '+' : ''}${quote.pctChange.toFixed(2)}% today)` : ''
    lines.push(`PRICE: ${quote.price >= 1 ? '$' + quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$' + quote.price.toFixed(4)}${chg}`)
  } else {
    lines.push('PRICE: unavailable')
  }
  lines.push('')

  // Technical read
  if (read) {
    lines.push('TECHNICAL READ (computed from daily closing candles — SMA, RSI/Wilder, MACD 12/26/9, Bollinger 20/2):')
    lines.push(`Overall: ${read.summary}`)
    for (const s of read.sections) {
      lines.push(`- ${s.label} [${s.tone}]: ${s.signal} (${s.detail})`)
    }
  } else {
    lines.push('TECHNICAL READ: unavailable (insufficient price history).')
  }
  lines.push('')

  if (isCrypto) {
    lines.push('NOTE: This is a crypto asset — company fundamentals, earnings, and equity-analyst coverage do not apply.')
    lines.push('')
  } else {
    // Key metrics
    if (metrics) {
      lines.push('KEY METRICS:')
      lines.push(`- Market cap: ${marketCap(metrics.marketCap)}`)
      lines.push(`- P/E (TTM): ${num(metrics.pe, '', 1)}`)
      lines.push(`- Beta: ${num(metrics.beta, '', 2)}`)
      if (metrics.high52 != null && metrics.low52 != null) {
        let pos = ''
        if (quote?.price != null && metrics.high52 > 0) {
          pos = ` (price ${(((quote.price - metrics.high52) / metrics.high52) * 100).toFixed(1)}% vs 52w high)`
        }
        lines.push(`- 52-week range: ${metrics.low52.toFixed(2)} – ${metrics.high52.toFixed(2)}${pos}`)
      }
      lines.push(`- Revenue growth (TTM YoY): ${num(metrics.revenueGrowth, '%', 1)}`)
      lines.push(`- EPS growth (TTM YoY): ${num(metrics.epsGrowth, '%', 1)}`)
      lines.push(`- Gross margin: ${num(metrics.grossMargin, '%', 1)} · Net margin: ${num(metrics.netMargin, '%', 1)}`)
      lines.push(`- Return on equity (TTM): ${num(metrics.roe, '%', 1)}`)
      lines.push('')
    } else {
      lines.push('KEY METRICS: unavailable.')
      lines.push('')
    }

    // Analyst consensus (third-party survey data)
    if (consensus) {
      const total = consensus.strongBuy + consensus.buy + consensus.hold + consensus.sell + consensus.strongSell
      if (total > 0) {
        lines.push('WALL STREET ANALYST CONSENSUS (third-party survey via Finnhub — this is external data, NOT Bourbon Pour\'s opinion):')
        lines.push(`Strong Buy ${consensus.strongBuy} · Buy ${consensus.buy} · Hold ${consensus.hold} · Sell ${consensus.sell} · Strong Sell ${consensus.strongSell} (${total} analysts)`)
        lines.push('')
      }
    }
  }

  // News
  if (news.length > 0) {
    lines.push('RECENT NEWS HEADLINES (last 7 days):')
    news.forEach((n, i) => {
      lines.push(`${i + 1}. "${n.headline}" — ${n.source} (${dateStr(n.datetime)})`)
    })
  } else {
    lines.push('RECENT NEWS HEADLINES: none available for this symbol in the last 7 days.')
  }

  return lines.join('\n')
}
