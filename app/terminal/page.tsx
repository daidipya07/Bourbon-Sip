'use client'

import { useState } from 'react'
import CommandBar from '@/components/terminal/CommandBar'
import ChartPanel from '@/components/terminal/ChartPanel'
import QuotePanel from '@/components/terminal/QuotePanel'
import WatchlistPanel from '@/components/terminal/WatchlistPanel'
import NewsPanel from '@/components/terminal/NewsPanel'
import MarketOverview from '@/components/terminal/MarketOverview'
import HeatmapPanel from '@/components/terminal/HeatmapPanel'
import MacroPanel from '@/components/terminal/MacroPanel'
import TerminalStrip from '@/components/terminal/TerminalStrip'
import './terminal.css'

type View = 'chart' | 'markets' | 'heatmap' | 'macro' | 'news'

export default function TerminalPage() {
  const [symbol, setSymbol] = useState('SPY')
  const [view, setView] = useState<View>('chart')

  function handleSelect(sym: string) {
    setSymbol(sym)
    setView('chart')
  }

  return (
    <div className="terminal-root">
      {/* ── Top Bar ─────────────────────────────────────── */}
      <div className="terminal-topbar">
        <a href="/" className="terminal-brand">
          <div className="terminal-brand-dot" />
          Bourbon Terminal
        </a>

        <CommandBar onSelect={handleSelect} />

        <div className="terminal-tabs">
          {([
            ['chart', 'Chart'],
            ['markets', 'Markets'],
            ['heatmap', 'Heatmap'],
            ['macro', 'Macro'],
            ['news', 'News'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              className={`terminal-tab ${view === key ? 'active' : ''}`}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ticker Strip ────────────────────────────────── */}
      <TerminalStrip onSelect={handleSelect} />

      {/* ── Main Content ────────────────────────────────── */}
      {view === 'chart' && (
        <div className="terminal-grid">
          {/* Left: Quote + Chart */}
          <div className="terminal-panel" style={{ gridRow: '1 / 3' }}>
            <QuotePanel symbol={symbol} />
            <ChartPanel symbol={symbol} />
          </div>

          {/* Right top: Watchlist */}
          <div style={{ gridRow: '1' }}>
            <WatchlistPanel onSelect={handleSelect} />
          </div>

          {/* Right bottom: News */}
          <div style={{ gridRow: '2' }}>
            <NewsPanel symbol={symbol} />
          </div>
        </div>
      )}

      {view === 'markets' && (
        <div className="terminal-grid terminal-grid-full">
          <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
            <MarketOverview onSelect={handleSelect} />
          </div>
        </div>
      )}

      {view === 'heatmap' && (
        <div className="terminal-grid terminal-grid-full">
          <div style={{ gridColumn: '1 / -1' }}>
            <HeatmapPanel onSelect={handleSelect} />
          </div>
        </div>
      )}

      {view === 'macro' && (
        <div className="terminal-grid terminal-grid-full">
          <div style={{ gridColumn: '1 / -1' }}>
            <MacroPanel />
          </div>
        </div>
      )}

      {view === 'news' && (
        <div className="terminal-grid terminal-grid-full">
          <div style={{ gridColumn: '1 / -1' }}>
            <NewsPanel symbol={null} />
          </div>
        </div>
      )}

      {/* ── Status Bar ──────────────────────────────────── */}
      <div className="terminal-statusbar">
        <div className="terminal-statusbar-item">
          <div className="terminal-statusbar-dot" />
          <span>Connected</span>
        </div>
        <span>Bourbon Terminal v1.0</span>
        <span>{symbol}</span>
        <span style={{ marginLeft: 'auto' }}>
          Data: Finnhub + FRED · Delayed · Not investment advice
        </span>
      </div>
    </div>
  )
}
