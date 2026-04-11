'use client'

import { tickers } from '@/lib/data/tickers'

export default function Ticker() {
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
