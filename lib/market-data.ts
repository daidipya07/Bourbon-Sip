// Combined market data — FRED (macro) + Finnhub (equities/commodities)
import { getFredData, type FredData } from './fred'

export interface FinnhubQuote {
  price:     number
  change:    number   // absolute change from prev close
  pctChange: number   // % change from prev close
  prevClose: number
}

async function finnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
  const key = process.env.FINNHUB_API_KEY
  if (!key) return null

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`,
      { next: { revalidate: 900 } } // cache 15 min
    )
    if (!res.ok) return null
    const d = await res.json()
    if (!d.c || d.c === 0) return null
    return {
      price:     parseFloat(d.c.toFixed(2)),
      change:    parseFloat((d.c - d.pc).toFixed(2)),
      pctChange: parseFloat(d.dp.toFixed(2)),
      prevClose: parseFloat(d.pc.toFixed(2)),
    }
  } catch {
    return null
  }
}

export interface MarketSnapshot {
  // Equities
  spy:  FinnhubQuote | null  // S&P 500 proxy
  qqq:  FinnhubQuote | null  // Nasdaq proxy
  iwm:  FinnhubQuote | null  // Russell 2000 (small cap)
  nvda: FinnhubQuote | null  // AI/tech proxy

  // Commodities
  gld:  FinnhubQuote | null  // Gold proxy
  uso:  FinnhubQuote | null  // Oil proxy
  copx: FinnhubQuote | null  // Copper ETF

  // Crypto
  btc:  FinnhubQuote | null  // Bitcoin (BINANCE:BTCUSDT)

  // Macro from FRED
  fred: FredData

  // Regime
  regime: 'risk-on' | 'risk-off' | 'reflation' | 'deflation'
  regimeLabel: string
  regimeColor: string

  lastUpdated: string
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const [spy, qqq, iwm, nvda, gld, uso, copx, btc, fred] = await Promise.all([
    finnhubQuote('SPY'),
    finnhubQuote('QQQ'),
    finnhubQuote('IWM'),
    finnhubQuote('NVDA'),
    finnhubQuote('GLD'),
    finnhubQuote('USO'),
    finnhubQuote('COPX'),
    finnhubQuote('BINANCE:BTCUSDT'),
    getFredData(),
  ])

  const regime = classifyRegime({ spy, fred })

  return {
    spy, qqq, iwm, nvda, gld, uso, copx, btc, fred,
    regime: regime.key,
    regimeLabel: regime.label,
    regimeColor: regime.color,
    lastUpdated: new Date().toISOString(),
  }
}

function classifyRegime({ spy, fred }: { spy: FinnhubQuote | null; fred: FredData }): {
  key: 'risk-on' | 'risk-off' | 'reflation' | 'deflation'
  label: string
  color: string
} {
  const vix       = fred.vix ?? 20
  const igSpreads = fred.igSpreads ?? 100
  const spChg     = spy?.pctChange ?? 0
  const yield10y  = fred.yield10y ?? 4
  const yieldCurve = fred.yieldCurve ?? -0.2
  const dxyChg    = fred.dxyChange ?? 0

  // Risk-Off: fear elevated, spreads widening, equities falling
  if (vix > 22 || igSpreads > 130 || (spChg < -1.5 && vix > 18)) {
    return { key: 'risk-off', label: 'Risk-Off', color: '#e05252' }
  }

  // Reflation: rates rising, commodities strong, equities up
  if (yield10y > 4.5 && (fred.yield10yChange ?? 0) > 0.1 && spChg > 0) {
    return { key: 'reflation', label: 'Reflation', color: '#c8963e' }
  }

  // Deflation: rates falling sharply, dollar strong, growth slowing
  if ((fred.yield10yChange ?? 0) < -0.15 && dxyChg > 0.5 && yieldCurve < -0.5) {
    return { key: 'deflation', label: 'Deflation', color: '#4a9eff' }
  }

  // Default: Risk-On
  return { key: 'risk-on', label: 'Risk-On', color: '#059669' }
}

// Format for weekly signal generation — human-readable data dump
export function formatSnapshotForAI(snap: MarketSnapshot): string {
  const f = (n: number | null | undefined, dec = 2) =>
    n != null ? n.toFixed(dec) : 'N/A'
  const pct = (n: number | null | undefined) =>
    n != null ? `${n > 0 ? '+' : ''}${n.toFixed(2)}%` : 'N/A'

  return `
MARKET DATA SNAPSHOT — ${new Date(snap.lastUpdated).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

MACRO REGIME: ${snap.regimeLabel.toUpperCase()}

RATES & YIELD CURVE:
- 10Y Treasury: ${f(snap.fred.yield10y)}% (week change: ${f(snap.fred.yield10yChange, 3)}%)
- 2Y Treasury:  ${f(snap.fred.yield2y)}% (week change: ${f(snap.fred.yield2yChange, 3)}%)
- Yield Curve (10Y-2Y): ${f(snap.fred.yieldCurve)}% (${(snap.fred.yieldCurve ?? 0) < 0 ? 'INVERTED' : 'positive'})

CREDIT:
- IG Spreads: ${f(snap.fred.igSpreads, 0)}bps (week change: ${f(snap.fred.igSpreadsChange, 0)}bps)
- HY Spreads: ${f(snap.fred.hySpreads, 0)}bps (week change: ${f(snap.fred.hySpreadsChange, 0)}bps)

FEAR & VOLATILITY:
- VIX: ${f(snap.fred.vix)} (week change: ${f(snap.fred.vixChange)})

EQUITIES (daily % change):
- S&P 500 (SPY): $${f(snap.spy?.price)} ${pct(snap.spy?.pctChange)}
- Nasdaq (QQQ):  $${f(snap.qqq?.price)} ${pct(snap.qqq?.pctChange)}
- Russell 2000:  $${f(snap.iwm?.price)} ${pct(snap.iwm?.pctChange)}
- Nvidia (AI):   $${f(snap.nvda?.price)} ${pct(snap.nvda?.pctChange)}

COMMODITIES:
- Gold (GLD):   $${f(snap.gld?.price)} ${pct(snap.gld?.pctChange)}
- Oil (USO):    $${f(snap.uso?.price)} ${pct(snap.uso?.pctChange)}
- Copper (COPX):$${f(snap.copx?.price)} ${pct(snap.copx?.pctChange)}

DOLLAR:
- USD Index (DXY): ${f(snap.fred.dxy)} (week change: ${f(snap.fred.dxyChange)})

CRYPTO:
- Bitcoin: $${snap.btc?.price?.toLocaleString() ?? 'N/A'} ${pct(snap.btc?.pctChange)}
`.trim()
}
