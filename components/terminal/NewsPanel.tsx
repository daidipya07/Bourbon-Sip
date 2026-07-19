'use client'

import { useEffect, useState } from 'react'
import { toFinnhubSymbol } from '@/lib/terminal/yahoo'

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

// Company news only exists for plain equities, not indices/FX/crypto symbols
function canHaveCompanyNews(symbol: string | null): symbol is string {
  return !!symbol && !/[\^=:]/.test(symbol) && !symbol.endsWith('-USD')
}

export default function NewsPanel({ symbol, defaultMode = 'symbol' }: { symbol: string | null; defaultMode?: Mode }) {
  const symbolOk = canHaveCompanyNews(symbol)
  const [mode, setMode] = useState<Mode>(symbolOk ? defaultMode : 'market')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMode(canHaveCompanyNews(symbol) ? defaultMode : 'market')
  }, [symbol, defaultMode])

  const activeSymbol = mode === 'symbol' && symbolOk ? symbol : null

  useEffect(() => {
    setLoading(true)
    const url = activeSymbol
      ? `/api/terminal/news?symbol=${encodeURIComponent(toFinnhubSymbol(activeSymbol))}`
      : '/api/terminal/news?category=general'

    fetch(url)
      .then(r => r.json())
      .then(d => setNews(d.news || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false))
  }, [activeSymbol])

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">News</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {symbolOk && (
            <div className="terminal-news-tabs">
              <button
                className={`terminal-news-tab ${mode === 'symbol' ? 'active' : ''}`}
                onClick={() => setMode('symbol')}
              >
                {symbol}
              </button>
              <button
                className={`terminal-news-tab ${mode === 'market' ? 'active' : ''}`}
                onClick={() => setMode('market')}
              >
                Market
              </button>
            </div>
          )}
          {!loading && <span style={{ fontSize: '9px', color: '#444' }}>{news.length} items</span>}
        </div>
      </div>
      <div className="terminal-panel-body">
        {loading && <div className="terminal-loading">Loading news</div>}
        {!loading && news.map(item => (
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
        {!loading && news.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#444', fontSize: '11px' }}>
            No recent news
          </div>
        )}
      </div>
    </div>
  )
}
