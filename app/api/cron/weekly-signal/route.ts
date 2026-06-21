import { NextResponse } from 'next/server'
import { runWeeklySignal } from '@/lib/signal-runner'

export const maxDuration = 60

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runWeeklySignal()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('Weekly signal cron error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
