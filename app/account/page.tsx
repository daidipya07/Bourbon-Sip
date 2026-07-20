import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import AccountPanel from '@/components/account/AccountPanel'

export const metadata: Metadata = {
  title: 'Account | Bourbon Pour',
  description: 'Free reader account for Bourbon Pour — home of the upcoming paper-trading sandbox.',
}

export default function AccountPage() {
  return (
    <>
      <Nav variant="tool" />
      <main style={{ maxWidth: '520px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '12px' }}>
          Reader Account
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.15, marginBottom: '14px' }}>
          Your seat at the bar.
        </h1>
        <p style={{ color: '#9a9a9a', fontSize: '15px', lineHeight: 1.65, marginBottom: '32px' }}>
          A free account unlocks the upcoming <strong style={{ color: '#cfc3ad' }}>paper-trading sandbox</strong> — practice
          trades with $100,000 of virtual cash against real market data. Educational only: no real money, no brokerage,
          nothing to buy. Ever.
        </p>
        <AccountPanel />
      </main>
      <Footer variant="minimal" />
    </>
  )
}
