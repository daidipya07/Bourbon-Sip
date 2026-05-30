import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About',
  description: 'Bourbon Pour is a personal, non-commercial project publishing evidence-scored finance and technology analysis.',
}

export default function AboutPage() {
  return (
    <>
      <Nav variant="hub" />

      <main className="page-main">
        {/* Header */}
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '780px' }}>
            <div className="section-eyebrow">About</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 900, marginBottom: '16px', lineHeight: 1.1 }}>
              Built what I wanted to read.
            </h1>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '20px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              A personal project exploring finance and technology through evidence-scored analysis.
            </p>
            <div style={{ marginTop: '20px', padding: '14px 20px', background: 'rgba(200,150,62,0.08)', border: '1px solid rgba(200,150,62,0.2)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.7 }}>
              Bourbon Pour is a personal, non-commercial educational project. Nothing here constitutes financial advice. <Link href="/terms" style={{ color: 'var(--amber)', textDecoration: 'none' }}>Terms of Use</Link> · <Link href="/privacy" style={{ color: 'var(--amber)', textDecoration: 'none' }}>Privacy Policy</Link>
            </div>
          </div>
        </div>

        {/* Body */}
        <section style={{ padding: '60px 32px' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>

            <p style={{ fontSize: '18px', color: 'var(--text-dim)', lineHeight: 1.85, marginBottom: '28px' }}>
              Bourbon Pour started from a simple frustration: most market and technology coverage is long on narrative and short on evidence. Headlines are optimized for clicks. Analysts quote each other. Nobody shows their work.
            </p>

            <p style={{ fontSize: '18px', color: 'var(--text-dim)', lineHeight: 1.85, marginBottom: '28px' }}>
              We decided to do something different. Every piece of intelligence published on this site carries a <strong style={{ color: 'var(--text)' }}>Proof Score™</strong> — a composite measure of data density, cross-reference quality, and source independence. It is not a gimmick. It is a commitment: if we cannot score it, we do not publish it.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '48px 0 16px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              The name
            </h2>

            <p style={{ fontSize: '18px', color: 'var(--text-dim)', lineHeight: 1.85, marginBottom: '28px' }}>
              Good bourbon is not rushed. It is aged, tested, and poured slowly — the flavor is the result of time and process, not speed. We think intelligence works the same way. The best analysis takes time to develop, multiple sources to validate, and patience to get right. Hence: Bourbon Pour.
            </p>

            <p style={{ fontSize: '18px', color: 'var(--text-dim)', lineHeight: 1.85, marginBottom: '28px' }}>
              <strong style={{ color: 'var(--amber)' }}>Data Is The New Currency™</strong> is not just a tagline. It is the central thesis of this publication. The most important asset class of the 21st century has no physical form — it is generated, aggregated, and monetized at a scale that most people do not yet understand. We are here to help you understand it.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '48px 0 16px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              What we cover
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '36px' }}>
              {[
                { icon: '◈', label: 'Markets & Macro', desc: 'Capital flows, monetary policy, credit markets, and the structural forces moving asset prices.' },
                { icon: '◈', label: 'AI & Technology', desc: 'Foundation models, infrastructure bets, enterprise adoption, and the real competitive dynamics behind the headlines.' },
                { icon: '◈', label: 'Disruptor Signals', desc: 'Pre-market intelligence on companies moving before the market knows — detected through procurement, hiring, and infrastructure data.' },
                { icon: '◈', label: 'Data Economy', desc: 'How data is created, valued, traded, and regulated — and what it means for every industry alive today.' },
              ].map(c => (
                <div key={c.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--amber)', marginBottom: '8px' }}>{c.icon} {c.label}</div>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '48px 0 16px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              The standard
            </h2>

            <p style={{ fontSize: '18px', color: 'var(--text-dim)', lineHeight: 1.85, marginBottom: '28px' }}>
              Every article on Bourbon Pour is evaluated against the same four criteria before publication: data density (how many independently sourced data points support the thesis), cross-reference quality (how well sources validate each other), recency weight (how current the underlying data is), and source independence (how free of circular citation the evidence chain is).
            </p>

            <p style={{ fontSize: '18px', color: 'var(--text-dim)', lineHeight: 1.85, marginBottom: '36px' }}>
              These four dimensions combine into the Proof Score™. Anything below 65 does not publish. Anything above 85 is conviction-grade intelligence that we believe a professional can act on. The methodology is transparent and available in full.
            </p>

            <Link href="/proof-score" className="btn-primary" style={{ display: 'inline-block', marginBottom: '60px' }}>
              Read the Proof Score methodology →
            </Link>

            <div style={{ background: 'linear-gradient(135deg, rgba(196,122,42,0.1), rgba(196,122,42,0.03))', border: '1px solid var(--border)', borderRadius: '8px', padding: '36px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                The Daily Sip. <em style={{ color: 'var(--amber)' }}>Every morning.</em>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px' }}>
                Evidence-scored intelligence delivered at 6:30 AM ET. Free, always.
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
