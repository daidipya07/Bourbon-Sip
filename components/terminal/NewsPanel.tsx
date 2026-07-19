'use client'

import { useEffect, useState } from 'react'

interface NewsItem {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  timestamp: number
  related: string
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NewsPanel({ symbol }: { symbol: string | null }) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = symbol
      ? `/api/terminal/news?symbol=${encodeURIComponent(symbol)}`
      : '/api/terminal/news?category=general'

    fetch(url)
      .then(r => r.json())
      .then(d => setNews(d.news || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false))
  }, [symbol])

  if (loading) return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">News {symbol ? `· ${symbol}` : ''}</span>
      </div>
      <div className="terminal-loading">Loading news</div>
    </div>
  )

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">News {symbol ? `· ${symbol}` : '· Market'}</span>
        <span style={{ fontSize: '9px', color: '#444' }}>{news.length} items</span>
      </div>
      <div className="terminal-panel-body">
        {news.map(item => (
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
        {news.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#444', fontSize: '11px' }}>
            No recent news
          </div>
        )}
      </div>
    </div>
  )
}
