export interface RssFeed {
  name: string
  url: string
  authority: number // 0-100, used as baseline for proof score
  category: string
}

export const RSS_FEEDS: RssFeed[] = [
  // ── Finance & Markets ──────────────────────────────
  { name: 'Reuters Business',        url: 'https://feeds.reuters.com/reuters/businessNews',                      authority: 95, category: 'markets' },
  { name: 'Bloomberg (via Google)',   url: 'https://news.google.com/rss/search?q=site:bloomberg.com+when:1d&hl=en-US&gl=US&ceid=US:en', authority: 92, category: 'markets' },
  { name: 'MarketWatch',             url: 'https://feeds.marketwatch.com/marketwatch/topstories',                authority: 82, category: 'markets' },
  { name: 'MarketWatch Markets',     url: 'https://feeds.marketwatch.com/marketwatch/marketpulse',               authority: 82, category: 'markets' },
  { name: 'CNBC Finance',            url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',                authority: 80, category: 'markets' },
  { name: 'Investopedia',            url: 'https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline', authority: 76, category: 'markets' },
  { name: 'Seeking Alpha',           url: 'https://seekingalpha.com/feed.xml',                                   authority: 72, category: 'markets' },
  { name: 'Yahoo Finance',           url: 'https://finance.yahoo.com/news/rssindex',                             authority: 78, category: 'markets' },
  { name: 'Barron\'s (via Google)',   url: 'https://news.google.com/rss/search?q=site:barrons.com+when:1d&hl=en-US&gl=US&ceid=US:en', authority: 88, category: 'markets' },
  { name: 'Financial Times (via Google)', url: 'https://news.google.com/rss/search?q=site:ft.com+when:1d&hl=en-US&gl=US&ceid=US:en', authority: 93, category: 'markets' },
  { name: 'AP Business',             url: 'https://rsshub.app/apnews/topics/business',                           authority: 85, category: 'markets' },

  // ── Macro & Economics ──────────────────────────────
  { name: 'The Economist',           url: 'https://www.economist.com/finance-and-economics/rss.xml',             authority: 90, category: 'macro' },
  { name: 'IMF Blog',                url: 'https://www.imf.org/en/Blogs/rss',                                    authority: 88, category: 'macro' },
  { name: 'World Bank Blog',         url: 'https://blogs.worldbank.org/en/rss.xml',                              authority: 85, category: 'macro' },
  { name: 'Federal Reserve',         url: 'https://www.federalreserve.gov/feeds/press_all.xml',                  authority: 92, category: 'macro' },
  { name: 'Project Syndicate',       url: 'https://www.project-syndicate.org/rss',                               authority: 84, category: 'macro' },
  { name: 'Brookings',               url: 'https://www.brookings.edu/feed/',                                     authority: 86, category: 'macro' },
  { name: 'NBER',                    url: 'https://www.nber.org/rss/new.xml',                                    authority: 90, category: 'macro' },

  // ── Technology & AI ────────────────────────────────
  { name: 'Reuters Tech',            url: 'https://feeds.reuters.com/reuters/technologyNews',                    authority: 95, category: 'tech' },
  { name: 'TechCrunch',              url: 'https://techcrunch.com/feed',                                         authority: 78, category: 'tech' },
  { name: 'The Verge',               url: 'https://www.theverge.com/rss/index.xml',                              authority: 75, category: 'tech' },
  { name: 'Ars Technica',            url: 'https://feeds.arstechnica.com/arstechnica/index',                     authority: 80, category: 'tech' },
  { name: 'Wired',                   url: 'https://www.wired.com/feed/rss',                                      authority: 77, category: 'tech' },
  { name: 'MIT Technology Review',   url: 'https://www.technologyreview.com/feed',                               authority: 88, category: 'ai' },
  { name: 'VentureBeat AI',          url: 'https://venturebeat.com/category/ai/feed',                            authority: 74, category: 'ai' },
  { name: 'CNBC Tech',               url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html',                authority: 80, category: 'tech' },
  { name: 'IEEE Spectrum',           url: 'https://spectrum.ieee.org/feeds/feed.rss',                            authority: 83, category: 'tech' },
  { name: 'Hacker News (best)',      url: 'https://hnrss.org/best?points=200',                                   authority: 70, category: 'tech' },
  { name: 'The Information (via Google)', url: 'https://news.google.com/rss/search?q=site:theinformation.com+when:1d&hl=en-US&gl=US&ceid=US:en', authority: 85, category: 'tech' },

  // ── Geopolitics & Policy ───────────────────────────
  { name: 'Foreign Affairs',         url: 'https://www.foreignaffairs.com/rss.xml',                              authority: 89, category: 'geopolitics' },
  { name: 'CFR',                     url: 'https://www.cfr.org/rss/all',                                         authority: 87, category: 'geopolitics' },
  { name: 'Politico Finance',        url: 'https://rss.politico.com/economy.xml',                                authority: 79, category: 'policy' },
  { name: 'The Diplomat',            url: 'https://thediplomat.com/feed/',                                       authority: 76, category: 'geopolitics' },

  // ── Fintech & Crypto ───────────────────────────────
  { name: 'Finextra',                url: 'https://www.finextra.com/rss/headlines.aspx',                         authority: 75, category: 'fintech' },
  { name: 'Crowdfund Insider',       url: 'https://www.crowdfundinsider.com/feed',                               authority: 68, category: 'fintech' },
  { name: 'CoinDesk',                url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',                     authority: 74, category: 'crypto' },
  { name: 'The Block',               url: 'https://www.theblock.co/rss.xml',                                    authority: 72, category: 'crypto' },

  // ── Energy & Commodities ───────────────────────────
  { name: 'Reuters Energy',          url: 'https://feeds.reuters.com/reuters/energyNews',                        authority: 95, category: 'energy' },
  { name: 'S&P Global Energy',       url: 'https://www.spglobal.com/commodityinsights/en/rss-feed/energy',       authority: 84, category: 'energy' },
  { name: 'Oilprice.com',            url: 'https://oilprice.com/rss/main',                                      authority: 70, category: 'energy' },
]
