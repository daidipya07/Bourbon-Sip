import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import EmailSignupForm from '@/components/EmailSignupForm'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = {
  title: 'Tipsy Reads™ — Curated Finance & Tech Intelligence',
  description: 'The world\'s most important finance and technology articles — curated daily, scored for credibility and disruption impact.',
}

export const revalidate = 3600 // revalidate every hour

const CATEGORIES = ['all', 'markets', 'ai', 'tech', 'macro', 'geopolitics', 'policy', 'energy', 'fintech']

const catColor: Record<string, string> = {
  markets: '#c8963e', ai: '#4a9eff', tech: '#7c3aed',
  macro: '#059669', geopolitics: '#dc2626', policy: '#d97706',
  energy: '#16a34a', fintech: '#0891b2',
}

function strengthLabel(score: number): string {
  if (score >= 80) return 'High Impact'
  if (score >= 60) return 'Significant'
  if (score >= 40) return 'Moderate'
  return 'Low Impact'
}

function strengthColor(score: number): string {
  if (score >= 80) return '#e05252'
  if (score >= 60) return '#c8963e'
  if (score >= 40) return '#4a9eff'
  return '#555'
}

function tierLabel(published_at: string): 'fresh' | 'yesterday' | 'cellar' {
  const hours = (Date.now() - new Date(published_at).getTime()) / 3600000
  if (hours < 24) return 'fresh'
  if (hours < 48) return 'yesterday'
  return 'cellar'
}

async function getPublishedReads() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('tipsy_reads')
    .select('*')
    .eq('status', 'published')
    .gte('published_at', cutoff)
    .order('published_at', { ascending: false })

  return data || []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TipsyCard({ item }: { item: any }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#c8963e')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
        {/* OG Image */}
        {item.og_image && (
          <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
            <img src={item.og_image} alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        <div style={{ padding: '20px' }}>
          {/* Publication + category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: catColor[item.category] || '#888', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              {item.category}
            </span>
            {item.publication && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {item.publication}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: '#f0e6d3', lineHeight: 1.4, marginBottom: '12px' }}>
            {item.title}
          </h3>

          {/* Bourbon Pour Take */}
          {item.bourbon_take && (
            <div style={{ borderLeft: '2px solid #c8963e', paddingLeft: '12px', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#c8963e', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
                Bourbon Pour Take
              </div>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.7, margin: 0 }}>
                {item.bourbon_take}
              </p>
            </div>
          )}

          {/* Proof Score */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Proof Score</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#c8963e' }}>{item.proof_score}</span>
            </div>
            <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.proof_score}%`, background: 'linear-gradient(90deg, #c8963e, #e8b86d)', borderRadius: '2px' }} />
            </div>
          </div>

          {/* Bourbon Strength */}
          <div style={{ background: '#0f0f0f', borderRadius: '6px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>🥃 Bourbon Strength</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: strengthColor(item.bourbon_strength) }}>
                {item.bourbon_strength} — {strengthLabel(item.bourbon_strength)}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { label: 'Market', val: item.market_impact },
                { label: 'Geo', val: item.geo_impact },
                { label: 'Tech', val: item.tech_disruption },
                { label: 'Policy', val: item.regulatory_weight },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#555' }}>{s.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#888' }}>{s.val}</span>
                  </div>
                  <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.val}%`, background: '#c8963e', opacity: 0.6, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '14px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#c8963e', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Read Full Article ↗
          </div>
        </div>
      </div>
    </a>
  )
}

export default async function TipsyReadsPage() {
  const all = await getPublishedReads()
  const fresh     = all.filter(r => tierLabel(r.published_at) === 'fresh')
  const yesterday = all.filter(r => tierLabel(r.published_at) === 'yesterday')
  const cellar    = all.filter(r => tierLabel(r.published_at) === 'cellar')

  const SectionHeader = ({ title, sub, count }: { title: string; sub: string; count: number }) => (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, margin: 0 }}>{title}</h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#555' }}>{count} read{count !== 1 ? 's' : ''}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#555', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{sub}</p>
    </div>
  )

  return (
    <>
      <Nav variant="hub" />

      <main className="page-main">
        {/* Header */}
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-eyebrow">Tipsy Reads™</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 900, marginBottom: '12px', lineHeight: 1.05 }}>
              The world&apos;s signal.<br />
              <em style={{ color: 'var(--amber)' }}>Our take.</em>
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-dim)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '28px' }}>
              The most important finance and technology articles from around the world — curated daily, scored for credibility (Proof Score) and disruption impact (Bourbon Strength).
            </p>
            {/* Category filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <Link key={cat} href={cat === 'all' ? '/tipsy-reads' : `/tipsy-reads?category=${cat}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '6px 14px', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-faint)', textDecoration: 'none' }}>
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 32px' }}>
          <div className="container">

            {/* Fresh Pours */}
            {fresh.length > 0 && (
              <section style={{ marginBottom: '64px' }}>
                <SectionHeader title="🍶 Fresh Pours" sub="Published today" count={fresh.length} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {fresh.map(item => <TipsyCard key={item.id} item={item} />)}
                </div>
              </section>
            )}

            {/* Yesterday's Sip */}
            {yesterday.length > 0 && (
              <section style={{ marginBottom: '64px' }}>
                <SectionHeader title="☕ Yesterday's Sip" sub="From yesterday — still relevant" count={yesterday.length} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {yesterday.map(item => <TipsyCard key={item.id} item={item} />)}
                </div>
              </section>
            )}

            {/* The Cellar */}
            {cellar.length > 0 && (
              <section style={{ marginBottom: '64px' }}>
                <SectionHeader title="🥃 The Cellar" sub="This week's aged reads · Days 3–7" count={cellar.length} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cellar.map(item => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#c8963e')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
                        <div>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: catColor[item.category] || '#888', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{item.category}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#555' }}>{item.publication}</span>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8dcc8', lineHeight: 1.4 }}>{item.title}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#c8963e', marginBottom: '2px' }}>🥃 {item.bourbon_strength}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555' }}>{item.proof_score}-proof</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {all.length === 0 && (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>🥃</div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                  First curated reads coming soon.
                </p>
                <p style={{ fontSize: '13px', color: '#444' }}>Check back tomorrow morning.</p>
              </div>
            )}

            {/* Newsletter CTA */}
            <div style={{ background: 'linear-gradient(135deg, rgba(200,150,62,0.1), rgba(200,150,62,0.03))', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
                Get the best reads every Friday. <em style={{ color: 'var(--amber)' }}>Free.</em>
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '28px' }}>
                The week&apos;s highest-scored reads — Proof Score, Bourbon Strength, and our take — delivered Friday at noon ET.
              </p>
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <EmailSignupForm source="tipsy-reads" placeholder="your@email.com" buttonLabel="Subscribe Free" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer variant="full" />
    </>
  )
}
