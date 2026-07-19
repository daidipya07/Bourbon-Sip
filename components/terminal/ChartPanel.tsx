'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  createChart, type IChartApi, ColorType, LineStyle,
  type CandlestickData, type LineData, type HistogramData, type Time,
} from 'lightweight-charts'
import {
  ema, bollinger, rsi, macd, perfStats, type Candle, type LinePoint, type BarInterval,
} from '@/lib/terminal/indicators'

const RANGES = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'] as const
const INTRADAY_RANGES = ['1D', '5D', '1M']
type ChartType = 'candle' | 'line'
type Range = typeof RANGES[number]

const COMPARE_COLORS = ['#4f8fe0', '#e0648f', '#59c98a', '#d9a441', '#9b6fe0']

function fmtVol(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`
  return String(Math.round(v))
}

// Partition vertical space into stacked panes via scaleMargins (lightweight-charts
// v4 is single-pane; weighted margins give us pseudo sub-panes).
function computeMargins(panes: { id: string; weight: number }[]): Record<string, { top: number; bottom: number }> {
  const gap = 0.04
  const total = panes.reduce((s, p) => s + p.weight, 0)
  const res: Record<string, { top: number; bottom: number }> = {}
  let acc = 0
  for (const p of panes) {
    const start = acc / total
    const end = (acc + p.weight) / total
    res[p.id] = {
      top: start > 0 ? start + gap / 2 : 0.04,
      bottom: end < 1 ? 1 - end + gap / 2 : 0.02,
    }
    acc += p.weight
  }
  return res
}

function toTime(p: LinePoint): LineData { return { time: p.time as Time, value: p.value } }

async function fetchCandles(symbol: string, range: string): Promise<{ candles: Candle[]; interval: BarInterval }> {
  const res = await fetch(`/api/terminal/candles?symbol=${encodeURIComponent(symbol)}&range=${range}`)
  const data = await res.json()
  return { candles: data.candles || [], interval: (data.interval as BarInterval) || '1d' }
}

export default function ChartPanel({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const legendRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  const [range, setRange] = useState<Range>('6M')
  const [chartType, setChartType] = useState<ChartType>('candle')
  const [ind, setInd] = useState({ ema: false, boll: false, rsi: false, macd: false })
  const [compareSymbols, setCompareSymbols] = useState<string[]>([])
  const [compareInput, setCompareInput] = useState('')
  const [showCompareInput, setShowCompareInput] = useState(false)
  const [loading, setLoading] = useState(true)
  const [empty, setEmpty] = useState(false)
  const [stats, setStats] = useState<ReturnType<typeof perfStats> | null>(null)
  const [rangeReturn, setRangeReturn] = useState<number | null>(null)

  const toggle = (k: keyof typeof ind) => setInd(s => ({ ...s, [k]: !s[k] }))

  const render = useCallback(async (sym: string, rng: Range, type: ChartType, indi: typeof ind, compares: string[]) => {
    if (!containerRef.current) return
    setLoading(true)
    setEmpty(false)

    try {
      const { candles, interval } = await fetchCandles(sym, rng)

      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }
      if (candles.length === 0) { setEmpty(true); setLoading(false); setStats(null); return }

      const chart = createChart(containerRef.current, {
        layout: { background: { type: ColorType.Solid, color: '#0a0a0a' }, textColor: '#555', fontFamily: 'var(--font-dm-mono), monospace', fontSize: 10 },
        grid: { vertLines: { color: '#111' }, horzLines: { color: '#111' } },
        crosshair: {
          vertLine: { color: '#c8963e44', width: 1, style: 2, labelBackgroundColor: '#c8963e' },
          horzLine: { color: '#c8963e44', width: 1, style: 2, labelBackgroundColor: '#c8963e' },
        },
        rightPriceScale: { borderColor: '#1a1a1a' },
        timeScale: { borderColor: '#1a1a1a', timeVisible: INTRADAY_RANGES.includes(rng), secondsVisible: false },
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })
      chartRef.current = chart

      // ── Comparison mode: normalized % lines, no candles/indicators ──
      if (compares.length > 0) {
        const base = candles
        const baseStart = base[0]?.close || 1
        const baseLine = chart.addLineSeries({ color: '#c8963e', lineWidth: 2, priceFormat: { type: 'percent' } })
        baseLine.setData(base.map(c => ({ time: c.time as Time, value: ((c.close - baseStart) / baseStart) * 100 })) as LineData[])

        const compareData = await Promise.all(compares.map(s => fetchCandles(s, rng)))
        compareData.forEach((cd, i) => {
          if (cd.candles.length === 0) return
          const start = cd.candles[0].close || 1
          const line = chart.addLineSeries({ color: COMPARE_COLORS[i % COMPARE_COLORS.length], lineWidth: 2, priceFormat: { type: 'percent' } })
          line.setData(cd.candles.map(c => ({ time: c.time as Time, value: ((c.close - start) / start) * 100 })) as LineData[])
        })

        if (legendRef.current) {
          legendRef.current.innerHTML =
            `<span class="t-amber">${sym}</span>` +
            compares.map((s, i) => ` <span style="color:${COMPARE_COLORS[i % COMPARE_COLORS.length]}">${s}</span>`).join('') +
            ` <span class="t-muted">· % change, ${rng}</span>`
        }
        chart.timeScale().fitContent()
        setStats(null)
        setRangeReturn(null)
        setLoading(false)
        return
      }

      // ── Pane layout ──
      const panes: { id: string; weight: number }[] = [{ id: 'right', weight: 3 }, { id: 'volume', weight: 0.7 }]
      if (indi.rsi) panes.push({ id: 'rsi', weight: 1 })
      if (indi.macd) panes.push({ id: 'macd', weight: 1 })
      const margins = computeMargins(panes)

      // ── Main price series ──
      if (type === 'candle') {
        const series = chart.addCandlestickSeries({
          upColor: '#00c853', downColor: '#ff1744', borderUpColor: '#00c853', borderDownColor: '#ff1744',
          wickUpColor: '#00c85388', wickDownColor: '#ff174488', priceScaleId: 'right',
        })
        series.setData(candles.map(c => ({ time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close })) as CandlestickData[])
      } else {
        const isUp = (candles[candles.length - 1]?.close ?? 0) >= (candles[0]?.close ?? 0)
        const series = chart.addLineSeries({ color: isUp ? '#00c853' : '#ff1744', lineWidth: 2, priceScaleId: 'right' })
        series.setData(candles.map(c => ({ time: c.time as Time, value: c.close })) as LineData[])
      }
      chart.priceScale('right').applyOptions({ scaleMargins: margins.right })

      // ── Overlays ──
      if (indi.ema && candles.length >= 20) {
        const e20 = chart.addLineSeries({ color: '#e0b64f', lineWidth: 1, priceScaleId: 'right', priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
        e20.setData(ema(candles, 20).map(toTime))
        if (candles.length >= 50) {
          const e50 = chart.addLineSeries({ color: '#4f8fe0', lineWidth: 1, priceScaleId: 'right', priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
          e50.setData(ema(candles, 50).map(toTime))
        }
      }
      if (indi.boll && candles.length >= 20) {
        const bb = bollinger(candles, 20, 2)
        const opts = { color: '#7a6fc0', lineWidth: 1 as const, priceScaleId: 'right', priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false }
        const u = chart.addLineSeries(opts); u.setData(bb.upper.map(toTime))
        const m = chart.addLineSeries({ ...opts, color: '#7a6fc088', lineStyle: LineStyle.Dashed }); m.setData(bb.middle.map(toTime))
        const l = chart.addLineSeries(opts); l.setData(bb.lower.map(toTime))
      }

      // ── Volume ──
      const vol = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: 'volume' })
      chart.priceScale('volume').applyOptions({ scaleMargins: margins.volume })
      vol.setData(candles.map(c => ({ time: c.time as Time, value: c.volume, color: c.close >= c.open ? '#00c85322' : '#ff174422' })) as HistogramData[])

      // ── RSI sub-pane ──
      if (indi.rsi) {
        const r = chart.addLineSeries({ color: '#c8963e', lineWidth: 1, priceScaleId: 'rsi', priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: true })
        r.setData(rsi(candles, 14).map(toTime))
        chart.priceScale('rsi').applyOptions({ scaleMargins: margins.rsi })
        r.createPriceLine({ price: 70, color: '#ff174455', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '70' })
        r.createPriceLine({ price: 30, color: '#00c85355', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '30' })
      }

      // ── MACD sub-pane ──
      if (indi.macd) {
        const mac = macd(candles)
        const hist = chart.addHistogramSeries({ priceScaleId: 'macd', priceLineVisible: false })
        hist.setData(mac.histogram.map(p => ({ time: p.time as Time, value: p.value, color: p.value >= 0 ? '#00c85355' : '#ff174455' })) as HistogramData[])
        const mLine = chart.addLineSeries({ color: '#4f8fe0', lineWidth: 1, priceScaleId: 'macd', priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
        mLine.setData(mac.macd.map(toTime))
        const sLine = chart.addLineSeries({ color: '#e0648f', lineWidth: 1, priceScaleId: 'macd', priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
        sLine.setData(mac.signal.map(toTime))
        chart.priceScale('macd').applyOptions({ scaleMargins: margins.macd })
      }

      // ── OHLC legend on crosshair ──
      const byTime = new Map(candles.map(c => [c.time, c]))
      const renderLegend = (c: Candle | undefined) => {
        if (!legendRef.current) return
        if (!c) { legendRef.current.textContent = ''; return }
        const chg = c.close - c.open
        const pct = c.open ? (chg / c.open) * 100 : 0
        const cls = chg >= 0 ? 't-green' : 't-red'
        const p = (n: number) => n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : n.toFixed(2)
        legendRef.current.innerHTML =
          `<span class="t-amber">${sym}</span> O <span>${p(c.open)}</span> H <span>${p(c.high)}</span> ` +
          `L <span>${p(c.low)}</span> C <span class="${cls}">${p(c.close)}</span> ` +
          `<span class="${cls}">${chg >= 0 ? '+' : ''}${pct.toFixed(2)}%</span>` +
          (c.volume ? ` · VOL <span>${fmtVol(c.volume)}</span>` : '')
      }
      renderLegend(candles[candles.length - 1])
      chart.subscribeCrosshairMove(param => {
        renderLegend(param.time ? byTime.get(param.time as number) : candles[candles.length - 1])
      })

      chart.timeScale().fitContent()

      // ── Perf stats ──
      setStats(perfStats(candles, interval))
      const first = candles[0]?.close
      const lastC = candles[candles.length - 1]?.close
      setRangeReturn(first && lastC ? ((lastC - first) / first) * 100 : null)
    } catch {
      setEmpty(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (symbol) render(symbol, range, chartType, ind, compareSymbols)
  }, [symbol, range, chartType, ind, compareSymbols, render])

  useEffect(() => {
    function onResize() {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight })
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => () => { chartRef.current?.remove(); chartRef.current = null }, [])

  function addCompare() {
    const s = compareInput.trim().toUpperCase()
    if (s && s !== symbol && !compareSymbols.includes(s) && compareSymbols.length < 4) {
      setCompareSymbols([...compareSymbols, s])
    }
    setCompareInput('')
    setShowCompareInput(false)
  }

  const inCompare = compareSymbols.length > 0

  return (
    <>
      <div className="terminal-chart-controls">
        {RANGES.map(r => (
          <button key={r} className={`terminal-chart-range-btn ${r === range ? 'active' : ''}`} onClick={() => setRange(r)}>{r}</button>
        ))}
        <span className="terminal-chart-divider" />
        {(['ema', 'boll', 'rsi', 'macd'] as const).map(k => (
          <button
            key={k}
            className={`terminal-chart-range-btn ${ind[k] ? 'active' : ''}`}
            onClick={() => toggle(k)}
            disabled={inCompare}
            title={inCompare ? 'Disabled in comparison mode' : undefined}
          >
            {k === 'ema' ? 'EMA' : k === 'boll' ? 'BOLL' : k.toUpperCase()}
          </button>
        ))}
        <span className="terminal-chart-divider" />
        <button className={`terminal-chart-range-btn ${inCompare ? 'active' : ''}`} onClick={() => setShowCompareInput(v => !v)} title="Compare symbols">VS</button>
        <button className={`terminal-chart-type-btn ${chartType === 'candle' ? 'active' : ''}`} onClick={() => setChartType('candle')} disabled={inCompare} title="Candlestick">▐▌</button>
        <button className={`terminal-chart-type-btn ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')} disabled={inCompare} title="Line">╱</button>
      </div>

      {(showCompareInput || inCompare) && (
        <div className="terminal-compare-bar">
          {compareSymbols.map((s, i) => (
            <span key={s} className="terminal-compare-chip" style={{ borderColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}>
              {s}
              <button onClick={() => setCompareSymbols(compareSymbols.filter(x => x !== s))}>×</button>
            </span>
          ))}
          {compareSymbols.length < 4 && (
            <input
              className="terminal-compare-input"
              value={compareInput}
              onChange={e => setCompareInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCompare()}
              placeholder="+ symbol"
              autoFocus={showCompareInput}
            />
          )}
        </div>
      )}

      <div ref={containerRef} className="terminal-chart-container" style={{ position: 'relative' }}>
        <div ref={legendRef} className="terminal-chart-legend" />
        {loading && <div className="terminal-loading">Loading chart</div>}
        {!loading && empty && <div className="terminal-loading" style={{ color: '#555' }}>No chart data for {symbol}</div>}
      </div>

      {stats && !inCompare && (
        <div className="terminal-perf-strip">
          <PerfStat label={`${range} Return`} value={rangeReturn} suffix="%" signed />
          {stats.ret1M != null && !['1M', '3M'].includes(range) && <PerfStat label="1M" value={stats.ret1M} suffix="%" signed />}
          {stats.retYTD != null && <PerfStat label="YTD" value={stats.retYTD} suffix="%" signed />}
          {stats.ret1Y != null && <PerfStat label="1Y" value={stats.ret1Y} suffix="%" signed />}
          {stats.annVol != null && <PerfStat label="Ann Vol" value={stats.annVol} suffix="%" />}
          <PerfStat label={INTRADAY_RANGES.includes(range) ? 'Window DD' : 'Max DD'} value={stats.maxDrawdown} suffix="%" signed />
        </div>
      )}
    </>
  )
}

function PerfStat({ label, value, suffix = '', signed = false }: { label: string; value: number | null; suffix?: string; signed?: boolean }) {
  const cls = signed && value != null ? (value >= 0 ? 't-green' : 't-red') : ''
  const text = value == null ? '—' : `${signed && value >= 0 ? '+' : ''}${value.toFixed(value != null && Math.abs(value) >= 100 ? 0 : 2)}${suffix}`
  return (
    <div className="terminal-perf-stat">
      <span className="terminal-perf-label">{label}</span>
      <span className={`terminal-perf-value ${cls}`}>{text}</span>
    </div>
  )
}
