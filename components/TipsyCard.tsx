'use client'

const catColor: Record<string, string> = {
  markets: '#c8963e', ai: '#4a9eff', tech: '#7c3aed',
  macro: '#059669', geopolitics: '#dc2626', policy: '#d97706',
  energy: '#16a34a', fintech: '#0891b2',
}

function strengthLabel(score: number): string {
  if (score >= 80) return 'High Impact'
  if (score >= 60) return 'Significant'
  if (score >= 40) return 'Moderate'
  return 'Low Impact'
}

function strengthColor(score: number): string {
  if (score >= 80) return '#e05252'
  if (score >= 60) return '#c8963e'
  if (score >= 40) return '#4a9eff'
  return '#555'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TipsyCard({ item }: { item: any }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#c8963e')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
        {item.og_image && (
          <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
            <img src={item.og_image} alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: catColor[item.category] || '#888', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              {item.category}
            </span>
            {item.publication && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {item.publication}
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: '#f0e6d3', lineHeight: 1.4, marginBottom: '12px' }}>
            {item.title}
          </h3>
          {item.bourbon_take && (
            <div style={{ borderLeft: '2px solid #c8963e', paddingLeft: '12px', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#c8963e', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
                Bourbon Pour Take
              </div>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.7, margin: 0 }}>
                {item.bourbon_take}
              </p>
            </div>
          )}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Proof Score</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#c8963e' }}>{item.proof_score}</span>
            </div>
            <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.proof_score}%`, background: 'linear-gradient(90deg, #c8963e, #e8b86d)', borderRadius: '2px' }} />
            </div>
          </div>
          <div style={{ background: '#0f0f0f', borderRadius: '6px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>🥃 Bourbon Strength</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: strengthColor(item.bourbon_strength) }}>
                {item.bourbon_strength} — {strengthLabel(item.bourbon_strength)}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Market', val: item.market_impact },
                { label: 'Geo', val: item.geo_impact },
                { label: 'Tech', val: item.tech_disruption },
                { label: 'Policy', val: item.regulatory_weight },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#555' }}>{s.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#888' }}>{s.val}</span>
                  </div>
                  <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.val}%`, background: '#c8963e', opacity: 0.6, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '14px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#c8963e', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Read Full Article ↗
          </div>
        </div>
      </div>
    </a>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CellarRow({ item }: { item: any }) {
  const catColor2: Record<string, string> = catColor
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#c8963e')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: catColor2[item.category] || '#888', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{item.category}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#555' }}>{item.publication}</span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8dcc8', lineHeight: 1.4 }}>{item.title}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#c8963e', marginBottom: '2px' }}>🥃 {item.bourbon_strength}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555' }}>{item.proof_score}-proof</div>
        </div>
      </div>
    </a>
  )
}
