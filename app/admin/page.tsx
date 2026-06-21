import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  const supabase = getAdminClient()

  const [articles, tipsyReads, weeklySignals] = await Promise.all([
    supabase.from('articles').select('id, title, slug, status, category_label, created_at').order('created_at', { ascending: false }),
    supabase.from('tipsy_reads').select('id, status, proof_score, analyzed').order('created_at', { ascending: false }),
    supabase.from('weekly_signals').select('id, week_of, regime, status, generated_at').order('generated_at', { ascending: false }).limit(5),
  ])

  return {
    articles: articles.data || [],
    tipsyReads: tipsyReads.data || [],
    weeklySignals: weeklySignals.data || [],
  }
}

const REGIME_COLOR: Record<string, string> = {
  'risk-on':   '#059669',
  'risk-off':  '#e05252',
  'reflation': '#c8963e',
  'deflation': '#4a9eff',
}

export default async function AdminDashboard() {
  const { articles, tipsyReads, weeklySignals } = await getDashboardStats()

  const articlesPublished = articles.filter(a => a.status === 'published').length
  const articlesDraft     = articles.filter(a => a.status === 'draft').length

  const readsPublished  = tipsyReads.filter(r => r.status === 'published').length
  const readsSuggested  = tipsyReads.filter(r => r.status === 'suggested').length
  const readsUnanalyzed = tipsyReads.filter(r => r.status === 'suggested' && !r.analyzed).length

  const signalsDraft     = weeklySignals.filter(s => s.status === 'draft').length
  const signalsPublished = weeklySignals.filter(s => s.status === 'published').length

  const recentArticles = articles.slice(0, 5)

  return (
    <div style={{ padding: '36px 40px', maxWidth: '1000px' }}>
      {/* Page title */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 900, color: '#e8dcc8', margin: '0 0 4px' }}>
          Dashboard
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#333', margin: 0 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Section cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>

        {/* Articles card */}
        <Link href="/admin/articles" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '24px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Articles</span>
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#c8963e' }}>✦</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 700, color: '#e8dcc8' }}>{articlesPublished}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#059669' }}>Published</div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 700, color: '#e8dcc8' }}>{articlesDraft}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#c8963e' }}>Drafts</div>
              </div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c8963e' }}>Manage articles →</div>
          </div>
        </Link>

        {/* Tipsy Reads card */}
        <Link href="/admin/tipsy-reads" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#0f0f0f', border: `1px solid ${readsSuggested > 0 ? '#c8963e44' : '#1a1a1a'}`, borderRadius: '10px', padding: '24px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Tipsy Reads</span>
              {readsUnanalyzed > 0 && (
                <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#e05252', background: '#e0525222', padding: '2px 8px', borderRadius: '3px' }}>
                  {readsUnanalyzed} need review
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 700, color: '#e8dcc8' }}>{readsPublished}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#059669' }}>Published</div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 700, color: '#e8dcc8' }}>{readsSuggested}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#c8963e' }}>Pending</div>
              </div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c8963e' }}>Review queue →</div>
          </div>
        </Link>

        {/* Weekly Signals card */}
        <Link href="/admin/weekly-signals" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#0f0f0f', border: `1px solid ${signalsDraft > 0 ? '#4a9eff44' : '#1a1a1a'}`, borderRadius: '10px', padding: '24px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Weekly Signals</span>
              {signalsDraft > 0 && (
                <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#4a9eff', background: '#4a9eff22', padding: '2px 8px', borderRadius: '3px' }}>
                  {signalsDraft} draft
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 700, color: '#e8dcc8' }}>{signalsPublished}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#059669' }}>Published</div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 700, color: '#e8dcc8' }}>{signalsDraft}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4a9eff' }}>Drafts</div>
              </div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c8963e' }}>Review signals →</div>
          </div>
        </Link>
      </div>

      {/* Two-column lower section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Recent articles */}
        <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #141414' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', fontWeight: 600 }}>Recent Articles</span>
            <Link href="/admin/articles/new" style={{ fontFamily: 'monospace', fontSize: '10px', color: '#c8963e', textDecoration: 'none', background: '#c8963e15', padding: '4px 10px', borderRadius: '4px' }}>
              + New
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <div style={{ padding: '32px 20px', fontFamily: 'monospace', fontSize: '12px', color: '#333', textAlign: 'center' }}>
              No articles yet
            </div>
          ) : (
            recentArticles.map((a, i) => (
              <Link key={a.id} href={`/admin/articles/${a.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: i === 0 ? 'none' : '1px solid #0f0f0f', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#c8b89a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.title || 'Untitled'}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#333', marginTop: '2px' }}>
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '9px', flexShrink: 0, color: a.status === 'published' ? '#059669' : '#c8963e', background: a.status === 'published' ? '#05966922' : '#c8963e22', padding: '2px 7px', borderRadius: '3px', textTransform: 'uppercase' }}>
                    {a.status}
                  </span>
                </div>
              </Link>
            ))
          )}
          {articles.length > 5 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #141414' }}>
              <Link href="/admin/articles" style={{ fontFamily: 'monospace', fontSize: '10px', color: '#444', textDecoration: 'none' }}>
                View all {articles.length} articles →
              </Link>
            </div>
          )}
        </div>

        {/* Recent weekly signals */}
        <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #141414' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', fontWeight: 600 }}>Recent Signals</span>
            <Link href="/admin/weekly-signals" style={{ fontFamily: 'monospace', fontSize: '10px', color: '#c8963e', textDecoration: 'none', background: '#c8963e15', padding: '4px 10px', borderRadius: '4px' }}>
              Manage
            </Link>
          </div>
          {weeklySignals.length === 0 ? (
            <div style={{ padding: '32px 20px', fontFamily: 'monospace', fontSize: '12px', color: '#333', textAlign: 'center' }}>
              No signals yet.<br />
              <Link href="/admin/weekly-signals" style={{ color: '#c8963e', textDecoration: 'none' }}>Generate first signal →</Link>
            </div>
          ) : (
            weeklySignals.map((s, i) => (
              <Link key={s.id} href="/admin/weekly-signals" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: i === 0 ? 'none' : '1px solid #0f0f0f', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#c8b89a', fontWeight: 600 }}>
                      Week of {new Date(s.week_of).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '9px', color: REGIME_COLOR[s.regime] ?? '#888' }}>{s.regime}</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '9px', flexShrink: 0, color: s.status === 'published' ? '#059669' : s.status === 'draft' ? '#4a9eff' : '#333', background: s.status === 'published' ? '#05966922' : s.status === 'draft' ? '#4a9eff22' : '#33333322', padding: '2px 7px', borderRadius: '3px', textTransform: 'uppercase' }}>
                    {s.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

      </div>

      {/* Quick actions row */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link href="/admin/articles/new" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#e8dcc8', background: '#c8963e', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700 }}>
          + New Article
        </Link>
        <Link href="/admin/tipsy-reads" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#c8963e', border: '1px solid #c8963e33', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none' }}>
          Review Tipsy Reads
        </Link>
        <Link href="/admin/weekly-signals" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4a9eff', border: '1px solid #4a9eff33', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none' }}>
          Weekly Signals
        </Link>
      </div>

    </div>
  )
}
