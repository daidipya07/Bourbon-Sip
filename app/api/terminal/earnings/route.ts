import { NextResponse } from 'next/server'

interface FinnhubEarning {
  date: string
  symbol: string
  epsEstimate: number | null
  epsActual: number | null
  revenueEstimate: number | null
  revenueActual: number | null
  hour: string
  quarter: number
  year: number
}

// Upcoming week of earnings from Finnhub's calendar (available on free tier).
export async function GET() {
  const key = process.env.FINNHUB_API_KEY
  if (!key) return NextResponse.json({ earnings: [] })

  const from = new Date(Date.now() - 86400 * 1000).toISOString().split('T')[0]
  const to = new Date(Date.now() + 7 * 86400 * 1000).toISOString().split('T')[0]

  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${key}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return NextResponse.json({ earnings: [] })

    const data = await res.json()
    const earnings = ((data.earningsCalendar || []) as FinnhubEarning[])
      .sort((a, b) => a.date.localeCompare(b.date) || a.symbol.localeCompare(b.symbol))
      .slice(0, 120)
      .map(e => ({
        date: e.date,
        symbol: e.symbol,
        epsEstimate: e.epsEstimate,
        epsActual: e.epsActual,
        revenueEstimate: e.revenueEstimate,
        revenueActual: e.revenueActual,
        hour: e.hour || '',
        quarter: e.quarter,
        year: e.year,
      }))

    return NextResponse.json({ earnings }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch {
    return NextResponse.json({ earnings: [] })
  }
}
