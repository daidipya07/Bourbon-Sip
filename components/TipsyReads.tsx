'use client'

import { useState } from 'react'
import Link from 'next/link'

const FILTERS = ['all', 'markets', 'tech', 'ai', 'macro', 'geopolitics', 'energy'] as const

const catColor: Record<string, string> = {
  markets: '#c8963e', ai: '#4a9eff', tech: '#7c3aed',
  macro: '#059669', geopolitics: '#dc2626', policy: '#d97706',
  energy: '#16a34a', fintech: '#0891b2',
}

function strengthColor(score: number) {
  if (score >= 80) return '#e05252'
  if (score >= 60) return '#c8963e'
  if (score >= 40) return '#4a9eff'
  return '#555'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TipsyReads({ initialItems = [] }: { initialItems?: any[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const filtered = activeFilter === 'all'
    ? initialItems
    : initialItems.filter(t => t.category === activeFilter)

  return (
    <>
      {/* Filters */}
      <div className="tipsy-filters" id="tipsyFilters">
        {FILTERS.map(f => (
          <button key={f}
            className={`tipsy-filter${activeFilter === f ? ' active' : ''}`}
            onClick={() => setActiveFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="tipsy-feed" id="tipsyFeed">
        {filtered.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            {initialItems.length === 0 ? 'Curated reads coming soon — check back tomorrow.' : 'No reads in this category yet.'}
          </div>
        )}

        {filtered.slice(0, 6).map((t, i) => (
          <a key={t.id || i} href={t.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div className="tipsy-card fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className={`tipsy-accent`} style={{ background: catColor[t.category] || '#c8963e' }} />
              <div className="tipsy-body">
                <div className="tipsy-top">
                  <span className="tipsy-tag" style={{ color: catColor[t.category] || '#c8963e' }}>
                    {t.category?.toUpperCase()}
                  </span>
                  <span className="tipsy-time">{t.publication}</span>
                </div>

                <div className="tipsy-text" style={{ fontWeight: 600, marginBottom: '8px' }}>
                  {t.title}
                </div>

                {t.bourbon_take && (
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, margin: '0 0 10px' }}>
                    {t.bourbon_take}
                  </p>
                )}

                <div className="tipsy-foot">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="tipsy-proof">
                      <div className="tipsy-proof-dot" />
                      {t.proof_score}-proof
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: strengthColor(t.bourbon_strength) }}>
                      🥃 {t.bourbon_strength}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Read ↗
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* View all link */}
      {initialItems.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/tipsy-reads" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amber)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            View all {initialItems.length} reads →
          </Link>
        </div>
      )}
    </>
  )
}
