import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ReadingProgress from '@/components/ReadingProgress'
import EmailSignupForm from '@/components/EmailSignupForm'
import ToastProvider from '@/components/Toast'
import { getArticleBySlug, getAllArticleSlugs, getAllArticles } from '@/lib/articles'
import { articles as legacyArticles } from '@/lib/data/articles'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  // Slugs from markdown files
  const mdSlugs = getAllArticleSlugs().map(slug => ({ slug }))
  // Slugs from legacy hardcoded articles
  const legacySlugs = legacyArticles.map(a => ({ slug: a.id }))
  // Deduplicate
  const allSlugs = [...mdSlugs]
  const mdSlugSet = new Set(mdSlugs.map(s => s.slug))
  legacySlugs.forEach(s => { if (!mdSlugSet.has(s.slug)) allSlugs.push(s) })
  return allSlugs
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) {
    const legacy = legacyArticles.find(a => a.id === slug)
    if (legacy) {
      return {
        title: `${legacy.headline} — Bourbon Pour`,
        description: legacy.excerpt,
      }
    }
    return { title: 'Article — Bourbon Pour' }
  }
  return {
    title: `${article.title} — Bourbon Pour`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.date,
    },
  }
}

function proofLevel(score: number) {
  if (score >= 85) return 'high'
  if (score >= 65) return 'mid'
  return 'low'
}

function proofColor(score: number) {
  if (score >= 85) return 'var(--green)'
  if (score >= 65) return 'var(--amber)'
  return 'var(--red)'
}

