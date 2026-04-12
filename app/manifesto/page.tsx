import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Manifesto',
  description: 'What Bourbon Pour believes about intelligence, evidence, and why most financial media has failed the people it claims to serve.',
}

const beliefs = [
  {
    num: '01',
    title: 'Evidence is not optional.',
    body: `Opinion is cheap. Data is scarce. The financial media ecosystem is built on the former because it is faster, cheaper, and more entertaining. We are built on the latter because entertainment is not why you are here. Every claim on this platform traces back to a source. Every source is independent. Every conclusion is scored. If you cannot prove it, you cannot publish it — full stop.`,
  },
  {
    num: '02',
    title: 'The signal is always early.',
    body: `By the time a development is reported in the financial press, the smart money has already moved. The real edge is not speed — it is the ability to detect signal in data that others have not yet assembled into a coherent picture. Procurement filings, hiring patterns, infrastructure anomalies, regulatory submissions: the future announces itself constantly in public data. Most people are not looking.`,
  },
  {
    num: '03',
    title: 'Data density is a quality signal.',
    body: `A 500-word article with 2 data points and a 3,000-word article with 31 data points are not the same product. They should not be evaluated the same way, and they should not carry the same authority. We measure data density explicitly because we believe it is one of the most underrated indicators of analytical quality. More data, properly sourced, means less room for narrative to fill the gaps that evidence should occupy.`,
  },
  {
    num: '04',
    title: 'Complexity is lazy. Clarity is hard.',
    body: `The most sophisticated analysis should be the most readable. Jargon is a defense mechanism, not a demonstration of expertise. If you cannot explain what the Federal Reserve's balance sheet normalization means for credit spreads in plain language, you do not understand it well enough to explain it. We hold ourselves to this standard. Every piece of intelligence on this platform should be readable by a smart, curious professional — regardless of how technical the underlying data is.`,
  },
  {
    num: '05',
    title: 'Intelligence should compound.',
    body: `The best investment you can make is in your own understanding. A single data point is a fact. A connected network of evidence-scored intelligence is a framework for thinking — one that improves every time a new data point lands. We build Bourbon Pour so that the more you read, the better your mental model becomes. Cross-references are not footnotes; they are the connective tissue of understanding.`,
  },
  {
    num: '06',
    title: 'The data economy is the economy.',
    body: `We are not in a transition period where data becomes important. We are in a period where the transition is already over. Intangible assets — data, models, algorithms, networks — represent over 90% of S&P 500 market value. Every industry is being repriced based on its data position. Every institution that does not understand this is operating with an incomplete map. We exist to provide a better one.`,
  },
  {
    num: '07',
    title: 'Free, forever.',
    body: `Great intelligence should not be locked behind a paywall for the people who would benefit most from it. The Daily Sip is free. The Intelligence Desk is free. The Proof Score methodology is free. We believe that transparency in analytical standards is what earns trust — not scarcity.`,
  },
]

export default function ManifestoPage() {
  return (
    <>
      <Nav variant="hub" />

      <main className="page-main">
        {/* Header */}
        <div style={{ background: 'var(--deep)', padding: '80px 32px 60px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '780px' }}>
            <div className="section-eyebrow">Manifesto</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 900, marginBottom: '20px', lineHeight: 1.05, letterSpacing: '-1px' }}>
              What we believe.
            </h1>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--text-dim)', lineHeight: 1.5, maxWidth: '600px' }}>
              Seven principles that define how we think about intelligence, evidence, and the responsibility of publishing in a world drowning in noise.
            </p>
          </div>
        </div>

        {/* Beliefs */}
        <section style={{ padding: '60px 32px 80px' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {beliefs.map((b, i) => (
              <div
                key={b.num}
                className="fade-up"
                style={{
                  animationDelay: `${i * 0.07}s`,
                  borderTop: '1px solid var(--border)',
                  padding: '44px 0',
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr',
                  gap: '32px',
                  alignItems: 'start',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--amber)', opacity: 0.6, paddingTop: '4px' }}>
                  {b.num}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>
                    {b.title}
                  </h2>
                  <p style={{ fontSize: '17px', color: 'var(--text-dim)', lineHeight: 1.85, margin: 0 }}>
                    {b.body}
                  </p>
                </div>
              </div>
            ))}

            {/* Closing statement */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '44px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '22px', color: 'var(--text)', lineHeight: 1.5, marginBottom: '32px' }}>
                "Data Is The New Currency™. We are here to help you spend it wisely."
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/#sip" className="btn-primary">Subscribe to the Daily Sip →</Link>
                <Link href="/about" className="btn-ghost">About Bourbon Pour</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </>
  )
}
