'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export type TerminalView = 'chart' | 'markets' | 'heatmap' | 'macro' | 'news' | 'earnings'

interface SearchResult {
  symbol: string
  name: string
  type: string
}

export interface Command {
  symbol?: string
  view?: TerminalView
  newsFocus?: 'symbol' | 'market'
  scrollTo?: 'research'
}

// Bloomberg-style function codes: `AAPL GP` charts Apple, `AAPL N` opens its news
const SYMBOL_FUNCTIONS: Record<string, TerminalView> = {
  GP: 'chart', G: 'chart', DES: 'chart', N: 'news', NEWS: 'news',
}

const BARE_FUNCTIONS: Record<string, TerminalView> = {
  MKT: 'markets', MARKETS: 'markets', WEI: 'markets',
  HM: 'heatmap', MAP: 'heatmap', HEAT: 'heatmap',
  ECO: 'macro', MACRO: 'macro',
  N: 'news', NEWS: 'news', TOP: 'news',
  ERN: 'earnings', EARN: 'earnings',
}

export default function CommandBar({ onCommand }: { onCommand: (cmd: Command) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Global keyboard shortcut: / to focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 1) { setResults([]); return }
    try {
      const res = await fetch(`/api/terminal/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
      setActiveIdx(0)
    } catch {
      setResults([])
    }
  }, [])

  function handleChange(val: string) {
    setQuery(val)
    setOpen(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    // Only search the first token — `AAPL GP` should still match AAPL
    const head = val.trim().split(/\s+/)[0] || ''
    timerRef.current = setTimeout(() => search(head), 200)
  }

  function fire(cmd: Command) {
    setQuery('')
    setOpen(false)
    setResults([])
    inputRef.current?.blur()
    onCommand(cmd)
  }

  function execute() {
    const tokens = query.trim().toUpperCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return

    if (tokens.length >= 2 && SYMBOL_FUNCTIONS[tokens[1]]) {
      const view = SYMBOL_FUNCTIONS[tokens[1]]
      fire({
        symbol: tokens[0],
        view,
        newsFocus: view === 'news' ? 'symbol' : undefined,
        scrollTo: tokens[1] === 'DES' ? 'research' : undefined,
      })
      return
    }
    if (tokens.length === 1 && BARE_FUNCTIONS[tokens[0]]) {
      fire({ view: BARE_FUNCTIONS[tokens[0]], newsFocus: 'market' })
      return
    }
    if (results.length > 0) {
      fire({ symbol: results[activeIdx].symbol, view: 'chart' })
      return
    }
    fire({ symbol: tokens[0], view: 'chart' })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      execute()
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      setActiveIdx(i => Math.max(i - 1, 0))
      e.preventDefault()
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showHelp = open && query.trim().length === 0

  return (
    <div className="terminal-cmd">
      <span className="terminal-cmd-icon">⌕</span>
      <input
        ref={inputRef}
        className="terminal-cmd-input"
        placeholder="Ticker or command… AAPL · AAPL GP · AAPL N · ECO  ( / )"
        value={query}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
        spellCheck={false}
      />
      {open && (results.length > 0 || showHelp) && (
        <div className="terminal-cmd-results">
          {results.map((r, i) => (
            <div
              key={r.symbol}
              className={`terminal-cmd-result ${i === activeIdx ? 'active' : ''}`}
              onMouseDown={() => fire({ symbol: r.symbol, view: 'chart' })}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className="terminal-cmd-result-sym">{r.symbol}</span>
              <span className="terminal-cmd-result-name">{r.name}</span>
              <span className="terminal-cmd-result-type">{r.type}</span>
            </div>
          ))}
          {showHelp && (
            <div className="terminal-cmd-help">
              <div className="terminal-cmd-help-row"><b>AAPL</b> load chart · <b>AAPL GP</b> chart · <b>AAPL DES</b> overview · <b>AAPL N</b> company news</div>
              <div className="terminal-cmd-help-row"><b>MKT</b> markets · <b>HM</b> heatmap · <b>ECO</b> macro · <b>N</b> top news · <b>ERN</b> earnings</div>
              <div className="terminal-cmd-help-row">Keys <b>1–6</b> switch panels · <b>/</b> focus command line</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
