import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase()
  const category = req.nextUrl.searchParams.get('category') || 'general' // general, forex, crypto, merger

  const key = process.env.FINNHUB_API_KEY
  if (!key) return NextResponse.json({ error: 'API key not configured' }, { status: 500 })

  try {
    let url: string
    if (symbol) {
      // Company-specific news (last 7 days)
      const to = new Date().toISOString().split('T')[0]
      const from = new Date(Date.now() - 7 * 86400 * 1000).toISOString().split('T')[0]
      url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${key}`
    } else {
      // General market news
      url = `https://finnhub.io/api/v1/news?category=${encodeURIComponent(category)}&token=${key}`
    }

    const res = await fetch(url)
    if (!res.ok) return NextResponse.json({ news: [] })

    const data = await res.json()

    const news = (Array.isArray(data) ? data : [])
      .slice(0, 30)
      .map((item: { id: number; headline: string; summary: string; source: string; url: string; datetime: number; image: string; category: string; related: string }) => ({
        id: item.id,
        headline: item.headline,
        summary: item.summary?.slice(0, 200) || '',
        source: item.source,
        url: item.url,
        timestamp: item.datetime,
        image: item.image || null,
        category: item.category || category,
        related: item.related || symbol || '',
      }))

    return NextResponse.json({ news }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ news: [] })
  }
}
