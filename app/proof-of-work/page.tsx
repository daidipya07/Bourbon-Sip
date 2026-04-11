import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Proof of Work™ — Community Intelligence | Bourbon Pour',
  description: 'Community-validated intelligence signals. Sources, tips, and research submitted by the Bourbon Pour community — all evidence-scored.',
}

export default function ProofOfWorkPage() {
  return (
    <>
      <Nav variant="tool" backHref="/" backLabel="← Home" />

      <main className="page-main">
        {/* Header */}
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-eyebrow">Community Intelligence</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '12px' }}>
              Proof of Work™
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-dim)', maxWidth: '560px', lineHeight: 1.7 }}>
              Intelligence validated by the community. Tips, signals, and research submitted by Bourbon Pour readers — all evidence-scored and reviewed before publication.
            </p>
          </div>
        </div>

        <section style={{ padding: '80px 32px' }}>
          <div className="container" style={{ maxWidth: '780px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🥃</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
              Coming Soon
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-dim)', marginBottom: '32px', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 32px' }}>
              Proof of Work™ is the community intelligence layer currently in development. Submit signals, validate community tips, and earn contributor credit when your intelligence proves accurate.
            </p>
            <Link href="/#sip" className="btn-primary">Subscribe Free</Link>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </>
  )
}
