import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase'
import AdminLogoutButton from '@/components/admin/LogoutButton'

export const dynamic = 'force-dynamic'

async function getArticles() {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, status, category_label, created_at')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AdminDashboard() {
  const articles = await getArticles()
  const published = articles.filter(a => a.status === 'published').length
  const drafts = articles.filter(a => a.status === 'draft').length

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #1e1e1e' }}>
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 900, color: '#c8963e' }}>Bourbon Pour</div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>Admin Panel</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/" target="_blank" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>View site ↗</Link>
          <AdminLogoutButton />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Total Articles', value: articles.length },
          { label: 'Published', value: published },
          { label: 'Drafts', value: drafts },
        ].map(s => (
          <div key={s.label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '20px 24px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#c8963e', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {[
          { label: 'Tipsy Reads', href: '/admin/tipsy-reads' },
          { label: 'Weekly Signals', href: '/admin/weekly-signals' },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{ fontFamily: 'monospace', fontSize: '12px', color: '#c8963e', border: '1px solid #c8963e33', borderRadius: '5px', padding: '8px 16px', textDecoration: 'none' }}>
            {l.label} →
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Articles</h2>
        <Link
          href="/admin/articles/new"
          style={{
            background: '#c8963e',
            color: '#0a0a0a',
            padding: '10px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          + New Article
        </Link>
      </div>

      {/* Article list */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
        {articles.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#555' }}>
            No articles yet. Create your first one.
          </div>
        ) : (
          articles.map((article, i) => (
            <div
              key={article.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '16px',
                alignItems: 'center',
                padding: '16px 20px',
                borderTop: i === 0 ? 'none' : '1px solid #1a1a1a',
              }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: '#e8dcc8' }}>
                  {article.title}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  {article.slug} · {article.category_label || '—'} · {new Date(article.created_at).toLocaleDateString()}
                </div>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '4px',
                background: article.status === 'published' ? '#1a3a1a' : '#2a2a1a',
                color: article.status === 'published' ? '#4caf50' : '#c8963e',
              }}>
                {article.status}
              </span>
              <Link
                href={`/admin/articles/${article.id}`}
                style={{ fontSize: '13px', color: '#888', textDecoration: 'none', padding: '6px 12px', border: '1px solid #2a2a2a', borderRadius: '4px' }}
              >
                Edit
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
