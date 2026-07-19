'use client'

import { useCallback } from 'react'
import { HEATMAP_SYMBOLS } from '@/lib/terminal/symbols'
import { usePolling } from './usePolling'
import PanelStatus from './PanelStatus'

interface Quote { symbol: string; pctChange: number | null }

function getHeatColor(pct: number): string {
  if (pct >= 3) return 'rgba(0, 200, 83, 0.7)'
  if (pct >= 1.5) return 'rgba(0, 200, 83, 0.5)'
  if (pct >= 0.5) return 'rgba(0, 200, 83, 0.3)'
  if (pct >= 0) return 'rgba(0, 200, 83, 0.15)'
  if (pct >= -0.5) return 'rgba(255, 23, 68, 0.15)'
  if (pct >= -1.5) return 'rgba(255, 23, 68, 0.3)'
  if (pct >= -3) return 'rgba(255, 23, 68, 0.5)'
  return 'rgba(255, 23, 68, 0.7)'
}

export default function HeatmapPanel({ onSelect }: { onSelect: (symbol: string) => void }) {
  const fetcher = useCallback(async () => {
    const symbols = HEATMAP_SYMBOLS.map(s => s.symbol).join(',')
    const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols)}`)
    if (!res.ok) throw new Error('heatmap')
    const data = await res.json()
    return new Map<string, Quote>((data.quotes || []).map((q: Quote) => [q.symbol, q]))
  }, [])

  const { data: bySymbol, loading, error, lastUpdated, stale, refetch } = usePolling(fetcher, { intervalMs: 5 * 60_000 })

  if (loading && !bySymbol) return <div className="terminal-loading">Loading heatmap</div>

  const sectors = Array.from(new Set(HEATMAP_SYMBOLS.map(s => s.sector)))

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Heatmap — {HEATMAP_SYMBOLS.length} Tracked US Large Caps</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '9px', color: '#444' }}>% change · click to chart</span>
          <PanelStatus lastUpdated={lastUpdated} stale={stale} error={error} onRetry={refetch} />
        </div>
      </div>
      <div className="terminal-panel-body">
        {sectors.map(sector => (
          <div key={sector}>
            <div className="terminal-sector-label">{sector}</div>
            <div className="terminal-heatmap">
              {HEATMAP_SYMBOLS.filter(i => i.sector === sector).map(item => {
                const pct = bySymbol?.get(item.symbol)?.pctChange ?? null
                return (
                  <div
                    key={item.symbol}
                    className="terminal-heatmap-cell"
                    style={{ background: getHeatColor(pct ?? 0) }}
                    onClick={() => onSelect(item.symbol)}
                  >
                    <div className="terminal-heatmap-sym">{item.symbol}</div>
                    <div className="terminal-heatmap-pct">
                      {pct != null ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` : '—'}
                    </div>
                    <div className="terminal-heatmap-name">{item.name}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
