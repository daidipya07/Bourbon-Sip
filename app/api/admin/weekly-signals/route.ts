import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase'
import { runWeeklySignal } from '@/lib/signal-runner'

async function auth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  return token && await verifyAdminToken(token)
}

export async function GET() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('weekly_signals')
    .select('id, week_of, regime, status, signal_text, generated_at, published_at')
    .order('week_of', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export const maxDuration = 60

export async function POST() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await runWeeklySignal()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
