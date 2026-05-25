import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Ticker from '@/components/Ticker'
import GaugeGrid from '@/components/GaugeGrid'
import SparklineChart from '@/components/charts/SparklineChart'
import StreakCounter from '@/components/StreakCounter'
import TipsyReads from '@/components/TipsyReads'
import EmailSignupForm from '@/components/EmailSignupForm'
import ProofBarAnimated from '@/components/ProofBarAnimated'
import ToastProvider from '@/components/Toast'
import { getRecentArticles } from '@/lib/articles'
import { radarData } from '@/lib/data/radar'
import { articles as legacyArticles } from '@/lib/data/articles'

export default async function HomePage() {
  // Real articles from markdown files
  const recentArticles = await getRecentArticles(5)

  // "Latest Pours" — use real articles if available, else fall back to legacy data
  const pours = recentArticles.length > 0
    ? recentArticles.slice(0, 3).map(a => ({
        cat: a.categoryLabel,
        proof: a.proofScore,
        headline: a.title,
        excerpt: a.excerpt,
        time: a.date,
        slug: a.slug,
        heroImage: a.heroImage,
      }))
    : legacyArticles.slice(0, 3).map(a => ({
        cat: a.catLabel,
        proof: a.proof,
        headline: a.headline,
        excerpt: a.excerpt,
        time: a.time,
        slug: a.id,
        heroImage: undefined as string | undefined,
      }))

  // Archive list — real articles if available
  const archiveItems = recentArticles.length > 0
    ? recentArticles.map(a => ({
        date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        headline: a.title,
        proof: a.proofScore,
        slug: a.slug,
      }))
    : [
        { date: 'Mar 24', headline: 'Why Goldman Just Quietly Doubled Its AI Infrastructure Budget', proof: 91, slug: 'ai-infrastructure-bet' },
        { date: 'Mar 21', headline: "The Sovereign Wealth Fund That's Buying Every AI Startup's Secondary Shares", proof: 88, slug: 'fed-silence' },
        { date: 'Mar 20', headline: "Three CFOs Told Us the Same Thing About AI ROI — And It's Not Good", proof: 93, slug: 'ai-infrastructure-bet' },
        { date: 'Mar 19', headline: "Japan's $400B Carry Trade Unwind Is Closer Than You Think", proof: 86, slug: 'fed-silence' },
        { date: 'Mar 18', headline: 'The Defense Tech Company That Just Stole 14 Engineers From Lockheed', proof: 82, slug: 'ai-infrastructure-bet' },
      ]

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  })

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
                Bourbon Pour delivers institutional-grade market intelligence, disruption signals, and evidence-scored analysis — daily. Built for the sharpest minds in finance and technology.
              </p>
              <div className="fade-up" style={{ display: 'flex', gap: '16px', marginBottom: '40px', animationDelay: '.3s' }}>
                <Link href="#sip" className="btn-primary">Pour Your First Issue — Free</Link>
                <Link href="#radar" className="btn-ghost">See the Platform</Link>
              </div>
              <div className="fade-up" style={{ display: 'flex', gap: '40px', animationDelay: '.4s' }}>
                <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 500, color: 'var(--amber-light)' }}>5</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Articles Live</div></div>
                <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 500, color: 'var(--amber-light)' }}>94</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Avg Proof Score</div></div>
                <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 500, color: 'var(--amber-light)' }}>6h</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Radar Refresh</div></div>
              </div>
            </div>

            {/* Data Pulse preview card */}
            <div className="hero-right fade-up" style={{ animationDelay: '.35s' }}>
              <div className="dp-card">
                <div className="dp-header">
                  <Link href="/data-pulse" style={{ color: 'var(--amber)' }}>
                    <div className="dp-title">Data Pulse™ — Live ↗</div>
                  </Link>
                  <div className="dp-time" id="dpTime" />
                </div>
                <GaugeGrid />
                <SparklineChart />
                <div className="dp-proof">
                  <div className="dp-proof-label">
                    <span>Proof Score™</span><span>91 / 100</span>
                  </div>
                  <ProofBarAnimated target={91} delay={600} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DISRUPTOR RADAR ──────────────────────────────── */}
        <section className="radar-section" id="radar" style={{ background: 'var(--deep)', padding: '80px 32px' }}>
          <div className="container">
            <div className="section-eyebrow">Disruptor Radar™</div>
            <div className="section-title">Who's moving before the market knows.</div>
            <div className="section-sub">Pre-market disruption signals detected an average of 38 days before public news. 84% confirmed accuracy rate.</div>
            <div className="radar-grid">
              {radarData.map((c, i) => (
                <div
                  key={c.name}
                  className={`radar-card ${c.cls} fade-up`}
                  style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                >
                  <div className="radar-tag">{c.sector}</div>
                  <div className="radar-name">{c.name}</div>
                  <div className="radar-signal">{c.signal}</div>
                  <div className="radar-footer">
                    <span className="radar-proof" style={{
                      color: c.cls === 'hot' ? 'var(--red)' : c.cls === 'rising' ? 'var(--amber)' : 'var(--blue)'
                    }}>
                      {c.proof}
                    </span>
                    <span className={`radar-badge badge-${c.cls}`}>{c.badge}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="radar-cta">
              <Link href="/disruptor-radar" className="btn-primary" style={{ display: 'inline-block' }}>
                Access Full Radar — 32 Companies Live →
              </Link>
            </div>
          </div>
        </section>

        {/* ── LATEST POURS ─────────────────────────────────── */}
        <section id="pours" style={{ padding: '80px 32px' }}>
          <div className="container">
            <div className="section-eyebrow">Latest Intelligence</div>
            <div className="section-title" style={{ marginBottom: '40px' }}>Today&apos;s Pours</div>
            <div className="pours-grid">
              {pours.map((p, i) => (
                <Link key={i} href={`/articles/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <div className={`pour-card fade-up`} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                    {p.heroImage && (
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '6px 6px 0 0' }}>
                        <img src={p.heroImage} alt={p.headline} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}
                    <div className="pour-card-inner">
                      <span className="pour-cat">{p.cat}</span>
                      <span className="pour-proof-badge">{p.proof}-proof</span>
                      <h3 className="pour-headline">{p.headline}</h3>
                      <p className="pour-excerpt">{p.excerpt}</p>
                      <div className="pour-meta">
                        <span>{p.time}</span>
                        <span>Read · 6 min</span>
                      </div>
                      <div className="pour-score-bar">
                        <div className="pour-score-fill" style={{ width: p.proof + '%', background: 'linear-gradient(90deg, var(--amber), var(--amber-pale))', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE DAILY SIP™ ───────────────────────────────── */}
        <section className="sip-section" id="sip">
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
                  <StreakCounter />
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

              {/* Today's preview card */}
              <div className="sip-right fade-up" style={{ animationDelay: '.2s' }}>
                <div className="sip-preview">
                  <div className="sip-preview-header">
                    <div className="sip-preview-label">Today&apos;s Sip — Preview</div>
                    <div className="sip-preview-date">{todayDate}</div>
                  </div>
                  <div className="sip-preview-body">
                    <div className="sip-issue-num">Latest Issue</div>
                    <h3 className="sip-issue-headline">
                      The $40B Signal Nobody&apos;s Watching, Japan&apos;s Quiet Power Move, and Why Your AI Budget Just Got Audited
                    </h3>
                    <ul className="sip-issue-bullets">
                      <li>
                        <span className="sip-bullet-num">01</span>
                        <span>Microsoft&apos;s Azure GPU reservations hit an all-time high last week — but the booking pattern suggests a single customer took 40% of new capacity. The math points to one company, and it&apos;s not OpenAI.</span>
                      </li>
                      <li>
                        <span className="sip-bullet-num">02</span>
                        <span>The Bank of Japan quietly purchased $2.1B in US tech debt instruments on Thursday. This is the third stealth buy in 8 weeks. No major outlet has connected the dots yet.</span>
                      </li>
                      <li>
                        <span className="sip-bullet-num">03</span>
                        <span>Enterprise AI spend audits are coming. Boards are demanding ROI proof by Q3 — and most current AI projects can&apos;t provide it.</span>
                      </li>
                    </ul>
                    <div className="sip-issue-proof">
                      <div className="sip-issue-proof-label">Issue Proof Score</div>
                      <div className="sip-issue-proof-bar">
                        <ProofBarAnimated target={94} observeParent />
                      </div>
                      <div className="sip-issue-proof-val">94</div>
                    </div>
                  </div>
                  <Link href="#sip" className="sip-preview-cta" style={{ display: 'block', textAlign: 'center', padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1px', borderTop: '1px solid var(--border)' }}>
                    Read full issue — subscribe free ↗
                  </Link>
                </div>
              </div>
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
              {/* Filters are inside TipsyReads component */}
            </div>
            <TipsyReads />
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

        {/* ── MANIFESTO ────────────────────────────────────── */}
        <section className="manifesto">
          <div className="container">
            <h2>Data is the new currency.<br /><em>Most people are still paying in cash.</em></h2>
            <p>Every day, billions of dollars move on information that most people never see. Not because it&apos;s hidden — because it&apos;s buried in noise. Bourbon Pour exists to cut through it. We don&apos;t do hot takes. We don&apos;t hedge. Every piece of intelligence we publish carries a Proof Score — so you know exactly how much weight to give it.</p>
            <p>We built the Disruptor Radar so you&apos;d never be the last to know. We created Data Pulse so you could feel the market moving before it moves. This isn&apos;t a newsletter. It&apos;s an edge.</p>
            <button className="btn-dark">Read the full manifesto →</button>
          </div>
        </section>

      </main>

      <Footer variant="full" />
    </>
  )
}
