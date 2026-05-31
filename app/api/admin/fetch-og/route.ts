import { NextResponse } from 'next/server'
import { fetchOGData } from '@/lib/og-fetcher'

export async function POST(request: Request) {
  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const og = await fetchOGData(url)
  return NextResponse.json(og)
}
