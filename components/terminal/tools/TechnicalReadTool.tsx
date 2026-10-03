'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Candle } from '@/lib/terminal/indicators'
import { computeTechnicalRead, type TechnicalRead, type Tone } from '@/lib/terminal/technical-read'
import { ToolDisclaimer } from './ToolsPanel'
import ToolHelp from './ToolHelp'

const TONE_COLOR: Record<Tone, string> = {
  bullish: '#00c853',
  bearish: '#e05252',
  neutral: '#888',
}

// Curated market quick-picks — every symbol is quotable/chartable on the free
// data tier (US equities + sector ETFs via Twelve Data, major crypto via the
// BINANCE:* → Twelve Data mapping). This is the "select a market" affordance.
const MARKETS: Record<string, string[]> = {
  'US Stocks': ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM'],
  'Sectors': ['XLK', 'XLF', 'XLE', 'XLV', 'XLI', 'XLY'],
  'Crypto': ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:SOLUSDT'],
}

const CRYPTO_LABEL: Record<string, string> = {
  'BINANCE:BTCUSDT': 'BTC',
  'BINANCE:ETHUSDT': 'ETH',
  'BINANCE:SOLUSDT': 'SOL',
}

function label(sym: string): string {
  return CRYPTO_LABEL[sym] ?? sym
}

