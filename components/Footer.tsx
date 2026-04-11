import Link from 'next/link'

interface FooterProps {
  variant?: 'full' | 'minimal'
}

export default function Footer({ variant = 'full' }: FooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className="footer-minimal">
        <span className="footer-copy">© 2026 Bourbon Pour Media Inc.</span>
        <Link href="/articles" className="footer-link">← Back to Intelligence Desk</Link>
      </footer>
    )
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="nav-brand" style={{ marginBottom: '4px', display: 'inline-flex' }}>
              <div className="nav-logo" style={{ width: 30, height: 30, fontSize: 16 }}>B</div>
              <div className="nav-wordmark" style={{ fontSize: 15 }}>Bourbon Pour</div>
            </Link>
            <p className="footer-brand-text">
              Sharp, evidence-scored finance and technology intelligence for the sharpest minds in the room.
            </p>
            <div className="footer-tagline">Data Is The New Currency™</div>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Content</div>
            <Link href="/#sip">The Daily Sip™</Link>
            <Link href="/#tipsy">Tipsy Reads™</Link>
            <Link href="/#pours">Latest Pours</Link>
            <Link href="/proof-of-work">Proof of Work™</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Platform</div>
            <Link href="/data-pulse">Data Pulse™</Link>
            <Link href="/disruptor-radar">Disruptor Radar™</Link>
            <Link href="/proof-score">Proof Score™</Link>
            <Link href="/pour-journal">Pour Journal™</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <Link href="#">About</Link>
            <Link href="#">Manifesto</Link>
            <Link href="#">Careers</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </div>
        </div>
        <div className="footer-bar">
          <div className="footer-copy">© 2026 Bourbon Pour Media Inc. All rights reserved.</div>
          <div className="footer-standard">
            <Link href="/proof-score" style={{ color: 'var(--amber)' }}>
              Proof Score™ — The Intelligence Standard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
