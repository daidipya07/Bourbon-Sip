'use client'

import { useEffect, useState } from 'react'

interface MacroData {
  fred: {
    yield10y: number | null
    yield10yChange: number | null
    yield2y: number | null
    yield2yChange: number | null
    yieldCurve: number | null
    igSpreads: number | null
    igSpreadsChange: number | null
    hySpreads: number | null
    hySpreadsChange: number | null
    vix: number | null
    vixChange: number | null
    dxy: number | null
    dxyChange: number | null
  }
  regime: string
  regimeLabel: string
  regimeColor: string
}

function MacroCard({ label, value, unit, change, changeUnit }: {
  label: string; value: string; unit?: string; change?: string; changeUnit?: string
}) {
  const isUp = change ? parseFloat(change) >= 0 : false
  return (
    <div className="terminal-macro-card">
      <div className="terminal-macro-label">{label}</div>
      <div className="terminal-macro-value">{value}</div>
      {change && (
        <div className={`terminal-macro-change ${isUp ? 't-green' : 't-red'}`}>
          {isUp ? '+' : ''}{change}{changeUnit || ''}
        </div>
      )}
      {unit && <div className="terminal-macro-unit">{unit}</div>}
    </div>
  )
}

interface WeeklySignal { week_of: string; regime: string | null; signal_text: string | null }

export default function MacroPanel() {
  const [data, setData] = useState<MacroData | null>(null)
  const [loading, setLoading] = useState(true)
  const [signal, setSignal] = useState<WeeklySignal | null>(null)

  useEffect(() => {
    fetch('/api/data-pulse')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
    fetch('/api/terminal/signal')
      .then(r => r.json())
      .then(d => setSignal(d.signal || null))
      .catch(() => {})
  }, [])

  if (loading) return <div className="terminal-loading">Loading macro data</div>
  if (!data) return <div className="terminal-loading" style={{ color: '#555' }}>Macro data unavailable</div>

  const f = data.fred

  return (
    <div className="terminal-panel" style={{ overflow: 'auto' }}>
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Macro Dashboard</span>
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          color: data.regimeColor,
          background: `${data.regimeColor}15`,
          padding: '2px 8px',
          borderRadius: '2px',
          border: `1px solid ${data.regimeColor}33`,
        }}>
          {data.regimeLabel}
        </span>
      </div>

      {signal?.signal_text && (
        <div className="terminal-signal-block">
          <div className="terminal-signal-head">
            <span>This Week&apos;s Signal</span>
            {signal.week_of && <span className="t-muted">Week of {signal.week_of}</span>}
          </div>
          <p className="terminal-signal-text">{signal.signal_text}</p>
        </div>
      )}

      <div style={{ padding: '12px 12px 4px', fontSize: '9px', color: '#c8963e', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
        Rates & Yield Curve
      </div>
      <div className="terminal-macro-grid">
        <MacroCard label="10Y Treasury" value={f.yield10y != null ? `${f.yield10y.toFixed(2)}%` : '—'} change={f.yield10yChange?.toFixed(3)} changeUnit="%" unit="Weekly change" />
        <MacroCard label="2Y Treasury" value={f.yield2y != null ? `${f.yield2y.toFixed(2)}%` : '—'} change={f.yield2yChange?.toFixed(3)} changeUnit="%" unit="Weekly change" />
        <MacroCard label="Yield Curve (10Y-2Y)" value={f.yieldCurve != null ? `${f.yieldCurve.toFixed(2)}%` : '—'} unit={(f.yieldCurve ?? 0) < 0 ? 'INVERTED' : 'Normal'} />
      </div>

      <div style={{ padding: '12px 12px 4px', fontSize: '9px', color: '#c8963e', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
        Credit Spreads
      </div>
      <div className="terminal-macro-grid">
        <MacroCard label="IG Credit Spreads" value={f.igSpreads != null ? `${f.igSpreads.toFixed(0)} bps` : '—'} change={f.igSpreadsChange?.toFixed(0)} changeUnit=" bps" unit="Weekly change" />
        <MacroCard label="HY Credit Spreads" value={f.hySpreads != null ? `${f.hySpreads.toFixed(0)} bps` : '—'} change={f.hySpreadsChange?.toFixed(0)} changeUnit=" bps" unit="Weekly change" />
      </div>

      <div style={{ padding: '12px 12px 4px', fontSize: '9px', color: '#c8963e', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
        Fear & Currency
      </div>
      <div className="terminal-macro-grid">
        <MacroCard label="VIX" value={f.vix != null ? f.vix.toFixed(2) : '—'} change={f.vixChange?.toFixed(2)} unit="CBOE Volatility Index" />
        <MacroCard label="USD Index (DXY)" value={f.dxy != null ? f.dxy.toFixed(2) : '—'} change={f.dxyChange?.toFixed(2)} unit="Broad Dollar Index" />
      </div>

      <div className="terminal-disclaimer">
        Source: Federal Reserve (FRED) · Delayed data · Not investment advice
      </div>
    </div>
  )
}
