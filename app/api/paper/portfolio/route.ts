import { NextResponse } from 'next/server'
import { verifyPaperUser, loadPortfolio } from '@/lib/paper'

export const maxDuration = 30

// Full mark-to-market portfolio state for the signed-in user.
export async function GET(request: Request) {
  const userId = await verifyPaperUser(request)
  if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  try {
    const state = await loadPortfolio(userId)
    return NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load portfolio'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
