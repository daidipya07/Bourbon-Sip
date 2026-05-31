import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { radarData } from '@/lib/data/radar'

export const metadata: Metadata = {
  title: 'Disruptor Radar™ — Companies Worth Watching | Bourbon Pour',
  description: 'Curated signals on companies worth watching — based on public filings, hiring patterns, and data analysis.',
}

export default function DisruptorRadarPage() {
  return (
    <>
      <Nav variant="tool" backHref="/" backLabel="← Home" />

      <main className="page-main">
        {/* Header */}
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-eyebrow">Curated Signals</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '12px' }}>
              Disruptor Radar™
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-dim)', maxWidth: '560px', lineHeight: 1.7 }}>
              Companies worth watching — curated based on public filings, hiring patterns, patent activity, and data signals. Updated as new information becomes available.
            </p>
            <div style={{ display: 'flex', gap: '32px', marginTop: '32px' }}>
              {[
                { val: `${radarData.length}`, label: 'Companies tracked' },
                { val: 'Public', label: 'Data sources' },
                { val: 'Manual', label: 'Curation' },
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Current signals — Manually curated
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['hot', 'rising', 'watch'] as const).map(cls => (
                  <span key={cls} className={`radar-badge badge-${cls}`}>{cls.toUpperCase()}</span>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '28px', padding: '10px 14px', background: 'rgba(200,150,62,0.05)', border: '1px solid rgba(200,150,62,0.12)', borderRadius: '5px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--amber)' }}>Editorial disclaimer: </span>
              All signals and assessments on this page are independent editorial opinions based on publicly available information. They are speculative in nature and do not constitute factual reporting, investment advice, or endorsement of any company. Always conduct your own research.
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
