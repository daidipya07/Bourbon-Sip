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
  const moreArticles = recentArticles.slice(1, 4) // skip featured, show next 3

  return (
    <>
      <Nav variant="home" />
      <Ticker />
      <ToastProvider />

      <main className="home-main">

        {/* ── HERO — FEATURED ARTICLE ──────────────────────── */}
        <section className="hero" id="pulse" style={{ padding: '100px 32px 60px' }}>
          <div className="container">
            {featured ? (
              <>
                {/* Eyebrow */}
                <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', background: 'rgba(196,122,42,0.12)', padding: '4px 12px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    Featured
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    {featured.categoryLabel}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>
                    {new Date(featured.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Two-column: title + article card */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px', alignItems: 'start' }}>
                  {/* Left: headline + excerpt */}
                  <div>
                    <Link href={`/articles/${featured.slug}`} style={{ textDecoration: 'none' }}>
                      <h1 className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1px', marginBottom: '20px', animationDelay: '.1s', color: 'var(--text)' }}>
                        {featured.title}
                      </h1>
                    </Link>
                    {featured.subtitle && (
                      <p className="fade-up" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '20px', color: 'var(--text-dim)', marginBottom: '20px', animationDelay: '.15s', lineHeight: 1.5 }}>
                        {featured.subtitle}
                      </p>
                    )}
                    <p className="fade-up" style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px', maxWidth: '540px', animationDelay: '.2s' }}>
                      {featured.excerpt}
                    </p>

                    {/* Proof Score inline */}
                    <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', animationDelay: '.25s' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px' }}>Proof Score™</span>
                      <div style={{ flex: 1, maxWidth: '200px' }}>
                        <ProofBarAnimated target={featured.proofScore} delay={400} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--amber)' }}>{featured.proofScore}</span>
                    </div>

                    <div className="fade-up" style={{ display: 'flex', gap: '12px', animationDelay: '.3s' }}>
                      <Link href={`/articles/${featured.slug}`} className="btn-primary">Read Article →</Link>
                      <Link href="/articles" className="btn-ghost">All Articles</Link>
                    </div>
                  </div>

                  {/* Right: article hero image */}
                  <div className="fade-up" style={{ animationDelay: '.2s' }}>
                    {featured.heroImage ? (
                      <Link href={`/articles/${featured.slug}`} style={{ textDecoration: 'none' }}>
                        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', transition: 'border-color 0.2s' }}>
                          <img src={featured.heroImage} alt={featured.title} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                          <div style={{ padding: '16px 20px', background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)' }}>{featured.readTime || '6 min read'}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)' }}>Read →</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px 28px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '64px', opacity: 0.15, marginBottom: '16px' }}>✦</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Original Research</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* No articles yet — tagline hero */
              <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
                <div className="hero-eyebrow fade-up">Finance &amp; Technology Intelligence</div>
                <h1 className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1px', marginBottom: '20px', animationDelay: '.1s' }}>
                  Data Is The <em style={{ fontStyle: 'italic', color: 'var(--amber)' }}>New Currency.</em>
                </h1>
                <p className="fade-up" style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px', animationDelay: '.2s' }}>
                  Evidence-scored finance and technology analysis — clearly sourced, proof-rated, and free.
                </p>
                <Link href="#sip" className="btn-primary fade-up" style={{ animationDelay: '.3s' }}>Subscribe Free →</Link>
              </div>
            )}
          </div>
        </section>

        {/* ── MORE ORIGINAL ARTICLES ───────────────────────── */}
        {moreArticles.length > 0 && (
          <section id="articles" style={{ padding: '60px 32px 80px', background: 'var(--deep)', borderTop: '1px solid var(--border)' }}>
            <div className="container">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div className="section-eyebrow">Original Intelligence</div>
                  <div className="section-title" style={{ marginBottom: 0, fontSize: '28px' }}>More from the Editor</div>
                </div>
                <Link href="/articles" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--amber)', textDecoration: 'none', border: '1px solid rgba(196,122,42,0.3)', padding: '8px 16px', borderRadius: '5px' }}>
                  View all →
                </Link>
              </div>
              <div className="pours-grid" style={{ gridTemplateColumns: `repeat(${Math.min(moreArticles.length, 3)}, 1fr)` }}>
                {moreArticles.map((a, i) => (
                  <Link key={a.slug} href={`/articles/${a.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="pour-card fade-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                      {a.heroImage && (
                        <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '6px 6px 0 0' }}>
                          <img src={a.heroImage} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                      )}
                      <div className="pour-card-inner">
                        <span className="pour-cat">{a.categoryLabel}</span>
                        <span className="pour-proof-badge">{a.proofScore}-proof</span>
                        <h3 className="pour-headline" style={{ fontSize: '18px' }}>{a.title}</h3>
                        <p className="pour-excerpt">{a.excerpt}</p>
                        <div className="pour-meta">
                          <span>{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>{a.readTime || '6 min'}</span>
                        </div>
                        <div className="pour-score-bar">
                          <div className="pour-score-fill" style={{ width: a.proofScore + '%', background: 'linear-gradient(90deg, var(--amber), var(--amber-pale))', transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── TIPSY READS™ ─────────────────────────────────── */}
        <section className="tipsy-section" id="tipsy">
          <div className="container">
            <div className="tipsy-header">
              <div className="tipsy-header-left">
                <div className="section-eyebrow">Tipsy Reads™</div>
                <div className="section-title" style={{ marginBottom: '4px' }}>Quick pours. Sharp takes.</div>
                <div className="section-sub" style={{ marginBottom: 0 }}>Curated market intelligence from across the web — scored and served with a bourbon take.</div>
              </div>
            </div>
            <TipsyReads initialItems={tipsyItems} />
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link href="/tipsy-reads" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--amber)', textDecoration: 'none', border: '1px solid rgba(196,122,42,0.3)', padding: '10px 24px', borderRadius: '5px' }}>
                View all Tipsy Reads →
              </Link>
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
                  Feel the market moving<br /><em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>before it moves.</em>
                </h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
                  Macro regime classification, FRED stress indicators, and an AI-generated weekly signal — reviewed and published every Friday.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
                  {['VIX', 'Yield Curve', 'Credit Spreads', 'Macro Regime', 'Weekly Signal'].map(label => (
                    <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', background: 'rgba(196,122,42,0.08)', border: '1px solid rgba(196,122,42,0.2)', padding: '4px 10px', borderRadius: '4px' }}>
                      {label}
                    </span>
                  ))}
                </div>
                <Link href="/data-pulse" className="btn-primary">Open Data Pulse →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Macro Regime', desc: 'Rules-based regime classification from public data' },
                  { label: 'Stress Gauges', desc: 'VIX, credit spreads, yield curve — all from FRED' },
                  { label: 'Weekly Signal', desc: 'AI-drafted, human-reviewed every Friday 9 AM ET' },
                  { label: 'Proof Leaderboard', desc: 'Publication credibility ranked by Proof Score™' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
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
            <div className="section-sub">Companies we are watching closely — editorial signals based on public data, filings, and hiring patterns.</div>
            <div className="radar-grid">
              {radarData.slice(0, 4).map((c, i) => (
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

        {/* ── SUBSCRIBE — THE DAILY SIP™ ───────────────────── */}
        <section className="sip-section" id="sip" style={{ background: 'var(--deep)' }}>
          <div className="container" style={{ maxWidth: '700px', textAlign: 'center' }}>
            <div className="sip-badge fade-up" style={{ justifyContent: 'center' }}>
              <div className="sip-badge-dot" />
              <div className="sip-badge-text">Free · Delivered weekdays at 6:30 AM ET</div>
            </div>
            <h2 className="sip-title fade-up" style={{ animationDelay: '.05s' }}>
              The Daily <em>Sip™</em>
            </h2>
            <p className="sip-subtitle fade-up" style={{ animationDelay: '.1s', maxWidth: '500px', margin: '0 auto 24px' }}>
              Your morning intelligence briefing — before the market opens.
            </p>
            <p className="sip-desc fade-up" style={{ animationDelay: '.15s', maxWidth: '520px', margin: '0 auto 32px' }}>
              The 3 things you need to know, the 1 thing nobody&apos;s talking about, and the data that proves it. Every issue carries a Proof Score.
            </p>
            <div className="fade-up" style={{ animationDelay: '.2s', maxWidth: '480px', margin: '0 auto 24px' }}>
              <div className="sip-form" style={{ justifyContent: 'center' }}>
                <EmailSignupForm
                  source="daily-sip"
                  placeholder="your@email.com"
                  buttonLabel="Pour Me In"
                  inputClassName="sip-input"
                  buttonClassName="sip-submit"
                />
              </div>
            </div>
            <div className="sip-trust fade-up" style={{ animationDelay: '.25s', justifyContent: 'center' }}>
              <div className="sip-trust-item"><span className="sip-trust-icon">✦</span> Growing daily</div>
              <div className="sip-trust-item"><span className="sip-trust-icon">✦</span> Free forever</div>
              <div className="sip-trust-item"><span className="sip-trust-icon">✦</span> Unsubscribe anytime</div>
            </div>
            <div className="fade-up" style={{ animationDelay: '.3s' }}>
              <StreakCounter target={recentArticles.length} />
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
