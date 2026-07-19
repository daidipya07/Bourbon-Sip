// Pure analysis math for the terminal's Tools tab. No API calls — operates on
// candle arrays fetched by callers through /api/terminal/candles. Everything is
// day-aligned via UNIX-second timestamps normalized to the UTC calendar day.

import type { Candle } from './indicators'

export interface DatedValue { time: number; value: number }

// Normalize a bar timestamp to its UTC calendar day (candles from different
// symbols can carry different intraday session times).
function dayKey(time: number): number {
  return Math.floor(time / 86400)
}

// close-to-close simple returns, keyed by day.
export function dailyReturns(candles: Candle[]): DatedValue[] {
  const out: DatedValue[] = []
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1].close
    if (prev > 0) out.push({ time: candles[i].time, value: candles[i].close / prev - 1 })
  }
  return out
}

// Intersect several dated series on their common days, in chronological order.
// Returns one aligned number[] per input series.
export function alignByTime(seriesList: DatedValue[][]): number[][] {
  if (seriesList.length === 0) return []
  const maps = seriesList.map(s => new Map(s.map(p => [dayKey(p.time), p.value])))
  let common: Set<number> | null = null
  for (const m of maps) {
    const keys = new Set(m.keys())
    common = common === null ? keys : new Set([...common].filter(k => keys.has(k)))
  }
  const days = [...(common ?? [])].sort((a, b) => a - b)
  return maps.map(m => days.map(d => m.get(d) as number))
}

export function pearson(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length)
  if (n < 3) return null
  let sa = 0, sb = 0
  for (let i = 0; i < n; i++) { sa += a[i]; sb += b[i] }
  const ma = sa / n, mb = sb / n
  let cov = 0, va = 0, vb = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - ma, db = b[i] - mb
    cov += da * db; va += da * da; vb += db * db
  }
  if (va === 0 || vb === 0) return null
  return cov / Math.sqrt(va * vb)
}

// OLS beta of asset returns vs benchmark returns (aligned arrays).
export function betaVsBenchmark(asset: number[], bench: number[]): number | null {
  const n = Math.min(asset.length, bench.length)
  if (n < 10) return null
  let sa = 0, sb = 0
  for (let i = 0; i < n; i++) { sa += asset[i]; sb += bench[i] }
  const ma = sa / n, mb = sb / n
  let cov = 0, vb = 0
  for (let i = 0; i < n; i++) {
    cov += (asset[i] - ma) * (bench[i] - mb)
    vb += (bench[i] - mb) ** 2
  }
  if (vb === 0) return null
  return cov / vb
}

// Weighted blend of aligned per-asset return arrays → portfolio return series.
export function blendedReturns(aligned: number[][], weights: number[]): number[] {
  if (aligned.length === 0) return []
  const n = aligned[0].length
  const total = weights.reduce((a, b) => a + b, 0) || 1
  const w = weights.map(x => x / total)
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    let r = 0
    for (let j = 0; j < aligned.length; j++) r += (aligned[j][i] ?? 0) * w[j]
    out.push(r)
  }
  return out
}

// Annualized volatility (%) and max drawdown (%) of a daily return series.
export function returnSeriesStats(returns: number[]): { annVol: number | null; maxDrawdown: number | null } {
  if (returns.length < 10) return { annVol: null, maxDrawdown: null }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const varc = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length
  const annVol = Math.sqrt(varc) * Math.sqrt(252) * 100

  // Equity curve from returns → drawdown.
  let equity = 1, peak = 1, maxDd = 0
  for (const r of returns) {
    equity *= 1 + r
    if (equity > peak) peak = equity
    const dd = equity / peak - 1
    if (dd < maxDd) maxDd = dd
  }
  return { annVol: parseFloat(annVol.toFixed(1)), maxDrawdown: parseFloat((maxDd * 100).toFixed(1)) }
}

// ── Backtests ──────────────────────────────────────────────────────────────

export interface BacktestPoint { time: number; value: number; contributed: number }

export interface BacktestResult {
  series: BacktestPoint[]
  contributed: number
  finalValue: number
  gain: number
  totalReturnPct: number
  annualizedPct: number | null // XIRR for DCA, CAGR for lump sum
  buys: number
}

// Invest `monthlyAmount` at the close of the first trading day of each month.
export function dcaBacktest(candles: Candle[], monthlyAmount: number): BacktestResult | null {
  if (candles.length < 2 || monthlyAmount <= 0) return null

  let shares = 0
  let contributed = 0
  let buys = 0
  const series: BacktestPoint[] = []
  const cashflows: Array<{ time: number; amount: number }> = []
  let lastMonth = ''

  for (const c of candles) {
    const d = new Date(c.time * 1000)
    const monthKeyStr = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    if (monthKeyStr !== lastMonth && c.close > 0) {
      lastMonth = monthKeyStr
      shares += monthlyAmount / c.close
      contributed += monthlyAmount
      buys++
      cashflows.push({ time: c.time, amount: -monthlyAmount })
    }
    series.push({ time: c.time, value: shares * c.close, contributed })
  }

  const last = candles[candles.length - 1]
  const finalValue = shares * last.close
  cashflows.push({ time: last.time, amount: finalValue })

  return {
    series,
    contributed,
    finalValue,
    gain: finalValue - contributed,
    totalReturnPct: contributed > 0 ? ((finalValue - contributed) / contributed) * 100 : 0,
    annualizedPct: xirr(cashflows),
    buys,
  }
}

// One purchase at the first close of the window.
export function lumpSumBacktest(candles: Candle[], amount: number): BacktestResult | null {
  if (candles.length < 2 || amount <= 0 || candles[0].close <= 0) return null
  const shares = amount / candles[0].close
  const series: BacktestPoint[] = candles.map(c => ({ time: c.time, value: shares * c.close, contributed: amount }))
  const finalValue = shares * candles[candles.length - 1].close
  const years = (candles[candles.length - 1].time - candles[0].time) / (365.25 * 86400)
  const cagr = years > 0.1 ? (Math.pow(finalValue / amount, 1 / years) - 1) * 100 : null

  return {
    series,
    contributed: amount,
    finalValue,
    gain: finalValue - amount,
    totalReturnPct: ((finalValue - amount) / amount) * 100,
    annualizedPct: cagr != null ? parseFloat(cagr.toFixed(2)) : null,
    buys: 1,
  }
}

// Annualized internal rate of return via bisection on the XNPV sign change.
// Cashflows: negative = money in, final positive = ending value. Returns %.
export function xirr(cashflows: Array<{ time: number; amount: number }>): number | null {
  if (cashflows.length < 2) return null
  const t0 = cashflows[0].time
  const years = (t: number) => (t - t0) / (365.25 * 86400)
  const npv = (rate: number) =>
    cashflows.reduce((sum, cf) => sum + cf.amount / Math.pow(1 + rate, years(cf.time)), 0)

  let lo = -0.9999
  let hi = 10
  let fLo = npv(lo)
  const fHi = npv(hi)
  if (fLo * fHi > 0) return null // no sign change in a sane rate range

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const fMid = npv(mid)
    if (Math.abs(fMid) < 1e-7) return parseFloat((mid * 100).toFixed(2))
    if (fLo * fMid < 0) { hi = mid } else { lo = mid; fLo = fMid }
  }
  return parseFloat((((lo + hi) / 2) * 100).toFixed(2))
}
