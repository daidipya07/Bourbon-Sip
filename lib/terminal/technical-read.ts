// Technical Read — a plain-English, factual read of a stock's chart, composed
// deterministically from the same indicators the chart already computes
// (lib/terminal/indicators.ts). No AI, no network: a pure function over candles.
//
// IMPORTANT (compliance): every line here is a DESCRIPTION of what public
// technical indicators currently show. Tones ('bullish'/'bearish'/'neutral') are
// mechanical classifications of indicator state — NOT predictions, forecasts, or
// investment advice, and NOT a recommendation to buy or sell. The UI must present
// them as such.

import { type Candle, sma, rsi, macd, bollinger, perfStats } from './indicators'

export type Tone = 'bullish' | 'bearish' | 'neutral'

export interface ReadSection {
  label: string
  signal: string
  detail: string
  tone: Tone
}

export interface TechnicalRead {
  symbol: string
  price: number
  asOf: number
  summary: string
  sections: ReadSection[]
}

const MIN_CANDLES = 30

function last<T>(arr: T[]): T | undefined {
  return arr.length ? arr[arr.length - 1] : undefined
}

function fmt(n: number): string {
  return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : n.toFixed(2)
}

export function computeTechnicalRead(candles: Candle[], symbol: string): TechnicalRead | null {
  if (!candles || candles.length < MIN_CANDLES) return null

  const lastCandle = candles[candles.length - 1]
  const price = lastCandle.close
  if (!(price > 0)) return null

  const sections: ReadSection[] = []

  // ── Trend: price vs 50 & 200-day moving averages ──
  const sma50 = last(sma(candles, 50))?.value ?? null
  const sma200 = last(sma(candles, 200))?.value ?? null
  if (sma50 != null && sma200 != null) {
    const aboveBoth = price > sma50 && price > sma200
    const belowBoth = price < sma50 && price < sma200
    const goldenOrder = sma50 > sma200 // short-term avg above long-term
    let tone: Tone = 'neutral'
    let signal: string
    if (aboveBoth && goldenOrder) {
      tone = 'bullish'
      signal = 'Price is above both the 50- and 200-day moving averages, with the 50-day above the 200-day — an uptrend configuration.'
    } else if (belowBoth && !goldenOrder) {
      tone = 'bearish'
      signal = 'Price is below both the 50- and 200-day moving averages, with the 50-day below the 200-day — a downtrend configuration.'
    } else if (aboveBoth) {
      tone = 'bullish'
      signal = 'Price is above both the 50- and 200-day moving averages.'
    } else if (belowBoth) {
      tone = 'bearish'
      signal = 'Price is below both the 50- and 200-day moving averages.'
    } else {
      tone = 'neutral'
      signal = 'Price is between its 50- and 200-day moving averages — a mixed trend.'
    }
    sections.push({
      label: 'Trend',
      signal,
      detail: `50-day ${fmt(sma50)} · 200-day ${fmt(sma200)} · last ${fmt(price)}`,
      tone,
    })
  } else if (sma50 != null) {
    const above = price > sma50
    sections.push({
      label: 'Trend',
      signal: `Price is ${above ? 'above' : 'below'} its 50-day moving average (not enough history for the 200-day).`,
      detail: `50-day ${fmt(sma50)} · last ${fmt(price)}`,
      tone: above ? 'bullish' : 'bearish',
    })
  }

  // ── Momentum: RSI(14) + MACD crossover ──
  // Tone reflects RSI direction vs its 50 midline (a factual read of recent
  // gains vs losses). Overbought/oversold are noted as "stretched" FLAGS — not
  // treated as reversal predictions (that would be an opinion, not a fact).
  const rsiVal = last(rsi(candles, 14))?.value ?? null
  if (rsiVal != null) {
    let tone: Tone = 'neutral'
    if (rsiVal >= 55) tone = 'bullish'
    else if (rsiVal <= 45) tone = 'bearish'

    let zone: string
    if (rsiVal >= 70) zone = 'above 50 and in overbought territory (a stretched reading)'
    else if (rsiVal <= 30) zone = 'below 50 and in oversold territory (a stretched reading)'
    else if (rsiVal >= 55) zone = 'above its 50 midline (positive momentum)'
    else if (rsiVal <= 45) zone = 'below its 50 midline (negative momentum)'
    else zone = 'near its 50 midline (neutral momentum)'

    // MACD crossover in the last few bars (sign flip of the histogram).
    const m = macd(candles)
    let macdNote = ''
    let macdTone: Tone | null = null
    if (m.histogram.length >= 2) {
      const hLast = m.histogram[m.histogram.length - 1].value
      // Find the most recent sign change within the last 5 bars.
      let crossedBarsAgo = -1
      for (let i = m.histogram.length - 1; i > 0 && m.histogram.length - 1 - i < 5; i--) {
        const cur = m.histogram[i].value
        const prev = m.histogram[i - 1].value
        if ((cur >= 0 && prev < 0) || (cur < 0 && prev >= 0)) {
          crossedBarsAgo = m.histogram.length - 1 - i
          break
        }
      }
      if (crossedBarsAgo >= 0) {
        const bullish = hLast >= 0
        macdTone = bullish ? 'bullish' : 'bearish'
        macdNote = ` MACD turned ${bullish ? 'bullish' : 'bearish'} ${crossedBarsAgo === 0 ? 'this bar' : `${crossedBarsAgo} bar${crossedBarsAgo === 1 ? '' : 's'} ago`}.`
      } else {
        macdNote = ` MACD histogram is ${hLast >= 0 ? 'positive' : 'negative'} (no recent crossover).`
      }
    }

    sections.push({
      label: 'Momentum',
      signal: `14-day RSI is ${rsiVal.toFixed(0)}, ${zone}.${macdNote}`,
      detail: `RSI ${rsiVal.toFixed(1)}`,
      // If a recent MACD cross disagrees with RSI, prefer neutral to avoid overstating.
      tone: macdTone && macdTone !== tone ? 'neutral' : tone,
    })
  }

  // ── Volatility: Bollinger position + annualized vol ──
  const bb = bollinger(candles, 20, 2)
  const bbUpper = last(bb.upper)?.value ?? null
  const bbLower = last(bb.lower)?.value ?? null
  const bbMid = last(bb.middle)?.value ?? null
  const stats = perfStats(candles, '1d')
  if (bbUpper != null && bbLower != null && bbMid != null) {
    const band = bbUpper - bbLower
    const posInBand = band > 0 ? (price - bbLower) / band : 0.5 // 0 = lower, 1 = upper
    let where: string
    let tone: Tone = 'neutral'
    if (posInBand >= 0.85) { where = 'near the upper Bollinger band'; tone = 'bullish' }
    else if (posInBand <= 0.15) { where = 'near the lower Bollinger band'; tone = 'bearish' }
    else { where = 'around the middle of its Bollinger bands'; tone = 'neutral' }
    const volNote = stats.annVol != null ? ` Annualized volatility is roughly ${stats.annVol.toFixed(0)}%.` : ''
    sections.push({
      label: 'Volatility',
      signal: `Trading ${where}.${volNote}`,
      detail: `Bands ${fmt(bbLower)} – ${fmt(bbUpper)} · mid ${fmt(bbMid)}`,
      tone,
    })
  }

  // ── Levels: window high/low (≈52wk from daily) + distance ──
  let hi = candles[0].high
  let lo = candles[0].low
  for (const c of candles) {
    if (c.high > hi) hi = c.high
    if (c.low < lo) lo = c.low
  }
  if (hi > 0 && lo > 0) {
    const fromHigh = ((price - hi) / hi) * 100
    const fromLow = ((price - lo) / lo) * 100
    sections.push({
      label: 'Levels',
      signal: `${Math.abs(fromHigh).toFixed(1)}% ${fromHigh < 0 ? 'below' : 'above'} the ${yearsLabel(candles)} high; ${fromLow.toFixed(1)}% above the low.`,
      detail: `Range ${fmt(lo)} – ${fmt(hi)} · last ${fmt(price)}`,
      tone: fromHigh > -3 ? 'bullish' : fromLow < 5 ? 'bearish' : 'neutral',
    })
  }

  // ── Volume: last bar vs 20-bar average ──
  if (candles.length >= 21) {
    let volSum = 0
    for (let i = candles.length - 21; i < candles.length - 1; i++) volSum += candles[i].volume
    const avg20 = volSum / 20
    const lastVol = lastCandle.volume
    if (avg20 > 0 && lastVol > 0) {
      const mult = lastVol / avg20
      let desc: string
      let tone: Tone = 'neutral'
      if (mult >= 1.5) { desc = `${mult.toFixed(1)}× the 20-day average — notably heavy`; tone = 'neutral' }
      else if (mult <= 0.6) { desc = `${mult.toFixed(1)}× the 20-day average — lighter than usual`; tone = 'neutral' }
      else { desc = `about average (${mult.toFixed(1)}× the 20-day)` }
      sections.push({
        label: 'Volume',
        signal: `Latest volume is ${desc}.`,
        detail: `Last ${compact(lastVol)} · 20-day avg ${compact(avg20)}`,
        tone,
      })
    }
  }

  if (sections.length === 0) return null

  // ── One-line factual synthesis ──
  const summary = buildSummary(sections)

  return { symbol, price, asOf: lastCandle.time, summary, sections }
}

