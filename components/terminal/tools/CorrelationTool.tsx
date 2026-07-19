'use client'

import { useState } from 'react'
import { dailyReturns, alignByTime, pearson } from '@/lib/terminal/analysis'
import type { Candle } from '@/lib/terminal/indicators'
import { ToolDisclaimer } from './ToolsPanel'
import ToolHelp from './ToolHelp'

const MAX_SYMBOLS = 6
type CorrPeriod = '1Y' | '3Y' | '5Y'
const PERIOD_RANGE: Record<CorrPeriod, string> = { '1Y': '1Y', '3Y': '5Y', '5Y': '5Y' }

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
  const [period, setPeriod] = useState<CorrPeriod>('1Y')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [matrix, setMatrix] = useState<Array<Array<number | null>> | null>(null)
  const [ranSymbols, setRanSymbols] = useState<string[]>([])
  const [ranPeriod, setRanPeriod] = useState<CorrPeriod>('1Y')
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
        const res = await fetch(`/api/terminal/candles?symbol=${encodeURIComponent(s)}&range=${PERIOD_RANGE[period]}`)
        const d = await res.json()
        let candles = (d.candles || []) as Candle[]
        if (period === '3Y' && candles.length > 0) {
          const cutoff = candles[candles.length - 1].time - 3 * 365.25 * 86400
          candles = candles.filter(c => c.time >= cutoff)
        }
        return { symbol: s, candles }
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
      setRanPeriod(period)
      setDays(n)
    } catch (err) {
      setMatrix(null)
      setError(err instanceof Error ? err.message : 'Failed to compute correlations')
    }
    setRunning(false)
  }

  const retFreq = (p: CorrPeriod) => (p === '1Y' ? 'daily' : 'weekly')

  return (
    <div className="terminal-tool">
      <div className="terminal-tool-header">
        <span className="terminal-panel-title">Correlation Matrix</span>
        <span style={{ fontSize: '9px', color: '#444' }}>Pearson r of {retFreq(period)} returns</span>
      </div>

      <div className="terminal-tool-form">
        <label className="terminal-tool-field">
          <span>Period</span>
          <div className="terminal-tool-seg">
            {(['1Y', '3Y', '5Y'] as CorrPeriod[]).map(p => (
              <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
        </label>
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
          <div className="terminal-tool-ranlabel">
            {ranPeriod} · {retFreq(ranPeriod)} returns · {days} overlapping {ranPeriod === '1Y' ? 'trading days' : 'weeks'}
          </div>
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
          Add tickers and Run — correlations are computed from aligned return history.
        </div>
      )}

      <ToolHelp
        howTo={[
          'Add 2–6 tickers you hold or are considering holding together (stocks, ETFs, crypto).',
          'Pick a period (1Y uses daily returns; 3Y/5Y use weekly) and press Run.',
          'Look at the off-diagonal cells: lots of deep red means your "diversified" portfolio is really one bet.',
        ]}
        meaning={[
          ['+1.00', 'The two assets moved in lockstep — owning both adds no diversification.'],
          ['0.00', 'No linear relationship — their moves were independent over this window.'],
          ['−1.00', 'They moved opposite each other — the strongest diversifier (rare in practice).'],
          ['Rules of thumb', '|r| under 0.3 = weak relationship · 0.3–0.7 = moderate · above 0.7 = strong. Most US large-cap stocks sit at 0.4–0.8 with each other.'],
        ]}
        methodology={[
          'For each symbol we take closing prices (Twelve Data), compute period-over-period % returns, intersect all series on their common dates, and compute the Pearson correlation of each pair on that identical date set.',
          'Assets that trade on different calendars (e.g. crypto trades weekends, stocks don\'t) are compared only on their overlapping days.',
          'The diagonal is 1.00 by definition.',
        ]}
        caveats={[
          'Correlation is a snapshot of one window and it drifts over time — check more than one period before drawing conclusions.',
          'Correlations tend to spike toward +1 in market crashes, exactly when you want diversification most. A calm-market matrix understates crisis behavior.',
          'Pearson r measures linear co-movement only, and correlation is not causation.',
        ]}
      />

      <ToolDisclaimer />
    </div>
  )
}
