import { NextResponse } from 'next/server'
import { fetchFinnhubQuote, isCrypto, toNewsSymbol } from '@/lib/terminal/finnhub'
import { fetchTwelveDataCandles } from '@/lib/terminal/twelvedata'
import type { Candle } from '@/lib/terminal/indicators'
import { computeTechnicalRead } from '@/lib/terminal/technical-read'
import {
  buildAnalystContext,
  type AnalystMetrics,
  type AnalystConsensus,
  type AnalystNewsItem,
} from '@/lib/terminal/analyst-context'
import { runAnalyst, consumeDailyQuota, type ChatMessage } from '@/lib/terminal/analyst'

export const maxDuration = 30

const SYMBOL_RE = /^[A-Z0-9.:-]{1,20}$/

const FH = 'https://finnhub.io/api/v1'
async function fhJSON(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  // Graceful degradation when the AI key isn't configured (missing, or still the
  // documented `your-…-here` placeholder in local dev). Avoids a hard failure.
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey || anthropicKey.startsWith('your-')) {
    return NextResponse.json(
      { error: 'The AI analyst is not configured yet. Add ANTHROPIC_API_KEY to enable it.' },
      { status: 503 }
    )
  }

  let body: { symbol?: string; messages?: ChatMessage[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const symbol = body.symbol?.toUpperCase()
  if (!symbol || !SYMBOL_RE.test(symbol)) {
    return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 })
  }

  const messages = Array.isArray(body.messages)
    ? body.messages.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    : []
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'A user message is required' }, { status: 400 })
  }

  // Cost guard — site-wide daily cap.
  if (!consumeDailyQuota()) {
    return NextResponse.json(
      { error: 'The analyst has reached its daily limit. Please try again tomorrow.' },
      { status: 429 }
    )
  }

  const fhKey = process.env.FINNHUB_API_KEY
  const tdKey = process.env.TWELVE_DATA_API_KEY
  const crypto = isCrypto(symbol)
  const newsSym = toNewsSymbol(symbol)

  // Gather all real data in parallel.
  const to = new Date().toISOString().split('T')[0]
  const from = new Date(Date.now() - 7 * 86400 * 1000).toISOString().split('T')[0]

  const [candleRes, quote, metricRaw, recRaw, newsRaw] = await Promise.all([
    tdKey ? fetchTwelveDataCandles(symbol, '1Y', tdKey, 'splits') : Promise.resolve({ candles: [] as Candle[], meta: null }),
    fhKey ? fetchFinnhubQuote(symbol, fhKey) : Promise.resolve(null),
    !crypto && fhKey ? fhJSON(`${FH}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${fhKey}`) : Promise.resolve(null),
    !crypto && fhKey ? fhJSON(`${FH}/stock/recommendation?symbol=${encodeURIComponent(symbol)}&token=${fhKey}`) : Promise.resolve(null),
    newsSym && fhKey ? fhJSON(`${FH}/company-news?symbol=${encodeURIComponent(newsSym)}&from=${from}&to=${to}&token=${fhKey}`) : Promise.resolve(null),
  ])

  const candles = (candleRes?.candles || []) as Candle[]
  const read = candles.length >= 30 ? computeTechnicalRead(candles, symbol) : null

  // Metrics
  const m = (metricRaw && typeof metricRaw === 'object' && 'metric' in metricRaw
    ? (metricRaw as { metric: Record<string, number | null> }).metric
    : {}) || {}
  const num = (k: string): number | null => (typeof m[k] === 'number' ? m[k] : null)
  const hasMetrics = Object.keys(m).length > 0
  const metrics: AnalystMetrics | null = hasMetrics && !crypto ? {
    marketCap: num('marketCapitalization'),
    pe: num('peTTM') ?? num('peInclExtraTTM'),
    beta: num('beta'),
    high52: num('52WeekHigh'),
    low52: num('52WeekLow'),
    revenueGrowth: num('revenueGrowthTTMYoy'),
    epsGrowth: num('epsGrowthTTMYoy'),
    grossMargin: num('grossMarginTTM'),
    netMargin: num('netProfitMarginTTM') ?? num('netMarginTTM'),
    roe: num('roeTTM'),
  } : null

  // Analyst consensus (most recent period)
  const recArr = Array.isArray(recRaw) ? (recRaw as Array<Record<string, number>>) : []
  const consensus: AnalystConsensus | null = recArr[0]
    ? {
        strongBuy: recArr[0].strongBuy ?? 0,
        buy: recArr[0].buy ?? 0,
        hold: recArr[0].hold ?? 0,
        sell: recArr[0].sell ?? 0,
        strongSell: recArr[0].strongSell ?? 0,
      }
    : null

  // News (top 6 by recency)
  const newsArr = Array.isArray(newsRaw) ? (newsRaw as Array<{ headline?: string; source?: string; datetime?: number }>) : []
  const news: AnalystNewsItem[] = newsArr
    .filter(n => n.headline && n.datetime)
    .slice(0, 6)
    .map(n => ({ headline: String(n.headline), source: String(n.source || 'News'), datetime: Number(n.datetime) }))

  const contextBlock = buildAnalystContext({
    symbol,
    name: candleRes?.meta?.name ?? null,
    isCrypto: crypto,
    read,
    quote: quote ? { price: quote.price, change: quote.change, pctChange: quote.pctChange } : null,
    metrics,
    consensus,
    news,
  })

  try {
    const reply = await runAnalyst(contextBlock, messages)
    return NextResponse.json({ reply }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Analyst error'
    return NextResponse.json({ error: `The analyst could not respond: ${msg}` }, { status: 502 })
  }
}
