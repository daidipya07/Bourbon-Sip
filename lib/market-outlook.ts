// Market Outlook — a plain-English "market wrap" composed deterministically from
// the live MarketSnapshot. No AI, no network: a pure function over data the site
// already fetches. Always fresh, free, and defensible. Complements (does not
// replace) the weekly AI signal, which stays the deeper, human-reviewed take.

import type { MarketSnapshot, FinnhubQuote } from './market-data'

export interface OutlookDriver {
  label: string
  value: string
  tone: 'up' | 'down' | 'neutral'
}

export interface MarketOutlook {
  headline: string
  summary: string
  drivers: OutlookDriver[]
  watch: string
  regime: string
  regimeLabel: string
  regimeColor: string
  asOf: string
}

// ── Helpers ──────────────────────────────────────────────

function pctStr(p: number | null | undefined): string {
  if (p == null) return '—'
  return `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`
}

function toneOf(p: number | null | undefined): 'up' | 'down' | 'neutral' {
  if (p == null) return 'neutral'
  if (p > 0.05) return 'up'
  if (p < -0.05) return 'down'
  return 'neutral'
}

type EquityTone = 'strong-up' | 'up' | 'flat' | 'down' | 'strong-down' | 'unknown'

function equityTone(pct: number | null | undefined): EquityTone {
  if (pct == null) return 'unknown'
  if (pct > 1) return 'strong-up'
  if (pct > 0.2) return 'up'
  if (pct >= -0.2) return 'flat'
  if (pct >= -1) return 'down'
  return 'strong-down'
}

const EQUITY_PHRASE: Record<EquityTone, string> = {
  'strong-up': 'stocks rallied',
  'up': 'stocks edged higher',
  'flat': 'stocks were little changed',
  'down': 'stocks slipped',
  'strong-down': 'stocks sold off',
  'unknown': 'equity data was unavailable',
}

type VixBucket = 'calm' | 'low' | 'normal' | 'elevated' | 'high' | 'unknown'

function vixBucket(v: number | null | undefined): VixBucket {
  if (v == null) return 'unknown'
  if (v < 14) return 'calm'
  if (v < 17) return 'low'
  if (v < 20) return 'normal'
  if (v < 26) return 'elevated'
  return 'high'
}

const VIX_PHRASE: Record<VixBucket, string> = {
  'calm': 'volatility subdued',
  'low': 'volatility low',
  'normal': 'volatility near its long-run norm',
  'elevated': 'volatility elevated',
  'high': 'volatility running hot',
  'unknown': '',
}

function directionWord(change: number | null | undefined, up = 'rising', down = 'falling', flat = 'steady'): string {
  if (change == null) return flat
  if (change > 0) return up
  if (change < 0) return down
  return flat
}

// ── Composer ─────────────────────────────────────────────

