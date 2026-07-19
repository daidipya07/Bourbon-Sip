'use client'

import { useEffect, useState, useCallback } from 'react'
import { MARKET_SYMBOLS } from '@/lib/terminal/symbols'

interface MarketItem {
  symbol: string
  name: string
  group: string
  price: number | null
  pctChange: number | null
}

export default function MarketOverview({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [items, setItems] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const symbols = MARKET_SYMBOLS.map(s => s.symbol).join(',')
      const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols)}`)
      const data = await res.json()
      const bySymbol = new Map((data.quotes || []).map((q: { symbol: string; price: number | null; pctChange: number | null }) => [q.symbol, q]))
      setItems(MARKET_SYMBOLS.map(s => {
        const q = bySymbol.get(s.symbol) as { price: number | null; pctChange: number | null } | undefined
        return { ...s, price: q?.price ?? null, pctChange: q?.pctChange ?? null }
      }))
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchAll])

  if (loading && items.length === 0) return <div className="terminal-loading">Loading markets</div>

  const groups = Array.from(new Set(MARKET_SYMBOLS.map(s => s.group)))

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      {groups.map(group => (
        <div key={group}>
          <div className="terminal-sector-label">{group}</div>
          <div className="terminal-market-grid">
            {items.filter(i => i.group === group).map(item => {
              const up = (item.pctChange ?? 0) >= 0
              return (
                <div
                  key={item.symbol}
                  className="terminal-market-card"
                  onClick={() => onSelect(item.symbol)}
                >
                  <div className="terminal-market-card-sym">{item.symbol}</div>
                  <div className="terminal-market-card-name">{item.name}</div>
                  <div className="terminal-market-card-price">
                    {item.price != null
                      ? item.price >= 1000
                        ? item.price.toLocaleString('en-US', { maximumFractionDigits: 0 })
                        : item.price >= 10 ? item.price.toFixed(2) : item.price.toFixed(4)
                      : '—'}
                  </div>
                  <div className={`terminal-market-card-chg ${up ? 't-green' : 't-red'}`}>
                    {item.pctChange != null ? `${up ? '+' : ''}${item.pctChange.toFixed(2)}%` : '—'}
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