function yearsLabel(candles: Candle[]): string {
  const spanDays = (candles[candles.length - 1].time - candles[0].time) / 86400
  if (spanDays >= 320) return '1-year'
  if (spanDays >= 150) return '6-month'
  if (spanDays >= 75) return '3-month'
  return 'recent'
}

function buildSummary(sections: ReadSection[]): string {
  const by = (label: string) => sections.find(s => s.label === label)
  const parts: string[] = []
  const trend = by('Trend')
  if (trend) parts.push(trend.tone === 'bullish' ? 'uptrend' : trend.tone === 'bearish' ? 'downtrend' : 'mixed trend')
  const mom = by('Momentum')
  if (mom) parts.push(mom.tone === 'bullish' ? 'positive momentum' : mom.tone === 'bearish' ? 'weak momentum' : 'neutral momentum')
  const vol = by('Volatility')
  if (vol) {
    if (vol.tone === 'bullish') parts.push('trading near the upper band')
    else if (vol.tone === 'bearish') parts.push('trading near the lower band')
  }
  const v = by('Volume')
  if (v && v.signal.includes('heavy')) parts.push('on above-average volume')
  if (parts.length === 0) return 'A read of the current indicators is shown below.'
  return capitalize(parts.join(', ')) + '.'
}

function compact(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s
}
