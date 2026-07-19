'use client'

import { useEffect, useState, useCallback } from 'react'
import { MOVERS_UNIVERSE } from '@/lib/terminal/symbols'

interface Mover {
  symbol: string
  name: string
  price: number | null
  pctChange: number
}

export default function MoversPanel({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [movers, setMovers] = useState<Mover[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const symbols = MOVERS_UNIVERSE.map(s => s.symbol).join(',')
      const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols)}`)
      const data = await res.json()
      const names = new Map(MOVERS_UNIVERSE.map(s => [s.symbol, s.name]))
      const valid = ((data.quotes || []) as Array<{ symbol: string; price: number | null; pctChange: number | null }>)
        .filter(q => q.pctChange != null)
        .map(q => ({
          symbol: q.symbol,
          name: names.get(q.symbol) || q.symbol,
          price: q.price,
          pctChange: q.pctChange as number,
        }))
        .sort((a, b) => b.pctChange - a.pctChange)
      setMovers(valid)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchAll])

  const gainers = movers.slice(0, 8)
  const losers = movers.slice(-8).reverse()

  function renderRow(item: Mover) {
    const up = item.pctChange >= 0
    return (
      <div key={item.symbol} className="terminal-movers-row" onClick={() => onSelect(item.symbol)}>
        <span className="terminal-watchlist-sym">{item.symbol}</span>
        <span className="terminal-movers-name">{item.name}</span>
        <span className="terminal-watchlist-price">
          {item.price != null ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
        </span>
        <span className={`terminal-watchlist-chg ${up ? 't-green' : 't-red'}`}>
          {up ? '+' : ''}{item.pctChange.toFixed(2)}%
        </span>
      </div>
    )
  }

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Movers — Large Caps</span>
      </div>
      <div className="terminal-panel-body">
        {loading && movers.length === 0 && <div className="terminal-loading">Loading movers</div>}
        {movers.length > 0 && (
          <>
            <div className="terminal-sector-label" style={{ color: '#00c853' }}>Top Gainers</div>
            {gainers.map(renderRow)}
            <div className="terminal-sector-label" style={{ color: '#ff1744' }}>Top Losers</div>
            {losers.map(renderRow)}
          </>
        )}
      </div>
    </div>
  )
}
