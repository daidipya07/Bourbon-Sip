import { NextResponse } from 'next/server'
import { runRssImport } from '@/lib/rss-importer'

export const maxDuration = 60 // Vercel Pro allows up to 60s; hobby caps at 10s

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runRssImport()
  return NextResponse.json(result)
}
