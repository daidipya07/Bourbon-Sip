'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['markets', 'ai', 'tech', 'macro', 'geopolitics', 'policy', 'energy', 'fintech']

interface TipsyRead {
  id?: string
  url: string
  title: string
  publication: string
  description: string
  og_image: string
  category: string
  bourbon_take: string
  proof_score: number
  market_impact: number
  geo_impact: number
  tech_disruption: number
  regulatory_weight: number
  bourbon_strength: number
  status: string
  analyzed: boolean
}

interface Props {
  initialData?: Partial<TipsyRead>
  mode: 'new' | 'edit'
}

const empty: TipsyRead = {
  url: '', title: '', publication: '', description: '', og_image: '',
  category: 'markets', bourbon_take: '', proof_score: 70,
  market_impact: 50, geo_impact: 50, tech_disruption: 50,
  regulatory_weight: 50, bourbon_strength: 50, status: 'suggested', analyzed: false,
}

export default function TipsyReadForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<TipsyRead>({ ...empty, ...initialData })
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [fetchingOG, setFetchingOG] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function set(key: keyof TipsyRead, value: unknown) {
    setForm(f => {
      const updated = { ...f, [key]: value }
      // Recalculate bourbon_strength live
      if (['market_impact', 'geo_impact', 'tech_disruption', 'regulatory_weight'].includes(key as string)) {
        updated.bourbon_strength = Math.round(
          (Number(updated.market_impact) + Number(updated.geo_impact) +
           Number(updated.tech_disruption) + Number(updated.regulatory_weight)) / 4
        )
      }
      return updated
    })
  }

  async function handleFetchOG() {
    if (!form.url) return
    setFetchingOG(true)
    setError('')
    try {
      const res = await fetch('/api/admin/fetch-og', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.url }),
      })
      const data = await res.json()
      if (data.title) set('title', data.title)
      if (data.description) set('description', data.description)
      if (data.image) set('og_image', data.image)
      if (data.siteName) set('publication', data.siteName)
    } catch {
      setError('Failed to fetch article metadata')
    }
    setFetchingOG(false)
  }

  async function handleAnalyze() {
    if (!form.id) return
    setAnalyzing(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/tipsy-reads/${form.id}/analyze`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setForm(f => ({ ...f, ...data }))
        setSuccess('Analysis complete — review and adjust if needed')
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch {
      setError('Analysis failed')
    }
    setAnalyzing(false)
  }

  async function handleSave(status: 'suggested' | 'published' | 'discarded') {
    setSaving(true)
    setError('')
    const payload = { ...form, status }
    const url = mode === 'new' ? '/api/admin/tipsy-reads' : `/api/admin/tipsy-reads/${form.id}`
    const method = mode === 'new' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/tipsy-reads')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Save failed')
      setSaving(false)
    }
  }

  const scoreSlider = (label: string, key: keyof TipsyRead, color = '#c8963e') => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontSize: '12px', color: '#888' }}>{label}</label>
        <span style={{ fontSize: '13px', fontWeight: 700, color }}>{form[key] as number}</span>
      </div>
      <input type="range" min={0} max={100} value={form[key] as number}
        onChange={e => set(key, Number(e.target.value))}
        style={{ width: '100%', accentColor: color }} />
    </div>
  )

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <button onClick={() => router.push('/admin/tipsy-reads')}
          style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          {mode === 'new' ? 'Add Tipsy Read' : 'Edit Tipsy Read'}
        </h1>
        <div style={{ flex: 1 }} />
        {mode === 'edit' && (
          <button onClick={handleAnalyze} disabled={analyzing || !process.env.NEXT_PUBLIC_OPENAI_ENABLED}
            style={{ background: analyzing ? '#333' : '#1a2a1a', border: '1px solid #2a4a2a', color: analyzing ? '#666' : '#4caf50', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: analyzing ? 'not-allowed' : 'pointer' }}>
            {analyzing ? '⟳ Analyzing…' : '✦ AI Analyze'}
          </button>
        )}
        <button onClick={() => handleSave('suggested')} disabled={saving}
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
          Save Draft
        </button>
        <button onClick={() => handleSave('discarded')} disabled={saving}
          style={{ background: 'none', border: '1px solid #3a1a1a', color: '#e05252', padding: '9px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
          Discard
        </button>
        <button onClick={() => handleSave('published')} disabled={saving}
          style={{ background: '#c8963e', border: 'none', color: '#0a0a0a', padding: '9px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
          {saving ? 'Saving…' : 'Publish'}
        </button>
      </div>

      {error && <div style={{ background: '#2a1a1a', border: '1px solid #3a2a2a', color: '#e05252', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
      {success && <div style={{ background: '#1a2a1a', border: '1px solid #2a3a2a', color: '#4caf50', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px' }}>
        {/* Main */}
        <div>
          {/* URL field */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Article URL</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={form.url} onChange={e => set('url', e.target.value)}
                placeholder="https://reuters.com/..."
                style={{ flex: 1, padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '14px', boxSizing: 'border-box' }} />
              <button onClick={handleFetchOG} disabled={fetchingOG || !form.url}
                style={{ whiteSpace: 'nowrap', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#c8963e', fontSize: '13px', cursor: 'pointer' }}>
                {fetchingOG ? '…' : 'Auto-fill ↗'}
              </button>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '15px', boxSizing: 'border-box' }} />
          </div>

          {/* Publication + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Publication</label>
              <input value={form.publication} onChange={e => set('publication', e.target.value)}
                placeholder="Reuters"
                style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '14px' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Article Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>

          {/* Bourbon Take */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bourbon Pour Take</label>
              {form.analyzed && <span style={{ fontSize: '11px', color: '#4caf50' }}>✦ AI generated</span>}
            </div>
            <textarea value={form.bourbon_take} onChange={e => set('bourbon_take', e.target.value)}
              rows={4}
              placeholder="2-3 sentence editorial take — sharp, specific, evidence-focused..."
              style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.7 }} />
          </div>

          {/* OG Image preview */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Preview Image URL</label>
            <input value={form.og_image} onChange={e => set('og_image', e.target.value)}
              placeholder="Auto-filled from article"
              style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'monospace' }} />
            {form.og_image && (
              <img src={form.og_image} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '6px', marginTop: '8px', display: 'block' }} />
            )}
          </div>
        </div>

        {/* Scores sidebar */}
        <div>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', overflow: 'hidden', position: 'sticky', top: '24px' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e1e1e', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Scores
            </div>
            <div style={{ padding: '18px' }}>
              {scoreSlider('Proof Score', 'proof_score', '#c8963e')}

              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '16px', marginBottom: '12px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Bourbon Strength
              </div>
              {scoreSlider('Market Impact', 'market_impact')}
              {scoreSlider('Geo Impact', 'geo_impact')}
              {scoreSlider('Tech Disruption', 'tech_disruption')}
              {scoreSlider('Regulatory Weight', 'regulatory_weight')}

              {/* Bourbon Strength total */}
              <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e8dcc8' }}>🥃 Bourbon Strength</span>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#c8963e' }}>{form.bourbon_strength}</span>
                </div>
                <div style={{ height: '6px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${form.bourbon_strength}%`, background: 'linear-gradient(90deg, #c8963e, #e8b86d)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
