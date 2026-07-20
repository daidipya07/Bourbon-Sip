import { NextResponse } from 'next/server'
import { buildDailyNewsletter, sendMailchimpCampaign } from '@/lib/newsletter'

export const maxDuration = 60

const MIN_READS = 3

// Daily at 13:00 UTC (see vercel.json). Sends The Daily Pour ONLY when three or
// more reads were published in the last 24h — no-content days send nothing.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await buildDailyNewsletter()

    if (payload.itemCount < MIN_READS) {
      return NextResponse.json({
        sent: false,
        reason: `Only ${payload.itemCount} read(s) published in the last 24h — minimum is ${MIN_READS}.`,
      })
    }

    const { campaignId } = await sendMailchimpCampaign(payload)
    return NextResponse.json({
      sent: true,
      campaignId,
      itemCount: payload.itemCount,
      subject: payload.subject,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[daily-newsletter]', message)
    return NextResponse.json({ sent: false, error: message }, { status: 500 })
  }
}
