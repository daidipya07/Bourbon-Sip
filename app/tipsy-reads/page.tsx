import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import EmailSignupForm from '@/components/EmailSignupForm'
import { TipsyCard, CellarRow } from '@/components/TipsyCard'
import { createClient } from '@supabase/supabase-js'

export const metadata: Metadata = {
  title: 'Tipsy Reads™ — Curated Finance & Tech Intelligence',
  description: 'The world\'s most important finance and technology articles — curated daily, scored for credibility and disruption impact.',
}

export const revalidate = 3600 // revalidate every hour

const CATEGORIES = ['all', 'markets', 'ai', 'tech', 'macro', 'geopolitics', 'policy', 'energy', 'fintech']

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
  const { data } = await supabase
    .from('tipsy_reads')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return data || []
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
                  {cellar.map(item => <CellarRow key={item.id} item={item} />)}
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
