import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ToastProvider from '@/components/Toast'
import { getAllArticles } from '@/lib/articles'
import { articles as legacyArticles } from '@/lib/data/articles'

export const metadata: Metadata = {
  title: 'Intelligence Desk',
  description: 'Evidence-scored finance and technology intelligence. Every article carries a Proof Score.',
}

function proofColor(score: number) {
  if (score >= 85) return 'var(--green)'
  if (score >= 65) return 'var(--amber)'
  return 'var(--red)'
}

const CATEGORIES = [
  { id: 'all',     label: 'All' },
  { id: 'markets', label: 'Markets' },
  { id: 'tech',    label: 'Technology' },
  { id: 'ai',      label: 'AI / ML' },
  { id: 'crypto',  label: 'Crypto' },
  { id: 'macro',   label: 'Macro' },
]

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { category } = await searchParams
  const activeCategory = category && category !== 'all' ? category : null

  const mdArticles = await getAllArticles()

  const mdSlugs = new Set(mdArticles.map(a => a.slug))
  const legacyMapped = legacyArticles
    .filter(a => !mdSlugs.has(a.id))
    .map(a => ({
      slug: a.id,
      title: a.headline,
      subtitle: a.subtitle,
      date: a.date,
      category: a.cat,
      categoryLabel: a.catLabel,
      categoryColor: a.catColor,
      readTime: a.read,
      proofScore: a.proof,
      dataDensity: a.dd,
      crossRefs: a.xr,
      recencyWeight: a.rw,
      dataPoints: a.dataPoints,
      sourcesCount: a.sources.length,
      excerpt: a.excerpt,
      featured: false,
      heroImage: undefined as string | undefined,
      source: 'markdown' as const,
    }))

  const allArticles = [...mdArticles, ...legacyMapped]
  const filtered = activeCategory
    ? allArticles.filter(a => a.category === activeCategory)
    : allArticles

  return (
    <>
      <Nav variant="hub" />
      <ToastProvider />

      <main className="page-main">
        {/* Header */}
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-eyebrow">Intelligence Desk</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '12px' }}>
              The Pour Journal
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '16px', maxWidth: '560px' }}>
              Every article is evidence-scored. Every claim is sourced. No hot takes — only intelligence you can act on.
            </p>
          </div>
        </div>

        {/* Category filter */}
        <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--deep)' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: '4px', paddingBottom: '0', overflowX: 'auto' }}>
              {CATEGORIES.map(cat => {
                const isActive = cat.id === 'all' ? !activeCategory : activeCategory === cat.id
                return (
                  <Link
                    key={cat.id}
                    href={cat.id === 'all' ? '/articles' : `/articles?category=${cat.id}`}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      padding: '14px 18px',
                      color: isActive ? 'var(--amber)' : 'var(--text-faint)',
                      textDecoration: 'none',
                      borderBottom: isActive ? '2px solid var(--amber)' : '2px solid transparent',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                  >
                    {cat.label}
                  </Link>
                )
              })}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
                  {filtered.length} article{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Article list */}
        <section style={{ padding: '40px 32px' }}>
          <div className="container">
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-faint)', marginBottom: '16px' }}>
                  No articles in this category yet.
                </p>
                <Link href="/articles" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amber)', textDecoration: 'none' }}>
                  ← View all articles
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filtered.map((a, i) => (
                  <Link key={a.slug} href={`/articles/${a.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="pour-card fade-up"
                      style={{ animationDelay: `${i * 0.04}s`, display: 'grid', gridTemplateColumns: a.heroImage ? '1fr 200px' : '1fr', overflow: 'hidden' }}
                    >
                      <div className="pour-card-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ color: a.categoryColor, fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            {a.categoryLabel}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
                            {a.date} · {a.readTime}
                          </span>
                        </div>
                        <h2 className="pour-headline" style={{ fontSize: '20px', marginBottom: '8px' }}>{a.title}</h2>
                        <p className="pour-excerpt">{a.excerpt}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: proofColor(a.proofScore), fontWeight: 500 }}>
                            {a.proofScore}-proof
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
                            {a.dataPoints} data points · {a.sourcesCount} sources
                          </span>
                        </div>
                      </div>
                      {a.heroImage && (
                        <div style={{ overflow: 'hidden' }}>
                          <img src={a.heroImage} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section style={{ padding: '0 32px 80px' }}>
          <div className="container">
            <div style={{ background: 'linear-gradient(135deg, rgba(196,122,42,0.12), rgba(196,122,42,0.04))', border: '1px solid var(--border)', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
                Intelligence like this. <em style={{ color: 'var(--amber)' }}>Every morning.</em>
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px' }}>
                The Daily Sip delivers evidence-scored intelligence at 6:30 AM ET. Free, always.
              </p>
              <Link href="/#sip" className="btn-primary">Subscribe Free →</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </>
  )
}
