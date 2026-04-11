import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Pour Journal™ — Intelligence Log | Bourbon Pour',
  description: 'Your personal AI-powered intelligence log. Track signals, annotate articles, and build your own evidence portfolio.',
}

export default function PourJournalPage() {
  return (
    <>
      <Nav variant="tool" backHref="/" backLabel="← Home" />

      <main className="page-main">
        {/* Header */}
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-eyebrow">Intelligence Log</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '12px' }}>
              Pour Journal™
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-dim)', maxWidth: '560px', lineHeight: 1.7 }}>
              Your personal intelligence log. Annotate signals, track your thesis, and build a living evidence portfolio — powered by Proof Score methodology.
            </p>
          </div>
        </div>

        <section style={{ padding: '80px 32px' }}>
          <div className="container" style={{ maxWidth: '780px' }}>
            {/* Feature preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '60px' }}>
              {[
                { icon: '📌', title: 'Pin & annotate signals', desc: 'Bookmark any Disruptor Radar signal or Tipsy Read with private notes. Your annotations stay private.' },
                { icon: '📊', title: 'Track thesis accuracy', desc: 'Log your market thesis, set review dates, and track how it ages against incoming Proof Score data.' },
                { icon: '🔔', title: 'Custom alert portfolio', desc: 'Set thresholds by company, sector, or proof score. Get notified when your tracked signals update.' },
                { icon: '📤', title: 'Export your intelligence', desc: 'Export your annotated intelligence portfolio as PDF or structured data for research and compliance records.' },
              ].map(f => (
                <div key={f.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(196,122,42,0.12), rgba(196,122,42,0.04))', border: '1px solid var(--border)', borderRadius: '8px', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Coming Soon</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
                Pour Journal™ is in development
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px', lineHeight: 1.7 }}>
                Subscribe to the Daily Sip to be first to know when Pour Journal launches.
              </p>
              <Link href="/#sip" className="btn-primary">Subscribe Free</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </>
  )
}
