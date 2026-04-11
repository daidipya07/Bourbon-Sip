import { NextResponse } from 'next/server'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

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
      return NextResponse.json({
        message: "You're in. First Sip drops tomorrow at 6:30 AM ET 🥃",
      })
    }

    const res = await fetch(
      `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          tags: [source],
        }),
      }
    )

    const data = await res.json()

    if (res.ok) {
      return NextResponse.json({
        message: "You're in. First Sip drops tomorrow at 6:30 AM ET 🥃",
      })
    }

    // Mailchimp returns 400 for "Member Exists"
    if (data.title === 'Member Exists') {
      return NextResponse.json({
        message: "You're already on the list — first Sip tomorrow at 6:30 AM ET.",
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
