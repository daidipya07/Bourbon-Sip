'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { HEATMAP_SYMBOLS } from '@/lib/terminal/symbols'
import { dailyReturns, alignByTime, blendedReturns, betaVsBenchmark, returnSeriesStats, pearson } from '@/lib/terminal/analysis'
import type { Candle } from '@/lib/terminal/indicators'
import { usePolling } from '../usePolling'
import PanelStatus from '../PanelStatus'
import { ToolDisclaimer } from './ToolsPanel'
import ToolHelp from './ToolHelp'

interface Holding { symbol: string; shares: number; costBasis?: number }
interface Quote { symbol: string; price: number | null; pctChange: number | null; prevClose?: number }

interface RiskResult {
  annVol: number | null
  maxDrawdown: number | null
  beta: number | null
  avgCorrelation: number | null
  days: number
  computedFor: string
}

const STORAGE_KEY = 'bourbon-terminal-portfolio'
const MAX_RISK_SYMBOLS = 12
const SECTOR_BY_SYMBOL = new Map(HEATMAP_SYMBOLS.map(s => [s.symbol, s.sector]))

function loadHoldings(): Holding[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveHoldings(h: Holding[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)) } catch {}
}

function fmtMoney(v: number, dec = 0): string {
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}`
}

export default function PortfolioTool({ onSelectSymbol }: { onSelectSymbol: (s: string) => void }) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loaded, setLoaded] = useState(false)
  const [symInput, setSymInput] = useState('')
  const [sharesInput, setSharesInput] = useState('')
  const [costInput, setCostInput] = useState('')
  const [risk, setRisk] = useState<RiskResult | null>(null)
  const [riskRunning, setRiskRunning] = useState(false)
  const [riskError, setRiskError] = useState('')

  useEffect(() => { setHoldings(loadHoldings()); setLoaded(true) }, [])

  const symbols = useMemo(() => holdings.map(h => h.symbol), [holdings])

  const fetcher = useCallback(async () => {
    if (symbols.length === 0) return new Map<string, Quote>()
    const res = await fetch(`/api/terminal/quotes?symbols=${encodeURIComponent(symbols.join(','))}`)
    if (!res.ok) throw new Error('portfolio quotes')
    const data = await res.json()
    return new Map<string, Quote>((data.quotes || []).map((q: Quote) => [q.symbol, q]))
  }, [symbols])

  const { data: quotes, error, lastUpdated, stale, refetch } = usePolling(fetcher, {
    intervalMs: 60_000,
    enabled: symbols.length > 0,
  })
  useEffect(() => { if (symbols.length > 0) refetch() }, [symbols, refetch])

  function addHolding() {
    const sym = symInput.trim().toUpperCase()
    const sh = parseFloat(sharesInput)
    const cost = parseFloat(costInput)
    if (!sym || !(sh > 0)) return
    const next = holdings.filter(h => h.symbol !== sym)
    next.push({ symbol: sym, shares: sh, costBasis: cost > 0 ? cost : undefined })
    setHoldings(next)
    saveHoldings(next)
    setSymInput(''); setSharesInput(''); setCostInput('')
    setRisk(null)
  }

  function removeHolding(sym: string) {
    const next = holdings.filter(h => h.symbol !== sym)
    setHoldings(next)
    saveHoldings(next)
    setRisk(null)
  }

  // ── Live layer ──
  const rows = holdings.map(h => {
    const q = quotes?.get(h.symbol)
    const price = q?.price ?? null
    const value = price != null ? price * h.shares : null
    const dayPl = price != null && q?.prevClose ? (price - q.prevClose) * h.shares : null
    const gain = price != null && h.costBasis ? (price - h.costBasis) * h.shares : null
    return { ...h, price, value, dayPl, pct: q?.pctChange ?? null, gain }
  })
  const totalValue = rows.reduce((s, r) => s + (r.value ?? 0), 0)
  const totalDayPl = rows.reduce((s, r) => s + (r.dayPl ?? 0), 0)
  const totalGain = rows.some(r => r.gain != null) ? rows.reduce((s, r) => s + (r.gain ?? 0), 0) : null
  const dayUp = totalDayPl >= 0

  // Sector mix
  const sectorMix = useMemo(() => {
    const bySector = new Map<string, number>()
    for (const r of rows) {
      if (r.value == null) continue
      const sector = SECTOR_BY_SYMBOL.get(r.symbol) || 'Other'
      bySector.set(sector, (bySector.get(sector) || 0) + r.value)
    }
    return [...bySector.entries()].sort((a, b) => b[1] - a[1])
  }, [rows])

  // ── Risk layer (explicit, budget-conscious) ──
  async function computeRisk() {
    const active = rows.filter(r => r.value != null && r.value > 0)
    if (active.length === 0) { setRiskError('Add holdings with live prices first.'); return }
    if (active.length > MAX_RISK_SYMBOLS) {
      setRiskError(`Risk engine caps at ${MAX_RISK_SYMBOLS} symbols (chart-data budget).`)
      return
    }
    setRiskRunning(true)
    setRiskError('')
    try {
      const uniqueSyms = active.map(r => r.symbol)
      const withBench = uniqueSyms.includes('SPY') ? uniqueSyms : [...uniqueSyms, 'SPY']
      const all = await Promise.all(withBench.map(async s => {
        const res = await fetch(`/api/terminal/candles?symbol=${encodeURIComponent(s)}&range=1Y`)
        const d = await res.json()
        return { symbol: s, candles: (d.candles || []) as Candle[] }
      }))
      const bad = all.filter(a => a.candles.length < 60).map(a => a.symbol)
      if (bad.length > 0) throw new Error(`Not enough 1Y history for: ${bad.join(', ')}`)

      const aligned = alignByTime(all.map(a => dailyReturns(a.candles)))
      const idxOf = (s: string) => withBench.indexOf(s)
      const weights = active.map(r => r.value as number)
      const assetSeries = active.map(r => aligned[idxOf(r.symbol)])
      const blended = blendedReturns(assetSeries, weights)
      const bench = aligned[idxOf('SPY')]

      const stats = returnSeriesStats(blended)
      const beta = betaVsBenchmark(blended, bench)

      // Average pairwise correlation across holdings (n ≥ 2).
      let avgCorr: number | null = null
      if (assetSeries.length >= 2) {
        let sum = 0, count = 0
        for (let i = 0; i < assetSeries.length; i++) {
          for (let j = i + 1; j < assetSeries.length; j++) {
            const r = pearson(assetSeries[i], assetSeries[j])
            if (r != null) { sum += r; count++ }
          }
        }
        avgCorr = count > 0 ? parseFloat((sum / count).toFixed(2)) : null
      }

      setRisk({
        annVol: stats.annVol,
        maxDrawdown: stats.maxDrawdown,
        beta: beta != null ? parseFloat(beta.toFixed(2)) : null,
        avgCorrelation: avgCorr,
        days: blended.length,
        computedFor: active.map(r => r.symbol).join(', '),
      })
    } catch (err) {
      setRisk(null)
      setRiskError(err instanceof Error ? err.message : 'Risk computation failed')
    }
    setRiskRunning(false)
  }

  return (
    <div className="terminal-tool">
      <div className="terminal-tool-header">
        <span className="terminal-panel-title">Portfolio Analyzer</span>
        <PanelStatus lastUpdated={lastUpdated} stale={stale} error={error} onRetry={refetch} />
      </div>

      {/* Add row */}
      <div className="terminal-tool-form terminal-portfolio-add">
        <label className="terminal-tool-field">
          <span>Symbol</span>
          <input value={symInput} onChange={e => setSymInput(e.target.value.toUpperCase())} placeholder="AAPL" onKeyDown={e => e.key === 'Enter' && addHolding()} />
        </label>
        <label className="terminal-tool-field">
          <span>Shares</span>
          <input value={sharesInput} onChange={e => setSharesInput(e.target.value)} inputMode="decimal" placeholder="10" onKeyDown={e => e.key === 'Enter' && addHolding()} />
        </label>
        <label className="terminal-tool-field">
          <span>Cost / Share ($ · opt)</span>
          <input value={costInput} onChange={e => setCostInput(e.target.value)} inputMode="decimal" placeholder="150" onKeyDown={e => e.key === 'Enter' && addHolding()} />
        </label>
        <button className="terminal-tool-run" onClick={addHolding}>Add</button>
      </div>

      {loaded && holdings.length === 0 && (
        <div className="terminal-tool-empty">
          Add your holdings — they stay in your browser (local storage), never on a server.
        </div>
      )}

      {holdings.length > 0 && (
        <>
          {/* Summary */}
          <div className="terminal-tool-results">
            <SummaryStat label="Total Value" value={fmtMoney(totalValue)} highlight />
            <SummaryStat label="Day P&L" value={`${dayUp ? '+' : '−'}${fmtMoney(Math.abs(totalDayPl))}`} cls={dayUp ? 't-green' : 't-red'} />
            {totalGain != null && (
              <SummaryStat label="Unrealized" value={`${totalGain >= 0 ? '+' : '−'}${fmtMoney(Math.abs(totalGain))}`} cls={totalGain >= 0 ? 't-green' : 't-red'} />
            )}
            <SummaryStat label="Positions" value={String(holdings.length)} />
          </div>

          {/* Holdings table */}
          <div className="terminal-portfolio-head">
            <span>Sym</span><span>Shares</span><span>Price</span><span>Value</span><span>Day</span><span>Wt</span><span />
          </div>
          {rows.map(r => {
            const rowUp = (r.dayPl ?? 0) >= 0
            const wt = totalValue > 0 && r.value != null ? (r.value / totalValue) * 100 : null
            return (
              <div key={r.symbol} className="terminal-portfolio-row">
                <button className="terminal-portfolio-sym" onClick={() => onSelectSymbol(r.symbol)}>{r.symbol}</button>
                <span>{r.shares}</span>
                <span>{r.price != null ? r.price.toFixed(2) : '—'}</span>
                <span>{r.value != null ? fmtMoney(r.value) : '—'}</span>
                <span className={rowUp ? 't-green' : 't-red'}>
                  {r.dayPl != null ? `${rowUp ? '+' : '−'}${fmtMoney(Math.abs(r.dayPl))}` : '—'}
                </span>
                <span className="t-muted">{wt != null ? `${wt.toFixed(0)}%` : '—'}</span>
                <button className="terminal-portfolio-del" onClick={() => removeHolding(r.symbol)} title="Remove">×</button>
              </div>
            )
          })}

          {/* Sector mix */}
          {sectorMix.length > 0 && totalValue > 0 && (
            <div className="terminal-company-section" style={{ marginTop: '8px' }}>
              <div className="terminal-sector-label">Sector Mix</div>
              <div className="terminal-rec-bar">
                {sectorMix.map(([sector, v], i) => (
                  <div key={sector} className="terminal-rec-seg" style={{ flex: v, background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} title={`${sector}: ${((v / totalValue) * 100).toFixed(0)}%`} />
                ))}
              </div>
              <div className="terminal-rec-legend">
                {sectorMix.map(([sector, v], i) => (
                  <span key={sector} className="terminal-rec-legend-item">
                    <span className="terminal-rec-dot" style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                    {sector} {((v / totalValue) * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Risk layer */}
          <div className="terminal-company-section" style={{ marginTop: '4px' }}>
            <div className="terminal-sector-label">Risk — 1Y Daily History vs SPY</div>
            {!risk && (
              <div style={{ padding: '4px 12px 8px' }}>
                <button className="terminal-tool-run" onClick={computeRisk} disabled={riskRunning}>
                  {riskRunning ? 'Computing…' : 'Compute Risk'}
                </button>
                <span style={{ fontSize: '9px', color: '#555', marginLeft: '10px' }}>
                  Fetches 1Y history per holding (max {MAX_RISK_SYMBOLS})
                </span>
              </div>
            )}
            {riskError && <div className="terminal-tool-warn">{riskError}</div>}
            {risk && (
              <>
                <div className="terminal-tool-results">
                  <SummaryStat label="Portfolio Beta" value={risk.beta != null ? risk.beta.toFixed(2) : '—'} highlight />
                  <SummaryStat label="Ann Volatility" value={risk.annVol != null ? `${risk.annVol.toFixed(1)}%` : '—'} />
                  <SummaryStat label="Max Drawdown" value={risk.maxDrawdown != null ? `${risk.maxDrawdown.toFixed(1)}%` : '—'} cls="t-red" />
                  {risk.avgCorrelation != null && <SummaryStat label="Avg Pair Corr" value={risk.avgCorrelation.toFixed(2)} />}
                </div>
                <div className="terminal-tool-ranlabel">
                  {risk.days} trading days · assumes today&apos;s weights held constant over the past year · {risk.computedFor}
                  <button style={{ background: 'none', border: 'none', color: '#c8963e', cursor: 'pointer', fontFamily: 'inherit', fontSize: '9px', marginLeft: '8px' }} onClick={computeRisk} disabled={riskRunning}>
                    recompute
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <ToolHelp
        howTo={[
          'Add each position: ticker, share count, and (optionally) your average cost per share. Holdings save to your browser only — nothing is uploaded.',
          'The live table updates automatically: value, day P&L and weight per position. Click a ticker to open its chart.',
          'Press "Compute Risk" to fetch a year of price history and measure how your portfolio as a whole has behaved.',
        ]}
        meaning={[
          ['Day P&L', 'Today\'s move per position: (price − previous close) × shares.'],
          ['Unrealized', 'Gain vs your cost basis, for positions where you entered one.'],
          ['Weight', 'Position value as a share of the total — concentration at a glance.'],
          ['Portfolio Beta', 'Sensitivity to the S&P 500. 1.0 = moves with the market; 1.3 = moves ~30% harder both ways; 0.5 = half the market\'s swings.'],
          ['Ann Volatility', 'Annualized standard deviation of daily returns — a typical year\'s "wobble". The S&P 500 usually runs ~12–20%.'],
          ['Max Drawdown', 'The worst peak-to-trough fall of the blended portfolio during the past year — the pain you would actually have felt.'],
          ['Avg Pair Corr', 'Average correlation between your holdings. Near 1 means they all move together — diversification in name only.'],
        ]}
        methodology={[
          'Risk metrics use 1 year of daily closes per holding (Twelve Data), day-aligned, blended with your CURRENT dollar weights held constant (daily-rebalanced) — a standard snapshot approximation, not your actual trade history.',
          'Beta is an OLS regression of the blended daily returns against SPY over the same dates; vol is annualized with √252.',
          'Sector mix uses our 48-large-cap sector map; anything outside it shows as "Other".',
        ]}
        caveats={[
          'This is NOT your historical performance — it answers "how would today\'s mix have behaved", ignoring when you actually bought.',
          'Price returns only (dividends excluded) — vol/beta are barely affected, but long-run return comparisons would be.',
          'Crypto trades weekends; only days overlapping the stock market are used, which slightly understates crypto risk.',
          'One year of daily data is a small sample — treat the numbers as estimates with real uncertainty, not precise measurements.',
        ]}
      />

      <ToolDisclaimer />
    </div>
  )
}

const SECTOR_COLORS = ['#c8963e', '#4f8fe0', '#59c98a', '#e0648f', '#9b6fe0', '#d9a441', '#5ac8c8', '#888']

function SummaryStat({ label, value, cls, highlight }: { label: string; value: string; cls?: string; highlight?: boolean }) {
  return (
    <div className={`terminal-tool-result ${highlight ? 'highlight' : ''}`}>
      <span className="terminal-tool-result-label">{label}</span>
      <span className={`terminal-tool-result-value ${cls || ''}`}>{value}</span>
    </div>
  )
}
