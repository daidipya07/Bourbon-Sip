'use client'

import { useState } from 'react'
import { tipsyData } from '@/lib/data/tipsy-reads'
import { showToast } from './Toast'

const FILTERS = ['all', 'markets', 'tech', 'ai', 'crypto', 'culture'] as const
const PAGE_SIZE = 6

export default function TipsyReads() {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = activeFilter === 'all'
    ? tipsyData
    : tipsyData.filter(t => t.cat === activeFilter)

  const shown = filtered.slice(0, visible)
  const hasMore = visible < filtered.length

  function handleFilter(f: string) {
    setActiveFilter(f)
    setVisible(PAGE_SIZE)
  }

  return (
    <>
      {/* Filters */}
      <div className="tipsy-filters" id="tipsyFilters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`tipsy-filter${activeFilter === f ? ' active' : ''}`}
            onClick={() => handleFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="tipsy-feed" id="tipsyFeed">
        {shown.map((t, i) => (
          <div className="tipsy-card fade-up" key={i} style={{ animationDelay: `${i * 0.04}s` }}>
            <div className={`tipsy-accent ${t.cat}`} />
            <div className="tipsy-body">
              <div className="tipsy-top">
                <span className={`tipsy-tag ${t.cat}`}>{t.tag}</span>
                <span className="tipsy-time">{t.time}</span>
              </div>
              <div
                className="tipsy-text"
                dangerouslySetInnerHTML={{ __html: t.text }}
              />
              <div className="tipsy-foot">
                <div className="tipsy-proof">
                  <div className="tipsy-proof-dot" />
                  {t.proof}-proof
                </div>
                <button
                  className="tipsy-share"
                  onClick={() => showToast('Link copied — share that Tipsy Read 🥃')}
                >
                  Share ↗
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      <div className="tipsy-load-wrap">
        {hasMore && (
          <button
            className="tipsy-load-btn"
            onClick={() => setVisible(v => v + PAGE_SIZE)}
          >
            Load more reads ↓
          </button>
        )}
      </div>
    </>
  )
}