export function composeMarketOutlook(s: MarketSnapshot): MarketOutlook {
  const spyPct = s.spy?.pctChange ?? null
  const qqqPct = s.qqq?.pctChange ?? null
  const iwmPct = s.iwm?.pctChange ?? null
  const f = s.fred

  const eTone = equityTone(spyPct)
  const vBucket = vixBucket(f.vix)

  // ── Headline: regime + equity tone + volatility ──
  const headParts: string[] = [s.regimeLabel]
  if (eTone !== 'unknown') headParts.push(EQUITY_PHRASE[eTone])
  if (vBucket !== 'unknown') headParts.push(VIX_PHRASE[vBucket])
  const headline = capitalize(headParts.filter(Boolean).join(', '))

  // ── Summary: 2–3 plain-English sentences ──
  const sentences: string[] = []

  // Sentence 1 — equities + leadership
  if (eTone !== 'unknown') {
    let s1 = `The S&P 500 ${spyPct != null ? (spyPct >= 0 ? 'gained' : 'lost') : 'moved'} ${spyPct != null ? Math.abs(spyPct).toFixed(2) + '%' : ''}`.trim()
    // Leadership: tech (QQQ) vs broad market
    if (qqqPct != null && spyPct != null) {
      if (qqqPct - spyPct > 0.3) s1 += ', with tech leading'
      else if (spyPct - qqqPct > 0.3) s1 += ', with tech lagging the broad market'
    }
    // Breadth: small caps participating?
    if (iwmPct != null && spyPct != null) {
      if (spyPct > 0.1 && iwmPct < -0.1) s1 += ' while small caps lagged'
      else if (spyPct > 0.1 && iwmPct > spyPct + 0.3) s1 += ' and small caps outpaced large caps'
      else if (spyPct < -0.1 && iwmPct < spyPct - 0.3) s1 += ' while small caps fell harder'
    }
    sentences.push(s1 + '.')
  }

  // Sentence 2 — rates + curve
  if (f.yield10y != null) {
    const dir = directionWord(f.yield10yChange)
    let s2 = `The 10-year Treasury yield sits at ${f.yield10y.toFixed(2)}%, ${dir} on the week`
    if (f.yieldCurve != null && f.yieldCurve < 0) {
      s2 += `, and the 2s10s curve remains inverted (${f.yieldCurve.toFixed(2)}%)`
    }
    sentences.push(s2 + '.')
  }

  // Sentence 3 — volatility + dollar
  if (vBucket !== 'unknown') {
    let s3 = `With the VIX at ${f.vix!.toFixed(1)}, ${VIX_PHRASE[vBucket]}`
    if (f.dxy != null && f.dxyChange != null && Math.abs(f.dxyChange) >= 0.3) {
      s3 += `; the dollar is ${directionWord(f.dxyChange, 'firmer', 'softer', 'flat')}`
    }
    sentences.push(capitalize(s3) + '.')
  }

  const summary = sentences.join(' ') || 'Market data is currently unavailable. Check back shortly.'

  // ── Drivers: 4–6 key facts as chips (only where data exists) ──
  const drivers: OutlookDriver[] = []
  const pushQuote = (label: string, q: FinnhubQuote | null) => {
    if (q?.pctChange != null) drivers.push({ label, value: pctStr(q.pctChange), tone: toneOf(q.pctChange) })
  }
  pushQuote('S&P 500', s.spy)
  pushQuote('Nasdaq', s.qqq)
  if (f.yield10y != null) {
    drivers.push({
      label: '10Y',
      value: `${f.yield10y.toFixed(2)}%`,
      tone: toneOf(f.yield10yChange),
    })
  }
  if (f.vix != null) {
    // For VIX, "up" is risk-negative — color it red when rising, green when falling.
    drivers.push({
      label: 'VIX',
      value: f.vix.toFixed(1),
      tone: f.vixChange == null ? 'neutral' : f.vixChange > 0 ? 'down' : 'up',
    })
  }
  pushQuote('Gold', s.gld)
  if (s.btc?.pctChange != null) pushQuote('BTC', s.btc)
  else pushQuote('Oil', s.uso)

  // ── Watch: single most-salient tension ──
  const watch = pickWatch(s)

  return {
    headline,
    summary,
    drivers,
    watch,
    regime: s.regime,
    regimeLabel: s.regimeLabel,
    regimeColor: s.regimeColor,
    asOf: s.lastUpdated,
  }
}

function pickWatch(s: MarketSnapshot): string {
  const f = s.fred
  // Deeply inverted curve
  if (f.yieldCurve != null && f.yieldCurve < -0.3) {
    return `Watch the 2s10s curve (${f.yieldCurve.toFixed(2)}%) — a sustained steepening back toward zero often precedes a shift in the rate cycle.`
  }
  // Volatility moving fast
  if (f.vix != null && f.vixChange != null && Math.abs(f.vixChange) >= 3) {
    return f.vixChange > 0
      ? `Watch the VIX (${f.vix.toFixed(1)}) — a fast jump in volatility can signal stress building under the surface.`
      : `Watch the VIX (${f.vix.toFixed(1)}) — easing volatility is giving risk assets room to run.`
  }
  // 10Y near a round level
  if (f.yield10y != null) {
    const nearest = Math.round(f.yield10y * 2) / 2 // nearest 0.5
    if (Math.abs(f.yield10y - nearest) < 0.08 && nearest % 1 !== 0.25) {
      return `Watch the 10-year yield near ${nearest.toFixed(2)}% — round levels often act as magnets and inflection points for both stocks and bonds.`
    }
  }
  // Credit spreads widening
  if (f.hySpreads != null && f.hySpreadsChange != null && f.hySpreadsChange > 15) {
    return `Watch high-yield credit spreads (${f.hySpreads.toFixed(0)}bps, widening) — credit usually cracks before equities do.`
  }
  // Default — regime-anchored
  const byRegime: Record<string, string> = {
    'risk-on': 'Watch whether breadth holds — a rally led by only a few names is more fragile than one where small caps join in.',
    'risk-off': 'Watch for a volatility peak — risk-off regimes often turn once the VIX stops making new highs.',
    'reflation': 'Watch commodity prices and the 10-year yield together — reflation persists only while both keep rising.',
    'deflation': 'Watch the dollar and real yields — a strengthening dollar tends to tighten financial conditions further.',
  }
  return byRegime[s.regime] ?? 'Watch rates, volatility, and credit spreads together — they usually turn before equities do.'
}

function capitalize(str: string): string {
  return str.length ? str[0].toUpperCase() + str.slice(1) : str
}