function verdict(score: number) {
  if (score >= 90) return 'Conviction-grade intelligence — act with high confidence'
  if (score >= 80) return 'Evidence-grade — strong data backing'
  if (score >= 65) return 'Signal-grade — emerging pattern'
  return 'Developing — monitor for confirmation'
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params

  // Try markdown first
  const mdArticle = await getArticleBySlug(slug)

  // Fall back to legacy hardcoded articles
  const legacy = !mdArticle ? legacyArticles.find(a => a.id === slug) : null

  if (!mdArticle && !legacy) notFound()

  // Normalize to a unified shape
  const article = mdArticle
    ? {
        slug: mdArticle.slug,
        catLabel: mdArticle.categoryLabel,
        catColor: mdArticle.categoryColor,
        headline: mdArticle.title,
        subtitle: mdArticle.subtitle,
        proof: mdArticle.proofScore,
        dd: mdArticle.dataDensity,
        xr: mdArticle.crossRefs,
        rw: mdArticle.recencyWeight,
        date: mdArticle.date,
        read: mdArticle.readTime,
        dataPoints: mdArticle.dataPoints,
        sourcesCount: mdArticle.sourcesCount,
        sources: mdArticle.sources,
        heroImage: mdArticle.heroImage,
        contentHtml: mdArticle.contentHtml,
      }
    : {
        slug: legacy!.id,
        catLabel: legacy!.catLabel,
        catColor: legacy!.catColor,
        headline: legacy!.headline,
        subtitle: legacy!.subtitle,
        proof: legacy!.proof,
        dd: legacy!.dd,
        xr: legacy!.xr,
        rw: legacy!.rw,
        date: legacy!.date,
        read: legacy!.read,
        dataPoints: legacy!.dataPoints,
        sourcesCount: legacy!.sources.length,
        sources: legacy!.sources,
        heroImage: undefined,
        contentHtml: legacy!.content,
      }

  // Related articles (exclude current)
  const allArticles = getAllArticles()
  const relatedMd = allArticles.filter(a => a.slug !== slug).slice(0, 3)

  return (
    <>
      <Nav variant="article" />
      <ReadingProgress />
      <ToastProvider />

      <main className="page-main">
        {/* Article header */}
        <div className="art-header fade-in">
          <div className="art-cat-badge">
            <div className="art-cat-dot" style={{ background: article.catColor }} />
            <div className="art-cat-text" style={{ color: article.catColor }}>{article.catLabel}</div>
          </div>
          <h1 className="art-h1">{article.headline}</h1>
          <p className="art-subtitle">{article.subtitle}</p>
          <div className="art-meta-bar">
            <span>{article.date}</span>
            <div className="sep" />
            <span>{article.read} read</span>
            <div className="sep" />
            <span>{article.dataPoints} data points</span>
            <div className="sep" />
            <span>{article.sourcesCount} independent sources</span>
          </div>
        </div>

        {/* Hero image */}
        {article.heroImage && (
          <div className="art-hero">
            <img src={article.heroImage} alt={article.headline} />
          </div>
        )}

        {/* Proof score card */}
        <div className={`proof-card ${proofLevel(article.proof)} fade-in`} style={{ animationDelay: '.1s' }}>
          <div className="proof-main">
            <div className="proof-score-big" style={{ color: proofColor(article.proof) }}>{article.proof}</div>
            <div className="proof-label">Proof Score</div>
          </div>
          <div className="proof-details">
            <div className="proof-verdict" style={{ color: proofColor(article.proof) }}>{verdict(article.proof)}</div>
            <div className="proof-bars">
              <div className="proof-bar-item">
                <div className="proof-bar-label"><span>Data Density</span><span style={{ color: 'var(--green)' }}>{article.dd}</span></div>
                <div className="proof-bar-track"><div className="proof-bar-fill" style={{ width: article.dd + '%', background: 'var(--green)' }} /></div>
              </div>
              <div className="proof-bar-item">
                <div className="proof-bar-label"><span>Cross-References</span><span style={{ color: 'var(--blue)' }}>{article.xr}</span></div>
                <div className="proof-bar-track"><div className="proof-bar-fill" style={{ width: article.xr + '%', background: 'var(--blue)' }} /></div>
              </div>
              <div className="proof-bar-item">
                <div className="proof-bar-label"><span>Recency</span><span style={{ color: 'var(--amber)' }}>{article.rw}</span></div>
                <div className="proof-bar-track"><div className="proof-bar-fill" style={{ width: article.rw + '%', background: 'var(--amber)' }} /></div>
              </div>
            </div>
            <div className="proof-sources">
              {article.sourcesCount} sources cited ·{' '}
              <Link href="/proof-score">How Proof Score works →</Link>
            </div>
          </div>
          <div className="share-bar">
            <button className="share-btn">Share ↗</button>
            <button className="share-btn">Save ✦</button>
          </div>
        </div>

        {/* Article body */}
        <article
          className="art-content fade-in"
          id="articleBody"
          style={{ animationDelay: '.15s' }}
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {/* Sources */}
        <div className="sources-block fade-in" style={{ animationDelay: '.2s' }}>
          <div className="sources-title">Sources &amp; Evidence ({article.sourcesCount})</div>
          {article.sources.map((s, i) => (
            <div className="source-item" key={i}>
              <span className="source-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="source-text">
                {s.text}
                <span className={`source-type ${s.type}`}>{s.type}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Related articles */}
        {relatedMd.length > 0 && (
          <div className="related fade-in" style={{ animationDelay: '.25s' }}>
            <div className="related-title">Continue Reading</div>
            <div className="related-grid">
              {relatedMd.map(a => (
                <Link key={a.slug} href={`/articles/${a.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="rel-card">
                    <div className="rel-cat" style={{ color: a.categoryColor }}>{a.categoryLabel}</div>
                    <div className="rel-headline">{a.title}</div>
                    <div className="rel-meta">
                      <span style={{ color: proofColor(a.proofScore) }}>{a.proofScore}-proof</span>
                      {' · '}{a.readTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="art-nl">
          <h3>Intelligence like this. <em>Every morning.</em></h3>
          <p>The Daily Sip delivers evidence-scored intelligence to sharp professionals every morning. Free, always.</p>
          <div className="art-nl-form">
            <EmailSignupForm
              source="article-cta"
              placeholder="your@email.com"
              buttonLabel="Pour Me In"
              inputClassName="nl-input"
              buttonClassName="btn-primary"
            />
          </div>
        </div>

        <Footer variant="minimal" />
      </main>
    </>
  )
}
