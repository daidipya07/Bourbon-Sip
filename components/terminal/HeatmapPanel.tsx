'use client'

import { useEffect, useState, useCallback } from 'react'
import { HEATMAP_SYMBOLS } from '@/lib/terminal/symbols'

interface HeatItem {
  symbol: string
  name: string
  sector: string
  pctChange: number | null
}

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
  const [items, setItems] = useState<HeatItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const symbols = HEATMAP_SYMBOLS.map(s => s.symbol).join(',')
      const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols)}`)
      const data = await res.json()
      const bySymbol = new Map((data.quotes || []).map((q: { symbol: string; pctChange: number | null }) => [q.symbol, q]))
      setItems(HEATMAP_SYMBOLS.map(s => {
        const q = bySymbol.get(s.symbol) as { pctChange: number | null } | undefined
        return { ...s, pctChange: q?.pctChange ?? null }
      }))
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchAll])

  if (loading && items.length === 0) return <div className="terminal-loading">Loading heatmap</div>

  const sectors = Array.from(new Set(HEATMAP_SYMBOLS.map(s => s.sector)))

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">US Large Caps — Heatmap by Sector</span>
        <span style={{ fontSize: '9px', color: '#444' }}>% change · click to chart</span>
      </div>
      <div className="terminal-panel-body">
        {sectors.map(sector => (
          <div key={sector}>
            <div className="terminal-sector-label">{sector}</div>
            <div className="terminal-heatmap">
              {items.filter(i => i.sector === sector).map(item => (
                <div
                  key={item.symbol}
                  className="terminal-heatmap-cell"
                  style={{ background: getHeatColor(item.pctChange ?? 0) }}
                  onClick={() => onSelect(item.symbol)}
                >
                  <div className="terminal-heatmap-sym">{item.symbol}</div>
                  <div className="terminal-heatmap-pct">
                    {item.pctChange != null ? `${item.pctChange >= 0 ? '+' : ''}${item.pctChange.toFixed(2)}%` : '—'}
                  </div>
                  <div className="terminal-heatmap-name">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
