// FRED API client — Federal Reserve Economic Data
// Free API: https://fred.stlouisfed.org/docs/api/fred/
// Get a free key at: https://fred.stlouisfed.org/docs/api/api_key.html

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations'

interface FredObservation {
  date: string
  value: number
}

async function fetchSeries(seriesId: string, limit = 10): Promise<FredObservation[]> {
  const key = process.env.FRED_API_KEY
  if (!key) {
    console.warn(`FRED_API_KEY not set — skipping ${seriesId}`)
    return []
  }

  try {
    const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${key}&sort_order=desc&limit=${limit}&file_type=json`
    const res = await fetch(url, { next: { revalidate: 3600 } }) // cache 1 hour
    if (!res.ok) throw new Error(`FRED ${seriesId}: ${res.status}`)
    const data = await res.json()

    return (data.observations ?? [])
      .filter((o: { value: string }) => o.value !== '.' && o.value !== '')
      .map((o: { date: string; value: string }) => ({
        date: o.date,
        value: parseFloat(o.value),
      }))
  } catch (err) {
    console.error(`FRED fetch error for ${seriesId}:`, err)
    return []
  }
}

function weekChange(series: FredObservation[]): { current: number | null; prev: number | null; change: number | null } {
  const current = series[0]?.value ?? null
  const prev    = series[4]?.value ?? null // ~5 business days ago
  const change  = current !== null && prev !== null ? current - prev : null
  return { current, prev, change }
}

export interface FredData {
  yield10y:       number | null
  yield10yChange: number | null
  yield2y:        number | null
  yield2yChange:  number | null
  yieldCurve:     number | null   // 10y - 2y spread
  igSpreads:      number | null   // IG OAS in bps
  igSpreadsChange:number | null
  hySpreads:      number | null   // HY OAS in bps
  hySpreadsChange:number | null
  vix:            number | null
  vixChange:      number | null
  dxy:            number | null   // Nominal broad dollar index
  dxyChange:      number | null
}

export async function getFredData(): Promise<FredData> {
  const [y10, y2, ig, hy, vix, dxy] = await Promise.all([
    fetchSeries('DGS10', 10),        // 10-Year Treasury
    fetchSeries('DGS2', 10),         // 2-Year Treasury
    fetchSeries('BAMLC0A0CM', 10),   // IG Credit Spreads (OAS bps)
    fetchSeries('BAMLH0A0HYM2', 10), // HY Credit Spreads (OAS bps)
    fetchSeries('VIXCLS', 10),       // VIX daily close
    fetchSeries('DTWEXBGS', 10),     // Nominal broad USD index
  ])

  const r10  = weekChange(y10)
  const r2   = weekChange(y2)
  const rIG  = weekChange(ig)
  const rHY  = weekChange(hy)
  const rVIX = weekChange(vix)
  const rDXY = weekChange(dxy)

  const yieldCurve = r10.current !== null && r2.current !== null
    ? parseFloat((r10.current - r2.current).toFixed(2))
    : null

  return {
    yield10y:        r10.current,
    yield10yChange:  r10.change !== null ? parseFloat(r10.change.toFixed(3)) : null,
    yield2y:         r2.current,
    yield2yChange:   r2.change !== null ? parseFloat(r2.change.toFixed(3)) : null,
    yieldCurve,
    igSpreads:       rIG.current,
    igSpreadsChange: rIG.change !== null ? parseFloat(rIG.change.toFixed(1)) : null,
    hySpreads:       rHY.current,
    hySpreadsChange: rHY.change !== null ? parseFloat(rHY.change.toFixed(1)) : null,
    vix:             rVIX.current,
    vixChange:       rVIX.change !== null ? parseFloat(rVIX.change.toFixed(2)) : null,
    dxy:             rDXY.current,
    dxyChange:       rDXY.change !== null ? parseFloat(rDXY.change.toFixed(2)) : null,
  }
}
