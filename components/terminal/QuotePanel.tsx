'use client'

import { useEffect, useState } from 'react'

interface QuoteData {
  symbol: string
  price: number
  change: number
  pctChange: number
  prevClose: number
  open: number
  high: number
  low: number
  name: string
  exchange: string
  industry: string
  marketCap: number | null
  logo: string | null
}

export default function QuotePanel({ symbol }: { symbol: string }) {
  const [data, setData] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!symbol) return
    setLoading(true)
    fetch(`/api/terminal/quote?symbol=${encodeURIComponent(symbol)}`)
      .then(r => r.json())
      .then(d => { if (d.price) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [symbol])

  if (loading) return <div className="terminal-loading">Loading</div>
  if (!data) return <div className="terminal-loading" style={{ color: '#555' }}>No data for {symbol}</div>

  const up = data.change >= 0

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
          <div className="terminal-quote-stat-value">{data.open?.toFixed(2) ?? '—'}</div>
        </div>
        <div className="terminal-quote-stat">
          <div className="terminal-quote-stat-label">High</div>
          <div className="terminal-quote-stat-value">{data.high?.toFixed(2) ?? '—'}</div>
        </div>
        <div className="terminal-quote-stat">
          <div className="terminal-quote-stat-label">Low</div>
          <div className="terminal-quote-stat-value">{data.low?.toFixed(2) ?? '—'}</div>
        </div>
        <div className="terminal-quote-stat">
          <div className="terminal-quote-stat-label">Prev Close</div>
          <div className="terminal-quote-stat-value">{data.prevClose?.toFixed(2) ?? '—'}</div>
        </div>
        {data.marketCap && (
          <>
            <div className="terminal-quote-stat">
              <div className="terminal-quote-stat-label">Mkt Cap</div>
              <div className="terminal-quote-stat-value">{formatMarketCap(data.marketCap)}</div>
            </div>
            <div className="terminal-quote-stat">
              <div className="terminal-quote-stat-label">Industry</div>
              <div className="terminal-quote-stat-value" style={{ fontSize: '10px' }}>{data.industry || '—'}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatMarketCap(m: number): string {
  if (m >= 1000000) return `$${(m / 1000000).toFixed(1)}T`
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`
  return `$${m.toFixed(0)}M`
}
