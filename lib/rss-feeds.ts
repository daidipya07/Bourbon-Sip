export interface RssFeed {
  name: string
  url: string
  authority: number // 0-100, used as baseline for proof score
  category: string
}

export const RSS_FEEDS: RssFeed[] = [
  // Finance & Markets
  { name: 'Reuters Business',       url: 'https://feeds.reuters.com/reuters/businessNews',         authority: 95, category: 'markets' },
  { name: 'Reuters Technology',     url: 'https://feeds.reuters.com/reuters/technologyNews',       authority: 95, category: 'tech' },
  { name: 'MarketWatch',            url: 'https://feeds.marketwatch.com/marketwatch/topstories',   authority: 82, category: 'markets' },
  { name: 'CNBC Finance',           url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',   authority: 80, category: 'markets' },
  { name: 'Bloomberg Markets',      url: 'https://feeds.bloomberg.com/markets/news.rss',           authority: 92, category: 'markets' },
  { name: 'Financial Times',        url: 'https://www.ft.com/rss/home',                            authority: 93, category: 'markets' },
  { name: 'WSJ Markets',            url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',          authority: 91, category: 'markets' },
  { name: 'The Economist',          url: 'https://www.economist.com/finance-and-economics/rss.xml',authority: 90, category: 'macro' },
  { name: 'IMF Blog',               url: 'https://www.imf.org/en/Blogs/rss',                       authority: 88, category: 'macro' },

  // Technology & AI
  { name: 'TechCrunch',             url: 'https://techcrunch.com/feed',                            authority: 78, category: 'tech' },
  { name: 'The Verge',              url: 'https://www.theverge.com/rss/index.xml',                 authority: 75, category: 'tech' },
  { name: 'Ars Technica',           url: 'https://feeds.arstechnica.com/arstechnica/index',        authority: 80, category: 'tech' },
  { name: 'Wired',                  url: 'https://www.wired.com/feed/rss',                         authority: 77, category: 'tech' },
  { name: 'MIT Technology Review',  url: 'https://www.technologyreview.com/feed',                  authority: 88, category: 'ai' },
  { name: 'VentureBeat AI',         url: 'https://venturebeat.com/category/ai/feed',               authority: 74, category: 'ai' },
  { name: 'CNBC Tech',              url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html',   authority: 80, category: 'tech' },

  // Geopolitics & Policy
  { name: 'Foreign Affairs',        url: 'https://www.foreignaffairs.com/rss.xml',                 authority: 89, category: 'geopolitics' },
  { name: 'CFR',                    url: 'https://www.cfr.org/rss/all',                            authority: 87, category: 'geopolitics' },
  { name: 'Politico Finance',       url: 'https://rss.politico.com/economy.xml',                   authority: 79, category: 'policy' },

  // Energy
  { name: 'Reuters Energy',         url: 'https://feeds.reuters.com/reuters/energyNews',           authority: 95, category: 'energy' },
]