export default function TechnicalReadTool({
  defaultSymbol,
  onSelectSymbol,
}: {
  defaultSymbol: string
  onSelectSymbol: (s: string) => void
}) {
  const [symbol, setSymbol] = useState(defaultSymbol || 'AAPL')
  const [input, setInput] = useState('')
  const [market, setMarket] = useState<string>('US Stocks')
  const [read, setRead] = useState<TechnicalRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const analyze = useCallback(async (sym: string) => {
    setLoading(true)
    setError('')
    setRead(null)
    try {
      const res = await fetch(`/api/terminal/candles?symbol=${encodeURIComponent(sym)}&range=1Y`)
      const d = await res.json()
      const candles = (d.candles || []) as Candle[]
      if (candles.length < 30) {
        setError(`Not enough price history for ${label(sym)} to compute a technical read.`)
        setLoading(false)
        return
      }
      const r = computeTechnicalRead(candles, sym)
      if (!r) setError(`Could not compute a technical read for ${label(sym)}.`)
      else setRead(r)
    } catch {
      setError('Failed to load price data. Try again in a moment.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { analyze(symbol) }, [symbol, analyze])

  function submitInput() {
    const s = input.trim().toUpperCase()
    if (s) { setSymbol(s); setInput('') }
  }

  const asOf = read
    ? new Date(read.asOf * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : null

  return (
    <div className="terminal-tool">
      <div className="terminal-tool-header">
        <span className="terminal-panel-title">Technical Read</span>
        <span style={{ fontSize: '9px', color: '#444' }}>Factual indicator read · daily bars</span>
      </div>

      {/* Market selection + symbol input */}
      <div className="terminal-tool-form">
        <label className="terminal-tool-field">
          <span>Market</span>
          <div className="terminal-tool-seg">
            {Object.keys(MARKETS).map(m => (
              <button key={m} className={market === m ? 'active' : ''} onClick={() => setMarket(m)}>{m}</button>
            ))}
          </div>
        </label>
        <div className="terminal-tool-field" style={{ gridColumn: '1 / -1' }}>
          <span>Pick a symbol</span>
          <div className="terminal-ta-picks">
            {MARKETS[market].map(s => (
              <button
                key={s}
                className={`terminal-ta-pick ${s === symbol ? 'active' : ''}`}
                onClick={() => setSymbol(s)}
              >
                {label(s)}
              </button>
            ))}
          </div>
        </div>
        <div className="terminal-tool-field" style={{ gridColumn: '1 / -1' }}>
          <span>Or enter any ticker</span>
          <div className="terminal-compare-bar" style={{ border: 'none', padding: 0, background: 'none' }}>
            <input
              className="terminal-compare-input"
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && submitInput()}
              placeholder="e.g. AMD"
              style={{ minWidth: '120px' }}
            />
            <button className="terminal-tool-run" onClick={submitInput} style={{ padding: '6px 14px' }}>Analyze</button>
          </div>
        </div>
      </div>

      {loading && <div className="terminal-tool-empty">Reading the chart for {label(symbol)}…</div>}
      {error && <div className="terminal-tool-warn">{error}</div>}

      {read && !loading && (
        <>
          {/* Header line */}
          <div className="terminal-ta-head">
            <div>
              <span className="terminal-ta-sym">{label(read.symbol)}</span>
              <span className="terminal-ta-price">{read.price >= 1 ? read.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : read.price.toFixed(4)}</span>
            </div>
            {asOf && <span className="terminal-ta-asof">as of {asOf} close</span>}
          </div>

          {/* One-line factual summary */}
          <div className="terminal-ta-summary">{read.summary}</div>

          {/* Section rows */}
          <div className="terminal-ta-sections">
            {read.sections.map(s => (
              <div key={s.label} className="terminal-ta-section">
                <div className="terminal-ta-section-top">
                  <span className="terminal-rec-dot" style={{ background: TONE_COLOR[s.tone] }} />
                  <span className="terminal-ta-section-label">{s.label}</span>
                  <span className="terminal-ta-section-tone" style={{ color: TONE_COLOR[s.tone] }}>{s.tone}</span>
                </div>
                <div className="terminal-ta-section-signal">{s.signal}</div>
                <div className="terminal-ta-section-detail">{s.detail}</div>
              </div>
            ))}
          </div>

          <button
            className="terminal-tool-run"
            style={{ marginTop: '14px', background: 'none', color: 'var(--amber)', border: '1px solid rgba(200,150,62,0.4)' }}
            onClick={() => onSelectSymbol(read.symbol)}
          >
            Open full chart →
          </button>
        </>
      )}

      <ToolHelp
        howTo={[
          'Pick a market (US stocks, sector ETFs, or crypto) and a symbol — or type any ticker and press Analyze.',
          'Read the five sections: Trend, Momentum, Volatility, Levels, and Volume. Each states what the indicator currently shows.',
          'The colored dot is a mechanical classification of that one indicator — green = constructive reading, red = weak reading, grey = neutral. It is not a buy/sell call.',
        ]}
        meaning={[
          ['Trend', 'Where price sits relative to its 50- and 200-day moving averages — the classic way of describing up/down/mixed trend.'],
          ['Momentum', 'RSI(14) vs its 50 midline, plus whether MACD recently crossed. Overbought/oversold are flagged as "stretched," not as reversal calls.'],
          ['Volatility', 'Position within the Bollinger bands and annualized volatility from the last year of daily bars.'],
          ['Levels', 'Distance from the 1-year high and low — useful context for where price is in its range.'],
          ['Volume', 'The latest session\'s volume versus the 20-day average, to see if a move came on conviction.'],
        ]}
        methodology={[
          'All five indicators are computed in your browser from daily closing candles (Twelve Data) — the same math used on the chart (SMA, EMA, RSI with Wilder smoothing, MACD 12/26/9, Bollinger 20/2).',
          'Nothing is forecast or predicted. Each line describes the current state of a public, well-known indicator.',
          '200-day trend needs ~200 sessions of history; if a symbol is newer, that part is omitted rather than guessed.',
        ]}
        caveats={[
          'Technical indicators describe past and present price behavior. They do not predict future prices, and no single indicator (or combination) is reliable on its own.',
          'Overbought can stay overbought and oversold can stay oversold for a long time in a strong trend — these are not timing signals.',
          'This is one lens among many; it ignores fundamentals, news, and your own risk tolerance and time horizon.',
        ]}
      />

      {/* Prominent compliance block — technical-specific */}
      <div className="terminal-ta-compliance">
        Technical indicators describe past and current price behavior. They are mechanical
        classifications — <strong>not predictions, forecasts, or investment advice</strong>, and
        not a recommendation to buy or sell any security. Do your own research and consult a
        licensed financial professional before making any investment decision.
      </div>

      <ToolDisclaimer />
    </div>
  )
}
