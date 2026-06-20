'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type NavVariant = 'home' | 'hub' | 'tool' | 'article'

interface NavProps {
  variant?: NavVariant
  backHref?: string
  backLabel?: string
}

export default function Nav({
  variant = 'home',
  backHref = '/articles',
  backLabel = '← Intelligence Desk',
}: NavProps) {
  // Initialize to empty string — only set on client to avoid SSR hydration mismatch
  const [clock, setClock] = useState('')

  useEffect(() => {
    function updateClock() {
      const n = new Date()
      const et = new Date(n.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const t =
        String(et.getHours()).padStart(2, '0') +
        ':' +
        String(et.getMinutes()).padStart(2, '0') +
        ':' +
        String(et.getSeconds()).padStart(2, '0') +
        ' ET'
      setClock(t)
    }
    updateClock()
    const id = setInterval(updateClock, 1000)
    return () => clearInterval(id)
  }, [])

  if (variant === 'article') {
    return (
      <nav className="nav" style={{ '--nav-h': '56px' } as React.CSSProperties}>
        <Link href="/" className="nav-brand">
          <div className="nav-logo nav-logo-sm">B</div>
          <div className="nav-wordmark nav-wordmark-sm">Bourbon Pour</div>
        </Link>
        <div className="nav-right nav-right-sm">
          <Link href={backHref} className="nav-back">{backLabel}</Link>
          <Link href="/#sip" className="btn-primary btn-primary-sm">Subscribe Free</Link>
        </div>
      </nav>
    )
  }

  if (variant === 'hub' || variant === 'tool') {
    return (
      <nav className="nav" style={{ '--nav-h': '56px' } as React.CSSProperties}>
        <Link href="/" className="nav-brand">
          <div className="nav-logo nav-logo-sm">B</div>
          <div className="nav-wordmark nav-wordmark-sm">Bourbon Pour</div>
        </Link>
        {variant === 'tool' && (
          <div className="nav-right nav-right-sm">
            <Link href={backHref} className="nav-back">{backLabel}</Link>
            <Link href="/#sip" className="btn-primary btn-primary-sm">Subscribe Free</Link>
          </div>
        )}
        {variant === 'hub' && (
          <div className="nav-right nav-right-sm">
            <Link href="/#sip" className="btn-primary btn-primary-sm">Subscribe Free</Link>
          </div>
        )}
      </nav>
    )
  }

  // Default: home variant — full nav with links, live dot, clock
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <div className="nav-logo">B</div>
        <div className="nav-wordmark">Bourbon Pour</div>
      </Link>
      <div className="nav-links">
        <Link href="/#sip">Daily Sip</Link>
        <Link href="/tipsy-reads">Tipsy Reads</Link>
        <Link href="/articles">Intelligence Desk</Link>
        <Link href="/data-pulse">Data Pulse</Link>
        <Link href="/#radar">Disruptor Radar</Link>
        <Link href="/proof-score">Proof Score</Link>
      </div>
      <div className="nav-right">
        <div className="nav-live">
          <div className="live-dot"></div>
          Markets Live
        </div>
        <div className="nav-clock">{clock || '--:--:-- ET'}</div>
        <Link href="/#sip" className="btn-primary">Subscribe Free</Link>
      </div>
    </nav>
  )
}
