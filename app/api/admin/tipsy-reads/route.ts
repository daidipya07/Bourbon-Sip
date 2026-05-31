import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'suggested'
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('tipsy_reads')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = getAdminClient()
  const body = await request.json()

  const now = new Date().toISOString()
  const record: Record<string, unknown> = { ...body }
  if (body.status === 'published' && !body.published_at) {
    record.published_at = now
  }

  const { data, error } = await supabase
    .from('tipsy_reads')
    .insert([record])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
