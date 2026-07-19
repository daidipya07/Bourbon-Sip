'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, type IChartApi, ColorType, type CandlestickData, type LineData, type HistogramData, type Time } from 'lightweight-charts'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const RANGES = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'] as const
const INTRADAY_RANGES = ['1D', '5D', '1M']
type ChartType = 'candle' | 'line'

function sma(candles: Candle[], period: number): LineData[] {
  const out: LineData[] = []
  let sum = 0
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close
    if (i >= period) sum -= candles[i - period].close
    if (i >= period - 1) out.push({ time: candles[i].time as Time, value: sum / period })
  }
  return out
}

function fmtVol(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`
  return String(Math.round(v))
}

export default function ChartPanel({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const legendRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  const [range, setRange] = useState<typeof RANGES[number]>('6M')
  const [chartType, setChartType] = useState<ChartType>('candle')
  const [showSma20, setShowSma20] = useState(false)
  const [showSma50, setShowSma50] = useState(false)
  const [loading, setLoading] = useState(true)
  const [empty, setEmpty] = useState(false)

  const fetchAndRender = useCallback(async (sym: string, rng: string, type: ChartType, sma20: boolean, sma50: boolean) => {
    if (!containerRef.current) return
    setLoading(true)
    setEmpty(false)

    try {
      const res = await fetch(`/api/terminal/candles?symbol=${encodeURIComponent(sym)}&range=${rng}`)
      const data = await res.json()
      const candles: Candle[] = data.candles || []

      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }

      if (candles.length === 0) {
        setEmpty(true)
        setLoading(false)
        return
      }

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#0a0a0a' },
          textColor: '#555',
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: 10,
        },
        grid: {
          vertLines: { color: '#111' },
          horzLines: { color: '#111' },
        },
        crosshair: {
          vertLine: { color: '#c8963e44', width: 1, style: 2, labelBackgroundColor: '#c8963e' },
          horzLine: { color: '#c8963e44', width: 1, style: 2, labelBackgroundColor: '#c8963e' },
        },
        rightPriceScale: {
          borderColor: '#1a1a1a',
          scaleMargins: { top: 0.1, bottom: 0.2 },
        },
        timeScale: {
          borderColor: '#1a1a1a',
          timeVisible: INTRADAY_RANGES.includes(rng),
          secondsVisible: false,
        },
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })
      chartRef.current = chart

      if (type === 'candle') {
        const series = chart.addCandlestickSeries({
          upColor: '#00c853',
          downColor: '#ff1744',
          borderUpColor: '#00c853',
          borderDownColor: '#ff1744',
          wickUpColor: '#00c85388',
          wickDownColor: '#ff174488',
        })
        series.setData(candles.map(c => ({
          time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close,
        })) as CandlestickData[])
      } else {
        const isUp = (candles[candles.length - 1]?.close ?? 0) >= (candles[0]?.close ?? 0)
        const series = chart.addLineSeries({
          color: isUp ? '#00c853' : '#ff1744',
          lineWidth: 2,
          crosshairMarkerRadius: 4,
          crosshairMarkerBackgroundColor: isUp ? '#00c853' : '#ff1744',
        })
        series.setData(candles.map(c => ({ time: c.time as Time, value: c.close })) as LineData[])
      }

      // Moving average overlays
      if (sma20 && candles.length >= 20) {
        const s = chart.addLineSeries({ color: '#e0b64f', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
        s.setData(sma(candles, 20))
      }
      if (sma50 && candles.length >= 50) {
        const s = chart.addLineSeries({ color: '#4f8fe0', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
        s.setData(sma(candles, 50))
      }

      // Volume histogram
      const volSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      })
      chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })
      volSeries.setData(candles.map(c => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? '#00c85322' : '#ff174422',
      })) as HistogramData[])

      // Crosshair OHLC legend
      const byTime = new Map(candles.map(c => [c.time, c]))
      const renderLegend = (c: Candle | undefined) => {
        if (!legendRef.current) return
        if (!c) { legendRef.current.textContent = '' ; return }
        const chg = c.close - c.open
        const pct = c.open ? (chg / c.open) * 100 : 0
        const cls = chg >= 0 ? 't-green' : 't-red'
        const p = (n: number) => n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : n.toFixed(2)
        legendRef.current.innerHTML =
          `<span class="t-amber">${sym}</span> ` +
          `O <span>${p(c.open)}</span> H <span>${p(c.high)}</span> ` +
          `L <span>${p(c.low)}</span> C <span class="${cls}">${p(c.close)}</span> ` +
          `<span class="${cls}">${chg >= 0 ? '+' : ''}${pct.toFixed(2)}%</span>` +
          (c.volume ? ` · VOL <span>${fmtVol(c.volume)}</span>` : '')
      }
      renderLegend(candles[candles.length - 1])

      chart.subscribeCrosshairMove(param => {
        if (!param.time) {
          renderLegend(candles[candles.length - 1])
          return
        }
        renderLegend(byTime.get(param.time as number))
      })

      chart.timeScale().fitContent()
    } catch {
      setEmpty(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (symbol) fetchAndRender(symbol, range, chartType, showSma20, showSma50)
  }, [symbol, range, chartType, showSma20, showSma50, fetchAndRender])

  useEffect(() => {
    function handleResize() {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return () => { chartRef.current?.remove(); chartRef.current = null }
  }, [])

  return (
    <>
      <div className="terminal-chart-controls">
        {RANGES.map(r => (
          <button
            key={r}
            className={`terminal-chart-range-btn ${r === range ? 'active' : ''}`}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
        <span className="terminal-chart-divider" />
        <button
          className={`terminal-chart-range-btn ${showSma20 ? 'active' : ''}`}
          onClick={() => setShowSma20(v => !v)}
          title="20-period simple moving average"
        >
          MA20
        </button>
        <button
          className={`terminal-chart-range-btn ${showSma50 ? 'active' : ''}`}
          onClick={() => setShowSma50(v => !v)}
          title="50-period simple moving average"
        >
          MA50
        </button>
        <button
          className={`terminal-chart-type-btn ${chartType === 'candle' ? 'active' : ''}`}
          onClick={() => setChartType('candle')}
          title="Candlestick"
        >
          ▐▌
        </button>
        <button
          className={`terminal-chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
          onClick={() => setChartType('line')}
          title="Line"
        >
          ╱
        </button>
      </div>
      <div ref={containerRef} className="terminal-chart-container" style={{ position: 'relative' }}>
        <div ref={legendRef} className="terminal-chart-legend" />
        {loading && <div className="terminal-loading">Loading chart</div>}
        {!loading && empty && (
          <div className="terminal-loading" style={{ color: '#555' }}>No chart data for {symbol}</div>
        )}
      </div>
    </>
  )
}
