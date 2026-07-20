import type { Metadata } from 'next'
import TradingDesk from '@/components/paper/TradingDesk'
import '../terminal/terminal.css'

export const metadata: Metadata = {
  title: 'Paper Trading Desk | Bourbon Pour',
  description: 'Practice trading with $100,000 of virtual cash against real market prices. Educational only.',
}

export default function TradePage() {
  return <TradingDesk />
}
