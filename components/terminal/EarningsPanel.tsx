'use client'

import { useCallback } from 'react'
import { usePolling } from './usePolling'
import PanelStatus from './PanelStatus'

interface Earning {
  date: string
  symbol: string
  epsEstimate: number | null
  epsActual: number | null
  revenueEstimate: number | null
  hour: string
  quarter: number
  year: number
}

function fmtRevenue(v: number | null): string {
  if (v == null) return '—'
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toLocaleString('en-US')}`
}

function hourLabel(h: string): string {
  if (h === 'bmo') return 'PRE'
  if (h === 'amc') return 'POST'
  if (h === 'dmh') return 'MID'
  return '—'
}

function fmtDate(d: string): string {
  const dt = new Date(`${d}T12:00:00Z`)
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export default function EarningsPanel({ onSelect }: { onSelect: (symbol: string) => void }) {
  const fetcher = useCallback(async (): Promise<Earning[]> => {
    const res = await fetch('/api/terminal/earnings')
    if (!res.ok) throw new Error('earnings')
    const d = await res.json()
    return d.earnings || []
  }, [])

  const { data, loading, error, lastUpdated, stale, refetch } = usePolling(fetcher, { intervalMs: 30 * 60_000 })
  const earnings = data ?? []

  if (loading && !data) return <div className="terminal-loading">Loading earnings calendar</div>

  const dates = Array.from(new Set(earnings.map(e => e.date)))

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Earnings Calendar — Next 7 Days</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '9px', color: '#444' }}>{earnings.length} reports · click symbol to chart</span>
          <PanelStatus lastUpdated={lastUpdated} stale={stale} error={error} onRetry={refetch} />
        </div>
      </div>
      <div className="terminal-panel-body">
        {earnings.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#444', fontSize: '11px' }}>
            No earnings data available
          </div>
        )}
        {dates.map(date => (
          <div key={date}>
            <div className="terminal-sector-label">{fmtDate(date)}</div>
            <div className="terminal-earnings-head">
              <span>Symbol</span>
              <span>When</span>
              <span>Qtr</span>
              <span>EPS Est</span>
              <span>EPS Act</span>
              <span>Rev Est</span>
            </div>
            {earnings.filter(e => e.date === date).map(e => {
              const beat = e.epsActual != null && e.epsEstimate != null ? e.epsActual >= e.epsEstimate : null
              return (
                <div key={`${e.date}-${e.symbol}`} className="terminal-earnings-row" onClick={() => onSelect(e.symbol)}>
                  <span className="terminal-watchlist-sym t-amber">{e.symbol}</span>
                  <span className="t-muted">{hourLabel(e.hour)}</span>
                  <span className="t-muted">Q{e.quarter} {String(e.year).slice(2)}</span>
                  <span>{e.epsEstimate != null ? e.epsEstimate.toFixed(2) : '—'}</span>
                  <span className={beat == null ? '' : beat ? 't-green' : 't-red'}>
                    {e.epsActual != null ? e.epsActual.toFixed(2) : '—'}
                  </span>
                  <span>{fmtRevenue(e.revenueEstimate)}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
