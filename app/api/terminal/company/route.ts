import { NextRequest, NextResponse } from 'next/server'

const FH = 'https://finnhub.io/api/v1'

async function getJSON(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

interface RecRow { period: string; strongBuy: number; buy: number; hold: number; sell: number; strongSell: number }
interface EarningRow { period: string; actual: number | null; estimate: number | null; surprisePercent: number | null }
interface InsiderRow { name: string; share: number; change: number; transactionDate: string; transactionCode: string }

// Aggregates Finnhub free-tier fundamentals into one payload for the Company
// research section. Each source is independent — a premium/empty response for
// one just yields null/empty for that section.
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  // Crypto pairs have no company data.
  if (symbol.includes(':')) return NextResponse.json({ symbol, applicable: false })

  const key = process.env.FINNHUB_API_KEY
  if (!key) return NextResponse.json({ symbol, applicable: false })

  const [recRaw, peersRaw, metricRaw, earningsRaw, insiderRaw] = await Promise.all([
    getJSON(`${FH}/stock/recommendation?symbol=${encodeURIComponent(symbol)}&token=${key}`),
    getJSON(`${FH}/stock/peers?symbol=${encodeURIComponent(symbol)}&token=${key}`),
    getJSON(`${FH}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${key}`),
    getJSON(`${FH}/stock/earnings?symbol=${encodeURIComponent(symbol)}&token=${key}`),
    getJSON(`${FH}/stock/insider-transactions?symbol=${encodeURIComponent(symbol)}&token=${key}`),
  ])

  // Recommendation (most recent period)
  const recArr = Array.isArray(recRaw) ? (recRaw as RecRow[]) : []
  const rec = recArr[0]
    ? { period: recArr[0].period, strongBuy: recArr[0].strongBuy, buy: recArr[0].buy, hold: recArr[0].hold, sell: recArr[0].sell, strongSell: recArr[0].strongSell }
    : null

  // Peers (exclude self, cap at 8)
  const peers = Array.isArray(peersRaw)
    ? (peersRaw as string[]).filter(p => p && p !== symbol).slice(0, 8)
    : []

  // Financials from metric bundle
  const m = (metricRaw && typeof metricRaw === 'object' && 'metric' in metricRaw
    ? (metricRaw as { metric: Record<string, number | null> }).metric
    : {}) || {}
  const num = (k: string): number | null => (typeof m[k] === 'number' ? m[k] : null)
  const financials = {
    revenueGrowth: num('revenueGrowthTTMYoy'),
    epsGrowth: num('epsGrowthTTMYoy'),
    grossMargin: num('grossMarginTTM'),
    operatingMargin: num('operatingMarginTTM'),
    netMargin: num('netProfitMarginTTM') ?? num('netMarginTTM'),
    roe: num('roeTTM'),
    currentRatio: num('currentRatioQuarterly') ?? num('currentRatioAnnual'),
    debtToEquity: num('totalDebt/totalEquityQuarterly') ?? num('longTermDebt/equityQuarterly'),
  }
  const hasFinancials = Object.values(financials).some(v => v != null)

  // Earnings surprises (last 4, oldest→newest)
  const earnArr = Array.isArray(earningsRaw) ? (earningsRaw as EarningRow[]) : []
  const earnings = earnArr.slice(0, 4).reverse().map(e => ({
    period: e.period,
    actual: e.actual,
    estimate: e.estimate,
    surprisePercent: e.surprisePercent,
  }))

  // Insider transactions → net share change + buy/sell counts over the window
  const insiderData = (insiderRaw && typeof insiderRaw === 'object' && 'data' in insiderRaw
    ? (insiderRaw as { data: InsiderRow[] }).data
    : []) || []
  let buys = 0, sells = 0, netShares = 0
  for (const t of insiderData) {
    if (t.change > 0) { buys++; netShares += t.change }
    else if (t.change < 0) { sells++; netShares += t.change }
  }
  const insider = insiderData.length > 0
    ? {
        buys, sells, netShares,
        recent: insiderData.slice(0, 6).map(t => ({ name: t.name, change: t.change, date: t.transactionDate, code: t.transactionCode })),
      }
    : null

  return NextResponse.json(
    {
      symbol,
      applicable: true,
      recommendation: rec,
      peers,
      financials: hasFinancials ? financials : null,
      earnings,
      insider,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
  )
}
