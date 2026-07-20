'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { SupabaseClient, Session } from '@supabase/supabase-js'
import { getPublicClient } from '@/lib/supabase'

interface EnrichedPosition {
  symbol: string
  qty: number
  avgCost: number
  last: number | null
  marketValue: number | null
  unrealizedPnl: number | null
  dayPnl: number | null
}

interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  qty: number
  price: number
  executed_at: string
}

interface Portfolio {
  cash: number
  positions: EnrichedPosition[]
  trades: Trade[]
  realizedPnl: number
  equity: number
  totalReturnPct: number
  dayPnl: number | null
}

interface TicketQuote { price: number; pctChange: number | null; name?: string; changeBasis?: string }

function money(v: number, dec = 2): string {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}`
}

function signedMoney(v: number): string {
  return `${v >= 0 ? '+' : '−'}${money(Math.abs(v))}`
}

export default function TradingDesk() {
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loadError, setLoadError] = useState('')

  // Order ticket
  const [symbol, setSymbol] = useState('')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [qty, setQty] = useState('')
  const [quote, setQuote] = useState<TicketQuote | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const c = getPublicClient()
      setClient(c)
      c.auth.getSession().then(({ data }) => setSession(data.session))
      const { data: sub } = c.auth.onAuthStateChange((_e, s) => setSession(s))
      return () => sub.subscription.unsubscribe()
    } catch {
      setSession(null)
    }
  }, [])

  const authedFetch = useCallback(async (path: string, init?: RequestInit) => {
    const token = (await client?.auth.getSession())?.data.session?.access_token
    return fetch(path, {
      ...init,
      headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
  }, [client])

  const refresh = useCallback(async () => {
    if (!client) return
    try {
      const res = await authedFetch('/api/paper/portfolio')
      const data = await res.json()
      if (!res.ok) { setLoadError(data.error || 'Failed to load'); return }
      setPortfolio(data)
      setLoadError('')
    } catch {
      setLoadError('Network error loading portfolio')
    }
  }, [client, authedFetch])

  // Load + poll portfolio while signed in and tab visible.
  useEffect(() => {
    if (!session?.user) return
    refresh()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, 30_000)
    return () => clearInterval(id)
  }, [session, refresh])

  // Live ticket quote — debounced on symbol, refreshed every 15s.
  useEffect(() => {
    setQuote(null)
    if (!symbol || symbol.length < 1) return
    let cancelled = false

    async function load() {
      setQuoteLoading(true)
      try {
        const res = await fetch(`/api/terminal/quote?symbol=${encodeURIComponent(symbol)}`)
        const d = await res.json()
        if (!cancelled) setQuote(d.price != null ? { price: d.price, pctChange: d.pctChange ?? null, name: d.name, changeBasis: d.changeBasis } : null)
      } catch { if (!cancelled) setQuote(null) }
      if (!cancelled) setQuoteLoading(false)
    }

    if (quoteTimer.current) clearTimeout(quoteTimer.current)
    quoteTimer.current = setTimeout(load, 350)
    const id = setInterval(load, 15_000)
    return () => { cancelled = true; clearInterval(id); if (quoteTimer.current) clearTimeout(quoteTimer.current) }
  }, [symbol])

  async function placeOrder() {
    const q = parseFloat(qty)
    if (!symbol || !(q > 0)) { setNotice({ kind: 'err', text: 'Enter a symbol and a positive quantity.' }); return }
    setPlacing(true)
    setNotice(null)
    try {
      const res = await authedFetch('/api/paper/trade', {
        method: 'POST',
        body: JSON.stringify({ symbol, side, qty: q }),
      })
      const data = await res.json()
      if (!res.ok) { setNotice({ kind: 'err', text: data.error || 'Trade failed' }); setPlacing(false); return }
      setPortfolio(data)
      setNotice({
        kind: 'ok',
        text: `Filled: ${data.filled.side.toUpperCase()} ${data.filled.qty} ${data.filled.symbol} @ ${money(data.filled.price)} = ${money(data.filled.notional)}`,
      })
      setQty('')
    } catch {
      setNotice({ kind: 'err', text: 'Network error — trade may not have gone through. Check history.' })
    }
    setPlacing(false)
  }

  function prefill(sym: string, s: 'buy' | 'sell', maxQty?: number) {
    setSymbol(sym)
    setSide(s)
    if (maxQty != null) setQty(String(maxQty))
    setNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const est = quote && parseFloat(qty) > 0 ? quote.price * parseFloat(qty) : null
  const held = portfolio?.positions.find(p => p.symbol === symbol)?.qty ?? 0
  const maxAffordable = quote && portfolio ? Math.floor((portfolio.cash / quote.price) * 10000) / 10000 : null

  // ── Gate: not signed in ──
  if (session === undefined) {
    return <div className="terminal-root"><div className="terminal-loading" style={{ height: '60vh' }}>Loading</div></div>
  }
  if (!session?.user) {
    return (
      <div className="terminal-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px', padding: '24px' }}>
          <div className="terminal-brand" style={{ justifyContent: 'center', marginBottom: '20px' }}>
            <div className="terminal-brand-dot" /> Bourbon Paper Desk
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#f0f0f0', marginBottom: '12px' }}>Sign in to trade.</h1>
          <p style={{ color: '#9a9a9a', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
            The paper desk fills orders at real market prices with $100,000 of virtual cash.
            Free account, educational only — no real money anywhere.
          </p>
          <Link href="/account" className="terminal-tool-run" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Create Account / Sign In
          </Link>
        </div>
      </div>
    )
  }

  const p = portfolio
  const retUp = (p?.totalReturnPct ?? 0) >= 0
  const dayUp = (p?.dayPnl ?? 0) >= 0

  return (
    <div className="terminal-root" style={{ minHeight: '100vh', overflow: 'auto', paddingBottom: '40px' }}>
      {/* Top bar */}
      <div className="terminal-topbar">
        <Link href="/" className="terminal-brand"><div className="terminal-brand-dot" />Bourbon Paper Desk</Link>
        <span style={{ fontSize: '10px', color: '#555', marginLeft: 'auto' }}>
          {session.user.email} · <Link href="/terminal" style={{ color: '#c8963e' }}>Terminal</Link> · <Link href="/account" style={{ color: '#888' }}>Account</Link>
        </span>
      </div>

      {loadError && <div className="terminal-tool-warn" style={{ margin: '12px 16px' }}>{loadError}</div>}

      {/* Equity summary */}
      {p && (
        <div className="terminal-tool-results" style={{ margin: '12px 16px' }}>
          <Stat label="Total Equity" value={money(p.equity)} highlight />
          <Stat label="Cash" value={money(p.cash)} />
          <Stat label="Total Return" value={`${retUp ? '+' : ''}${p.totalReturnPct.toFixed(2)}%`} cls={retUp ? 't-green' : 't-red'} />
          <Stat label="Day P&L" value={p.dayPnl != null ? signedMoney(p.dayPnl) : '—'} cls={dayUp ? 't-green' : 't-red'} />
          <Stat label="Realized P&L" value={signedMoney(p.realizedPnl)} cls={p.realizedPnl >= 0 ? 't-green' : 't-red'} />
        </div>
      )}

      {/* Order ticket */}
      <div className="terminal-panel" style={{ margin: '0 16px 14px', overflow: 'visible' }}>
        <div className="terminal-panel-header">
          <span className="terminal-panel-title">Order Ticket — fills at the latest real market price</span>
        </div>
        <div className="terminal-tool-form" style={{ alignItems: 'end' }}>
          <label className="terminal-tool-field">
            <span>Symbol (stock · ETF · BINANCE:BTCUSDT)</span>
            <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="AAPL" />
          </label>
          <label className="terminal-tool-field">
            <span>Side</span>
            <div className="terminal-tool-seg">
              <button className={side === 'buy' ? 'active' : ''} onClick={() => setSide('buy')} style={side === 'buy' ? { color: '#00c853', borderColor: '#00c85355', background: '#00c85311' } : {}}>BUY</button>
              <button className={side === 'sell' ? 'active' : ''} onClick={() => setSide('sell')} style={side === 'sell' ? { color: '#ff1744', borderColor: '#ff174455', background: '#ff174411' } : {}}>SELL</button>
            </div>
          </label>
          <label className="terminal-tool-field">
            <span>Quantity{side === 'sell' && held > 0 ? ` (held: ${held})` : ''}</span>
            <input value={qty} onChange={e => setQty(e.target.value)} inputMode="decimal" placeholder="10" onKeyDown={e => e.key === 'Enter' && placeOrder()} />
          </label>
          <button className="terminal-tool-run" onClick={placeOrder} disabled={placing || !quote}>
            {placing ? 'Filling…' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol || '—'}`}
          </button>
        </div>

        <div style={{ padding: '0 16px 12px', fontSize: '11px', color: '#888', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          {quoteLoading && <span>Fetching quote…</span>}
          {quote && (
            <>
              <span>
                {symbol} last: <b style={{ color: '#e8e8e8' }}>{money(quote.price)}</b>
                {quote.pctChange != null && (
                  <span className={quote.pctChange >= 0 ? 't-green' : 't-red'}> {quote.pctChange >= 0 ? '+' : ''}{quote.pctChange.toFixed(2)}%{quote.changeBasis === '24h' ? ' 24h' : ''}</span>
                )}
              </span>
              {est != null && <span>Est. {side === 'buy' ? 'cost' : 'proceeds'}: <b style={{ color: '#e8e8e8' }}>{money(est)}</b></span>}
              {side === 'buy' && maxAffordable != null && (
                <button className="terminal-tool-csv" onClick={() => setQty(String(Math.max(0, Math.floor(maxAffordable))))}>max {Math.floor(maxAffordable)}</button>
              )}
              {side === 'sell' && held > 0 && (
                <button className="terminal-tool-csv" onClick={() => setQty(String(held))}>sell all {held}</button>
              )}
            </>
          )}
          {!quote && !quoteLoading && symbol && <span className="t-red">No live price for {symbol}</span>}
        </div>

        {notice && (
          <div className={notice.kind === 'ok' ? 'terminal-fill-ok' : 'terminal-tool-warn'} style={{ margin: '0 16px 12px' }}>
            {notice.text}
          </div>
        )}
      </div>

      {/* Positions */}
      <div className="terminal-panel" style={{ margin: '0 16px 14px' }}>
        <div className="terminal-panel-header">
          <span className="terminal-panel-title">Positions {p ? `(${p.positions.length})` : ''}</span>
          <span style={{ fontSize: '9px', color: '#444' }}>marked to live prices · refreshes 30s</span>
        </div>
        {p && p.positions.length === 0 && (
          <div className="terminal-tool-empty">No positions yet — your first fill lands here.</div>
        )}
        {p && p.positions.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <div className="terminal-paper-head">
              <span>Sym</span><span>Qty</span><span>Avg Cost</span><span>Last</span><span>Mkt Value</span><span>Unrealized</span><span>Day</span><span />
            </div>
            {p.positions.map(pos => {
              const uUp = (pos.unrealizedPnl ?? 0) >= 0
              const dUp = (pos.dayPnl ?? 0) >= 0
              return (
                <div key={pos.symbol} className="terminal-paper-row">
                  <button className="terminal-portfolio-sym" onClick={() => prefill(pos.symbol, 'buy')}>{pos.symbol}</button>
                  <span>{pos.qty}</span>
                  <span>{money(pos.avgCost)}</span>
                  <span>{pos.last != null ? money(pos.last) : '—'}</span>
                  <span>{pos.marketValue != null ? money(pos.marketValue) : '—'}</span>
                  <span className={uUp ? 't-green' : 't-red'}>
                    {pos.unrealizedPnl != null ? signedMoney(pos.unrealizedPnl) : '—'}
                  </span>
                  <span className={dUp ? 't-green' : 't-red'}>
                    {pos.dayPnl != null ? signedMoney(pos.dayPnl) : '—'}
                  </span>
                  <button className="terminal-tool-csv" onClick={() => prefill(pos.symbol, 'sell', pos.qty)}>sell</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* History */}
      <div className="terminal-panel" style={{ margin: '0 16px 14px' }}>
        <div className="terminal-panel-header">
          <span className="terminal-panel-title">Trade History</span>
        </div>
        {p && p.trades.length === 0 && <div className="terminal-tool-empty">No trades yet.</div>}
        {p && p.trades.map(t => (
          <div key={t.id} className="terminal-paper-row" style={{ gridTemplateColumns: '110px 50px 60px 90px 90px 1fr' }}>
            <span className="t-muted">{new Date(t.executed_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            <span className={t.side === 'buy' ? 't-green' : 't-red'}>{t.side.toUpperCase()}</span>
            <span style={{ color: '#c8963e', fontWeight: 600 }}>{t.symbol}</span>
            <span>{t.qty}</span>
            <span>{money(t.price)}</span>
            <span className="t-muted">{money(t.qty * t.price)}</span>
          </div>
        ))}
      </div>

      <div className="terminal-disclaimer" style={{ margin: '0 16px', borderTop: 'none' }}>
        Paper trading sandbox — 100% virtual money, educational only, not investment advice. Orders fill at the
        latest available market price (Finnhub/CoinGecko, may be delayed up to a minute; after-hours fills use the
        last traded price). No shorting, no margin, no fees modeled. Starting balance $100,000.
      </div>
    </div>
  )
}

function Stat({ label, value, cls, highlight }: { label: string; value: string; cls?: string; highlight?: boolean }) {
  return (
    <div className={`terminal-tool-result ${highlight ? 'highlight' : ''}`}>
      <span className="terminal-tool-result-label">{label}</span>
      <span className={`terminal-tool-result-value ${cls || ''}`}>{value}</span>
    </div>
  )
}
