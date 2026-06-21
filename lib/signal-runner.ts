// Shared signal generation logic — called by both the cron route and the admin route
// Avoids internal HTTP fetch between serverless functions (unreliable on Vercel)

import { getMarketSnapshot } from './market-data'
import { generateWeeklySignal } from './weekly-signal-generator'
import { getAdminClient } from './supabase'

export async function runWeeklySignal(): Promise<{ id: string; week_of: string; regime: string }> {
  const snapshot = await getMarketSnapshot()
  const signalText = await generateWeeklySignal(snapshot)

  // Get Friday of current week (or today if it is Friday)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysToFriday = dayOfWeek === 5 ? 0 : (5 - dayOfWeek + 7) % 7
  const friday = new Date(now)
  friday.setDate(now.getDate() + daysToFriday)
  const weekOf = friday.toISOString().split('T')[0]

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

  return { id: data.id, week_of: weekOf, regime: snapshot.regime }
}
