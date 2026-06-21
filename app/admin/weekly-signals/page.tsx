'use client'

import { useEffect, useState } from 'react'

type SignalStatus = 'draft' | 'published' | 'discarded'

interface WeeklySignal {
  id: string
  week_of: string
  signal_text: string
  regime: string
  status: SignalStatus
  generated_at: string
  published_at: string | null
}

const STATUS_COLOR: Record<SignalStatus, string> = {
  draft:     '#c8963e',
  published: '#059669',
  discarded: '#555',
}

const REGIME_COLOR: Record<string, string> = {
  'risk-on':   '#059669',
  'risk-off':  '#e05252',
  'reflation': '#c8963e',
  'deflation': '#4a9eff',
}

export default function WeeklySignalsAdmin() {
  const [signals, setSignals] = useState<WeeklySignal[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/weekly-signals')
      if (res.ok) setSignals(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function generate() {
    setGenerating(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/weekly-signals', { method: 'POST' })
      const body = await res.json()
      if (res.ok) {
        setMsg('Signal generated as draft. Review below before publishing.')
        await load()
      } else {
        setMsg(`Error: ${body.error ?? 'Unknown'}`)
      }
    } catch {
      setMsg('Network error')
    } finally {
      setGenerating(false)
    }
  }

  async function updateStatus(id: string, status: SignalStatus) {
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/weekly-signals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) await load()
    } finally {
      setSaving(null)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

  return (
    <div style={{ padding: '40px 32px', maxWidth: '860px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>
            Admin
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: '#e8dcc8', margin: 0 }}>
            Weekly Signals
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#444', marginTop: '6px' }}>
            AI-generated every Friday 9 AM ET · Review drafts before publishing
          </p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
            background: generating ? '#1a1a1a' : '#c8963e', color: generating ? '#555' : '#0a0a0a',
            border: 'none', borderRadius: '6px', padding: '10px 20px', cursor: generating ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {generating ? 'Generating…' : '+ Generate Now'}
        </button>
      </div>

      {msg && (
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '6px', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#c8963e', marginBottom: '24px' }}>
          {msg}
        </div>
      )}

      {loading ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#333', padding: '40px 0' }}>Loading signals…</div>
      ) : signals.length === 0 ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#333', padding: '40px 0', textAlign: 'center' }}>
          No signals yet. Click &ldquo;Generate Now&rdquo; or wait for Friday&apos;s cron job.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {signals.map(s => (
            <div key={s.id} style={{ background: '#0f0f0f', border: `1px solid ${s.status === 'published' ? '#059669' : s.status === 'draft' ? '#c8963e33' : '#111'}`, borderRadius: '8px', overflow: 'hidden' }}>
              {/* Row header */}
              <div
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', gap: '12px', flexWrap: 'wrap' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: STATUS_COLOR[s.status], background: `${STATUS_COLOR[s.status]}15`, padding: '2px 8px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {s.status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: REGIME_COLOR[s.regime] ?? '#888', background: `${REGIME_COLOR[s.regime] ?? '#888'}15`, padding: '2px 8px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {s.regime}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#e8dcc8', fontWeight: 600 }}>
                    Week of {formatDate(s.week_of)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#333' }}>
                    Generated {new Date(s.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#444' }}>
                    {expanded === s.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {expanded === s.id && (
                <div style={{ borderTop: '1px solid #1a1a1a', padding: '20px 20px 24px' }}>
                  <div style={{ borderLeft: '2px solid #c8963e', paddingLeft: '16px', marginBottom: '20px' }}>
                    {s.signal_text.split('\n\n').filter(Boolean).map((para, i) => (
                      <p key={i} style={{ fontSize: '14px', color: '#c8b89a', lineHeight: 1.8, margin: '0 0 14px' }}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Actions */}
                  {s.status !== 'published' && s.status !== 'discarded' && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => updateStatus(s.id, 'published')}
                        disabled={saving === s.id}
                        style={{
                          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                          background: '#059669', color: '#fff', border: 'none', borderRadius: '5px',
                          padding: '8px 18px', cursor: 'pointer',
                        }}
                      >
                        {saving === s.id ? 'Saving…' : '✓ Publish'}
                      </button>
                      <button
                        onClick={() => updateStatus(s.id, 'discarded')}
                        disabled={saving === s.id}
                        style={{
                          fontFamily: 'var(--font-mono)', fontSize: '11px',
                          background: 'transparent', color: '#555', border: '1px solid #222', borderRadius: '5px',
                          padding: '8px 18px', cursor: 'pointer',
                        }}
                      >
                        Discard
                      </button>
                    </div>
                  )}

                  {s.status === 'published' && s.published_at && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#059669' }}>
                      Published {new Date(s.published_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' })} ET
                    </div>
                  )}

                  {s.status === 'discarded' && (
                    <button
                      onClick={() => updateStatus(s.id, 'draft')}
                      disabled={saving === s.id}
                      style={{
                        fontFamily: 'var(--font-mono)', fontSize: '11px',
                        background: 'transparent', color: '#555', border: '1px solid #222', borderRadius: '5px',
                        padding: '8px 18px', cursor: 'pointer',
                      }}
                    >
                      Restore to Draft
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
