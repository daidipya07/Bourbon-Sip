'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Status = 'suggested' | 'published' | 'discarded'

interface TipsyRead {
  id: string
  url: string
  title: string
  publication: string
  category: string
  proof_score: number
  bourbon_strength: number
  analyzed: boolean
  status: string
  created_at: string
  og_image?: string
}

const TABS: { label: string; status: Status }[] = [
  { label: 'Suggested', status: 'suggested' },
  { label: 'Published', status: 'published' },
  { label: 'Discarded', status: 'discarded' },
]

const catColor: Record<string, string> = {
  markets: '#c8963e', ai: '#4a9eff', tech: '#7c3aed',
  macro: '#059669', geopolitics: '#dc2626', policy: '#d97706',
  energy: '#16a34a', fintech: '#0891b2',
}

export default function AdminTipsyReads() {
  const [activeTab, setActiveTab] = useState<Status>('suggested')
  const [items, setItems] = useState<TipsyRead[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [discarding, setDiscarding] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)

  async function load(status: Status) {
    setLoading(true)
    const res = await fetch(`/api/admin/tipsy-reads?status=${status}`)
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load(activeTab) }, [activeTab])

  async function quickPublish(id: string) {
    setPublishing(id)
    await fetch(`/api/admin/tipsy-reads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    })
    load(activeTab)
    setPublishing(null)
  }

  async function quickDiscard(id: string) {
    setDiscarding(id)
    await fetch(`/api/admin/tipsy-reads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'discarded' }),
    })
    load(activeTab)
    setDiscarding(null)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #1e1e1e' }}>
        <div>
          <Link href="/admin" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>← Dashboard</Link>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '6px 0 0' }}>Tipsy Reads</h1>
        </div>
        <Link href="/admin/tipsy-reads/new"
          style={{ background: '#c8963e', color: '#0a0a0a', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
          + Add Manually
        </Link>
      </div>

      {/* Cron trigger */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8dcc8', marginBottom: '2px' }}>RSS Import Pipeline</div>
          <div style={{ fontSize: '12px', color: '#555' }}>Runs automatically at 6 AM ET · 20 RSS feeds · ~25 articles suggested daily</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <button
            disabled={importing}
            onClick={async () => {
              setImporting(true)
              setImportMsg(null)
              try {
                const res = await fetch('/api/admin/run-rss-import', { method: 'POST' })
                const data = await res.json()
                if (res.ok) {
                  setImportMsg(`✓ Imported — ${data.saved ?? 0} new articles suggested`)
                  load('suggested')
                } else {
                  setImportMsg(`✗ Error: ${data.error || 'Unknown error'}`)
                }
              } catch {
                setImportMsg('✗ Network error')
              }
              setImporting(false)
            }}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: importing ? '#444' : '#888', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: importing ? 'not-allowed' : 'pointer' }}>
            {importing ? 'Importing…' : 'Run Now'}
          </button>
          {importMsg && <div style={{ fontSize: '11px', color: importMsg.startsWith('✓') ? '#4caf50' : '#e05252' }}>{importMsg}</div>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #1e1e1e' }}>
        {TABS.map(t => (
          <button key={t.status} onClick={() => setActiveTab(t.status)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === t.status ? '2px solid #c8963e' : '2px solid transparent', color: activeTab === t.status ? '#c8963e' : '#666', fontSize: '13px', fontWeight: activeTab === t.status ? 700 : 400, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#444', fontSize: '13px' }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#444', fontSize: '13px' }}>
          {activeTab === 'suggested' ? 'No suggestions yet — run the import or add manually.' : `No ${activeTab} reads.`}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px 20px', display: 'grid', gridTemplateColumns: item.og_image ? '80px 1fr auto' : '1fr auto', gap: '16px', alignItems: 'center' }}>
              {item.og_image && (
                <img src={item.og_image} alt="" style={{ width: '80px', height: '54px', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: catColor[item.category] || '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.category}</span>
                  <span style={{ fontSize: '11px', color: '#555' }}>{item.publication}</span>
                  {item.analyzed && <span style={{ fontSize: '10px', color: '#4caf50', background: '#1a2a1a', padding: '2px 6px', borderRadius: '4px' }}>✦ AI analyzed</span>}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#e8dcc8', marginBottom: '4px', lineHeight: 1.4 }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  Proof: {item.proof_score} · 🥃 {item.bourbon_strength} · {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                <Link href={`/admin/tipsy-reads/${item.id}`}
                  style={{ padding: '7px 12px', border: '1px solid #2a2a2a', borderRadius: '5px', fontSize: '12px', color: '#888', textDecoration: 'none' }}>
                  Edit
                </Link>
                {activeTab === 'suggested' && (
                  <>
                    <button onClick={() => quickDiscard(item.id)} disabled={discarding === item.id}
                      style={{ padding: '7px 12px', border: '1px solid #3a1a1a', borderRadius: '5px', fontSize: '12px', color: '#e05252', background: 'none', cursor: 'pointer' }}>
                      Discard
                    </button>
                    <button onClick={() => quickPublish(item.id)} disabled={publishing === item.id}
                      style={{ padding: '7px 14px', background: '#c8963e', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 700, color: '#0a0a0a', cursor: 'pointer' }}>
                      {publishing === item.id ? '…' : 'Publish'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
