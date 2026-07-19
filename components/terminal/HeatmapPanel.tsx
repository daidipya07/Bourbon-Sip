'use client'

import { useEffect, useState, useCallback } from 'react'

interface HeatItem {
  symbol: string
  name: string
  pctChange: number | null
  marketCap: number | null
}

const HEATMAP_SYMBOLS = [
  { symbol: 'AAPL',  name: 'Apple' },
  { symbol: 'MSFT',  name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN',  name: 'Amazon' },
  { symbol: 'NVDA',  name: 'Nvidia' },
  { symbol: 'META',  name: 'Meta' },
  { symbol: 'TSLA',  name: 'Tesla' },
  { symbol: 'BRK.B', name: 'Berkshire' },
  { symbol: 'JPM',   name: 'JPMorgan' },
  { symbol: 'V',     name: 'Visa' },
  { symbol: 'JNJ',   name: 'J&J' },
  { symbol: 'WMT',   name: 'Walmart' },
  { symbol: 'XOM',   name: 'Exxon' },
  { symbol: 'UNH',   name: 'UnitedHealth' },
  { symbol: 'MA',    name: 'Mastercard' },
  { symbol: 'HD',    name: 'Home Depot' },
  { symbol: 'PG',    name: 'P&G' },
  { symbol: 'COST',  name: 'Costco' },
  { symbol: 'ABBV',  name: 'AbbVie' },
  { symbol: 'CRM',   name: 'Salesforce' },
  { symbol: 'AMD',   name: 'AMD' },
  { symbol: 'NFLX',  name: 'Netflix' },
  { symbol: 'AVGO',  name: 'Broadcom' },
  { symbol: 'LLY',   name: 'Eli Lilly' },
]

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
    setLoading(true)
    const results: HeatItem[] = await Promise.all(
      HEATMAP_SYMBOLS.map(async s => {
        try {
          const res = await fetch(`/api/terminal/quote?symbol=${encodeURIComponent(s.symbol)}`)
          const d = await res.json()
          return { ...s, pctChange: d.pctChange ?? null, marketCap: d.marketCap ?? null }
        } catch {
          return { ...s, pctChange: null, marketCap: null }
        }
      })
    )
    setItems(results.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0)))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchAll])

  if (loading && items.length === 0) return <div className="terminal-loading">Loading heatmap</div>

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">S&P 500 Leaders — Heatmap</span>
      </div>
      <div className="terminal-heatmap">
        {items.map(item => (
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
  )
}
