import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase'

async function auth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  return token && await verifyAdminToken(token)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const supabase = getAdminClient()

  const update: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() }
  if (body.status === 'published' && !body.published_at) {
    update.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('weekly_signals')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
