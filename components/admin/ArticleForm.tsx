'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false })

const CATEGORIES = [
  { value: 'ai', label: 'AI / ML' },
  { value: 'macro', label: 'Macro' },
  { value: 'markets', label: 'Markets' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'policy', label: 'Policy' },
  { value: 'tech', label: 'Tech' },
  { value: 'data', label: 'Data' },
]

interface ArticleFormProps {
  initialData?: Record<string, unknown>
  mode: 'new' | 'edit'
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function ArticleForm({ initialData, mode }: ArticleFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [coverPreview, setCoverPreview] = useState<string>(initialData?.cover_image as string || '')
  const coverRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: (initialData?.title as string) || '',
    slug: (initialData?.slug as string) || '',
    subtitle: (initialData?.subtitle as string) || '',
    excerpt: (initialData?.excerpt as string) || '',
    category: (initialData?.category as string) || 'ai',
    category_label: (initialData?.category_label as string) || 'AI / ML',
    read_time: (initialData?.read_time as string) || '5 min',
    proof_score: (initialData?.proof_score as number) || 85,
    data_density: (initialData?.data_density as number) || 85,
    cross_refs: (initialData?.cross_refs as number) || 80,
    recency_weight: (initialData?.recency_weight as number) || 85,
    cover_image: (initialData?.cover_image as string) || '',
    status: (initialData?.status as string) || 'draft',
    body_html: (initialData?.body_html as string) || '',
    sources: (initialData?.sources as string) || '',
  })

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function uploadCover(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) {
      set('cover_image', data.url)
      setCoverPreview(data.url)
    }
  }

  async function handleSave(status: 'draft' | 'published') {
    setSaving(true)
    setError('')
    const payload = { ...form, status }

    const url = mode === 'new'
      ? '/api/admin/articles'
      : `/api/admin/articles/${initialData?.id}`
    const method = mode === 'new' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this article permanently?')) return
    await fetch(`/api/admin/articles/${initialData?.id}`, { method: 'DELETE' })
    router.push('/admin')
    router.refresh()
  }

  const field = (label: string, node: React.ReactNode) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      {node}
    </div>
  )

  const input = (key: string, placeholder?: string, type = 'text') => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[key as keyof typeof form] as string}
      onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
      style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '15px', boxSizing: 'border-box' }}
    />
  )

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer', padding: 0 }}>←</button>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
          {mode === 'new' ? 'New Article' : 'Edit Article'}
        </h1>
        <div style={{ flex: 1 }} />
        {mode === 'edit' && (
          <button onClick={handleDelete} style={{ background: 'none', border: '1px solid #3a1a1a', color: '#e05252', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
            Delete
          </button>
        )}
        <button onClick={() => handleSave('draft')} disabled={saving} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', padding: '10px 18px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Save Draft
        </button>
        <button onClick={() => handleSave('published')} disabled={saving} style={{ background: '#c8963e', border: 'none', color: '#0a0a0a', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
          {saving ? 'Saving…' : 'Publish'}
        </button>
      </div>

      {error && <div style={{ background: '#2a1a1a', border: '1px solid #3a2a2a', color: '#e05252', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>
        {/* Main column */}
        <div>
          {field('Title', input('title', 'Article title…'))}
          {field('Slug', (
            <div style={{ display: 'flex', gap: '8px' }}>
              {input('slug', 'article-slug')}
              <button type="button" onClick={() => set('slug', slugify(form.title))} style={{ whiteSpace: 'nowrap', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', fontSize: '13px', cursor: 'pointer' }}>
                Auto
              </button>
            </div>
          ))}
          {field('Subtitle', input('subtitle', 'Optional subtitle or kicker'))}
          {field('Excerpt', (
            <textarea
              placeholder="Short excerpt for cards and SEO…"
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          ))}
          {field('Article Body', (
            <TiptapEditor
              content={form.body_html}
              onChange={html => set('body_html', html)}
            />
          ))}
          {field('Sources (one per line)', (
            <textarea
              placeholder="https://source1.com&#10;https://source2.com"
              value={form.sources}
              onChange={e => set('sources', e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '10px 14px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace' }}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '24px' }}>
          {/* Cover image */}
          <div style={{ marginBottom: '24px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e1e', fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Cover Image
            </div>
            <div
              style={{ padding: '16px', cursor: 'pointer' }}
              onClick={() => coverRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file?.type.startsWith('image/')) uploadCover(file)
              }}
            >
              {coverPreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={coverPreview} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '6px', display: 'block' }} />
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); set('cover_image', ''); setCoverPreview('') }}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #2a2a2a', borderRadius: '6px', color: '#555', fontSize: '13px', gap: '8px' }}>
                  <span style={{ fontSize: '28px' }}>🖼</span>
                  Drag & drop or click to upload
                </div>
              )}
            </div>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = '' }} />
          </div>

          {/* Metadata */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e1e', fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Metadata
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px' }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => {
                    const cat = CATEGORIES.find(c => c.value === e.target.value)
                    set('category', e.target.value)
                    if (cat) set('category_label', cat.label)
                  }}
                  style={{ width: '100%', padding: '8px 12px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '14px' }}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px' }}>Read Time</label>
                <input
                  value={form.read_time}
                  onChange={e => set('read_time', e.target.value)}
                  placeholder="5 min"
                  style={{ width: '100%', padding: '8px 12px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#e8dcc8', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Proof scores */}
              {[
                { key: 'proof_score', label: 'Proof Score' },
                { key: 'data_density', label: 'Data Density' },
                { key: 'cross_refs', label: 'Cross-References' },
                { key: 'recency_weight', label: 'Recency Weight' },
              ].map(s => (
                <div key={s.key} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', color: '#666' }}>{s.label}</label>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#c8963e' }}>{form[s.key as keyof typeof form]}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form[s.key as keyof typeof form] as number}
                    onChange={e => set(s.key, Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#c8963e' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
