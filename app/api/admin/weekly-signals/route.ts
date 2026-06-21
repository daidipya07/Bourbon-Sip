import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase'

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

// Admin can also manually trigger signal generation
export async function POST() {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/cron/weekly-signal`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
