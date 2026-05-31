import Parser from 'rss-parser'
import { getAdminClient } from '@/lib/supabase'
import { RSS_FEEDS } from '@/lib/rss-feeds'
import { fetchOGData } from '@/lib/og-fetcher'

const parser = new Parser({ timeout: 8000, headers: { 'User-Agent': 'BourbonPour/1.0' } })

const KEYWORDS = [
  'ai', 'artificial intelligence', 'fed', 'federal reserve', 'interest rate',
  'inflation', 'gdp', 'recession', 'market', 'stocks', 'bond', 'yield',
  'startup', 'ipo', 'acquisition', 'merger', 'crypto', 'bitcoin', 'fintech',
  'bank', 'investment', 'fund', 'capital', 'tech', 'openai', 'google',
  'microsoft', 'apple', 'nvidia', 'regulation', 'policy', 'trade', 'tariff',
  'geopolitics', 'china', 'semiconductor', 'energy', 'oil', 'data',
]

const JUNK_TITLES = [
  'just a moment', 'access denied', 'subscribe to read', 'sign in',
  'please enable javascript', '403 forbidden', '404 not found',
  'page not found', 'attention required', 'are you a robot',
  'verify you are human', 'loading...', 'redirecting',
]

function isRelevant(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  return KEYWORDS.some(kw => text.includes(kw))
}

function isJunkTitle(title: string): boolean {
  const t = title.toLowerCase().trim()
  return !t || JUNK_TITLES.some(j => t.includes(j)) || t.length < 10
}

export async function runRssImport(): Promise<{ saved: number; skipped: number; total_feeds: number }> {
  const supabase = getAdminClient()
  const imported: string[] = []
  const skipped: string[] = []

  // Get existing URLs to avoid duplicates (last 7 days)
  const { data: existing } = await supabase
    .from('tipsy_reads')
    .select('url')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const existingUrls = new Set((existing || []).map((r: { url: string }) => r.url))

  // Pull all RSS feeds in batches of 5
  const allItems: Array<{
    url: string; title: string; description: string
    publication: string; authority: number; category: string; articleDate: string
  }> = []

  const feedBatches: typeof RSS_FEEDS[] = []
  for (let i = 0; i < RSS_FEEDS.length; i += 5) feedBatches.push(RSS_FEEDS.slice(i, i + 5))

  for (const batch of feedBatches) {
    await Promise.all(batch.map(async feed => {
      try {
        const parsed = await parser.parseURL(feed.url)
        for (const item of parsed.items.slice(0, 10)) {
          const url = item.link || item.guid || ''
          if (!url || existingUrls.has(url)) continue
          const title = item.title || ''
          const description = item.contentSnippet || item.summary || item.content || ''
          if (!isRelevant(title, description)) continue
          allItems.push({
            url, title,
            description: description.slice(0, 500),
            publication: feed.name,
            authority: feed.authority,
            category: feed.category,
            articleDate: item.isoDate || item.pubDate || new Date().toISOString(),
          })
        }
      } catch {
        // Feed failed silently
      }
    }))
  }

  // Deduplicate
  const seen = new Set<string>()
  const unique = allItems.filter(item => {
    if (seen.has(item.url) || existingUrls.has(item.url)) return false
    seen.add(item.url)
    return true
  })

  // Top 30 by authority — fetch OG data and store
  const top = unique.sort((a, b) => b.authority - a.authority).slice(0, 30)

  for (const item of top) {
    try {
      const og = await fetchOGData(item.url)

      // Prefer the RSS title — it's clean and pre-formatted by the publisher.
      // OG title often has " | Site Name" appended, or returns paywall junk.
      // Only fall back to OG title if RSS gave us nothing.
      const finalTitle = item.title || og.title
      if (isJunkTitle(finalTitle)) { skipped.push(item.url); continue }

      const { error } = await supabase.from('tipsy_reads').insert({
        url:              item.url,
        title:            finalTitle,
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

  return { saved: imported.length, skipped: skipped.length, total_feeds: RSS_FEEDS.length }
}
