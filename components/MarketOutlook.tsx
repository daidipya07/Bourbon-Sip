'use client'

import { useEffect, useState } from 'react'
import type { MarketSnapshot } from '@/lib/market-data'
import { composeMarketOutlook } from '@/lib/market-outlook'

const TONE_COLOR: Record<'up' | 'down' | 'neutral', string> = {
  up: '#00c853',
  down: '#e05252',
  neutral: '#888',
}

const REGIME_COLOR: Record<string, string> = {
  'risk-on': '#059669',
  'risk-off': '#e05252',
  'reflation': '#c8963e',
  'deflation': '#4a9eff',
}

export default function MarketOutlook({
  initial,
  variant = 'full',
}: {
  initial?: MarketSnapshot
  variant?: 'full' | 'compact'
}) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(initial ?? null)

  // Fetch fresh on mount (keeps the homepage static — same source MarketStrip polls).
  useEffect(() => {
    let cancelled = false
    fetch('/api/data-pulse')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled && d && !d.error) setSnapshot(d) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!snapshot) {
    return (
      <div style={cardStyle}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#555', padding: '12px 0' }}>
          Composing market outlook…
        </div>
      </div>
    )
  }

  const o = composeMarketOutlook(snapshot)
  const regimeColor = REGIME_COLOR[o.regime] ?? o.regimeColor ?? '#888'
  const asOf = o.asOf
    ? new Date(o.asOf).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York',
      }) + ' ET'
    : null

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '2px' }}>
          🥃 The Market Pour
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px', color: regimeColor,
          background: `${regimeColor}18`, border: `1px solid ${regimeColor}33`,
          padding: '3px 10px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '1px',
        }}>
          {o.regimeLabel}
        </span>
      </div>

      {/* Headline */}
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: variant === 'compact' ? '22px' : '26px', lineHeight: 1.25,
        color: '#f0e6d3', margin: '0 0 12px',
      }}>
        {o.headline}
      </h3>

      {/* Summary */}
      <p style={{
        fontSize: variant === 'compact' ? '14px' : '15px', lineHeight: 1.75,
        color: '#c8b89a', margin: '0 0 18px',
      }}>
        {o.summary}
      </p>

      {/* Driver chips */}
      {o.drivers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: variant === 'compact' ? '14px' : '18px' }}>
          {o.drivers.map(d => (
            <div key={d.label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '5px', padding: '5px 10px',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#777', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {d.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: TONE_COLOR[d.tone] }}>
                {d.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* What to watch — full variant only */}
      {variant === 'full' && o.watch && (
        <div style={{ borderLeft: '2px solid var(--amber)', paddingLeft: '14px', marginBottom: '18px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '5px' }}>
            What to watch
          </div>
          <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.65, margin: 0 }}>
            {o.watch}
          </p>
        </div>
      )}

      {/* Footnote */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', lineHeight: 1.6 }}>
        {asOf && <>As of {asOf} · </>}
        Auto-composed from public market data · Editorial, not financial advice
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(200,150,62,0.08), rgba(200,150,62,0.02))',
  border: '1px solid rgba(200,150,62,0.18)',
  borderRadius: '12px',
  padding: '24px 28px',
}
