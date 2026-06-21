import { createClient } from '@supabase/supabase-js'

interface PublicationScore {
  publication: string
  avg_score: number
  article_count: number
}

async function getLeaderboard(): Promise<PublicationScore[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data } = await supabase
    .from('tipsy_reads')
    .select('publication, proof_score')
    .eq('status', 'published')
    .not('proof_score', 'is', null)
    .not('publication', 'is', null)

  if (!data || data.length === 0) return []

  // Aggregate by publication
  const map: Record<string, { total: number; count: number }> = {}
  for (const row of data) {
    if (!row.publication || !row.proof_score) continue
    const pub = row.publication.trim()
    if (!map[pub]) map[pub] = { total: 0, count: 0 }
    map[pub].total += row.proof_score
    map[pub].count += 1
  }

  return Object.entries(map)
    .filter(([, v]) => v.count >= 1)
    .map(([publication, v]) => ({
      publication,
      avg_score: Math.round(v.total / v.count),
      article_count: v.count,
    }))
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, 10)
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? '#059669' : score >= 75 ? '#c8963e' : '#4a9eff'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
      <div style={{ flex: 1, height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '2px' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color, minWidth: '28px' }}>{score}</span>
    </div>
  )
}

export default async function ProofLeaderboard() {
  const leaderboard = await getLeaderboard()

  if (leaderboard.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#444' }}>
        Leaderboard builds automatically as Tipsy Reads are published.
        <br />Publish your first few reads to see rankings.
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
        Proof Score™ Leaderboard
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#666', marginBottom: '16px' }}>
        Publication credibility ranked by editorial scoring across {leaderboard.reduce((s, r) => s + r.article_count, 0)} articles
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {leaderboard.map((row, i) => (
          <div key={row.publication} style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0f0f0f' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: i < 3 ? '#c8963e' : '#333' }}>
              {i + 1}
            </span>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#e8dcc8', fontWeight: 600, marginBottom: '5px' }}>
                {row.publication}
              </div>
              <ScoreBar score={row.avg_score} />
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#666' }}>
                {row.article_count} article{row.article_count !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', padding: '10px 12px', background: '#0a0a0a', borderRadius: '5px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', lineHeight: 1.6 }}>
        Rankings update automatically as new Tipsy Reads are published · Proof Score is an editorial credibility metric, not a financial rating
      </div>
    </div>
  )
}
