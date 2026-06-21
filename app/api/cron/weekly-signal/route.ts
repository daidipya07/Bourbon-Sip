import { NextResponse } from 'next/server'
import { getMarketSnapshot } from '@/lib/market-data'
import { generateWeeklySignal } from '@/lib/weekly-signal-generator'
import { getAdminClient } from '@/lib/supabase'

export const maxDuration = 60

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get current market snapshot
    const snapshot = await getMarketSnapshot()

    // Generate AI signal
    const signalText = await generateWeeklySignal(snapshot)

    // Get Friday of current week
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToFriday = (5 - dayOfWeek + 7) % 7
    const friday = new Date(now)
    friday.setDate(now.getDate() + (daysToFriday === 0 ? 0 : daysToFriday))
    const weekOf = friday.toISOString().split('T')[0]

    // Save to Supabase as draft
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('weekly_signals')
      .upsert({
        week_of:       weekOf,
        signal_text:   signalText,
        data_snapshot: snapshot,
        regime:        snapshot.regime,
        status:        'draft',
        generated_at:  new Date().toISOString(),
      }, { onConflict: 'week_of' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, id: data.id, week_of: weekOf, regime: snapshot.regime })
  } catch (err) {
    console.error('Weekly signal cron error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
