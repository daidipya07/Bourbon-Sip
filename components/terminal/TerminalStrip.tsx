'use client'

import { useEffect, useState, useCallback } from 'react'
import { STRIP_SYMBOLS } from '@/lib/terminal/symbols'

interface StripItem {
  symbol: string
  label: string
  price: number | null
  pctChange: number | null
}

export default function TerminalStrip({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [items, setItems] = useState<StripItem[]>([])

  const fetchAll = useCallback(async () => {
    try {
      const symbols = STRIP_SYMBOLS.map(s => s.symbol).join(',')
      const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols)}`)
      const data = await res.json()
      const bySymbol = new Map((data.quotes || []).map((q: { symbol: string; price: number | null; pctChange: number | null }) => [q.symbol, q]))
      setItems(STRIP_SYMBOLS.map(s => {
        const q = bySymbol.get(s.symbol) as { price: number | null; pctChange: number | null } | undefined
        return { ...s, price: q?.price ?? null, pctChange: q?.pctChange ?? null }
      }))
    } catch {}
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 60 * 1000)
    return () => clearInterval(id)
  }, [fetchAll])

  return (
    <div className="terminal-strip">
      {items.map(item => {
        const up = (item.pctChange ?? 0) >= 0
        return (
          <div
            key={item.symbol}
            className="terminal-strip-item"
            onClick={() => onSelect(item.symbol)}
          >
            <span className="terminal-strip-sym">{item.label}</span>
            <span className="terminal-strip-price">
              {item.price != null ? (item.price >= 1000 ? item.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : item.price.toFixed(2)) : '—'}
            </span>
            <span className={`terminal-strip-chg ${up ? 't-green' : 't-red'}`}>
              {item.pctChange != null ? `${up ? '+' : ''}${item.pctChange.toFixed(2)}%` : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
