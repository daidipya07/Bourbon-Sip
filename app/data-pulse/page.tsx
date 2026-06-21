import { Suspense } from 'react'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import MarketStrip from '@/components/data-pulse/MarketStrip'
import RegimeIndicator from '@/components/data-pulse/RegimeIndicator'
import StressGauges from '@/components/data-pulse/StressGauges'
import ProofLeaderboard from '@/components/data-pulse/ProofLeaderboard'
import WeeklySignalBlock from '@/components/data-pulse/WeeklySignalBlock'
import { getMarketSnapshot } from '@/lib/market-data'

export const metadata: Metadata = {
  title: 'Data Pulse™ — Live Market Intelligence | Bourbon Pour',
  description: 'Real-time macro regime classification, stress indicators sourced from FRED & CBOE, and AI-generated weekly market signal. Editorial market intelligence.',
}

// Revalidate every 15 minutes
export const revalidate = 900

const REGIME_COLOR: Record<string, string> = {
  'risk-on':   '#059669',
  'risk-off':  '#e05252',
  'reflation': '#c8963e',
  'deflation': '#4a9eff',
}

const REGIME_LABEL: Record<string, string> = {
  'risk-on':   'Risk-On',
  'risk-off':  'Risk-Off',
  'reflation': 'Reflation',
  'deflation': 'Deflation',
}

export default async function DataPulsePage() {
  const snapshot = await getMarketSnapshot()
  const regime = snapshot.regime
  const regimeColor = REGIME_COLOR[regime] ?? '#888'
  const regimeLabel = REGIME_LABEL[regime] ?? regime

  return (
    <>
      <Nav variant="tool" backHref="/" backLabel="← Home" />

      {/* Live market ticker strip */}
      <MarketStrip initial={snapshot} />

      <main className="page-main">
        {/* Hero */}
        <div style={{ background: 'var(--deep)', padding: '52px 32px 40px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
              Live · Updated every 15 min
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '8px' }}>
              Data Pulse™
            </h1>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '18px', color: 'var(--text-dim)', marginBottom: '0' }}>
              Institutional-grade macro intelligence — powered by FRED, CBOE, and GPT-4o.
            </p>
          </div>
        </div>

        <section style={{ padding: '48px 32px 80px' }}>
          <div className="container">
            <div style={{ maxWidth: '900px' }}>

              {/* Macro Regime */}
              <RegimeIndicator
                regime={regime}
                regimeLabel={regimeLabel}
                regimeColor={regimeColor}
              />

              {/* Two-column layout: Stress Gauges + Leaderboard */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>

                {/* Left: Stress Indicators */}
                <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '28px' }}>
                  <StressGauges data={snapshot} />
                </div>

                {/* Right: Proof Score Leaderboard */}
                <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '28px' }}>
                  <Suspense fallback={
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#333', padding: '20px 0' }}>
                      Loading leaderboard…
                    </div>
                  }>
                    <ProofLeaderboard />
                  </Suspense>
                </div>
              </div>

              {/* Weekly Signal — full width */}
              <Suspense fallback={
                <div style={{ background: 'linear-gradient(135deg, rgba(200,150,62,0.08), rgba(200,150,62,0.02))', border: '1px solid rgba(200,150,62,0.15)', borderRadius: '10px', padding: '32px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#333' }}>
                  Loading weekly signal…
                </div>
              }>
                <WeeklySignalBlock />
              </Suspense>

              {/* Data sources footnote */}
              <div style={{ marginTop: '40px', padding: '16px 20px', background: '#080808', border: '1px solid #111', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#2a2a2a', lineHeight: 1.8 }}>
                <span style={{ color: '#333' }}>Data sources:</span> FRED (Federal Reserve Economic Data) · CBOE (VIX) · Finnhub (equity/commodity quotes) · OpenAI GPT-4o-mini (weekly signal generation)
                &nbsp;·&nbsp; All data is for editorial and informational purposes only · Not financial advice · Not real-time for FRED series
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </>
  )
}
