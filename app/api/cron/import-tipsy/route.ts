import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { getAdminClient } from '@/lib/supabase'
import { RSS_FEEDS } from '@/lib/rss-feeds'
import { fetchOGData } from '@/lib/og-fetcher'

const parser = new Parser({ timeout: 8000, headers: { 'User-Agent': 'BourbonPour/1.0' } })

// Finance/Tech relevance keywords
const KEYWORDS = [
  'ai', 'artificial intelligence', 'fed', 'federal reserve', 'interest rate',
  'inflation', 'gdp', 'recession', 'market', 'stocks', 'bond', 'yield',
  'startup', 'ipo', 'acquisition', 'merger', 'crypto', 'bitcoin', 'fintech',
  'bank', 'investment', 'fund', 'capital', 'tech', 'openai', 'google',
  'microsoft', 'apple', 'nvidia', 'regulation', 'policy', 'trade', 'tariff',
  'geopolitics', 'china', 'semiconductor', 'energy', 'oil', 'data',
]

function isRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  return KEYWORDS.some(kw => text.includes(kw))
}

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()
  const imported: string[] = []
  const skipped: string[] = []

  // Get existing URLs to avoid duplicates
  const { data: existing } = await supabase
    .from('tipsy_reads')
    .select('url')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const existingUrls = new Set((existing || []).map(r => r.url))

  // Pull all RSS feeds in parallel (batches of 5)
  const allItems: Array<{
    url: string
    title: string
    description: string
    publication: string
    authority: number
    category: string
    articleDate: string
  }> = []

  const feedBatches = []
  for (let i = 0; i < RSS_FEEDS.length; i += 5) {
    feedBatches.push(RSS_FEEDS.slice(i, i + 5))
  }

  for (const batch of feedBatches) {
    await Promise.all(
      batch.map(async feed => {
        try {
          const parsed = await parser.parseURL(feed.url)
          for (const item of parsed.items.slice(0, 10)) {
            const url = item.link || item.guid || ''
            if (!url || existingUrls.has(url)) continue
            const title = item.title || ''
            const description = item.contentSnippet || item.summary || item.content || ''
            if (!isRelevant(title, description)) continue
            allItems.push({
              url,
              title,
              description: description.slice(0, 500),
              publication: feed.name,
              authority: feed.authority,
              category: feed.category,
              articleDate: item.isoDate || item.pubDate || new Date().toISOString(),
            })
          }
        } catch {
          // Feed failed silently — don't block other feeds
        }
      })
    )
  }

  // Deduplicate by URL across all feeds
  const seen = new Set<string>()
  const unique = allItems.filter(item => {
    if (seen.has(item.url) || existingUrls.has(item.url)) return false
    seen.add(item.url)
    return true
  })

  // Take top 30 by source authority, fetch OG data, store
  const top = unique.sort((a, b) => b.authority - a.authority).slice(0, 30)

  for (const item of top) {
    try {
      const og = await fetchOGData(item.url)
      const { error } = await supabase.from('tipsy_reads').insert({
        url:              item.url,
        title:            og.title || item.title,
        publication:      og.siteName || item.publication,
        description:      og.description || item.description,
        og_image:         og.image,
        category:         item.category,
        source_authority: item.authority,
        article_date:     item.articleDate,
        status:           'suggested',
      })
      if (!error) imported.push(item.url)
    } catch {
      skipped.push(item.url)
    }
  }

  // Discard stale suggestions older than 48 hours
  await supabase
    .from('tipsy_reads')
    .update({ status: 'discarded' })
    .eq('status', 'suggested')
    .lt('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

  return NextResponse.json({
    imported: imported.length,
    skipped: skipped.length,
    total_feeds: RSS_FEEDS.length,
  })
}
