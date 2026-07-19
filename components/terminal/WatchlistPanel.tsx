'use client'

import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_WATCHLIST } from '@/lib/terminal/symbols'
import { usePolling } from './usePolling'
import { useStreamedPrice, useFlash } from './StreamProvider'
import PanelStatus from './PanelStatus'

interface Quote { symbol: string; price: number | null; pctChange: number | null; prevClose?: number; changeBasis?: string }

function WatchRow({ symbol, quote, onSelect, onRemove }: {
  symbol: string; quote?: Quote; onSelect: (s: string) => void; onRemove: (s: string) => void
}) {
  const streamed = useStreamedPrice(symbol)
  const flash = useFlash(streamed)

  const price = streamed ?? quote?.price ?? null
  const pct = streamed != null && quote?.prevClose
    ? ((streamed - quote.prevClose) / quote.prevClose) * 100
    : quote?.pctChange ?? null
  const up = (pct ?? 0) >= 0

  return (
    <div
      className="terminal-watchlist-row"
      onClick={() => onSelect(symbol)}
      onContextMenu={e => { e.preventDefault(); onRemove(symbol) }}
      title="Click to view · Right-click to remove"
    >
      <span className="terminal-watchlist-sym">{symbol}</span>
      <span className={`terminal-watchlist-price ${flash}`}>
        {price != null ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
      </span>
      <span className={`terminal-watchlist-chg ${up ? 't-green' : 't-red'}`}>
        {pct != null ? `${up ? '+' : ''}${pct.toFixed(2)}%${quote?.changeBasis === '24h' ? ' 24h' : ''}` : '—'}
      </span>
    </div>
  )
}

const STORAGE_KEY = 'bourbon-terminal-watchlist'

function loadWatchlist(): string[] {
  if (typeof window === 'undefined') return DEFAULT_WATCHLIST
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return DEFAULT_WATCHLIST
}

function saveWatchlist(symbols: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols)) } catch {}
}

export default function WatchlistPanel({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [symbols, setSymbols] = useState<string[]>([])
  const [addMode, setAddMode] = useState(false)
  const [addInput, setAddInput] = useState('')

  useEffect(() => { setSymbols(loadWatchlist()) }, [])

  const fetcher = useCallback(async () => {
    if (symbols.length === 0) return new Map<string, Quote>()
    const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols.join(','))}`)
    if (!res.ok) throw new Error('watchlist')
    const data = await res.json()
    return new Map<string, Quote>((data.quotes || []).map((q: Quote) => [q.symbol, q]))
  }, [symbols])

  const { data: bySymbol, loading, error, lastUpdated, stale, refetch } = usePolling(fetcher, {
    intervalMs: 60_000,
    enabled: symbols.length > 0,
  })

  // Refetch immediately after the watchlist changes.
  useEffect(() => { if (symbols.length > 0) refetch() }, [symbols, refetch])

  function addSymbol() {
    const sym = addInput.trim().toUpperCase()
    if (sym && !symbols.includes(sym)) {
      const next = [...symbols, sym]
      setSymbols(next)
      saveWatchlist(next)
    }
    setAddInput('')
    setAddMode(false)
  }

  function removeSymbol(sym: string) {
    const next = symbols.filter(s => s !== sym)
    setSymbols(next)
    saveWatchlist(next)
  }

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Watchlist</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PanelStatus lastUpdated={lastUpdated} stale={stale} error={error} onRetry={refetch} />
          <button
            onClick={() => setAddMode(!addMode)}
            style={{ background: 'none', border: 'none', color: '#c8963e', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
          >
            +
          </button>
        </div>
      </div>
      <div className="terminal-panel-body">
        {addMode && (
          <div style={{ padding: '6px 12px', display: 'flex', gap: '4px' }}>
            <input
              value={addInput}
              onChange={e => setAddInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSymbol()}
              placeholder="AAPL"
              autoFocus
              style={{
                flex: 1, background: '#111', border: '1px solid #222', color: '#e8e8e8',
                fontFamily: 'inherit', fontSize: '11px', padding: '3px 8px', borderRadius: '2px', outline: 'none',
              }}
            />
            <button
              onClick={addSymbol}
              style={{ background: '#c8963e', color: '#000', border: 'none', padding: '3px 10px', fontSize: '10px', fontFamily: 'inherit', cursor: 'pointer', borderRadius: '2px', fontWeight: 600 }}
            >
              ADD
            </button>
          </div>
        )}
        {symbols.map(sym => (
          <WatchRow key={sym} symbol={sym} quote={bySymbol?.get(sym)} onSelect={onSelect} onRemove={removeSymbol} />
        ))}
        {loading && symbols.length > 0 && !bySymbol && (
          <div className="terminal-loading">Loading watchlist</div>
        )}
      </div>
    </div>
  )
}
