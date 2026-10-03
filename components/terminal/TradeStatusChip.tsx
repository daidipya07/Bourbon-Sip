'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useSupabaseSession } from '@/lib/useSupabaseSession'
import { usePolling } from './usePolling'

interface Portfolio {
  cash: number
  equity: number
  totalReturnPct: number
}

export default function TradeStatusChip() {
  const { client, session } = useSupabaseSession()

  const fetcher = useCallback(async (): Promise<Portfolio> => {
    const token = (await client?.auth.getSession())?.data.session?.access_token
    const res = await fetch('/api/paper/portfolio', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('portfolio')
    return res.json()
  }, [client])

  const { data } = usePolling(fetcher, { intervalMs: 30_000, enabled: !!session })

  if (session === undefined) return null

  if (!session) {
    return (
      <Link href="/account" className="terminal-statusbar-item t-muted">
        Sign in to trade
      </Link>
    )
  }

  if (!data) return null

  const up = data.totalReturnPct >= 0

  return (
    <Link href="/trade" className="terminal-statusbar-item">
      <span className="t-muted">Cash ${data.cash.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
      <span className="t-muted">·</span>
      <span>Equity ${data.equity.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
      <span className={up ? 't-green' : 't-red'}>
        ({up ? '+' : ''}{data.totalReturnPct.toFixed(2)}%)
      </span>
    </Link>
  )
}
