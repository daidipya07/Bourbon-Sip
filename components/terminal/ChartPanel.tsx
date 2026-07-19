'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, type IChartApi, type ISeriesApi, ColorType, type CandlestickData, type LineData, type HistogramData, type Time } from 'lightweight-charts'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const RANGES = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'] as const
type ChartType = 'candle' | 'line'

export default function ChartPanel({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)

  const [range, setRange] = useState<typeof RANGES[number]>('6M')
  const [chartType, setChartType] = useState<ChartType>('candle')
  const [loading, setLoading] = useState(true)

  const fetchAndRender = useCallback(async (sym: string, rng: string, type: ChartType) => {
    if (!containerRef.current) return
    setLoading(true)

    try {
      const res = await fetch(`/api/terminal/candles?symbol=${encodeURIComponent(sym)}&range=${rng}&resolution=auto`)
      const data = await res.json()
      const candles: Candle[] = data.candles || []

      if (candles.length === 0) {
        setLoading(false)
        return
      }

      // Destroy old chart
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
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
          timeVisible: ['1D', '5D'].includes(rng),
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
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })) as CandlestickData[])
        candleSeriesRef.current = series
      } else {
        const lastClose = candles[candles.length - 1]?.close ?? 0
        const firstClose = candles[0]?.close ?? 0
        const isUp = lastClose >= firstClose

        const series = chart.addLineSeries({
          color: isUp ? '#00c853' : '#ff1744',
          lineWidth: 2,
          crosshairMarkerRadius: 4,
          crosshairMarkerBackgroundColor: isUp ? '#00c853' : '#ff1744',
        })
        series.setData(candles.map(c => ({
          time: c.time as Time,
          value: c.close,
        })) as LineData[])
        lineSeriesRef.current = series
      }

      // Volume histogram
      const volSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      })
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      })
      volSeries.setData(candles.map(c => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? '#00c85322' : '#ff174422',
      })) as HistogramData[])
      volumeSeriesRef.current = volSeries

      chart.timeScale().fitContent()

    } catch {
      // Chart load failed
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (symbol) fetchAndRender(symbol, range, chartType)
  }, [symbol, range, chartType, fetchAndRender])

  // Resize handler
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

  // Cleanup
  useEffect(() => {
    return () => { chartRef.current?.remove() }
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
      <div
        ref={containerRef}
        className="terminal-chart-container"
        style={{ position: 'relative' }}
      >
        {loading && <div className="terminal-loading">Loading chart</div>}
      </div>
    </>
  )
}
