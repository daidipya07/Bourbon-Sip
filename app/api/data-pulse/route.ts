import { NextResponse } from 'next/server'
import { getMarketSnapshot } from '@/lib/market-data'

export const revalidate = 900 // cache 15 minutes

export async function GET() {
  try {
    const snapshot = await getMarketSnapshot()
    return NextResponse.json(snapshot)
  } catch (err) {
    console.error('Data pulse error:', err)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
