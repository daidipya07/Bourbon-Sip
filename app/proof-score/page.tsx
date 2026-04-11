import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Proof Score™ — The Intelligence Standard | Bourbon Pour',
  description: 'Every piece of intelligence we publish carries a Proof Score. Here\'s exactly how we calculate it.',
}

const pillars = [
  {
    num: '01',
    name: 'Data Density',
    abbr: 'DD',
    weight: '35%',
    color: 'var(--green)',
    desc: 'How many verifiable, quantitative data points support the core claim? More primary-source numbers = higher density.',
    examples: ['Primary data sources', 'Quantitative evidence', 'Verifiable statistics', 'Official filings cited'],
  },
  {
    num: '02',
    name: 'Cross-Reference Score',
    abbr: 'XR',
    weight: '30%',
    color: 'var(--blue)',
    desc: 'How many independent sources corroborate the signal? True convergence requires orthogonal data sources that reach the same conclusion independently.',
    examples: ['Independent source count', 'Source type diversity', 'Institutional validation', 'Corroborating signals'],
  },
  {
    num: '03',
    name: 'Recency Weight',
    abbr: 'RW',
    weight: '20%',
    color: 'var(--amber)',
    desc: 'How fresh is the underlying data? Markets move fast. Intelligence degrades. A 90-day-old signal is worth less than today\'s filing.',
    examples: ['Data publication date', 'Signal detection lag', 'Source update frequency', 'Real-time validation'],
  },
  {
    num: '04',
    name: 'Analyst Conviction',
    abbr: 'AC',
    weight: '15%',
    color: 'var(--red)',
    desc: 'Our editorial team\'s subjective confidence adjustment — applied only when primary data creates ambiguity. Used sparingly.',
    examples: ['Internal peer review', 'Domain expert validation', 'Pattern recognition history', 'Contextual analysis'],
  },
]

const tiers = [
  { range: '90–100', label: 'Conviction Grade', color: 'var(--green)', desc: 'Act with high confidence. Multiple primary sources, strong corroboration, recent data.' },
  { range: '75–89',  label: 'Evidence Grade',   color: 'var(--green)', desc: 'Strong data backing. Minor gaps in sourcing or recency. Worth acting on with normal due diligence.' },
  { range: '60–74',  label: 'Signal Grade',     color: 'var(--amber)', desc: 'Emerging pattern. Real signal but incomplete corroboration. Monitor and position lightly.' },
  { range: '40–59',  label: 'Watch Grade',      color: 'var(--amber)', desc: 'Early indicator. Single source or aging data. Set alerts; don\'t act yet.' },
  { range: '0–39',   label: 'Developing',       color: 'var(--red)',   desc: 'Noise level. Not enough evidence to call a signal. Published for transparency only.' },
]

export default function ProofScorePage() {
  return (
    <>
      <Nav variant="tool" backHref="/" backLabel="← Home" />

      <main className="page-main">
        {/* Hero */}
        <div style={{ background: 'var(--deep)', padding: '80px 32px 60px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '780px' }}>
            <div className="section-eyebrow">Methodology</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: '16px' }}>
              Proof Score™
            </h1>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--text-dim)', marginBottom: '24px' }}>
              The intelligence standard that separates signal from noise.
            </p>
            <p style={{ fontSize: '16px', color: 'var(--text-dim)', lineHeight: 1.75, maxWidth: '600px' }}>
              Every piece of intelligence Bourbon Pour publishes carries a Proof Score — a 0–100 rating that tells you exactly how much weight to give it. No editorial bias. No hidden methodology. Here&apos;s precisely how we calculate it.
            </p>
          </div>
        </div>

        {/* Formula */}
        <section style={{ padding: '80px 32px', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '780px' }}>
            <div className="section-eyebrow">The Formula</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginBottom: '32px' }}>
              Four pillars. One score.
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', color: 'var(--text)', background: 'var(--deep)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px 32px', marginBottom: '48px', lineHeight: 2 }}>
              <span style={{ color: 'var(--amber-light)' }}>Proof Score</span>
              {' = '}
              <span style={{ color: 'var(--green)' }}>(DD × 0.35)</span>
              {' + '}
              <span style={{ color: 'var(--blue)' }}>(XR × 0.30)</span>
              {' + '}
              <span style={{ color: 'var(--amber)' }}>(RW × 0.20)</span>
              {' + '}
              <span style={{ color: 'var(--red)' }}>(AC × 0.15)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {pillars.map(p => (
                <div key={p.num} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: p.color }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{p.num} — {p.abbr}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>{p.name}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 500, color: p.color }}>{p.weight}</div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '16px' }}>{p.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {p.examples.map(ex => (
                      <span key={ex} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)', padding: '3px 8px', border: '1px solid var(--border)', borderRadius: '3px' }}>{ex}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scale */}
        <section style={{ padding: '80px 32px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '780px' }}>
            <div className="section-eyebrow">The Scale</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginBottom: '40px' }}>What the numbers mean.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tiers.map(t => (
                <div key={t.range} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '20px', alignItems: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px 24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 500, color: t.color }}>{t.range}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: t.color, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{t.label}</div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 32px', background: 'linear-gradient(135deg, rgba(196,122,42,0.12), rgba(196,122,42,0.04))', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>
              Intelligence with a <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>standard.</em>
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-dim)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.7 }}>
              Every Bourbon Pour article shows its Proof Score, sub-scores, and sources. You decide how much weight to give it.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/articles" className="btn-primary">Read the Intelligence Desk</Link>
              <Link href="/#sip" className="btn-ghost">Subscribe Free</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </>
  )
}
