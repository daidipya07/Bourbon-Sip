'use client'

import { useCallback, useEffect } from 'react'
import { usePolling } from './usePolling'

interface TipsyRead {
  id: string
  title: string
  publication: string | null
  url: string
  bourbon_take: string | null
  proof_score: number | null
  category: string | null
  article_date: string | null
}

export default function TipsyTakePanel({ symbol }: { symbol: string }) {
  const fetcher = useCallback(async (): Promise<TipsyRead[]> => {
    const res = await fetch(`/api/terminal/tipsy?symbol=${encodeURIComponent(symbol)}`)
    if (!res.ok) return []
    const d = await res.json()
    return d.reads || []
  }, [symbol])

  const { data, refetch } = usePolling(fetcher, { intervalMs: 10 * 60_000, enabled: !!symbol && !symbol.includes(':') })

  useEffect(() => { if (symbol && !symbol.includes(':')) refetch() }, [symbol, refetch])

  if (symbol.includes(':')) return null
  const reads = data ?? []
  if (reads.length === 0) return null

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Bourbon Take · {symbol}</span>
        <span style={{ fontSize: '9px', color: '#c8963e' }}>Bourbon Pour intel</span>
      </div>
      <div className="terminal-panel-body">
        {reads.map(r => (
          <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="terminal-tipsy-item">
            <div className="terminal-tipsy-top">
              <span className="terminal-tipsy-headline">{r.title}</span>
              {r.proof_score != null && (
                <span className="terminal-tipsy-proof" title="Proof Score">{r.proof_score}</span>
              )}
            </div>
            {r.bourbon_take && <div className="terminal-tipsy-take">{r.bourbon_take}</div>}
            <div className="terminal-tipsy-meta">
              {r.publication && <span className="terminal-news-source">{r.publication}</span>}
              {r.category && <span className="t-muted">{r.category}</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
