import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

// Latest published weekly AI macro signal — surfaced in the terminal's Macro tab.
export async function GET() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('weekly_signals')
      .select('week_of, regime, signal_text, published_at')
      .eq('status', 'published')
      .order('week_of', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return NextResponse.json({ signal: null })
    return NextResponse.json({ signal: data }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch {
    return NextResponse.json({ signal: null })
  }
}
