'use client'

import { useCallback } from 'react'
import { STRIP_SYMBOLS } from '@/lib/terminal/symbols'
import { usePolling } from './usePolling'
import { useStreamedPrice, useFlash } from './StreamProvider'

interface Quote { symbol: string; price: number | null; pctChange: number | null; prevClose?: number }

function StripItem({ symbol, label, quote, onSelect }: { symbol: string; label: string; quote?: Quote; onSelect: (s: string) => void }) {
  const streamed = useStreamedPrice(symbol)
  const flash = useFlash(streamed)

  const price = streamed ?? quote?.price ?? null
  // Recompute % live off prevClose when a stream tick is present.
  const pct = streamed != null && quote?.prevClose
    ? ((streamed - quote.prevClose) / quote.prevClose) * 100
    : quote?.pctChange ?? null
  const up = (pct ?? 0) >= 0

  return (
    <div className="terminal-strip-item" onClick={() => onSelect(symbol)}>
      <span className="terminal-strip-sym">{label}</span>
      <span className={`terminal-strip-price ${flash}`}>
        {price != null ? (price >= 1000 ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)) : '—'}
      </span>
      <span className={`terminal-strip-chg ${up ? 't-green' : 't-red'}`}>
        {pct != null ? `${up ? '+' : ''}${pct.toFixed(2)}%` : ''}
      </span>
    </div>
  )
}

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
      {STRIP_SYMBOLS.map(s => (
        <StripItem key={s.symbol} symbol={s.symbol} label={s.label} quote={bySymbol?.get(s.symbol)} onSelect={onSelect} />
      ))}
    </div>
  )
}
