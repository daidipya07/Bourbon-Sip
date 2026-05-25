import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = getAdminClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('articles')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
