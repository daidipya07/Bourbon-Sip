import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getAdminClient()
  const { data, error } = await supabase.from('tipsy_reads').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getAdminClient()
  const body = await request.json()

  const now = new Date().toISOString()
  const update: Record<string, unknown> = { ...body, updated_at: now }

  // Set published_at when status first becomes 'published'
  if (body.status === 'published') {
    update.published_at = update.published_at || now
  }

  const { data, error } = await supabase
    .from('tipsy_reads')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getAdminClient()
  const { error } = await supabase.from('tipsy_reads').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
