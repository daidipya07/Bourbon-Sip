import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { verifyPaperUser, getExecutionQuote, derivePositions, loadPortfolio, type PaperTrade } from '@/lib/paper'

export const maxDuration = 30

const MAX_QTY = 1_000_000
const SYMBOL_RE = /^[A-Z0-9.:-]{1,20}$/

// Execute a paper trade at the server's latest real market price.
// The client supplies only symbol/side/qty — never a price.
export async function POST(request: Request) {
  const userId = await verifyPaperUser(request)
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  let body: { symbol?: string; side?: string; qty?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const symbol = (body.symbol || '').trim().toUpperCase()
  const side = body.side === 'buy' || body.side === 'sell' ? body.side : null
  const qty = typeof body.qty === 'number' ? body.qty : parseFloat(String(body.qty))

  if (!SYMBOL_RE.test(symbol)) return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 })
  if (!side) return NextResponse.json({ error: 'Side must be buy or sell' }, { status: 400 })
  if (!(qty > 0) || qty > MAX_QTY) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })

  // Real price from the server-side feed — refuse to fill without one.
  const quote = await getExecutionQuote(symbol)
  if (!quote || quote.price == null) {
    return NextResponse.json({ error: `No live market price for ${symbol} — check the symbol.` }, { status: 422 })
  }
  const price = quote.price
  const notional = parseFloat((qty * price).toFixed(2))

  const supabase = getAdminClient()

  try {
    if (side === 'buy') {
      // Atomic funds check-and-debit: only succeeds if cash covers the cost.
      const { data: debited, error } = await supabase
        .rpc('paper_debit_cash', { p_user_id: userId, p_amount: notional })
      if (error) {
        // RPC not installed → fall back to read-check-write (fine for v1).
        const { data: acct } = await supabase.from('paper_accounts').select('cash').eq('user_id', userId).maybeSingle()
        if (!acct) return NextResponse.json({ error: 'No paper account — visit /account first.' }, { status: 400 })
        if (Number(acct.cash) < notional) {
          return NextResponse.json({ error: `Insufficient cash: cost $${notional.toLocaleString()} vs $${Number(acct.cash).toLocaleString()} available.` }, { status: 400 })
        }
        await supabase.from('paper_accounts')
          .update({ cash: Number(acct.cash) - notional, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
      } else if (debited === false) {
        return NextResponse.json({ error: `Insufficient cash for $${notional.toLocaleString()} — reduce the quantity.` }, { status: 400 })
      }
    } else {
      // Sell: verify the position covers the quantity.
      const { data: tradeRows, error } = await supabase
        .from('paper_trades').select('id, symbol, side, qty, price, executed_at').eq('user_id', userId)
      if (error) throw new Error('Paper trading tables missing — run supabase-accounts.sql.')
      const { positions } = derivePositions((tradeRows || []).map(t => ({ ...t, qty: Number(t.qty), price: Number(t.price) })) as PaperTrade[])
      const held = positions.find(p => p.symbol === symbol)?.qty ?? 0
      if (qty > held + 1e-9) {
        return NextResponse.json({ error: `You hold ${held} ${symbol} — cannot sell ${qty}. (No short selling in the sandbox.)` }, { status: 400 })
      }
      const { data: acct } = await supabase.from('paper_accounts').select('cash').eq('user_id', userId).maybeSingle()
      await supabase.from('paper_accounts')
        .update({ cash: Number(acct?.cash ?? 0) + notional, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
    }

    const { error: insertErr } = await supabase.from('paper_trades').insert({
      user_id: userId, symbol, side, qty, price,
    })
    if (insertErr) {
      // Roll the cash movement back so the books stay consistent.
      const { data: acct } = await supabase.from('paper_accounts').select('cash').eq('user_id', userId).maybeSingle()
      if (acct) {
        const revert = side === 'buy' ? Number(acct.cash) + notional : Number(acct.cash) - notional
        await supabase.from('paper_accounts').update({ cash: revert }).eq('user_id', userId)
      }
      throw new Error(insertErr.message)
    }

    const state = await loadPortfolio(userId)
    return NextResponse.json({
      filled: { symbol, side, qty, price, notional },
      ...state,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Trade failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
