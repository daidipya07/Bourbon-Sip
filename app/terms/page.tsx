import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for Bourbon Pour.',
}

const LAST_UPDATED = 'May 30, 2026'

const sections = [
  {
    title: 'Nature of this site',
    body: `Bourbon Pour is a personal, non-commercial publishing project. It is not a registered business, financial advisory firm, or news organization. The site is operated by an individual for educational and informational purposes only. No revenue is generated from this site.`,
  },
  {
    title: 'Not financial advice',
    body: `Nothing published on Bourbon Pour constitutes financial, investment, legal, or professional advice of any kind. All content is for informational and educational purposes only. The Proof Score™ methodology is an editorial framework for assessing source quality — it is not a guarantee of accuracy or a basis for investment decisions. Always consult a qualified financial professional before making any investment or financial decision.`,
  },
  {
    title: 'Accuracy of information',
    body: `We make reasonable efforts to ensure accuracy and to cite primary sources. However, we make no representations or warranties of any kind about the completeness, accuracy, reliability, or suitability of any information on this site. Any reliance you place on such information is strictly at your own risk. Market data, company information, and analysis may be outdated, incomplete, or contain errors.`,
  },
  {
    title: 'Editorial independence',
    body: `Bourbon Pour is editorially independent. We do not accept payment for coverage, sponsored content, or affiliate arrangements of any kind. The Disruptor Radar and article analysis represent the personal editorial judgment of the author and should not be interpreted as investment signals or recommendations.`,
  },
  {
    title: 'Intellectual property',
    body: `Original written content, analysis, and the Proof Score™ methodology published on Bourbon Pour are the intellectual property of the site operator. You may share links to articles and quote brief excerpts (up to two sentences) with clear attribution. Reproducing full articles or substantial portions without permission is not permitted.`,
  },
  {
    title: 'Third-party links',
    body: `Bourbon Pour may link to external websites and articles for reference. We are not responsible for the content, accuracy, or privacy practices of any third-party sites. Links do not constitute endorsement.`,
  },
  {
    title: 'Newsletter',
    body: `By subscribing to The Daily Sip, you consent to receive periodic email communications from Bourbon Pour. You may unsubscribe at any time via the link in any email. We do not sell subscriber lists.`,
  },
  {
    title: 'Limitation of liability',
    body: `To the fullest extent permitted by law, Bourbon Pour and its operator shall not be liable for any direct, indirect, incidental, or consequential loss or damage arising from your use of this site or reliance on any content published here.`,
  },
  {
    title: 'Governing law',
    body: `These terms are governed by the laws of the United States. Any disputes shall be resolved in the appropriate courts of the United States.`,
  },
  {
    title: 'Changes to these terms',
    body: `We may update these Terms of Use at any time. Changes will be reflected on this page with an updated date. Continued use of the site constitutes acceptance of the revised terms.`,
  },
  {
    title: 'Contact',
    body: `For any questions about these terms, contact: espresso.daily.news@gmail.com`,
  },
]

export default function TermsPage() {
  return (
    <>
      <Nav variant="hub" />

      <main className="page-main">
        <div style={{ background: 'var(--deep)', padding: '60px 32px 48px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <div className="section-eyebrow">Legal</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, marginBottom: '12px' }}>
              Terms of Use
            </h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-faint)' }}>
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </div>

        <section style={{ padding: '60px 32px 80px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <p style={{ fontSize: '16px', color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: '48px', borderLeft: '3px solid var(--amber)', paddingLeft: '20px' }}>
              Bourbon Pour is a personal educational project. Content is for informational purposes only and does not constitute financial advice.
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
              <Link href="/privacy" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--amber)', textDecoration: 'none' }}>
                Privacy Policy →
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
