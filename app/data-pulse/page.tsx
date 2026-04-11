import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import GaugeGrid from '@/components/GaugeGrid'
import SparklineChart from '@/components/charts/SparklineChart'
import ProofBarAnimated from '@/components/ProofBarAnimated'

export const metadata: Metadata = {
  title: 'Data Pulse™ — Live Market Intelligence | Bourbon Pour',
  description: 'Real-time market intelligence gauges. AI Spend Velocity, Fed Sentiment Index, Startup Funding Heat, and Macro Stress Score.',
}

export default function DataPulsePage() {
  return (
    <>
      <Nav variant="tool" backHref="/" backLabel="← Home" />

      <main className="page-main">
        {/* Hero */}
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-eyebrow">Live Intelligence</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '8px' }}>
              Data Pulse™
            </h1>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '18px', color: 'var(--text-dim)', marginBottom: '0' }}>
              Feel the market moving before it moves.
            </p>
          </div>
        </div>

        <section style={{ padding: '60px 32px' }}>
          <div className="container">
            <div style={{ maxWidth: '860px' }}>

              {/* Main gauge card */}
              <div className="dp-card" style={{ marginBottom: '32px' }}>
                <div className="dp-header">
                  <div className="dp-title">Data Pulse™ — Live</div>
                  <div className="dp-time">Updates every 4 seconds</div>
                </div>
                <GaugeGrid />
                <SparklineChart />
                <div className="dp-proof">
                  <div className="dp-proof-label">
                    <span>Methodology Proof Score™</span>
                    <span>91 / 100</span>
                  </div>
                  <ProofBarAnimated target={91} delay={600} />
                </div>
              </div>

              {/* What each gauge means */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '48px' }}>
                {[
                  { name: 'AI Spend Velocity', color: 'var(--green)', desc: 'Aggregated enterprise AI budget allocation signals from procurement filings, hiring data, and cloud spend patterns. A score above 75 indicates accelerating spend cycles.' },
                  { name: 'Fed Sentiment Index', color: 'var(--amber)', desc: 'Composite of Fed communication frequency, language analysis, and bond market positioning. Neutral (50) suggests balanced risk; extremes signal policy pivots.' },
                  { name: 'Startup Funding Heat', color: 'var(--green)', desc: 'Venture deal flow, valuation multiples, and secondary market premiums aggregated across sectors. Tracks forward-looking risk appetite in private markets.' },
                  { name: 'Macro Stress Score', color: 'var(--red)', desc: 'Inverse stress index — lower scores indicate higher stress. Combines credit spreads, volatility surfaces, and cross-asset correlation breakdowns.' },
                ].map(g => (
                  <div key={g.name} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: g.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{g.name}</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{g.desc}</p>
                  </div>
                ))}
              </div>

              {/* Upgrade CTA */}
              <div style={{ background: 'linear-gradient(135deg, rgba(196,122,42,0.12), rgba(196,122,42,0.04))', border: '1px solid var(--border)', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Pro Feature</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                  Full Data Pulse — 6 live gauges + sector overlays
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
                  Upgrade to Proof Pro for the complete dashboard: Energy Stress, Credit Spread Index, sector-specific heat maps, and custom alert thresholds.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <Link href="/#pricing" className="btn-primary">Upgrade to Pro — $19/mo</Link>
                  <Link href="/#sip" className="btn-ghost">Subscribe Free</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </>
  )
}
