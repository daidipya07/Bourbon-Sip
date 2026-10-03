import type { Metadata } from 'next'
import TradingDesk from '@/components/paper/TradingDesk'
import '../terminal/terminal.css'

export const metadata: Metadata = {
  title: 'Paper Trading Desk | Bourbon Pour',
  description: 'Practice trading with $100,000 of virtual cash against real market prices. Educational only.',
}

const SYMBOL_RE = /^[A-Z0-9.:-]{1,20}$/i

export default async function TradePage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; side?: string }>
}) {
  const sp = await searchParams
  const symbol = sp.symbol && SYMBOL_RE.test(sp.symbol) ? sp.symbol.toUpperCase() : undefined
  const side = sp.side === 'sell' ? 'sell' : sp.side === 'buy' ? 'buy' : undefined

  return <TradingDesk initialSymbol={symbol} initialSide={side} />
}
