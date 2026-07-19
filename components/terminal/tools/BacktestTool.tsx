'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, type IChartApi, ColorType, LineStyle, type LineData, type Time } from 'lightweight-charts'
import { dcaBacktest, lumpSumBacktest, type BacktestResult } from '@/lib/terminal/analysis'
import type { Candle } from '@/lib/terminal/indicators'
import { ToolDisclaimer } from './ToolsPanel'

type Mode = 'dca' | 'lump'
type Period = '1Y' | '3Y' | '5Y' | 'MAX'

// 3Y is served from the 5Y range, trimmed client-side.
const PERIOD_RANGE: Record<Period, string> = { '1Y': '1Y', '3Y': '5Y', '5Y': '5Y', 'MAX': 'MAX' }

function fmtMoney(v: number): string {
  return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export default function BacktestTool({ defaultSymbol }: { defaultSymbol: string }) {
  const [symbol, setSymbol] = useState(defaultSymbol.includes(':') ? 'SPY' : defaultSymbol)
  const [mode, setMode] = useState<Mode>('dca')
  const [amount, setAmount] = useState('500')
  const [period, setPeriod] = useState<Period>('5Y')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [ranLabel, setRanLabel] = useState('')

  const chartContainer = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  async function run() {
    const sym = symbol.trim().toUpperCase()
    const amt = parseFloat(amount)
    if (!sym || !(amt > 0)) { setError('Enter a symbol and a positive amount.'); return }
    setRunning(true)
    setError('')
    try {
      const res = await fetch(`/api/terminal/candles?symbol=${encodeURIComponent(sym)}&range=${PERIOD_RANGE[period]}`)
      const data = await res.json()
      let candles: Candle[] = data.candles || []
      if (candles.length < 24) throw new Error(data.error || `Not enough history for ${sym}`)
      if (period === '3Y') {
        const cutoff = candles[candles.length - 1].time - 3 * 365.25 * 86400
        candles = candles.filter(c => c.time >= cutoff)
      }
      const r = mode === 'dca' ? dcaBacktest(candles, amt) : lumpSumBacktest(candles, amt)
      if (!r) throw new Error('Backtest failed on this data')
      setResult(r)
      setRanLabel(`${sym} · ${mode === 'dca' ? `$${amt}/month` : `$${amt} lump sum`} · ${period}`)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Backtest failed')
    }
    setRunning(false)
  }

  // Render chart whenever a result lands.
  useEffect(() => {
    if (!result || !chartContainer.current) return
    if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }

    const chart = createChart(chartContainer.current, {
      layout: { background: { type: ColorType.Solid, color: '#0a0a0a' }, textColor: '#555', fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10 },
      grid: { vertLines: { color: '#111' }, horzLines: { color: '#111' } },
      rightPriceScale: { borderColor: '#1a1a1a' },
      timeScale: { borderColor: '#1a1a1a' },
      width: chartContainer.current.clientWidth,
      height: 260,
    })
    chartRef.current = chart

    const value = chart.addLineSeries({ color: '#c8963e', lineWidth: 2, title: 'Value' })
    value.setData(result.series.map(p => ({ time: p.time as Time, value: p.value })) as LineData[])

    const contrib = chart.addLineSeries({ color: '#4f8fe0', lineWidth: 1, lineStyle: LineStyle.Dashed, title: 'Contributed' })
    contrib.setData(result.series.map(p => ({ time: p.time as Time, value: p.contributed })) as LineData[])

    chart.timeScale().fitContent()

    const onResize = () => {
      if (chartRef.current && chartContainer.current) {
        chartRef.current.applyOptions({ width: chartContainer.current.clientWidth })
      }
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chartRef.current?.remove()
      chartRef.current = null
    }
  }, [result])

  const gainUp = (result?.gain ?? 0) >= 0

  return (
    <div className="terminal-tool">
      <div className="terminal-tool-header">
        <span className="terminal-panel-title">DCA / Lump-Sum Backtester</span>
        <span style={{ fontSize: '9px', color: '#444' }}>Real price history</span>
      </div>

      <div className="terminal-tool-form">
        <label className="terminal-tool-field">
          <span>Symbol</span>
          <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="SPY" />
        </label>
        <label className="terminal-tool-field">
          <span>Strategy</span>
          <div className="terminal-tool-seg">
            <button className={mode === 'dca' ? 'active' : ''} onClick={() => setMode('dca')}>Monthly DCA</button>
            <button className={mode === 'lump' ? 'active' : ''} onClick={() => setMode('lump')}>Lump Sum</button>
          </div>
        </label>
        <label className="terminal-tool-field">
          <span>{mode === 'dca' ? 'Amount / Month ($)' : 'Amount ($)'}</span>
          <input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" />
        </label>
        <label className="terminal-tool-field">
          <span>Period</span>
          <div className="terminal-tool-seg">
            {(['1Y', '3Y', '5Y', 'MAX'] as Period[]).map(p => (
              <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
        </label>
        <button className="terminal-tool-run" onClick={run} disabled={running}>
          {running ? 'Running…' : 'Run Backtest'}
        </button>
      </div>

      {error && <div className="terminal-tool-warn">{error}</div>}

      {result && (
        <>
          <div className="terminal-tool-ranlabel">{ranLabel} · {result.buys} {result.buys === 1 ? 'purchase' : 'purchases'}</div>
          <div className="terminal-tool-results">
            <Result label="Contributed" value={fmtMoney(result.contributed)} />
            <Result label="Final Value" value={fmtMoney(result.finalValue)} highlight />
            <Result label="Gain" value={`${gainUp ? '+' : '−'}${fmtMoney(Math.abs(result.gain))}`} cls={gainUp ? 't-green' : 't-red'} />
            <Result label="Total Return" value={`${gainUp ? '+' : ''}${result.totalReturnPct.toFixed(1)}%`} cls={gainUp ? 't-green' : 't-red'} />
            {result.annualizedPct != null && (
              <Result
                label={mode === 'dca' ? 'Annualized (XIRR)' : 'CAGR'}
                value={`${result.annualizedPct >= 0 ? '+' : ''}${result.annualizedPct.toFixed(1)}%/yr`}
                cls={result.annualizedPct >= 0 ? 't-green' : 't-red'}
              />
            )}
          </div>
          <div ref={chartContainer} className="terminal-tool-chart" />
          <div className="terminal-tool-legend">
            <span><span className="terminal-rec-dot" style={{ background: '#c8963e' }} /> Portfolio value</span>
            <span><span className="terminal-rec-dot" style={{ background: '#4f8fe0' }} /> Total contributed</span>
          </div>
        </>
      )}

      {!result && !error && (
        <div className="terminal-tool-empty">
          Pick a symbol, strategy and period, then Run — computed from actual closing prices.
        </div>
      )}

      <ToolDisclaimer />
    </div>
  )
}

function Result({ label, value, cls, highlight }: { label: string; value: string; cls?: string; highlight?: boolean }) {
  return (
    <div className={`terminal-tool-result ${highlight ? 'highlight' : ''}`}>
      <span className="terminal-tool-result-label">{label}</span>
      <span className={`terminal-tool-result-value ${cls || ''}`}>{value}</span>
    </div>
  )
}
