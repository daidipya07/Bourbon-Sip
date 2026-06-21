'use client'

const REGIME_DESCRIPTIONS: Record<string, string> = {
  'risk-on':    'Equities rising, spreads tight, fear low. Markets pricing in growth. Favorable for risk assets.',
  'risk-off':   'Flight to safety underway. Spreads widening, volatility elevated. Capital rotating to bonds and gold.',
  'reflation':  'Growth and inflation rising together. Commodities and real assets outperforming. Rates moving higher.',
  'deflation':  'Growth slowing, rates falling. Dollar strengthening. Defensive positioning favored.',
}

export default function RegimeIndicator({
  regime,
  regimeLabel,
  regimeColor,
}: {
  regime: string
  regimeLabel: string
  regimeColor: string
}) {
  return (
    <div style={{ background: '#0f0f0f', border: `1px solid ${regimeColor}33`, borderRadius: '10px', padding: '24px 28px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
            Current Macro Regime
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', marginBottom: '8px' }}>
            Editorial classification · Not investment advice
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: regimeColor, boxShadow: `0 0 8px ${regimeColor}` }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: regimeColor, letterSpacing: '-0.5px' }}>
              {regimeLabel}
            </span>
          </div>
        </div>
        <div style={{ maxWidth: '460px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#888', lineHeight: 1.7, margin: 0 }}>
            {REGIME_DESCRIPTIONS[regime] ?? ''}
          </p>
        </div>
      </div>

      {/* Regime scale */}
      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        {[
          { key: 'risk-on',   label: 'Risk-On',   color: '#059669' },
          { key: 'reflation', label: 'Reflation', color: '#c8963e' },
          { key: 'deflation', label: 'Deflation', color: '#4a9eff' },
          { key: 'risk-off',  label: 'Risk-Off',  color: '#e05252' },
        ].map(r => (
          <div key={r.key} style={{
            padding: '6px 10px', borderRadius: '4px', textAlign: 'center',
            background: regime === r.key ? `${r.color}22` : 'transparent',
            border: `1px solid ${regime === r.key ? r.color : '#1e1e1e'}`,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: regime === r.key ? r.color : '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
