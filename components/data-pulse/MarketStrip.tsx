'use client'

import { useEffect, useState } from 'react'
import type { MarketSnapshot } from '@/lib/market-data'

function Tick({ label, price, pct }: { label: string; price: number | null | undefined; pct: number | null | undefined }) {
  if (!price) return null
  const up = (pct ?? 0) >= 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', borderRight: '1px solid #1e1e1e' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: '#e8dcc8' }}>
        {price >= 1000 ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: up ? '#059669' : '#e05252' }}>
        {up ? '▲' : '▼'} {Math.abs(pct ?? 0).toFixed(2)}%
      </span>
    </div>
  )
}

export default function MarketStrip({ initial }: { initial: MarketSnapshot | null }) {
  const [data, setData] = useState<MarketSnapshot | null>(initial)
  const [lastRefresh, setLastRefresh] = useState<string>('')

  useEffect(() => {
    async function refresh() {
      try {
        const res = await fetch('/api/data-pulse')
        if (res.ok) {
          const snap = await res.json()
          setData(snap)
          setLastRefresh(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET')
        }
      } catch { /* silent */ }
    }

    // Refresh every 15 minutes
    const id = setInterval(refresh, 15 * 60 * 1000)
    setLastRefresh(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }) + ' ET')
    return () => clearInterval(id)
  }, [])

  if (!data) return null

  return (
    <div style={{ background: '#0d0d0d', borderBottom: '1px solid #1a1a1a', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 'max-content', height: '40px' }}>
        <div style={{ padding: '0 16px 0 20px', borderRight: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Prices · {lastRefresh || '—'}
          </span>
        </div>
        <Tick label="S&P 500"  price={data.spy?.price}  pct={data.spy?.pctChange} />
        <Tick label="Nasdaq"   price={data.qqq?.price}  pct={data.qqq?.pctChange} />
        <Tick label="10Y"      price={data.fred.yield10y ?? undefined} pct={data.fred.yield10yChange ? data.fred.yield10yChange * 100 : undefined} />
        <Tick label="VIX"      price={data.fred.vix ?? undefined} pct={data.fred.vixChange ?? undefined} />
        <Tick label="Gold"     price={data.gld?.price}  pct={data.gld?.pctChange} />
        <Tick label="Oil"      price={data.uso?.price}  pct={data.uso?.pctChange} />
        <Tick label="BTC"      price={data.btc?.price}  pct={data.btc?.pctChange} />
        <Tick label="Nvidia"   price={data.nvda?.price} pct={data.nvda?.pctChange} />
      </div>
    </div>
  )
}
