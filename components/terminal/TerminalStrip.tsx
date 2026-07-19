'use client'

import { useCallback } from 'react'
import { STRIP_SYMBOLS } from '@/lib/terminal/symbols'
import { usePolling } from './usePolling'

interface Quote { symbol: string; price: number | null; pctChange: number | null }

export default function TerminalStrip({ onSelect }: { onSelect: (symbol: string) => void }) {
  const fetcher = useCallback(async () => {
    const symbols = STRIP_SYMBOLS.map(s => s.symbol).join(',')
    const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols)}`)
    if (!res.ok) throw new Error('strip')
    const data = await res.json()
    return new Map<string, Quote>((data.quotes || []).map((q: Quote) => [q.symbol, q]))
  }, [])

  const { data: bySymbol } = usePolling(fetcher, { intervalMs: 60_000 })

  return (
    <div className="terminal-strip">
      {STRIP_SYMBOLS.map(s => {
        const q = bySymbol?.get(s.symbol)
        const price = q?.price ?? null
        const pct = q?.pctChange ?? null
        const up = (pct ?? 0) >= 0
        return (
          <div key={s.symbol} className="terminal-strip-item" onClick={() => onSelect(s.symbol)}>
            <span className="terminal-strip-sym">{s.label}</span>
            <span className="terminal-strip-price">
              {price != null ? (price >= 1000 ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)) : '—'}
            </span>
            <span className={`terminal-strip-chg ${up ? 't-green' : 't-red'}`}>
              {pct != null ? `${up ? '+' : ''}${pct.toFixed(2)}%` : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
