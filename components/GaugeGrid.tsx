'use client'

import { useEffect, useRef } from 'react'

interface Gauge {
  label: string
  base: number
  color: string
  arrow: string
  note: string
}

const gauges: Gauge[] = [
  { label: 'AI Spend Velocity',    base: 84, color: 'var(--green)', arrow: '↑', note: 'Enterprise AI budgets accelerating Q1' },
  { label: 'Fed Sentiment Index',  base: 52, color: 'var(--amber)', arrow: '◆', note: 'Neutral — markets pricing 2 cuts by Dec' },
  { label: 'Startup Funding Heat', base: 71, color: 'var(--green)', arrow: '↑', note: 'AI vertical pulling total numbers up' },
  { label: 'Macro Stress Score',   base: 38, color: 'var(--red)',   arrow: '↓', note: 'Low stress — risk appetite elevated' },
]

export default function GaugeGrid() {
  const valRefs = useRef<(HTMLSpanElement | null)[]>([])
  const fillRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      gauges.forEach((g, i) => {
        const v = g.base + Math.round((Math.random() - 0.5) * 3)
        if (valRefs.current[i]) valRefs.current[i]!.textContent = String(v)
        if (fillRefs.current[i]) fillRefs.current[i]!.style.width = v + '%'
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', padding: '8px 12px', background: 'rgba(200,150,62,0.06)', border: '1px solid rgba(200,150,62,0.15)', borderRadius: '5px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>⚠ Illustrative only</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>— Values are editorial estimates, not real-time data. Not a basis for financial decisions.</span>
      </div>
      <div className="dp-gauges" id="gauges">
        {gauges.map((g, i) => (
          <div className="gauge" key={g.label}>
            <div className="gauge-label">{g.label}</div>
            <div className="gauge-val" style={{ color: g.color }}>
              <span ref={el => { valRefs.current[i] = el }}>{g.base}</span>
              <span className="gauge-arrow">{g.arrow}</span>
            </div>
            <div className="gauge-bar">
              <div
                className="gauge-fill"
                style={{ width: g.base + '%', background: g.color }}
                ref={el => { fillRefs.current[i] = el }}
              />
            </div>
            <div className="gauge-note">{g.note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
