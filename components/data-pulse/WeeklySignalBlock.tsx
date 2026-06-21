import { createClient } from '@supabase/supabase-js'

interface WeeklySignal {
  id: string
  week_of: string
  signal_text: string
  regime: string
  published_at: string
}

async function getLatestSignal(): Promise<WeeklySignal | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data } = await supabase
    .from('weekly_signals')
    .select('id, week_of, signal_text, regime, published_at')
    .eq('status', 'published')
    .order('week_of', { ascending: false })
    .limit(1)
    .single()

  return data ?? null
}

const regimeColor: Record<string, string> = {
  'risk-on':   '#059669',
  'risk-off':  '#e05252',
  'reflation': '#c8963e',
  'deflation': '#4a9eff',
}

export default async function WeeklySignalBlock() {
  const signal = await getLatestSignal()

  const weekLabel = signal
    ? new Date(signal.week_of).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : null

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(200,150,62,0.08), rgba(200,150,62,0.02))', border: '1px solid rgba(200,150,62,0.15)', borderRadius: '10px', padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#c8963e', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
            Bourbon Pour Weekly Signal
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444' }}>
            AI-analyzed · Reviewed & published by Bourbon Pour
          </div>
        </div>
        {signal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: regimeColor[signal.regime] ?? '#888', background: `${regimeColor[signal.regime] ?? '#888'}15`, padding: '3px 8px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {signal.regime}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#444' }}>
              Week of {weekLabel}
            </span>
          </div>
        )}
      </div>

      {signal ? (
        <>
          <div style={{ borderLeft: '2px solid #c8963e', paddingLeft: '20px' }}>
            {signal.signal_text.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} style={{ fontSize: '15px', color: '#c8b89a', lineHeight: 1.8, margin: '0 0 16px', fontStyle: i === 0 ? 'normal' : 'normal' }}>
                {para}
              </p>
            ))}
          </div>
          <div style={{ marginTop: '16px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#333' }}>
            Editorial commentary on publicly available market data · Not financial advice · Sources: FRED, CBOE, Finnhub
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#444', marginBottom: '8px' }}>
            First signal drops this Friday at 9 AM ET.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#333' }}>
            Weekly macro analysis — published every Friday morning.
          </div>
        </div>
      )}
    </div>
  )
}
