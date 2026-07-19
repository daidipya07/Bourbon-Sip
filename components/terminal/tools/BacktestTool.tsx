'use client'

import { useEffect, useRef, useState } from 'react'
import { createChart, type IChartApi, ColorType, LineStyle, type LineData, type Time } from 'lightweight-charts'
import { dcaBacktest, lumpSumBacktest, type BacktestResult } from '@/lib/terminal/analysis'
import type { Candle } from '@/lib/terminal/indicators'
import { ToolDisclaimer } from './ToolsPanel'
import ToolHelp from './ToolHelp'

type Mode = 'dca' | 'lump'
type Period = '1Y' | '3Y' | '5Y' | 'MAX'

// 3Y is served from the 5Y range, trimmed client-side.
const PERIOD_RANGE: Record<Period, string> = { '1Y': '1Y', '3Y': '5Y', '5Y': '5Y', 'MAX': 'MAX' }

function fmtMoney(v: number): string {
  return `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

async function loadCandles(sym: string, period: Period, dividends: boolean): Promise<Candle[]> {
  const adjust = dividends ? '&adjust=all' : ''
  const res = await fetch(`/api/terminal/candles?symbol=${encodeURIComponent(sym)}&range=${PERIOD_RANGE[period]}${adjust}`)
  const data = await res.json()
  let candles: Candle[] = data.candles || []
  if (candles.length < 24) throw new Error(data.error || `Not enough history for ${sym}`)
  if (period === '3Y') {
    const cutoff = candles[candles.length - 1].time - 3 * 365.25 * 86400
    candles = candles.filter(c => c.time >= cutoff)
  }
  return candles
}

export default function BacktestTool({ defaultSymbol }: { defaultSymbol: string }) {
  const [symbol, setSymbol] = useState(defaultSymbol.includes(':') ? 'SPY' : defaultSymbol)
  const [mode, setMode] = useState<Mode>('dca')
  const [amount, setAmount] = useState('500')
  const [period, setPeriod] = useState<Period>('5Y')
  const [dividends, setDividends] = useState(true)
  const [benchmark, setBenchmark] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [benchResult, setBenchResult] = useState<BacktestResult | null>(null)
  const [ranLabel, setRanLabel] = useState('')
  const [ranSymbol, setRanSymbol] = useState('')

  const chartContainer = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  async function run() {
    const sym = symbol.trim().toUpperCase()
    const amt = parseFloat(amount)
    if (!sym || !(amt > 0)) { setError('Enter a symbol and a positive amount.'); return }
    setRunning(true)
    setError('')
    try {
      const wantBench = benchmark && sym !== 'SPY'
      const [candles, benchCandles] = await Promise.all([
        loadCandles(sym, period, dividends),
        wantBench ? loadCandles('SPY', period, dividends) : Promise.resolve(null),
      ])

      const bt = (c: Candle[]) => (mode === 'dca' ? dcaBacktest(c, amt) : lumpSumBacktest(c, amt))
      const r = bt(candles)
      if (!r) throw new Error('Backtest failed on this data')
      setResult(r)
      setBenchResult(benchCandles ? bt(benchCandles) : null)
      setRanSymbol(sym)
      setRanLabel(
        `${sym} · ${mode === 'dca' ? `$${amt}/month` : `$${amt} lump sum`} · ${period} · ` +
        `${dividends ? 'total return (dividends reinvested)' : 'price return (no dividends)'}`
      )
    } catch (err) {
      setResult(null)
      setBenchResult(null)
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

    const value = chart.addLineSeries({ color: '#c8963e', lineWidth: 2 })
    value.setData(result.series.map(p => ({ time: p.time as Time, value: p.value })) as LineData[])

    if (benchResult) {
      const bench = chart.addLineSeries({ color: '#888', lineWidth: 1 })
      bench.setData(benchResult.series.map(p => ({ time: p.time as Time, value: p.value })) as LineData[])
    }

    const contrib = chart.addLineSeries({ color: '#4f8fe0', lineWidth: 1, lineStyle: LineStyle.Dashed })
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
  }, [result, benchResult])

  function downloadCsv() {
    if (!result) return
    const rows = [['date', `${ranSymbol}_value`, 'contributed', ...(benchResult ? ['spy_value'] : [])]]
    const benchByTime = benchResult ? new Map(benchResult.series.map(p => [p.time, p.value])) : null
    for (const p of result.series) {
      const d = new Date(p.time * 1000).toISOString().split('T')[0]
      const row = [d, p.value.toFixed(2), p.contributed.toFixed(2)]
      if (benchByTime) row.push((benchByTime.get(p.time) ?? '').toString())
      rows.push(row)
    }
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `backtest-${ranSymbol}-${period}-${mode}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const gainUp = (result?.gain ?? 0) >= 0

  return (
    <div className="terminal-tool">
      <div className="terminal-tool-header">
        <span className="terminal-panel-title">DCA / Lump-Sum Backtester</span>
        <span style={{ fontSize: '9px', color: '#444' }}>Real price history · Twelve Data</span>
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
        <label className="terminal-tool-field">
          <span>Dividends</span>
          <div className="terminal-tool-seg">
            <button className={dividends ? 'active' : ''} onClick={() => setDividends(true)} title="Dividend-adjusted prices — models reinvesting every dividend">Reinvested</button>
            <button className={!dividends ? 'active' : ''} onClick={() => setDividends(false)} title="Raw split-adjusted prices — ignores dividends entirely">Excluded</button>
          </div>
        </label>
        <label className="terminal-tool-field">
          <span>Benchmark</span>
          <div className="terminal-tool-seg">
            <button className={benchmark ? 'active' : ''} onClick={() => setBenchmark(true)}>vs SPY</button>
            <button className={!benchmark ? 'active' : ''} onClick={() => setBenchmark(false)}>Off</button>
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

          {benchResult && (
            <div className="terminal-tool-benchrow">
              Same plan in <b>SPY</b>: {fmtMoney(benchResult.finalValue)} final
              ({benchResult.totalReturnPct >= 0 ? '+' : ''}{benchResult.totalReturnPct.toFixed(1)}%
              {benchResult.annualizedPct != null && <> · {benchResult.annualizedPct >= 0 ? '+' : ''}{benchResult.annualizedPct.toFixed(1)}%/yr</>})
              {' — '}
              <span className={result.finalValue >= benchResult.finalValue ? 't-green' : 't-red'}>
                {ranSymbol} {result.finalValue >= benchResult.finalValue ? 'outperformed' : 'underperformed'} by {fmtMoney(Math.abs(result.finalValue - benchResult.finalValue))}
              </span>
            </div>
          )}

          <div ref={chartContainer} className="terminal-tool-chart" />
          <div className="terminal-tool-legend">
            <span><span className="terminal-rec-dot" style={{ background: '#c8963e' }} /> {ranSymbol} value</span>
            {benchResult && <span><span className="terminal-rec-dot" style={{ background: '#888' }} /> SPY value (same plan)</span>}
            <span><span className="terminal-rec-dot" style={{ background: '#4f8fe0' }} /> Total contributed</span>
            <button className="terminal-tool-csv" onClick={downloadCsv}>↓ CSV</button>
          </div>
        </>
      )}

      {!result && !error && (
        <div className="terminal-tool-empty">
          Pick a symbol, strategy and period, then Run — computed from actual closing prices.
        </div>
      )}

      <ToolHelp
        howTo={[
          'Enter a ticker (stock or ETF), choose Monthly DCA (invest a fixed amount every month) or Lump Sum (invest once at the start).',
          'Pick the period and whether dividends are reinvested (the realistic default) or excluded.',
          'Press Run. Compare against the grey SPY line — beating a simple index plan is the bar that matters.',
        ]}
        meaning={[
          ['Contributed', 'Total cash you would have put in over the period.'],
          ['Final Value', 'What those purchases would be worth at the latest close.'],
          ['Total Return', 'Gain as a % of contributed cash. For DCA this is NOT an annual rate — later contributions were invested for less time.'],
          ['XIRR', 'Your money-weighted annual return — the constant yearly rate that explains the outcome given WHEN each dollar went in. Directly comparable to an interest rate (e.g. XIRR +9%/yr beats a 5% savings account).'],
          ['CAGR', 'Compound annual growth rate of a single lump sum — the smoothed yearly growth rate.'],
          ['vs SPY', 'The identical plan applied to the S&P 500 ETF — your opportunity-cost benchmark.'],
        ]}
        methodology={[
          'DCA buys at the closing price of the first trading day of each month; lump sum buys at the first close of the period. Fractional shares allowed.',
          'Dividends "Reinvested" uses dividend-adjusted prices (Twelve Data adjust=all), which is mathematically equivalent to reinvesting every dividend on its ex-date. "Excluded" uses split-adjusted prices only.',
          'All prices are split-adjusted in both modes; MAX period uses monthly bars (one purchase at each monthly close).',
          'XIRR is solved by bisection on the exact dated cashflows; the SPY benchmark runs the identical schedule on the same dates.',
        ]}
        caveats={[
          'No trading fees, bid-ask spread, slippage or taxes are modeled — real results would be slightly lower.',
          'Results are nominal, not inflation-adjusted.',
          'Backtesting a stock you already know did well is hindsight bias — a 5Y NVDA backtest tells you what happened, not what will happen. That is exactly why the SPY benchmark is on by default.',
          'Data: Twelve Data end-of-day closes. Very long "MAX" histories can be shorter than the company\'s real history.',
        ]}
      />

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
