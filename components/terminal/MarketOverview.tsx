'use client'

import { useCallback } from 'react'
import { MARKET_SYMBOLS } from '@/lib/terminal/symbols'
import { usePolling } from './usePolling'
import PanelStatus from './PanelStatus'

interface Quote { symbol: string; price: number | null; pctChange: number | null }

export default function MarketOverview({ onSelect }: { onSelect: (symbol: string) => void }) {
  const fetcher = useCallback(async () => {
    const symbols = MARKET_SYMBOLS.map(s => s.symbol).join(',')
    const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols)}`)
    if (!res.ok) throw new Error('markets')
    const data = await res.json()
    return new Map<string, Quote>((data.quotes || []).map((q: Quote) => [q.symbol, q]))
  }, [])

  const { data: bySymbol, loading, error, lastUpdated, stale, refetch } = usePolling(fetcher, { intervalMs: 5 * 60_000 })

  if (loading && !bySymbol) return <div className="terminal-loading">Loading markets</div>

  const groups = Array.from(new Set(MARKET_SYMBOLS.map(s => s.group)))

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      <div className="terminal-panel-header" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
        <span className="terminal-panel-title">Global Markets</span>
        <PanelStatus lastUpdated={lastUpdated} stale={stale} error={error} onRetry={refetch} />
      </div>
      {groups.map(group => (
        <div key={group}>
          <div className="terminal-sector-label">{group}</div>
          <div className="terminal-market-grid">
            {MARKET_SYMBOLS.filter(i => i.group === group).map(item => {
              const q = bySymbol?.get(item.symbol)
              const price = q?.price ?? null
              const pct = q?.pctChange ?? null
              const up = (pct ?? 0) >= 0
              return (
                <div key={item.symbol} className="terminal-market-card" onClick={() => onSelect(item.symbol)}>
                  <div className="terminal-market-card-sym">{item.symbol}</div>
                  <div className="terminal-market-card-name">{item.name}</div>
                  <div className="terminal-market-card-price">
                    {price != null
                      ? price >= 1000
                        ? price.toLocaleString('en-US', { maximumFractionDigits: 0 })
                        : price >= 10 ? price.toFixed(2) : price.toFixed(4)
                      : '—'}
                  </div>
                  <div className={`terminal-market-card-chg ${up ? 't-green' : 't-red'}`}>
                    {pct != null ? `${up ? '+' : ''}${pct.toFixed(2)}%` : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
