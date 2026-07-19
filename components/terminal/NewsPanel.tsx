'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePolling } from './usePolling'
import PanelStatus from './PanelStatus'

interface NewsItem {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  timestamp: number
  related: string
}

type Mode = 'symbol' | 'market'

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Company news exists for equities/ETFs, not crypto pairs (BINANCE:…)
function canHaveCompanyNews(symbol: string | null): symbol is string {
  return !!symbol && !symbol.includes(':')
}

export default function NewsPanel({ symbol, defaultMode = 'symbol' }: { symbol: string | null; defaultMode?: Mode }) {
  const symbolOk = canHaveCompanyNews(symbol)
  const [mode, setMode] = useState<Mode>(symbolOk ? defaultMode : 'market')

  useEffect(() => {
    setMode(canHaveCompanyNews(symbol) ? defaultMode : 'market')
  }, [symbol, defaultMode])

  const activeSymbol = mode === 'symbol' && symbolOk ? symbol : null

  const fetcher = useCallback(async (): Promise<NewsItem[]> => {
    const url = activeSymbol
      ? `/api/terminal/news?symbol=${encodeURIComponent(activeSymbol)}`
      : '/api/terminal/news?category=general'
    const res = await fetch(url)
    if (!res.ok) throw new Error('news')
    const d = await res.json()
    return d.news || []
  }, [activeSymbol])

  const { data: news, loading, error, lastUpdated, stale, refetch } = usePolling(fetcher, { intervalMs: 5 * 60_000 })

  useEffect(() => { refetch() }, [activeSymbol, refetch])

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">News</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {symbolOk && (
            <div className="terminal-news-tabs">
              <button className={`terminal-news-tab ${mode === 'symbol' ? 'active' : ''}`} onClick={() => setMode('symbol')}>{symbol}</button>
              <button className={`terminal-news-tab ${mode === 'market' ? 'active' : ''}`} onClick={() => setMode('market')}>Market</button>
            </div>
          )}
          <PanelStatus lastUpdated={lastUpdated} stale={stale} error={error} onRetry={refetch} />
        </div>
      </div>
      <div className="terminal-panel-body">
        {loading && !news && <div className="terminal-loading">Loading news</div>}
        {news && news.map(item => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="terminal-news-item"
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <div className="terminal-news-headline">{item.headline}</div>
            <div className="terminal-news-meta">
              <span className="terminal-news-source">{item.source}</span>
              <span className="terminal-news-time">{timeAgo(item.timestamp)}</span>
              {item.related && <span style={{ color: '#555' }}>{item.related}</span>}
            </div>
          </a>
        ))}
        {news && news.length === 0 && !loading && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#444', fontSize: '11px' }}>No recent news</div>
        )}
      </div>
    </div>
  )
}
