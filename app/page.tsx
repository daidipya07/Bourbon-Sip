import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Ticker from '@/components/Ticker'
import StreakCounter from '@/components/StreakCounter'
import TipsyReads from '@/components/TipsyReads'
import EmailSignupForm from '@/components/EmailSignupForm'
import ProofBarAnimated from '@/components/ProofBarAnimated'
import ToastProvider from '@/components/Toast'
import { getRecentArticles } from '@/lib/articles'
import { radarData } from '@/lib/data/radar'
import { createClient } from '@supabase/supabase-js'

async function getHomepageTipsyReads() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []
  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data } = await supabase
    .from('tipsy_reads')
    .select('id, url, title, publication, category, bourbon_take, proof_score, bourbon_strength, market_impact, geo_impact, tech_disruption, regulatory_weight, og_image, published_at, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)
  return data || []
}

export default async function HomePage() {
  const recentArticles = await getRecentArticles(5)
  const tipsyItems = await getHomepageTipsyReads()

  const featured = recentArticles[0] ?? null
  const pours = recentArticles.slice(0, 3)

  const archiveItems = recentArticles.map(a => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    headline: a.title,
    proof: a.proofScore,
    slug: a.slug,
  }))

  return (
    <>
      <Nav variant="home" />
      <Ticker />
      <ToastProvider />

      <main className="home-main">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="hero" id="pulse" style={{ padding: '100px 32px 80px' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div className="hero-left">
              <div className="hero-eyebrow fade-up">Finance &amp; Technology Intelligence</div>
              <h1 className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1px', marginBottom: '16px', animationDelay: '.1s' }}>
                Data Is The<br /><em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>New Currency.</em>
              </h1>
              <p className="fade-up" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '20px', color: 'var(--text-dim)', marginBottom: '20px', animationDelay: '.2s' }}>
                Most people are still paying in cash.
              </p>
              <p className="fade-up" style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px', animationDelay: '.25s' }}>
                Bourbon Pour delivers evidence-scored finance and technology analysis — clearly sourced, proof-rated, and free. Built for curious, critical thinkers.
              </p>
              <div className="fade-up" style={{ display: 'flex', gap: '16px', marginBottom: '40px', animationDelay: '.3s' }}>
                <Link href="#sip" className="btn-primary">Subscribe Free →</Link>
                <Link href="/articles" className="btn-ghost">Read Articles</Link>
              </div>
              <div className="fade-up" style={{ display: 'flex', gap: '40px', animationDelay: '.4s' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 500, color: 'var(--amber-light)' }}>{recentArticles.length || '—'}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Articles</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 500, color: 'var(--amber-light)' }}>{tipsyItems.length > 0 ? tipsyItems.length + '+' : '—'}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Tipsy Reads</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 500, color: 'var(--amber-light)' }}>Free</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Always</div>
                </div>
              </div>
            </div>

            {/* Featured article card — replaces fake gauge */}
            <div className="hero-right fade-up" style={{ animationDelay: '.35s' }}>
              {featured ? (
                <Link href={`/articles/${featured.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#111', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                    {featured.heroImage && (
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                        <img src={featured.heroImage} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}
                    <div style={{ padding: '28px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', background: 'rgba(200,150,62,0.12)', padding: '3px 10px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {featured.categoryLabel}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
                          {new Date(featured.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, marginBottom: '10px' }}>
                        {featured.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '20px' }}>
                        {featured.excerpt}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, marginRight: '16px' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-faint)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Proof Score™
                          </div>
                          <ProofBarAnimated target={featured.proofScore} observeParent />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'var(--amber)' }}>
                          {featured.proofScore}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '12px 28px', borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Read article →
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="dp-card">
                  <div className="dp-header">
                    <div className="dp-title">Bourbon Pour™</div>
                  </div>
                  <div style={{ padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.7 }}>
                      Evidence-scored intelligence on finance and technology.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── LATEST ARTICLES ──────────────────────────────── */}
        <section id="articles" style={{ padding: '80px 32px', background: 'var(--deep)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div className="section-eyebrow">Latest Intelligence</div>
                <div className="section-title" style={{ marginBottom: 0 }}>Recent Articles</div>
              </div>
              <Link href="/articles" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--amber)', textDecoration: 'none', border: '1px solid rgba(200,150,62,0.3)', padding: '8px 16px', borderRadius: '5px' }}>
                View all articles →
              </Link>
            </div>
            <div className="pours-grid">
              {pours.length > 0 ? pours.map((p, i) => (
                <Link key={p.slug} href={`/articles/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="pour-card fade-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                    {p.heroImage && (
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '6px 6px 0 0' }}>
                        <img src={p.heroImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}
                    <div className="pour-card-inner">
                      <span className="pour-cat">{p.categoryLabel}</span>
                      <span className="pour-proof-badge">{p.proofScore}-proof</span>
                      <h3 className="pour-headline">{p.title}</h3>
                      <p className="pour-excerpt">{p.excerpt}</p>
                      <div className="pour-meta">
                        <span>{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>{p.readTime || '6 min'}</span>
                      </div>
                      <div className="pour-score-bar">
                        <div className="pour-score-fill" style={{ width: p.proofScore + '%', background: 'linear-gradient(90deg, var(--amber), var(--amber-pale))', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div style={{ gridColumn: '1/-1', padding: '60px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-faint)' }}>
                  First articles coming soon.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── TIPSY READS™ ─────────────────────────────────── */}
        <section className="tipsy-section" id="tipsy">
          <div className="container">
            <div className="tipsy-header">
              <div className="tipsy-header-left">
                <div className="section-eyebrow">Tipsy Reads™</div>
                <div className="section-title" style={{ marginBottom: '4px' }}>Quick pours. Sharp takes.</div>
                <div className="section-sub" style={{ marginBottom: 0 }}>Bite-sized market intelligence you&apos;ll actually want to share. Updated throughout the day.</div>
              </div>
            </div>
            <TipsyReads initialItems={tipsyItems} />
            <div className="tipsy-cta">
              <div>
                <div className="tipsy-cta-headline">Get Tipsy Reads in your inbox. <em>Free.</em></div>
                <div className="tipsy-cta-sub">The best bites from the week — every Friday at noon ET.</div>
              </div>
              <div className="tipsy-cta-form">
                <EmailSignupForm
                  source="tipsy-reads"
                  placeholder="your@email.com"
                  buttonLabel="Subscribe"
                  inputClassName="sip-input"
                  buttonClassName="sip-submit"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── DATA PULSE TEASER ────────────────────────────── */}
        <section style={{ background: 'var(--deep)', padding: '80px 32px', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
              <div>
                <div className="section-eyebrow">Data Pulse™</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
                  Feel the market moving<br /><em>before it moves.</em>
                </h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
                  Live macro regime classification, FRED stress indicators, and an AI-generated weekly signal — reviewed and published every Friday.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                  {['VIX · Fear Index', 'Yield Curve', 'Credit Spreads', 'Macro Regime', 'Weekly Signal'].map(label => (
                    <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', background: 'rgba(200,150,62,0.08)', border: '1px solid rgba(200,150,62,0.2)', padding: '4px 10px', borderRadius: '4px' }}>
                      {label}
                    </span>
                  ))}
                </div>
                <Link href="/data-pulse" className="btn-primary">Open Data Pulse →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Macro Regime', desc: 'Rules-based regime classification updated every 15 min' },
                  { label: 'Stress Gauges', desc: 'VIX, credit spreads, yield curve from FRED' },
                  { label: 'Weekly Signal', desc: 'AI-drafted, human-reviewed every Friday 9 AM ET' },
                  { label: 'Proof Leaderboard', desc: 'Publication credibility ranked by Proof Score™' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#111', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DISRUPTOR RADAR ──────────────────────────────── */}
        <section className="radar-section" id="radar" style={{ padding: '80px 32px' }}>
          <div className="container">
            <div className="section-eyebrow">Disruptor Radar™</div>
            <div className="section-title">Who&apos;s moving before the market knows.</div>
            <div className="section-sub">Companies we are watching closely — curated signals based on public data, filings, and hiring patterns.</div>
            <div className="radar-grid">
              {radarData.slice(0, 6).map((c, i) => (
                <div key={c.name} className={`radar-card ${c.cls} fade-up`} style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
                  <div className="radar-tag">{c.sector}</div>
                  <div className="radar-name">{c.name}</div>
                  <div className="radar-signal">{c.signal}</div>
                  <div className="radar-footer">
                    <span className="radar-proof" style={{ color: c.cls === 'hot' ? 'var(--red)' : c.cls === 'rising' ? 'var(--amber)' : 'var(--blue)' }}>
                      {c.proof}
                    </span>
                    <span className={`radar-badge badge-${c.cls}`}>{c.badge}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="radar-cta">
              <Link href="/disruptor-radar" className="btn-primary" style={{ display: 'inline-block' }}>
                View Full Radar →
              </Link>
            </div>
          </div>
        </section>

        {/* ── THE DAILY SIP™ EMAIL SIGNUP ──────────────────── */}
        <section className="sip-section" id="sip" style={{ background: 'var(--deep)' }}>
          <div className="container">
            <div className="sip-layout">
              <div className="sip-left">
                <div className="sip-badge fade-up">
                  <div className="sip-badge-dot" />
                  <div className="sip-badge-text">Delivered 5x / week at 6:30 AM ET</div>
                </div>
                <h2 className="sip-title fade-up" style={{ animationDelay: '.05s' }}>
                  The Daily <em>Sip™</em>
                </h2>
                <p className="sip-subtitle fade-up" style={{ animationDelay: '.1s' }}>
                  Your morning intelligence briefing — before the market opens.
                </p>
                <p className="sip-desc fade-up" style={{ animationDelay: '.15s' }}>
                  Every weekday, The Daily Sip delivers the 3 things you need to know, the 1 thing nobody&apos;s talking about, and the data that proves it. Every issue carries a Proof Score. No fluff. No filler. Just the sharpest five-minute read in finance.
                </p>
                <div className="fade-up" style={{ animationDelay: '.2s' }}>
                  <div className="sip-form">
                    <EmailSignupForm
                      source="daily-sip"
                      placeholder="your@email.com"
                      buttonLabel="Pour Me In"
                      inputClassName="sip-input"
                      buttonClassName="sip-submit"
                    />
                  </div>
                </div>
                <div className="sip-trust fade-up" style={{ animationDelay: '.25s' }}>
                  <div className="sip-trust-item"><span className="sip-trust-icon">✦</span> Growing daily</div>
                  <div className="sip-trust-item"><span className="sip-trust-icon">✦</span> Free forever</div>
                  <div className="sip-trust-item"><span className="sip-trust-icon">✦</span> Unsubscribe anytime</div>
                </div>
                <div className="fade-up" style={{ animationDelay: '.3s' }}>
                  <StreakCounter target={recentArticles.length} />
                </div>
                <div className="fade-up" style={{ animationDelay: '.35s' }}>
                  <div className="sip-archive-title">Recent Issues</div>
                  <div className="sip-archive-list">
                    {archiveItems.map((a, i) => (
                      <Link key={i} href={`/articles/${a.slug}`} style={{ textDecoration: 'none' }}>
                        <div className="sip-archive-item">
                          <div className="sip-archive-left">
                            <span className="sip-archive-date">{a.date}</span>
                            <span className="sip-archive-headline">{a.headline}</span>
                          </div>
                          <span className="sip-archive-proof">{a.proof}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest article preview card */}
              <div className="sip-right fade-up" style={{ animationDelay: '.2s' }}>
                <div className="sip-preview">
                  <div className="sip-preview-header">
                    <div className="sip-preview-label">Latest Issue</div>
                    <div className="sip-preview-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div className="sip-preview-body">
                    {recentArticles[0] ? (
                      <>
                        <div className="sip-issue-num">{recentArticles[0].categoryLabel}</div>
                        <h3 className="sip-issue-headline">{recentArticles[0].title}</h3>
                        <ul className="sip-issue-bullets">
                          <li>
                            <span className="sip-bullet-num">01</span>
                            <span>{recentArticles[0].excerpt}</span>
                          </li>
                          {recentArticles[1] && (
                            <li>
                              <span className="sip-bullet-num">02</span>
                              <span>{recentArticles[1].title}</span>
                            </li>
                          )}
                        </ul>
                        <div className="sip-issue-proof">
                          <div className="sip-issue-proof-label">Proof Score™</div>
                          <div className="sip-issue-proof-bar">
                            <ProofBarAnimated target={recentArticles[0].proofScore} observeParent />
                          </div>
                          <div className="sip-issue-proof-val">{recentArticles[0].proofScore}</div>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '32px 0', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
                          Evidence-scored intelligence on finance and technology — delivered to your inbox.
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          First issue coming soon
                        </p>
                      </div>
                    )}
                  </div>
                  <Link href={recentArticles[0] ? `/articles/${recentArticles[0].slug}` : '#sip'} className="sip-preview-cta" style={{ display: 'block', textAlign: 'center', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1px', borderTop: '1px solid var(--border)' }}>
                    {recentArticles[0] ? 'Read full article →' : 'Subscribe free ↗'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MANIFESTO ────────────────────────────────────── */}
        <section className="manifesto">
          <div className="container">
            <h2>Data is the new currency.<br /><em>Most people are still paying in cash.</em></h2>
            <p>Every day, billions of dollars move on information that most people never see. Not because it&apos;s hidden — because it&apos;s buried in noise. Bourbon Pour exists to cut through it. We don&apos;t do hot takes. We don&apos;t hedge. Every piece of intelligence we publish carries a Proof Score — so you know exactly how much weight to give it.</p>
            <p>We built the Disruptor Radar so you&apos;d never be the last to know. We created Data Pulse so you could feel the market moving before it moves. This isn&apos;t a newsletter. It&apos;s an edge.</p>
            <Link href="/manifesto" className="btn-dark">Read the full manifesto →</Link>
          </div>
        </section>

      </main>

      <Footer variant="full" />
    </>
  )
}
