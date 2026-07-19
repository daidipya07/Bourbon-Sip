'use client'

import { useCallback, useEffect } from 'react'
import { usePolling } from './usePolling'

interface QuoteStats {
  high52: number | null
  low52: number | null
  pe: number | null
  beta: number | null
  divYield: number | null
}

interface QuoteData {
  symbol: string
  price: number
  change: number
  pctChange: number
  prevClose: number
  open: number | null
  high: number | null
  low: number | null
  name: string
  exchange: string
  industry: string
  marketCap: number | null
  stats: QuoteStats | null
}

function fmt(v: number | null | undefined): string {
  if (v == null) return '—'
  return v >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : v.toFixed(2)
}

function formatMarketCap(m: number): string {
  if (m >= 1000000) return `$${(m / 1000000).toFixed(1)}T`
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`
  return `$${m.toFixed(0)}M`
}

export default function QuotePanel({ symbol }: { symbol: string }) {
  const fetcher = useCallback(async (): Promise<QuoteData | null> => {
    const res = await fetch(`/api/terminal/quote?symbol=${encodeURIComponent(symbol)}`)
    if (!res.ok) return null
    const d = await res.json()
    return d.price != null ? d : null
  }, [symbol])

  const { data, loading, refetch } = usePolling(fetcher, { intervalMs: 60_000, enabled: !!symbol })

  // Refetch immediately when the symbol changes.
  useEffect(() => { if (symbol) refetch() }, [symbol, refetch])

  if (loading && !data) return <div className="terminal-loading">Loading</div>
  if (!data) return <div className="terminal-loading" style={{ color: '#555' }}>No data for {symbol}</div>

  const up = data.change >= 0
  const s = data.stats

  return (
    <div className="terminal-quote-header">
      <div className="terminal-quote-top">
        <span className="terminal-quote-symbol">{data.symbol}</span>
        <span className="terminal-quote-name">{data.name}</span>
        <span className="terminal-quote-exchange">{data.exchange}</span>
      </div>

      <div className="terminal-quote-price-row">
        <span className="terminal-quote-price">
          {data.price >= 1 ? data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : data.price.toFixed(4)}
        </span>
        <span className={`terminal-quote-change ${up ? 't-green' : 't-red'}`}>
          {up ? '+' : ''}{data.change.toFixed(2)} ({up ? '+' : ''}{data.pctChange.toFixed(2)}%)
        </span>
      </div>

      <div className="terminal-quote-stats">
        <div className="terminal-quote-stat">
          <div className="terminal-quote-stat-label">Open</div>
          <div className="terminal-quote-stat-value">{fmt(data.open)}</div>
        </div>
        <div className="terminal-quote-stat">
          <div className="terminal-quote-stat-label">High</div>
          <div className="terminal-quote-stat-value">{fmt(data.high)}</div>
        </div>
        <div className="terminal-quote-stat">
          <div className="terminal-quote-stat-label">Low</div>
          <div className="terminal-quote-stat-value">{fmt(data.low)}</div>
        </div>
        <div className="terminal-quote-stat">
          <div className="terminal-quote-stat-label">Prev Close</div>
          <div className="terminal-quote-stat-value">{fmt(data.prevClose)}</div>
        </div>
        {data.marketCap != null && (
          <div className="terminal-quote-stat">
            <div className="terminal-quote-stat-label">Mkt Cap</div>
            <div className="terminal-quote-stat-value">{formatMarketCap(data.marketCap)}</div>
          </div>
        )}
        {data.industry && (
          <div className="terminal-quote-stat">
            <div className="terminal-quote-stat-label">Industry</div>
            <div className="terminal-quote-stat-value" style={{ fontSize: '10px' }}>{data.industry}</div>
          </div>
        )}
        {s?.high52 != null && (
          <div className="terminal-quote-stat">
            <div className="terminal-quote-stat-label">52W High</div>
            <div className="terminal-quote-stat-value">{fmt(s.high52)}</div>
          </div>
        )}
        {s?.low52 != null && (
          <div className="terminal-quote-stat">
            <div className="terminal-quote-stat-label">52W Low</div>
            <div className="terminal-quote-stat-value">{fmt(s.low52)}</div>
          </div>
        )}
        {s?.pe != null && (
          <div className="terminal-quote-stat">
            <div className="terminal-quote-stat-label">P/E (TTM)</div>
            <div className="terminal-quote-stat-value">{s.pe.toFixed(1)}</div>
          </div>
        )}
        {s?.beta != null && (
          <div className="terminal-quote-stat">
            <div className="terminal-quote-stat-label">Beta</div>
            <div className="terminal-quote-stat-value">{s.beta.toFixed(2)}</div>
          </div>
        )}
        {s?.divYield != null && (
          <div className="terminal-quote-stat">
            <div className="terminal-quote-stat-label">Div Yield</div>
            <div className="terminal-quote-stat-value">{s.divYield.toFixed(2)}%</div>
          </div>
        )}
      </div>
    </div>
  )
}
