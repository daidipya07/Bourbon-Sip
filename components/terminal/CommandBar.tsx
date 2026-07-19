'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SearchResult {
  symbol: string
  name: string
  type: string
}

export default function CommandBar({ onSelect }: { onSelect: (symbol: string) => void }) {
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
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 1) { setResults([]); setOpen(false); return }
    try {
      const res = await fetch(`/api/terminal/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
      setOpen(true)
      setActiveIdx(0)
    } catch {
      setResults([])
    }
  }, [])

  function handleChange(val: string) {
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(val), 200)
  }

  function handleSelect(symbol: string) {
    setQuery('')
    setOpen(false)
    setResults([])
    onSelect(symbol)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (results.length > 0 && open) {
        handleSelect(results[activeIdx].symbol)
      } else if (query.trim()) {
        handleSelect(query.trim().toUpperCase())
      }
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

  return (
    <div className="terminal-cmd">
      <span className="terminal-cmd-icon">⌕</span>
      <input
        ref={inputRef}
        className="terminal-cmd-input"
        placeholder="Search ticker or company… ( / )"
        value={query}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
        spellCheck={false}
      />
      {open && results.length > 0 && (
        <div className="terminal-cmd-results">
          {results.map((r, i) => (
            <div
              key={r.symbol}
              className={`terminal-cmd-result ${i === activeIdx ? 'active' : ''}`}
              onMouseDown={() => handleSelect(r.symbol)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className="terminal-cmd-result-sym">{r.symbol}</span>
              <span className="terminal-cmd-result-name">{r.name}</span>
              <span className="terminal-cmd-result-type">{r.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
