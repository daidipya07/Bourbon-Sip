// Technical indicators + performance stats computed entirely from candle data
// already fetched for the chart — zero additional API calls. Each returns arrays
// aligned to a UNIX-seconds `time` so lightweight-charts can plot them directly.

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface LinePoint { time: number; value: number }

export function sma(candles: Candle[], period: number): LinePoint[] {
  const out: LinePoint[] = []
  let sum = 0
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close
    if (i >= period) sum -= candles[i - period].close
    if (i >= period - 1) out.push({ time: candles[i].time, value: sum / period })
  }
  return out
}

// Exponential moving average of close prices.
export function ema(candles: Candle[], period: number): LinePoint[] {
  if (candles.length < period) return []
  const out: LinePoint[] = []
  const k = 2 / (period + 1)
  // Seed with the SMA of the first `period` closes.
  let prev = 0
  for (let i = 0; i < period; i++) prev += candles[i].close
  prev /= period
  out.push({ time: candles[period - 1].time, value: prev })
  for (let i = period; i < candles.length; i++) {
    prev = candles[i].close * k + prev * (1 - k)
    out.push({ time: candles[i].time, value: prev })
  }
  return out
}

// EMA over an arbitrary numeric series (used internally by MACD).
function emaValues(values: number[], period: number): number[] {
  if (values.length < period) return []
  const out: number[] = []
  const k = 2 / (period + 1)
  let prev = 0
  for (let i = 0; i < period; i++) prev += values[i]
  prev /= period
  out.push(prev)
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k)
    out.push(prev)
  }
  return out
}

export interface BollingerBands { upper: LinePoint[]; middle: LinePoint[]; lower: LinePoint[] }

// Bollinger Bands: SMA(period) ± k standard deviations.
export function bollinger(candles: Candle[], period = 20, k = 2): BollingerBands {
  const upper: LinePoint[] = []
  const middle: LinePoint[] = []
  const lower: LinePoint[] = []
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close
    const mean = sum / period
    let variance = 0
    for (let j = i - period + 1; j <= i; j++) variance += (candles[j].close - mean) ** 2
    const sd = Math.sqrt(variance / period)
    const t = candles[i].time
    middle.push({ time: t, value: mean })
    upper.push({ time: t, value: mean + k * sd })
    lower.push({ time: t, value: mean - k * sd })
  }
  return { upper, middle, lower }
}

// Relative Strength Index (Wilder's smoothing).
export function rsi(candles: Candle[], period = 14): LinePoint[] {
  if (candles.length <= period) return []
  const out: LinePoint[] = []
  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close
    if (diff >= 0) avgGain += diff
    else avgLoss -= diff
  }
  avgGain /= period
  avgLoss /= period
  const rsiAt = () => (avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  out.push({ time: candles[period].time, value: rsiAt() })
  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close
    const gain = diff >= 0 ? diff : 0
    const loss = diff < 0 ? -diff : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    out.push({ time: candles[i].time, value: rsiAt() })
  }
  return out
}

export interface Macd { macd: LinePoint[]; signal: LinePoint[]; histogram: LinePoint[] }

// MACD(12,26,9): fast EMA − slow EMA, its signal EMA, and the histogram.
export function macd(candles: Candle[], fast = 12, slow = 26, signalPeriod = 9): Macd {
  if (candles.length < slow + signalPeriod) return { macd: [], signal: [], histogram: [] }
  const closes = candles.map(c => c.close)
  const emaFast = emaValues(closes, fast) // aligned to index fast-1..end
  const emaSlow = emaValues(closes, slow) // aligned to index slow-1..end
  // Align both to the slow EMA's start.
  const offset = slow - fast
  const macdLineVals: number[] = []
  for (let i = 0; i < emaSlow.length; i++) macdLineVals.push(emaFast[i + offset] - emaSlow[i])
  const signalVals = emaValues(macdLineVals, signalPeriod)

  const macdLine: LinePoint[] = []
  const signal: LinePoint[] = []
  const histogram: LinePoint[] = []
  const baseIdx = slow - 1 // candle index where macdLineVals[0] sits
  for (let i = 0; i < macdLineVals.length; i++) {
    macdLine.push({ time: candles[baseIdx + i].time, value: macdLineVals[i] })
  }
  for (let i = 0; i < signalVals.length; i++) {
    const cIdx = baseIdx + (signalPeriod - 1) + i
    signal.push({ time: candles[cIdx].time, value: signalVals[i] })
    histogram.push({ time: candles[cIdx].time, value: macdLineVals[(signalPeriod - 1) + i] - signalVals[i] })
  }
  return { macd: macdLine, signal, histogram }
}

export interface PerfStats {
  ret1M: number | null
  ret6M: number | null
  retYTD: number | null
  ret1Y: number | null
  annVol: number | null      // annualized volatility, %
  maxDrawdown: number | null // most negative peak-to-trough, %
}

// Return between the last close and the close ~n calendar days ago.
function returnOverDays(candles: Candle[], days: number): number | null {
  if (candles.length < 2) return null
  const last = candles[candles.length - 1]
  const cutoff = last.time - days * 86400
  // First candle at/after the cutoff.
  let ref: Candle | null = null
  for (let i = 0; i < candles.length; i++) {
    if (candles[i].time >= cutoff) { ref = candles[i]; break }
  }
  if (!ref || ref.close === 0 || ref === last) return null
  return ((last.close - ref.close) / ref.close) * 100
}

// Perf stats from (ideally daily) candles. On intraday ranges these are noisy but
// still directionally valid; callers pass a daily-range candle set when possible.
export function perfStats(candles: Candle[]): PerfStats {
  if (candles.length < 2) {
    return { ret1M: null, ret6M: null, retYTD: null, ret1Y: null, annVol: null, maxDrawdown: null }
  }
  const last = candles[candles.length - 1]

  // YTD: first candle of the current calendar year.
  const year = new Date(last.time * 1000).getUTCFullYear()
  const jan1 = Date.UTC(year, 0, 1) / 1000
  let ytdRef: Candle | null = null
  for (const c of candles) { if (c.time >= jan1) { ytdRef = c; break } }
  const retYTD = ytdRef && ytdRef.close !== 0 && ytdRef !== last
    ? ((last.close - ytdRef.close) / ytdRef.close) * 100 : null

  // Annualized volatility from daily log returns.
  let annVol: number | null = null
  if (candles.length >= 10) {
    const rets: number[] = []
    for (let i = 1; i < candles.length; i++) {
      if (candles[i - 1].close > 0) rets.push(Math.log(candles[i].close / candles[i - 1].close))
    }
    const mean = rets.reduce((a, b) => a + b, 0) / rets.length
    const varc = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length
    annVol = Math.sqrt(varc) * Math.sqrt(252) * 100
  }

  // Max drawdown over the window.
  let peak = candles[0].close
  let maxDd = 0
  for (const c of candles) {
    if (c.close > peak) peak = c.close
    if (peak > 0) {
      const dd = (c.close - peak) / peak
      if (dd < maxDd) maxDd = dd
    }
  }

  return {
    ret1M: returnOverDays(candles, 30),
    ret6M: returnOverDays(candles, 182),
    retYTD,
    ret1Y: returnOverDays(candles, 365),
    annVol: annVol != null ? parseFloat(annVol.toFixed(1)) : null,
    maxDrawdown: parseFloat((maxDd * 100).toFixed(1)),
  }
}
