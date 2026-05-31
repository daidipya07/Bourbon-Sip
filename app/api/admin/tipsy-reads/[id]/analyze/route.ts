import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase'
import { analyzeArticle } from '@/lib/tipsy-analyzer'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = getAdminClient()

  // Fetch article
  const { data: article, error: fetchError } = await supabase
    .from('tipsy_reads')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 })
  }

  try {
    const analysis = await analyzeArticle(
      article.title,
      article.publication || 'Unknown',
      article.description || '',
      article.category || 'markets',
      article.source_authority || 70
    )

    // Save analysis back to DB
    const { data: updated, error: updateError } = await supabase
      .from('tipsy_reads')
      .update({ ...analysis, analyzed: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 429 })
  }
}
