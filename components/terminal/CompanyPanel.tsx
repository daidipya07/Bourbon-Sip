'use client'

import { useCallback, useEffect } from 'react'
import { usePolling } from './usePolling'

interface Recommendation { period: string; strongBuy: number; buy: number; hold: number; sell: number; strongSell: number }
interface Financials {
  revenueGrowth: number | null; epsGrowth: number | null; grossMargin: number | null
  operatingMargin: number | null; netMargin: number | null; roe: number | null
  currentRatio: number | null; debtToEquity: number | null
}
interface EarningRow { period: string; actual: number | null; estimate: number | null; surprisePercent: number | null }
interface InsiderRecent { name: string; change: number; date: string; code: string }
interface Insider { buys: number; sells: number; netShares: number; recent: InsiderRecent[] }

interface CompanyData {
  symbol: string
  applicable: boolean
  recommendation: Recommendation | null
  peers: string[]
  financials: Financials | null
  earnings: EarningRow[]
  insider: Insider | null
}

const REC_SEGMENTS: Array<{ key: keyof Recommendation; label: string; color: string }> = [
  { key: 'strongBuy', label: 'Strong Buy', color: '#00c853' },
  { key: 'buy', label: 'Buy', color: '#4caf50' },
  { key: 'hold', label: 'Hold', color: '#c8963e' },
  { key: 'sell', label: 'Sell', color: '#ff7043' },
  { key: 'strongSell', label: 'Strong Sell', color: '#ff1744' },
]

function fmtShares(n: number): string {
  const a = Math.abs(n)
  const s = n >= 0 ? '+' : '−'
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(2)}M`
  if (a >= 1e3) return `${s}${(a / 1e3).toFixed(1)}K`
  return `${s}${a}`
}

function pct(v: number | null): string {
  return v == null ? '—' : `${v.toFixed(1)}%`
}
function ratio(v: number | null): string {
  return v == null ? '—' : v.toFixed(2)
}

export default function CompanyPanel({ symbol, onSelect }: { symbol: string; onSelect: (s: string) => void }) {
  const fetcher = useCallback(async (): Promise<CompanyData | null> => {
    const res = await fetch(`/api/terminal/company?symbol=${encodeURIComponent(symbol)}`)
    if (!res.ok) return null
    return await res.json()
  }, [symbol])

  const { data, loading, refetch } = usePolling(fetcher, { intervalMs: 30 * 60_000, enabled: !!symbol && !symbol.includes(':') })

  useEffect(() => { if (symbol && !symbol.includes(':')) refetch() }, [symbol, refetch])

  // Crypto / no company data → render nothing (keeps the column clean)
  if (symbol.includes(':')) return null
  if (loading && !data) {
    return (
      <div className="terminal-panel">
        <div className="terminal-panel-header"><span className="terminal-panel-title">Company · {symbol}</span></div>
        <div className="terminal-loading">Loading research</div>
      </div>
    )
  }
  if (!data || !data.applicable) return null

  const rec = data.recommendation
  const recTotal = rec ? rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell : 0
  const f = data.financials

  const hasAnything = rec || f || data.peers.length > 0 || data.earnings.length > 0 || data.insider
  if (!hasAnything) return null

  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">
        <span className="terminal-panel-title">Company · {symbol}</span>
      </div>
      <div className="terminal-panel-body">

        {rec && recTotal > 0 && (
          <div className="terminal-company-section">
            <div className="terminal-sector-label">Analyst Recommendations</div>
            <div className="terminal-rec-bar">
              {REC_SEGMENTS.map(seg => {
                const v = rec[seg.key] as number
                if (v <= 0) return null
                return <div key={seg.key} className="terminal-rec-seg" style={{ flex: v, background: seg.color }} title={`${seg.label}: ${v}`} />
              })}
            </div>
            <div className="terminal-rec-legend">
              {REC_SEGMENTS.map(seg => {
                const v = rec[seg.key] as number
                if (v <= 0) return null
                return (
                  <span key={seg.key} className="terminal-rec-legend-item">
                    <span className="terminal-rec-dot" style={{ background: seg.color }} />{seg.label} {v}
                  </span>
                )
              })}
              <span className="t-muted" style={{ marginLeft: 'auto' }}>{recTotal} analysts</span>
            </div>
          </div>
        )}

        {f && (
          <div className="terminal-company-section">
            <div className="terminal-sector-label">Key Financials (TTM)</div>
            <div className="terminal-fin-grid">
              <Fin label="Rev Growth" value={pct(f.revenueGrowth)} v={f.revenueGrowth} signed />
              <Fin label="EPS Growth" value={pct(f.epsGrowth)} v={f.epsGrowth} signed />
              <Fin label="Gross Margin" value={pct(f.grossMargin)} />
              <Fin label="Oper Margin" value={pct(f.operatingMargin)} />
              <Fin label="Net Margin" value={pct(f.netMargin)} />
              <Fin label="ROE" value={pct(f.roe)} />
              <Fin label="Current Ratio" value={ratio(f.currentRatio)} />
              <Fin label="Debt/Equity" value={ratio(f.debtToEquity)} />
            </div>
          </div>
        )}

        {data.earnings.length > 0 && (
          <div className="terminal-company-section">
            <div className="terminal-sector-label">Earnings — Actual vs Estimate</div>
            <div className="terminal-earn-hist">
              {data.earnings.map(e => {
                const beat = e.surprisePercent != null ? e.surprisePercent >= 0 : null
                return (
                  <div key={e.period} className="terminal-earn-hist-row">
                    <span className="t-muted">{e.period?.slice(0, 7)}</span>
                    <span>{e.actual != null ? e.actual.toFixed(2) : '—'}</span>
                    <span className="t-muted">vs {e.estimate != null ? e.estimate.toFixed(2) : '—'}</span>
                    <span className={beat == null ? '' : beat ? 't-green' : 't-red'}>
                      {e.surprisePercent != null ? `${e.surprisePercent >= 0 ? '+' : ''}${e.surprisePercent.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {data.peers.length > 0 && (
          <div className="terminal-company-section">
            <div className="terminal-sector-label">Peers</div>
            <div className="terminal-peers">
              {data.peers.map(p => (
                <button key={p} className="terminal-peer-chip" onClick={() => onSelect(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {data.insider && (
          <div className="terminal-company-section">
            <div className="terminal-sector-label">Insider Activity</div>
            <div className="terminal-insider-summary">
              <span>Net: <span className={data.insider.netShares >= 0 ? 't-green' : 't-red'}>{fmtShares(data.insider.netShares)}</span></span>
              <span className="t-muted">{data.insider.buys} buys · {data.insider.sells} sells</span>
            </div>
            {data.insider.recent.map((t, i) => (
              <div key={i} className="terminal-insider-row">
                <span className="terminal-insider-name">{t.name}</span>
                <span className="t-muted">{t.date}</span>
                <span className={t.change >= 0 ? 't-green' : 't-red'}>{fmtShares(t.change)}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function Fin({ label, value, v, signed }: { label: string; value: string; v?: number | null; signed?: boolean }) {
  const cls = signed && v != null ? (v >= 0 ? 't-green' : 't-red') : ''
  return (
    <div className="terminal-fin-cell">
      <div className="terminal-fin-label">{label}</div>
      <div className={`terminal-fin-value ${cls}`}>{value}</div>
    </div>
  )
}
