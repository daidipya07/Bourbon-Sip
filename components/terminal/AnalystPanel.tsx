'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Msg { role: 'user' | 'assistant'; content: string }

const QUICK_PROMPTS = [
  'Analyze this chart',
  'Bull vs bear case',
  'Key risks',
  'Short-term vs long-term',
]

export default function AnalystPanel({
  symbol,
  open,
  onToggle,
}: {
  symbol: string
  open: boolean
  onToggle: () => void
}) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  // Reset the conversation when the charted symbol changes — the analyst is
  // always about the symbol currently on the chart.
  useEffect(() => {
    setMessages([])
    setError('')
    setInput('')
  }, [symbol])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = useCallback(async (text: string) => {
    const content = text.trim()
    if (!content || loading) return
    setError('')
    const next = [...messages, { role: 'user' as const, content }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/terminal/analyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, messages: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'The analyst could not respond right now.')
      } else {
        setMessages(m => [...m, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setError('Network error — please try again.')
    }
    setLoading(false)
  }, [messages, symbol, loading])

  if (!open) {
    return (
      <button className="terminal-analyst-rail" onClick={onToggle} title="Open AI Analyst">
        <span className="terminal-analyst-rail-label">AI&nbsp;ANALYST</span>
      </button>
    )
  }

  return (
    <div className="terminal-analyst">
      <div className="terminal-analyst-header">
        <div>
          <span className="terminal-analyst-title">AI Analyst</span>
          <span className="terminal-analyst-sym">· {symbol}</span>
        </div>
        <button className="terminal-analyst-collapse" onClick={onToggle} title="Collapse">‹</button>
      </div>

      <div className="terminal-analyst-body" ref={bodyRef}>
        {messages.length === 0 && !loading && (
          <div className="terminal-analyst-empty">
            Ask the analyst to break down <b>{symbol}</b>&apos;s chart, news, and fundamentals —
            the technical posture, the bull and bear case, and the key risks.
            <div className="terminal-analyst-empty-note">
              Educational analysis grounded in live data. Not investment advice.
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`terminal-analyst-msg ${m.role}`}>
            {m.content}
          </div>
        ))}

        {loading && (
          <div className="terminal-analyst-msg assistant terminal-analyst-loading">
            Analyzing {symbol}…
          </div>
        )}

        {error && <div className="terminal-analyst-error">{error}</div>}
      </div>

      <div className="terminal-analyst-prompts">
        {QUICK_PROMPTS.map(p => (
          <button key={p} className="terminal-analyst-prompt" onClick={() => send(p)} disabled={loading}>
            {p}
          </button>
        ))}
      </div>

      <div className="terminal-analyst-inputbar">
        <input
          className="terminal-analyst-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(input) }}
          placeholder={`Ask about ${symbol}…`}
          disabled={loading}
        />
        <button className="terminal-analyst-send" onClick={() => send(input)} disabled={loading || !input.trim()}>
          ↑
        </button>
      </div>

      <div className="terminal-analyst-disclaimer">
        Educational analysis, not investment advice · Not a recommendation to buy or sell · AI can be wrong — verify independently.
      </div>
    </div>
  )
}
