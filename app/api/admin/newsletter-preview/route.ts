import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/auth'
import { buildDailyNewsletter } from '@/lib/newsletter'

export const maxDuration = 60

// Renders exactly what today's Daily Pour would look like — same builder, same
// data, no send. Open /api/admin/newsletter-preview in the browser while
// logged in to verify content before the cron ever mails it.
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await buildDailyNewsletter()
    return new NextResponse(payload.html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Newsletter-Items': String(payload.itemCount),
        'X-Newsletter-Would-Send': String(payload.itemCount >= 3),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
