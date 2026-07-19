'use client'

import { useEffect, useState } from 'react'
import CommandBar, { type Command, type TerminalView } from '@/components/terminal/CommandBar'
import ChartPanel from '@/components/terminal/ChartPanel'
import QuotePanel from '@/components/terminal/QuotePanel'
import WatchlistPanel from '@/components/terminal/WatchlistPanel'
import NewsPanel from '@/components/terminal/NewsPanel'
import MarketOverview from '@/components/terminal/MarketOverview'
import HeatmapPanel from '@/components/terminal/HeatmapPanel'
import MacroPanel from '@/components/terminal/MacroPanel'
import MoversPanel from '@/components/terminal/MoversPanel'
import EarningsPanel from '@/components/terminal/EarningsPanel'
import TerminalStrip from '@/components/terminal/TerminalStrip'
import './terminal.css'

const TABS: Array<[TerminalView, string]> = [
  ['chart', 'Chart'],
  ['markets', 'Markets'],
  ['heatmap', 'Heatmap'],
  ['macro', 'Macro'],
  ['news', 'News'],
  ['earnings', 'Earnings'],
]

function useNyClock() {
  const [now, setNow] = useState<{ time: string; open: boolean }>({ time: '', open: false })

  useEffect(() => {
    function tick() {
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      })
      const parts = fmt.formatToParts(new Date())
      const get = (t: string) => parts.find(p => p.type === t)?.value || ''
      const weekday = get('weekday')
      const h = parseInt(get('hour'), 10)
      const m = parseInt(get('minute'), 10)
      const isWeekday = !['Sat', 'Sun'].includes(weekday)
      const afterOpen = h > 9 || (h === 9 && m >= 30)
      const beforeClose = h < 16
      setNow({
        time: `${weekday} ${get('hour')}:${get('minute')}:${get('second')} ET`,
        open: isWeekday && afterOpen && beforeClose,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return now
}

export default function TerminalPage() {
  const [symbol, setSymbol] = useState('AAPL')
  const [view, setView] = useState<TerminalView>('chart')
  const [newsFocus, setNewsFocus] = useState<'symbol' | 'market'>('market')
  const clock = useNyClock()

  function handleSelect(sym: string) {
    setSymbol(sym)
    setView('chart')
  }

  function handleCommand(cmd: Command) {
    if (cmd.symbol) setSymbol(cmd.symbol)
    if (cmd.view) setView(cmd.view)
    if (cmd.newsFocus) setNewsFocus(cmd.newsFocus)
  }

  // Number keys 1-6 switch panels when not typing
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      const idx = parseInt(e.key, 10) - 1
      if (idx >= 0 && idx < TABS.length) {
        setView(TABS[idx][0])
        if (TABS[idx][0] === 'news') setNewsFocus('market')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="terminal-root">
      {/* ── Top Bar ─────────────────────────────────────── */}
      <div className="terminal-topbar">
        <a href="/" className="terminal-brand">
          <div className="terminal-brand-dot" />
          Bourbon Terminal
        </a>

        <CommandBar onCommand={handleCommand} />

        <div className="terminal-tabs">
          {TABS.map(([key, label], i) => (
            <button
              key={key}
              className={`terminal-tab ${view === key ? 'active' : ''}`}
              onClick={() => { setView(key); if (key === 'news') setNewsFocus('market') }}
              title={`Shortcut: ${i + 1}`}
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
          <div className="terminal-panel tg-main">
            <QuotePanel symbol={symbol} />
            <ChartPanel symbol={symbol} />
          </div>
          <div className="tg-side-top">
            <WatchlistPanel onSelect={handleSelect} />
          </div>
          <div className="tg-side-bottom">
            <NewsPanel symbol={symbol} defaultMode="symbol" />
          </div>
        </div>
      )}

      {view === 'markets' && (
        <div className="terminal-grid">
          <div className="terminal-panel tg-main">
            <MarketOverview onSelect={handleSelect} />
          </div>
          <div className="tg-side-full">
            <MoversPanel onSelect={handleSelect} />
          </div>
        </div>
      )}

      {view === 'heatmap' && (
        <div className="terminal-grid">
          <div className="tg-full">
            <HeatmapPanel onSelect={handleSelect} />
          </div>
        </div>
      )}

      {view === 'macro' && (
        <div className="terminal-grid">
          <div className="tg-full">
            <MacroPanel />
          </div>
        </div>
      )}

      {view === 'news' && (
        <div className="terminal-grid">
          <div className="tg-full">
            <NewsPanel symbol={symbol} defaultMode={newsFocus} />
          </div>
        </div>
      )}

      {view === 'earnings' && (
        <div className="terminal-grid">
          <div className="tg-full">
            <EarningsPanel onSelect={handleSelect} />
          </div>
        </div>
      )}

      {/* ── Status Bar ──────────────────────────────────── */}
      <div className="terminal-statusbar">
        <div className="terminal-statusbar-item">
          <div className="terminal-statusbar-dot" style={{ background: clock.open ? '#059669' : '#666' }} />
          <span style={{ color: clock.open ? '#059669' : '#666' }}>
            {clock.open ? 'NYSE OPEN' : 'NYSE CLOSED'}
          </span>
        </div>
        <span className="terminal-statusbar-clock">{clock.time}</span>
        <span className="t-amber">{symbol}</span>
        <span style={{ marginLeft: 'auto' }}>
          Data: Yahoo Finance + Finnhub + FRED · Delayed · Not investment advice
        </span>
      </div>
    </div>
  )
}
