import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ToastProvider from '@/components/Toast'
import { getAllArticles } from '@/lib/articles'
import { articles as legacyArticles } from '@/lib/data/articles'

export const metadata: Metadata = {
  title: 'Intelligence Desk — Bourbon Pour',
  description: 'Evidence-scored finance and technology intelligence. Every article carries a Proof Score.',
}

function proofColor(score: number) {
  if (score >= 85) return 'var(--green)'
  if (score >= 65) return 'var(--amber)'
  return 'var(--red)'
}

export default function ArticlesPage() {
  const mdArticles = getAllArticles()

  // Merge markdown articles with legacy hardcoded ones, deduplicating by slug
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
    }))

  const allArticles = [...mdArticles, ...legacyMapped]

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

        {/* Article grid */}
        <section style={{ padding: '60px 32px' }}>
          <div className="container">
            {allArticles.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                No articles yet — drop a .md file in content/daily-sip/ to publish your first.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {allArticles.map((a, i) => (
                  <Link key={a.slug} href={`/articles/${a.slug}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="pour-card fade-up"
                      style={{
                        animationDelay: `${i * 0.05}s`,
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        gap: '24px',
                      }}
                    >
                      <div className="pour-card-inner" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span
                            className="pour-cat"
                            style={{ color: a.categoryColor, fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px' }}
                          >
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
                The Daily Sip delivers evidence-scored intelligence to 47,000+ professionals at 6:30 AM ET. Free forever.
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
