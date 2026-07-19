'use client'

import { useEffect, useState, useCallback } from 'react'

interface WatchItem {
  symbol: string
  price: number | null
  pctChange: number | null
}

const DEFAULT_WATCHLIST = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'BRK.B', 'GLD', 'TLT']
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
  const [items, setItems] = useState<WatchItem[]>([])
  const [addMode, setAddMode] = useState(false)
  const [addInput, setAddInput] = useState('')

  // Load watchlist on mount
  useEffect(() => {
    setSymbols(loadWatchlist())
  }, [])

  const fetchQuotes = useCallback(async (syms: string[]) => {
    const results: WatchItem[] = await Promise.all(
      syms.map(async sym => {
        try {
          const res = await fetch(`/api/terminal/quote?symbol=${encodeURIComponent(sym)}`)
          const d = await res.json()
          return { symbol: sym, price: d.price ?? null, pctChange: d.pctChange ?? null }
        } catch {
          return { symbol: sym, price: null, pctChange: null }
        }
      })
    )
    setItems(results)
  }, [])

  useEffect(() => {
    if (symbols.length > 0) fetchQuotes(symbols)
    // Refresh every 60s
    const id = setInterval(() => { if (symbols.length > 0) fetchQuotes(symbols) }, 60000)
    return () => clearInterval(id)
  }, [symbols, fetchQuotes])

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
    setItems(items.filter(i => i.symbol !== sym))
  }

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Watchlist</span>
        <button
          onClick={() => setAddMode(!addMode)}
          style={{ background: 'none', border: 'none', color: '#c8963e', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
        >
          +
        </button>
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
        {items.map(item => {
          const up = (item.pctChange ?? 0) >= 0
          return (
            <div
              key={item.symbol}
              className="terminal-watchlist-row"
              onClick={() => onSelect(item.symbol)}
              onContextMenu={e => { e.preventDefault(); removeSymbol(item.symbol) }}
              title="Click to view · Right-click to remove"
            >
              <span className="terminal-watchlist-sym">{item.symbol}</span>
              <span className="terminal-watchlist-price">
                {item.price ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
              </span>
              <span className={`terminal-watchlist-chg ${up ? 't-green' : 't-red'}`}>
                {item.pctChange != null ? `${up ? '+' : ''}${item.pctChange.toFixed(2)}%` : '—'}
              </span>
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="terminal-loading">Loading watchlist</div>
        )}
      </div>
    </div>
  )
}
