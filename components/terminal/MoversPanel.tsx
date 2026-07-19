'use client'

import { useCallback } from 'react'
import { MOVERS_UNIVERSE } from '@/lib/terminal/symbols'
import { usePolling } from './usePolling'
import PanelStatus from './PanelStatus'

interface Quote { symbol: string; price: number | null; pctChange: number | null }
interface Mover { symbol: string; name: string; price: number | null; pctChange: number }

export default function MoversPanel({ onSelect }: { onSelect: (symbol: string) => void }) {
  const fetcher = useCallback(async () => {
    const symbols = MOVERS_UNIVERSE.map(s => s.symbol).join(',')
    const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols)}`)
    if (!res.ok) throw new Error('movers')
    const data = await res.json()
    const names = new Map(MOVERS_UNIVERSE.map(s => [s.symbol, s.name]))
    return ((data.quotes || []) as Quote[])
      .filter(q => q.pctChange != null)
      .map(q => ({ symbol: q.symbol, name: names.get(q.symbol) || q.symbol, price: q.price, pctChange: q.pctChange as number }))
      .sort((a, b) => b.pctChange - a.pctChange)
  }, [])

  const { data: movers, loading, error, lastUpdated, stale, refetch } = usePolling<Mover[]>(fetcher, { intervalMs: 5 * 60_000 })

  const gainers = movers ? movers.slice(0, 8) : []
  const losers = movers ? movers.slice(-8).reverse() : []

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
        <span className="terminal-panel-title">Movers — {MOVERS_UNIVERSE.length} Tracked Large Caps</span>
        <PanelStatus lastUpdated={lastUpdated} stale={stale} error={error} onRetry={refetch} />
      </div>
      <div className="terminal-panel-body">
        {loading && !movers && <div className="terminal-loading">Loading movers</div>}
        {movers && movers.length > 0 && (
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
