'use client'

import type { MarketSnapshot } from '@/lib/market-data'

function DataRow({
  label, value, unit = '', change, changeUnit = '',
  hint, stress,
}: {
  label: string
  value: number | null | undefined
  unit?: string
  change?: number | null
  changeUnit?: string
  hint?: string
  stress?: 'low' | 'medium' | 'high'
}) {
  const stressColor = { low: '#059669', medium: '#c8963e', high: '#e05252' }[stress ?? 'low'] ?? '#555'
  const up = (change ?? 0) >= 0
  const fmt = (n: number) => Math.abs(n) >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : Math.abs(n).toFixed(2)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #141414' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#e8dcc8', fontWeight: 600 }}>{label}</div>
          {hint && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', marginTop: '2px' }}>{hint}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {stress && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: stressColor, textTransform: 'uppercase', letterSpacing: '1px', background: `${stressColor}15`, padding: '2px 8px', borderRadius: '3px' }}>
            {stress === 'low' ? 'Low Stress' : stress === 'medium' ? 'Watch' : 'Elevated'}
          </span>
        )}
        {change != null && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: up ? '#059669' : '#e05252', minWidth: '60px', textAlign: 'right' }}>
            {up ? '+' : '-'}{fmt(change)}{changeUnit}
          </span>
        )}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: '#e8dcc8', minWidth: '80px', textAlign: 'right' }}>
          {value != null ? `${value >= 1000 ? value.toLocaleString() : value}${unit}` : '—'}
        </div>
      </div>
    </div>
  )
}

function stressLevel(type: string, value: number | null): 'low' | 'medium' | 'high' {
  if (value == null) return 'low'
  if (type === 'vix')       return value < 18 ? 'low' : value < 25 ? 'medium' : 'high'
  if (type === 'ig')        return value < 110 ? 'low' : value < 150 ? 'medium' : 'high'
  if (type === 'hy')        return value < 350 ? 'low' : value < 500 ? 'medium' : 'high'
  if (type === 'curve')     return value > 0 ? 'low' : value > -0.5 ? 'medium' : 'high'
  return 'low'
}

export default function StressGauges({ data }: { data: MarketSnapshot }) {
  const { fred } = data

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
        Stress Indicators
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#333', marginBottom: '16px' }}>
        Institutional-grade risk gauges — sourced from FRED &amp; CBOE
      </div>

      <DataRow
        label="VIX — Fear Index"
        hint="CBOE Volatility Index · below 18 = calm, above 25 = fear"
        value={fred.vix} change={fred.vixChange}
        stress={stressLevel('vix', fred.vix)}
      />
      <DataRow
        label="IG Credit Spreads"
        hint="Investment grade OAS in bps · tighter = confidence"
        value={fred.igSpreads} unit="bps" change={fred.igSpreadsChange} changeUnit="bps"
        stress={stressLevel('ig', fred.igSpreads)}
      />
      <DataRow
        label="HY Credit Spreads"
        hint="High yield OAS in bps · wider = risk aversion"
        value={fred.hySpreads} unit="bps" change={fred.hySpreadsChange} changeUnit="bps"
        stress={stressLevel('hy', fred.hySpreads)}
      />
      <DataRow
        label="Yield Curve (10Y–2Y)"
        hint="Positive = normal · Negative = inverted (recession signal)"
        value={fred.yieldCurve} unit="%"
        stress={stressLevel('curve', fred.yieldCurve)}
      />
      <DataRow
        label="10Y Treasury Yield"
        hint="Risk-free rate · drives mortgage rates, equity valuations"
        value={fred.yield10y} unit="%" change={fred.yield10yChange} changeUnit="%"
      />
      <DataRow
        label="2Y Treasury Yield"
        hint="Fed policy proxy · reflects near-term rate expectations"
        value={fred.yield2y} unit="%" change={fred.yield2yChange} changeUnit="%"
      />
      <DataRow
        label="USD Index (DXY)"
        hint="Dollar strength vs major currencies · higher = tighter global liquidity"
        value={fred.dxy} change={fred.dxyChange}
      />

      <div style={{ marginTop: '16px', padding: '10px 12px', background: '#0a0a0a', borderRadius: '5px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#333', lineHeight: 1.6 }}>
        Data sourced from FRED (Federal Reserve Economic Data) · Updated daily · Not real-time · Editorial use only
      </div>
    </div>
  )
}
