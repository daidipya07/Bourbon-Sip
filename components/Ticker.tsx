'use client'

import { useEffect, useState } from 'react'
import { tickers as fallbackTickers, type Ticker } from '@/lib/data/tickers'

export default function Ticker() {
  const [tickers, setTickers] = useState<Ticker[]>(fallbackTickers)

  useEffect(() => {
    async function fetchTickers() {
      try {
        const res = await fetch('/api/tickers')
        if (!res.ok) return
        const data = await res.json()
        if (data.tickers?.length) setTickers(data.tickers)
      } catch {
        // keep fallback data on error
      }
    }

    fetchTickers()
    const id = setInterval(fetchTickers, 60_000)
    return () => clearInterval(id)
  }, [])

  // Duplicate items to create seamless scroll loop
  const items = [...tickers, ...tickers]

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {items.map((t, i) => (
          <span key={i}>
            <span className="ticker-item">
              <span className="ticker-sym">{t.sym}</span>
              <span className="ticker-val">{t.val}</span>
              <span className={`ticker-chg ${t.up ? 'up' : 'down'}`}>{t.chg}</span>
            </span>
            <span className="ticker-sep">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
