import type { Metadata } from 'next'
import { Playfair_Display, DM_Mono, DM_Sans } from 'next/font/google'
import './globals.css'
import './home.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bourbonpour.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Bourbon Pour — Data Is The New Currency™',
    template: '%s — Bourbon Pour',
  },
  description:
    'Institutional-grade market intelligence, disruption signals, and evidence-scored analysis — daily. Built for the sharpest minds in finance and technology.',
  openGraph: {
    title: 'Bourbon Pour — Data Is The New Currency™',
    description:
      'Evidence-scored finance and technology intelligence for serious professionals.',
    type: 'website',
    url: siteUrl,
    siteName: 'Bourbon Pour',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bourbon Pour — Data Is The New Currency™',
    description: 'Evidence-scored finance and technology intelligence for serious professionals.',
  },
  alternates: {
    canonical: siteUrl,
    types: {
      'application/rss+xml': `${siteUrl}/rss.xml`,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmMono.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
