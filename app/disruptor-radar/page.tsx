import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { radarData } from '@/lib/data/radar'

export const metadata: Metadata = {
  title: 'Disruptor Radar™ — Pre-Market Disruption Signals | Bourbon Pour',
  description: 'Pre-market disruption signals detected an average of 38 days before public news. 84% confirmed accuracy rate.',
}

export default function DisruptorRadarPage() {
  return (
    <>
      <Nav variant="tool" backHref="/" backLabel="← Home" />

      <main className="page-main">
        {/* Header */}
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-eyebrow">Live Signals</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '12px' }}>
              Disruptor Radar™
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-dim)', maxWidth: '560px', lineHeight: 1.7 }}>
              Who&apos;s moving before the market knows. Pre-market disruption signals detected an average of 38 days before public news. 84% confirmed accuracy rate.
            </p>
            <div style={{ display: 'flex', gap: '32px', marginTop: '32px' }}>
              {[
                { val: '38d', label: 'Avg lead time' },
                { val: '84%', label: 'Accuracy rate' },
                { val: '32',  label: 'Companies tracked' },
                { val: '6h',  label: 'Refresh cycle' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 500, color: 'var(--amber-light)' }}>{s.val}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar grid */}
        <section style={{ padding: '60px 32px' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Current signals — Updated every 6 hours
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['hot', 'rising', 'watch'] as const).map(cls => (
                  <span key={cls} className={`radar-badge badge-${cls}`}>{cls.toUpperCase()}</span>
                ))}
              </div>
            </div>

            <div className="radar-grid" style={{ marginBottom: '48px' }}>
              {radarData.map((c, i) => (
                <div
                  key={c.name}
                  className={`radar-card ${c.cls} fade-up`}
                  style={{ animationDelay: `${0.05 + i * 0.05}s` }}
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

            {/* More signals coming */}
            <div style={{ background: 'linear-gradient(135deg, rgba(196,122,42,0.12), rgba(196,122,42,0.04))', border: '1px solid var(--border)', borderRadius: '8px', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Coming Soon</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
                More signals in development
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px', lineHeight: 1.7 }}>
                Sector filters, custom alert thresholds, and historical signal accuracy tracking are currently in development.
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
