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
  title: 'Data Pulse™ — Editorial Market Overview | Bourbon Pour',
  description: 'Editorial macro overview sourced from public FRED and Finnhub data. Not financial advice. Regime classifications and weekly commentary are editorial opinions only.',
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

      {/* Market ticker strip — equity/commodity prices from Finnhub, refresh every 15 min */}
      <MarketStrip initial={snapshot} />

      <main className="page-main">
        {/* Hero */}
        <div style={{ background: 'var(--deep)', padding: '52px 32px 40px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
              Editorial · Prices refresh every 15 min · Macro data via FRED
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '8px' }}>
              Data Pulse™
            </h1>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '18px', color: 'var(--text-dim)', marginBottom: '0' }}>
              A personal editorial view of publicly available macro data.
            </p>
          </div>
        </div>

        {/* Compliance disclaimer — prominent and readable */}
        <div style={{ background: '#0d0d0d', borderBottom: '1px solid #161616', padding: '14px 32px' }}>
          <div className="container">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#555', margin: 0, lineHeight: 1.7 }}>
              <span style={{ color: '#c8963e', fontWeight: 700 }}>Editorial use only.</span>{' '}
              All content on this page is personal commentary on publicly available data — not financial advice, not investment recommendations, and not a solicitation to buy or sell any security.
              Macro regime classifications are editorial opinions, not professional analysis. Equity prices are sourced from Finnhub and may be delayed.
              FRED series (yields, spreads, VIX) are updated daily by the Federal Reserve and reflect the most recently published value, not real-time quotes.
              Weekly signals are AI-generated drafts reviewed and published by the site author. Past signals do not predict future outcomes.
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

              {/* Data sources footnote — readable */}
              <div style={{ marginTop: '40px', padding: '16px 20px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444', lineHeight: 2 }}>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#666' }}>Data sources</span>
                  {' · '}FRED (Federal Reserve Economic Data, public)
                  {' · '}CBOE Volatility Index via FRED
                  {' · '}Finnhub (equity &amp; commodity quotes, may be delayed)
                  {' · '}OpenAI GPT-4o-mini (weekly signal drafts, human-reviewed before publishing)
                </div>
                <div>
                  <span style={{ color: '#666' }}>Disclaimers</span>
                  {' · '}Not financial advice
                  {' · '}Not investment recommendations
                  {' · '}Editorial opinions only
                  {' · '}No guarantee of accuracy or timeliness
                  {' · '}See <a href="/terms" style={{ color: '#555', textDecoration: 'underline' }}>Terms of Use</a> and <a href="/about" style={{ color: '#555', textDecoration: 'underline' }}>About</a>
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
