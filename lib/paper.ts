// Paper-trading engine — server-side only.
//
// Trust model: the client sends ONLY (symbol, side, qty) plus their Supabase
// auth token. Prices come from the server-side market feed (Finnhub/CoinGecko),
// balances live in Postgres behind RLS, and every mutation happens here with
// the service-role client after verifying the caller's JWT. A client can never
// supply its own price or touch another user's account.

import { getAdminClient } from './supabase'
import { fetchFinnhubQuote, fetchFinnhubQuotes, type FinnhubQuote } from './terminal/finnhub'
import { fetchCryptoQuotes, isCryptoSymbol } from './terminal/crypto'

export const STARTING_CASH = 100_000

export interface PaperTrade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  price: number
  executed_at: string
}

export interface Position {
  symbol: string
  qty: number
  avgCost: number
}

// Verify the caller's Supabase auth JWT → user id, or null.
export async function verifyPaperUser(request: Request): Promise<string | null> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  try {
    const { data, error } = await getAdminClient().auth.getUser(token)
    if (error || !data.user) return null
    return data.user.id
  } catch {
    return null
  }
}

// One quote path for every tradable symbol: equities/ETFs via Finnhub,
// crypto (BINANCE:*) via CoinGecko. Null when the market feed has no price.
export async function getExecutionQuote(symbol: string): Promise<FinnhubQuote | null> {
  if (isCryptoSymbol(symbol)) {
    const [q] = await fetchCryptoQuotes([symbol])
    return q?.price != null ? q : null
  }
  const key = process.env.FINNHUB_API_KEY
  if (!key) return null
  const q = await fetchFinnhubQuote(symbol, key)
  return q.price != null ? q : null
}

// Replay the trade log chronologically → open positions with average cost,
// plus cumulative realized P&L (average-cost method).
export function derivePositions(trades: PaperTrade[]): { positions: Position[]; realizedPnl: number } {
  const book = new Map<string, { qty: number; cost: number }>()
  let realized = 0

  const chrono = [...trades].sort((a, b) => a.executed_at.localeCompare(b.executed_at))
  for (const t of chrono) {
    const p = book.get(t.symbol) || { qty: 0, cost: 0 }
    if (t.side === 'buy') {
      p.qty += t.qty
      p.cost += t.qty * t.price
    } else {
      const avg = p.qty > 0 ? p.cost / p.qty : 0
      realized += t.qty * (t.price - avg)
      p.cost -= t.qty * avg
      p.qty -= t.qty
    }
    if (p.qty <= 1e-9) book.delete(t.symbol)
    else book.set(t.symbol, p)
  }

  const positions = [...book.entries()].map(([symbol, p]) => ({
    symbol,
    qty: parseFloat(p.qty.toFixed(6)),
    avgCost: parseFloat((p.cost / p.qty).toFixed(4)),
  }))
  return { positions, realizedPnl: parseFloat(realized.toFixed(2)) }
}

export interface EnrichedPosition extends Position {
  last: number | null
  prevClose: number | null
  marketValue: number | null
  unrealizedPnl: number | null
  dayPnl: number | null
}

export interface PortfolioState {
  cash: number
  positions: EnrichedPosition[]
  trades: PaperTrade[]
  realizedPnl: number
  equity: number
  totalReturnPct: number
  dayPnl: number | null
}

export async function loadPortfolio(userId: string): Promise<PortfolioState> {
  const supabase = getAdminClient()

  const [{ data: account, error: accErr }, { data: tradeRows, error: trErr }] = await Promise.all([
    supabase.from('paper_accounts').select('cash').eq('user_id', userId).maybeSingle(),
    supabase.from('paper_trades').select('id, symbol, side, qty, price, executed_at')
      .eq('user_id', userId).order('executed_at', { ascending: false }).limit(500),
  ])
  if (accErr || trErr) {
    throw new Error('Paper trading tables missing — run supabase-accounts.sql in the Supabase SQL editor.')
  }

  // Self-provision on first visit if the signup trigger wasn't installed yet.
  let cash = account ? Number(account.cash) : STARTING_CASH
  if (!account) {
    await supabase.from('paper_accounts').insert({ user_id: userId }).select().maybeSingle()
  }

  const trades = (tradeRows || []).map(t => ({
    ...t,
    qty: Number(t.qty),
    price: Number(t.price),
  })) as PaperTrade[]

  const { positions, realizedPnl } = derivePositions(trades)

  // Mark to market with real quotes.
  const symbols = positions.map(p => p.symbol)
  const cryptoSyms = symbols.filter(isCryptoSymbol)
  const equitySyms = symbols.filter(s => !isCryptoSymbol(s))
  const key = process.env.FINNHUB_API_KEY
  const [cryptoQ, equityQ] = await Promise.all([
    cryptoSyms.length ? fetchCryptoQuotes(cryptoSyms) : Promise.resolve([]),
    equitySyms.length && key ? fetchFinnhubQuotes(equitySyms, key) : Promise.resolve([]),
  ])
  const quoteMap = new Map([...cryptoQ, ...equityQ].map(q => [q.symbol, q]))

  let dayPnl: number | null = 0
  const enriched: EnrichedPosition[] = positions.map(p => {
    const q = quoteMap.get(p.symbol)
    const last = q?.price ?? null
    const prevClose = q?.prevClose ?? null
    const marketValue = last != null ? last * p.qty : null
    const unrealizedPnl = last != null ? (last - p.avgCost) * p.qty : null
    const posDay = last != null && prevClose != null ? (last - prevClose) * p.qty : null
    if (posDay == null) dayPnl = null
    else if (dayPnl != null) dayPnl += posDay
    return { ...p, last, prevClose, marketValue, unrealizedPnl, dayPnl: posDay }
  })

  const positionsValue = enriched.reduce((s, p) => s + (p.marketValue ?? 0), 0)
  const equity = cash + positionsValue

  return {
    cash: parseFloat(cash.toFixed(2)),
    positions: enriched,
    trades: trades.slice(0, 25),
    realizedPnl,
    equity: parseFloat(equity.toFixed(2)),
    totalReturnPct: parseFloat((((equity - STARTING_CASH) / STARTING_CASH) * 100).toFixed(2)),
    dayPnl: dayPnl != null ? parseFloat(dayPnl.toFixed(2)) : null,
  }
}
