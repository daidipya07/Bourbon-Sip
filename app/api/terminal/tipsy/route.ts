import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

// Company-name search terms from a Finnhub profile name — strip corporate
// suffixes so "Apple Inc" → "Apple", "JPMorgan Chase & Co" → "JPMorgan".
function searchTermFromName(name: string): string {
  const cleaned = name
    .replace(/\b(inc|corp|corporation|co|company|ltd|plc|group|holdings|the|sa|nv|ag)\b\.?/gi, '')
    .replace(/[.,&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.split(' ')[0] || name
}

// Tipsy Reads (Bourbon Pour's curated + AI-analyzed news) matched to a ticker by
// company-name / symbol text search. Ties the terminal to the site's editorial edge.
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  if (symbol.includes(':')) return NextResponse.json({ reads: [] })

  // Resolve a company name for a better text match (falls back to the symbol).
  let term = symbol
  const fhKey = process.env.FINNHUB_API_KEY
  if (fhKey) {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${fhKey}`, { next: { revalidate: 86400 } })
      if (res.ok) {
        const p = await res.json()
        if (p.name) term = searchTermFromName(p.name)
      }
    } catch {}
  }

  // Sanitize for the PostgREST or() filter (wildcards are `*` there).
  const safe = term.replace(/[^a-zA-Z0-9 ]/g, '').trim()
  if (safe.length < 2) return NextResponse.json({ reads: [] })

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('tipsy_reads')
      .select('id, title, publication, url, bourbon_take, proof_score, category, article_date')
      .eq('status', 'published')
      .or(`title.ilike.*${safe}*,description.ilike.*${safe}*`)
      .order('proof_score', { ascending: false, nullsFirst: false })
      .limit(6)

    if (error) return NextResponse.json({ reads: [], error: error.message })
    return NextResponse.json({ reads: data || [], term: safe }, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800' },
    })
  } catch (err) {
    return NextResponse.json({ reads: [], error: err instanceof Error ? err.message : 'failed' })
  }
}
