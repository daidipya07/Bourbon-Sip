import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Bourbon Pour handles your data.',
}

const LAST_UPDATED = 'May 30, 2026'

const sections = [
  {
    title: 'Who we are',
    body: `Bourbon Pour is a personal, non-commercial publishing project focused on finance and technology analysis. It is operated by an individual and is not a registered business entity. The site is free to access and does not generate revenue.`,
  },
  {
    title: 'What information we collect',
    body: `We collect only your email address when you voluntarily subscribe to The Daily Sip newsletter. We do not collect names, payment information, or any other personal data. We do not use tracking cookies, behavioral advertising, or analytics that identify individuals.`,
  },
  {
    title: 'How we use your email address',
    body: `Your email address is used solely to deliver The Daily Sip newsletter. It is stored securely through Mailchimp, our email delivery provider. We do not sell, rent, share, or transfer your email address to any third party for any purpose other than delivering the newsletter you subscribed to.`,
  },
  {
    title: 'Third-party services',
    body: `This site uses Mailchimp to manage email subscriptions. Mailchimp's privacy policy governs how they handle data on our behalf. We use Supabase (a managed database provider) to store published article content — no personal user data is stored in Supabase. The site is hosted on Vercel.`,
  },
  {
    title: 'Your rights',
    body: `You may unsubscribe from the newsletter at any time by clicking the unsubscribe link at the bottom of any email. Upon unsubscribing, your email address will be removed from our active list. If you wish to have your data permanently deleted, contact us at the email below and we will action your request within 14 days.`,
  },
  {
    title: 'Cookies',
    body: `Bourbon Pour does not use advertising cookies or third-party tracking cookies. A session cookie may be set for admin authentication purposes — this is only relevant to the site administrator and is not set for regular visitors.`,
  },
  {
    title: 'Children',
    body: `This site is not directed at children under 13. We do not knowingly collect personal information from children.`,
  },
  {
    title: 'Changes to this policy',
    body: `We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated date. Continued use of the site after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: 'Contact',
    body: `For any privacy-related questions or data deletion requests, contact: bourbonpour@proton.me`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Nav variant="hub" />

      <main className="page-main">
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <div className="section-eyebrow">Legal</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '12px' }}>
              Privacy Policy
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-faint)' }}>
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </div>

        <section style={{ padding: '60px 32px 80px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <p style={{ fontSize: '16px', color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: '48px', borderLeft: '3px solid var(--amber)', paddingLeft: '20px' }}>
              Bourbon Pour is a personal, non-commercial project. We collect the minimum data necessary to operate the newsletter and nothing more.
            </p>

            {sections.map((s, i) => (
              <div key={i} style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
                  {s.title}
                </h2>
                <p style={{ fontSize: '16px', color: 'var(--text-dim)', lineHeight: 1.85, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            ))}

            <div style={{ marginTop: '40px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/terms" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--amber)', textDecoration: 'none' }}>
                Terms of Use →
              </Link>
              <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-faint)', textDecoration: 'none' }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="minimal" />
    </>
  )
}
