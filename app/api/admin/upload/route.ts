import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const supabase = getAdminClient()
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error } = await supabase.storage
    .from('article-images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabase.storage
    .from('article-images')
    .getPublicUrl(fileName)

  return NextResponse.json({ url: urlData.publicUrl })
}
