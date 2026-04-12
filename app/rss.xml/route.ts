import { getAllArticles } from '@/lib/articles'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bourbonpour.vercel.app'
  const articles = getAllArticles()

  const items = articles
    .map(a => {
      const url = `${siteUrl}/articles/${a.slug}`
      const pubDate = new Date(a.date).toUTCString()
      return `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <description><![CDATA[${a.excerpt}]]></description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${a.categoryLabel}</category>
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bourbon Pour — The Daily Sip</title>
    <description>Evidence-scored finance and technology intelligence. Every article carries a Proof Score.</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<image>
      <url>${siteUrl}/favicon.ico</url>
      <title>Bourbon Pour</title>
      <link>${siteUrl}</link>
    </image>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
