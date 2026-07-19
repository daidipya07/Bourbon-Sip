'use client'

import { useEffect, useState, useCallback } from 'react'

interface MarketItem {
  symbol: string
  name: string
  group: string
  price: number | null
  pctChange: number | null
}

const MARKET_SYMBOLS: Array<{ symbol: string; name: string; group: string }> = [
  // Indices
  { symbol: 'SPY',  name: 'S&P 500',    group: 'Indices' },
  { symbol: 'QQQ',  name: 'Nasdaq 100',  group: 'Indices' },
  { symbol: 'IWM',  name: 'Russell 2000', group: 'Indices' },
  { symbol: 'DIA',  name: 'Dow Jones',   group: 'Indices' },
  { symbol: 'EFA',  name: 'Intl Dev',    group: 'Indices' },
  { symbol: 'EEM',  name: 'Emerging Mkts', group: 'Indices' },
  // Sectors
  { symbol: 'XLK',  name: 'Tech',        group: 'Sectors' },
  { symbol: 'XLF',  name: 'Financials',  group: 'Sectors' },
  { symbol: 'XLE',  name: 'Energy',      group: 'Sectors' },
  { symbol: 'XLV',  name: 'Healthcare',  group: 'Sectors' },
  { symbol: 'XLI',  name: 'Industrials', group: 'Sectors' },
  { symbol: 'XLP',  name: 'Staples',     group: 'Sectors' },
  // Commodities
  { symbol: 'GLD',  name: 'Gold',        group: 'Commodities' },
  { symbol: 'SLV',  name: 'Silver',      group: 'Commodities' },
  { symbol: 'USO',  name: 'Crude Oil',   group: 'Commodities' },
  { symbol: 'UNG',  name: 'Nat Gas',     group: 'Commodities' },
  // Bonds
  { symbol: 'TLT',  name: '20Y+ Treasury', group: 'Bonds' },
  { symbol: 'IEF',  name: '7-10Y Treasury', group: 'Bonds' },
  { symbol: 'HYG',  name: 'High Yield',  group: 'Bonds' },
  { symbol: 'LQD',  name: 'IG Corporate', group: 'Bonds' },
  // Crypto
  { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin',  group: 'Crypto' },
  { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum',  group: 'Crypto' },
]

export default function MarketOverview({ onSelect }: { onSelect: (symbol: string) => void }) {
  const [items, setItems] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const results: MarketItem[] = await Promise.all(
      MARKET_SYMBOLS.map(async s => {
        try {
          const res = await fetch(`/api/terminal/quote?symbol=${encodeURIComponent(s.symbol)}`)
          const d = await res.json()
          return { ...s, price: d.price ?? null, pctChange: d.pctChange ?? null }
        } catch {
          return { ...s, price: null, pctChange: null }
        }
      })
    )
    setItems(results)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchAll])

  if (loading && items.length === 0) return <div className="terminal-loading">Loading markets</div>

  const groups = Array.from(new Set(MARKET_SYMBOLS.map(s => s.group)))

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      {groups.map(group => (
        <div key={group}>
          <div style={{ padding: '8px 12px 4px', fontSize: '9px', color: '#c8963e', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
            {group}
          </div>
          <div className="terminal-market-grid">
            {items.filter(i => i.group === group).map(item => {
              const up = (item.pctChange ?? 0) >= 0
              return (
                <div
                  key={item.symbol}
                  className="terminal-market-card"
                  onClick={() => onSelect(item.symbol.includes(':') ? item.symbol : item.symbol)}
                >
                  <div className="terminal-market-card-sym">{item.symbol.includes(':') ? item.name : item.symbol}</div>
                  <div className="terminal-market-card-name">{item.name}</div>
                  <div className="terminal-market-card-price">
                    {item.price ? (item.price >= 1000 ? item.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : item.price.toFixed(2)) : '—'}
                  </div>
                  <div className={`terminal-market-card-chg ${up ? 't-green' : 't-red'}`}>
                    {item.pctChange != null ? `${up ? '+' : ''}${item.pctChange.toFixed(2)}%` : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
