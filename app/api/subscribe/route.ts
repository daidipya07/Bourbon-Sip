import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const CONFIRM_MSG = 'Almost in — check your inbox and confirm your email to start receiving The Daily Pour 🥃'

// Double opt-in: status "pending" makes Mailchimp send a confirmation email on
// every signup. (Single opt-in "subscribed" adds members SILENTLY — that was
// why nobody received anything.)
export async function POST(request: Request) {
  try {
    const { email, source } = await request.json()

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const apiKey = process.env.MAILCHIMP_API_KEY
    const listId = process.env.MAILCHIMP_LIST_ID
    const dc = process.env.MAILCHIMP_DC || 'us1'

    // If no Mailchimp credentials are set, return a success stub
    // (useful for local dev before you connect Mailchimp)
    if (!apiKey || !listId) {
      console.warn('[subscribe] Mailchimp env vars not set — returning stub success')
      return NextResponse.json({ message: CONFIRM_MSG })
    }

    const base = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}`
    const headers = {
      Authorization: `apikey ${apiKey}`,
      'Content-Type': 'application/json',
    }

    const res = await fetch(`${base}/members`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email_address: email,
        status: 'pending',
        tags: [source],
      }),
    })

    const data = await res.json()

    if (res.ok) {
      return NextResponse.json({ message: CONFIRM_MSG })
    }

    if (data.title === 'Member Exists') {
      // Look up their actual state so the message (and any re-invite) is right.
      const hash = createHash('md5').update(email.toLowerCase()).digest('hex')
      const memberRes = await fetch(`${base}/members/${hash}`, { headers })
      const member = memberRes.ok ? await memberRes.json() : null

      if (member?.status === 'subscribed') {
        return NextResponse.json({
          message: "You're already on the list — The Daily Pour lands whenever three or more new reads drop.",
        })
      }
      if (member?.status === 'pending') {
        return NextResponse.json({
          message: 'You signed up but never confirmed — check your inbox (and spam) for the confirmation email.',
        })
      }
      // Unsubscribed / cleaned / archived → re-invite via double opt-in
      const reinvite = await fetch(`${base}/members/${hash}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ email_address: email, status: 'pending' }),
      })
      if (reinvite.ok) {
        return NextResponse.json({ message: CONFIRM_MSG })
      }
      return NextResponse.json({
        message: 'This address previously unsubscribed. Mailchimp requires you to re-subscribe from the confirmation email — if none arrives, contact us.',
      })
    }

    console.error('[subscribe] Mailchimp error:', data)
    return NextResponse.json(
      { error: 'Could not subscribe. Please try again.' },
      { status: 500 }
    )
  } catch (err) {
    console.error('[subscribe] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
