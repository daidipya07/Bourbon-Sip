'use client'

import { useState } from 'react'
import { dailyReturns, alignByTime, pearson } from '@/lib/terminal/analysis'
import type { Candle } from '@/lib/terminal/indicators'
import { ToolDisclaimer } from './ToolsPanel'

const MAX_SYMBOLS = 6

// Diverging color: -1 cool blue → 0 neutral → +1 hot red.
function corrColor(r: number): string {
  if (r >= 0) {
    const a = Math.min(1, r)
    return `rgba(255, 82, 82, ${0.08 + a * 0.5})`
  }
  const a = Math.min(1, -r)
  return `rgba(79, 143, 224, ${0.08 + a * 0.5})`
}

export default function CorrelationTool({ defaultSymbol }: { defaultSymbol: string }) {
  const initial = defaultSymbol.includes(':') || defaultSymbol === 'SPY'
    ? ['SPY', 'QQQ', 'GLD']
    : ['SPY', defaultSymbol, 'GLD']
  const [symbols, setSymbols] = useState<string[]>(initial)
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [matrix, setMatrix] = useState<Array<Array<number | null>> | null>(null)
  const [ranSymbols, setRanSymbols] = useState<string[]>([])
  const [days, setDays] = useState(0)

  function addSymbol() {
    const s = input.trim().toUpperCase()
    if (s && !symbols.includes(s) && symbols.length < MAX_SYMBOLS) setSymbols([...symbols, s])
    setInput('')
  }

  async function run() {
    if (symbols.length < 2) { setError('Add at least 2 symbols.'); return }
    setRunning(true)
    setError('')
    try {
      const all = await Promise.all(symbols.map(async s => {
        const res = await fetch(`/api/terminal/candles?symbol=${encodeURIComponent(s)}&range=1Y`)
        const d = await res.json()
        return { symbol: s, candles: (d.candles || []) as Candle[] }
      }))
      const missing = all.filter(a => a.candles.length < 30).map(a => a.symbol)
      if (missing.length > 0) throw new Error(`No usable history for: ${missing.join(', ')}`)

      const aligned = alignByTime(all.map(a => dailyReturns(a.candles)))
      const n = aligned[0]?.length ?? 0
      if (n < 30) throw new Error('Fewer than 30 overlapping trading days')

      const m: Array<Array<number | null>> = symbols.map((_, i) =>
        symbols.map((_, j) => (i === j ? 1 : pearson(aligned[i], aligned[j])))
      )
      setMatrix(m)
      setRanSymbols([...symbols])
      setDays(n)
    } catch (err) {
      setMatrix(null)
      setError(err instanceof Error ? err.message : 'Failed to compute correlations')
    }
    setRunning(false)
  }

  return (
    <div className="terminal-tool">
      <div className="terminal-tool-header">
        <span className="terminal-panel-title">Correlation Matrix — 1Y Daily Returns</span>
      </div>

      <div className="terminal-tool-form">
        <div className="terminal-tool-field" style={{ gridColumn: '1 / -1' }}>
          <span>Symbols (2–{MAX_SYMBOLS})</span>
          <div className="terminal-compare-bar" style={{ border: 'none', padding: 0, background: 'none' }}>
            {symbols.map(s => (
              <span key={s} className="terminal-compare-chip" style={{ borderColor: '#c8963e' }}>
                {s}
                <button onClick={() => setSymbols(symbols.filter(x => x !== s))}>×</button>
              </span>
            ))}
            {symbols.length < MAX_SYMBOLS && (
              <input
                className="terminal-compare-input"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && addSymbol()}
                placeholder="+ symbol"
              />
            )}
          </div>
        </div>
        <button className="terminal-tool-run" onClick={run} disabled={running}>
          {running ? 'Computing…' : 'Run'}
        </button>
      </div>

      {error && <div className="terminal-tool-warn">{error}</div>}

      {matrix && (
        <>
          <div className="terminal-tool-ranlabel">{days} overlapping trading days</div>
          <div className="terminal-corr-wrap">
            <table className="terminal-corr-table">
              <thead>
                <tr>
                  <th />
                  {ranSymbols.map(s => <th key={s}>{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {ranSymbols.map((rowSym, i) => (
                  <tr key={rowSym}>
                    <th>{rowSym}</th>
                    {ranSymbols.map((colSym, j) => {
                      const r = matrix[i][j]
                      return (
                        <td key={colSym} style={{ background: r != null ? corrColor(r) : undefined }}>
                          {r != null ? r.toFixed(2) : '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="terminal-tool-legend">
            <span><span className="terminal-rec-dot" style={{ background: 'rgba(79,143,224,0.6)' }} /> negative (diversifying)</span>
            <span><span className="terminal-rec-dot" style={{ background: 'rgba(255,255,255,0.15)' }} /> ~0 (independent)</span>
            <span><span className="terminal-rec-dot" style={{ background: 'rgba(255,82,82,0.6)' }} /> +1 (moves together)</span>
          </div>
        </>
      )}

      {!matrix && !error && (
        <div className="terminal-tool-empty">
          Add tickers and Run — correlations are computed from a year of aligned daily returns.
        </div>
      )}

      <ToolDisclaimer />
    </div>
  )
}
