'use client'

import { useEffect, useState, useCallback } from 'react'

interface StripItem {
  symbol: string
  label: string
  price: number | null
  pctChange: number | null
}

const STRIP_SYMBOLS = [
  { symbol: 'SPY', label: 'S&P 500' },
  { symbol: 'QQQ', label: 'Nasdaq' },
  { symbol: 'DIA', label: 'Dow' },
  { symbol: 'IWM', label: 'Russell' },
  { symbol: 'GLD', label: 'Gold' },
  { symbol: 'USO', label: 'Oil' },
  { symbol: 'TLT', label: '20Y Bond' },
  { symbol: 'BINANCE:BTCUSDT', label: 'BTC' },
  { symbol: 'BINANCE:ETHUSDT', label: 'ETH' },
  { symbol: 'NVDA', label: 'NVDA' },
]

export default function TerminalStrip({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [items, setItems] = useState<StripItem[]>([])

  const fetchAll = useCallback(async () => {
    const results: StripItem[] = await Promise.all(
      STRIP_SYMBOLS.map(async s => {
        try {
          const res = await fetch(`/api/terminal/quote?symbol=${encodeURIComponent(s.symbol)}`)
          const d = await res.json()
          return { ...s, price: d.price ?? null, pctChange: d.pctChange ?? null }
        } catch {
          return { ...s, price: null, pctChange: null }
        }
      })
    )
    setItems(results)
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
              {item.price ? (item.price >= 1000 ? item.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : item.price.toFixed(2)) : '—'}
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
