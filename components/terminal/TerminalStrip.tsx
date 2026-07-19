'use client'

import { useCallback } from 'react'
import { STRIP_SYMBOLS } from '@/lib/terminal/symbols'
import { usePolling } from './usePolling'
import { useStreamedPrice, useFlash } from './StreamProvider'

interface Quote { symbol: string; price: number | null; pctChange: number | null; prevClose?: number; changeBasis?: string }

interface FredStrip {
  vix: number | null; vixChange: number | null
  yield10y: number | null; yield10yChange: number | null
  dxy: number | null; dxyChange: number | null
}

function StripItem({ symbol, label, quote, onSelect }: { symbol: string; label: string; quote?: Quote; onSelect: (s: string) => void }) {
  const streamed = useStreamedPrice(symbol)
  const flash = useFlash(streamed)

  const price = streamed ?? quote?.price ?? null
  // Recompute % live off prevClose when a stream tick is present.
  const pct = streamed != null && quote?.prevClose
    ? ((streamed - quote.prevClose) / quote.prevClose) * 100
    : quote?.pctChange ?? null
  const up = (pct ?? 0) >= 0
  const is24h = quote?.changeBasis === '24h'

  return (
    <div className="terminal-strip-item" onClick={() => onSelect(symbol)}>
      <span className="terminal-strip-sym">{label}</span>
      <span className={`terminal-strip-price ${flash}`}>
        {price != null ? (price >= 1000 ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)) : '—'}
      </span>
      <span className={`terminal-strip-chg ${up ? 't-green' : 't-red'}`}>
        {pct != null ? `${up ? '+' : ''}${pct.toFixed(2)}%${is24h ? ' 24h' : ''}` : ''}
      </span>
    </div>
  )
}

// Real macro values from FRED (not ETF proxies) — same source as the Macro tab.
function MacroChip({ label, value, change, digits = 2, onClick }: {
  label: string; value: number | null; change: number | null; digits?: number; onClick?: () => void
}) {
  if (value == null) return null
  const up = (change ?? 0) >= 0
  return (
    <div className="terminal-strip-item terminal-strip-macro" onClick={onClick} title="FRED · weekly change · click for Macro tab">
      <span className="terminal-strip-sym">{label}</span>
      <span className="terminal-strip-price">{value.toFixed(digits)}</span>
      {change != null && (
        <span className={`terminal-strip-chg ${up ? 't-green' : 't-red'}`}>
          {up ? '+' : ''}{change.toFixed(digits)}w
        </span>
      )}
    </div>
  )
}

export default function TerminalStrip({ onSelect, onMacro }: { onSelect: (symbol: string) => void; onMacro?: () => void }) {
  const fetcher = useCallback(async () => {
    const symbols = STRIP_SYMBOLS.map(s => s.symbol).join(',')
    const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols)}`)
    if (!res.ok) throw new Error('strip')
    const data = await res.json()
    return new Map<string, Quote>((data.quotes || []).map((q: Quote) => [q.symbol, q]))
  }, [])

  const { data: bySymbol } = usePolling(fetcher, { intervalMs: 60_000 })

  const fredFetcher = useCallback(async (): Promise<FredStrip | null> => {
    const res = await fetch('/api/data-pulse')
    if (!res.ok) throw new Error('fred')
    const d = await res.json()
    return d.fred || null
  }, [])

  const { data: fred } = usePolling(fredFetcher, { intervalMs: 15 * 60_000 })

  return (
    <div className="terminal-strip">
      <MacroChip label="VIX" value={fred?.vix ?? null} change={fred?.vixChange ?? null} onClick={onMacro} />
      <MacroChip label="US 10Y" value={fred?.yield10y ?? null} change={fred?.yield10yChange ?? null} onClick={onMacro} />
      <MacroChip label="DXY" value={fred?.dxy ?? null} change={fred?.dxyChange ?? null} onClick={onMacro} />
      {STRIP_SYMBOLS.map(s => (
        <StripItem key={s.symbol} symbol={s.symbol} label={s.label} quote={bySymbol?.get(s.symbol)} onSelect={onSelect} />
      ))}
    </div>
  )
}
