export interface RssFeed {
  name: string
  url: string
  authority: number // 0-100, used as baseline for proof score
  category: string
}

export const RSS_FEEDS: RssFeed[] = [
  // Finance & Markets — open/free sources
  { name: 'Reuters Business',        url: 'https://feeds.reuters.com/reuters/businessNews',                      authority: 95, category: 'markets' },
  { name: 'Reuters Technology',      url: 'https://feeds.reuters.com/reuters/technologyNews',                    authority: 95, category: 'tech' },
  { name: 'MarketWatch',             url: 'https://feeds.marketwatch.com/marketwatch/topstories',                authority: 82, category: 'markets' },
  { name: 'CNBC Finance',            url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',                authority: 80, category: 'markets' },
  { name: 'Investopedia News',       url: 'https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline', authority: 76, category: 'markets' },
  { name: 'Seeking Alpha Markets',   url: 'https://seekingalpha.com/feed.xml',                                   authority: 72, category: 'markets' },
  { name: 'Yahoo Finance',           url: 'https://finance.yahoo.com/news/rssindex',                             authority: 78, category: 'markets' },

  // Macro & Economics — open sources
  { name: 'The Economist (free)',    url: 'https://www.economist.com/finance-and-economics/rss.xml',             authority: 90, category: 'macro' },
  { name: 'IMF Blog',                url: 'https://www.imf.org/en/Blogs/rss',                                    authority: 88, category: 'macro' },
  { name: 'World Bank Blog',         url: 'https://blogs.worldbank.org/en/rss.xml',                              authority: 85, category: 'macro' },
  { name: 'Federal Reserve',         url: 'https://www.federalreserve.gov/feeds/press_all.xml',                  authority: 92, category: 'macro' },
  { name: 'Project Syndicate',       url: 'https://www.project-syndicate.org/rss',                               authority: 84, category: 'macro' },

  // Technology & AI — all open
  { name: 'TechCrunch',              url: 'https://techcrunch.com/feed',                                         authority: 78, category: 'tech' },
  { name: 'The Verge',               url: 'https://www.theverge.com/rss/index.xml',                              authority: 75, category: 'tech' },
  { name: 'Ars Technica',            url: 'https://feeds.arstechnica.com/arstechnica/index',                     authority: 80, category: 'tech' },
  { name: 'Wired',                   url: 'https://www.wired.com/feed/rss',                                      authority: 77, category: 'tech' },
  { name: 'MIT Technology Review',   url: 'https://www.technologyreview.com/feed',                               authority: 88, category: 'ai' },
  { name: 'VentureBeat AI',          url: 'https://venturebeat.com/category/ai/feed',                            authority: 74, category: 'ai' },
  { name: 'CNBC Tech',               url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html',                authority: 80, category: 'tech' },
  { name: 'IEEE Spectrum',           url: 'https://spectrum.ieee.org/feeds/feed.rss',                            authority: 83, category: 'tech' },
  { name: 'Hacker News (best)',      url: 'https://hnrss.org/best?points=200',                                   authority: 70, category: 'tech' },

  // Geopolitics & Policy — all open
  { name: 'Foreign Affairs',         url: 'https://www.foreignaffairs.com/rss.xml',                              authority: 89, category: 'geopolitics' },
  { name: 'CFR',                     url: 'https://www.cfr.org/rss/all',                                         authority: 87, category: 'geopolitics' },
  { name: 'Politico Finance',        url: 'https://rss.politico.com/economy.xml',                                authority: 79, category: 'policy' },
  { name: 'AP Business',             url: 'https://rsshub.app/apnews/topics/business',                           authority: 85, category: 'markets' },

  // Fintech
  { name: 'Finextra',                url: 'https://www.finextra.com/rss/headlines.aspx',                         authority: 75, category: 'fintech' },
  { name: 'Crowdfund Insider',       url: 'https://www.crowdfundinsider.com/feed',                               authority: 68, category: 'fintech' },

  // Energy
  { name: 'Reuters Energy',          url: 'https://feeds.reuters.com/reuters/energyNews',                        authority: 95, category: 'energy' },
  { name: 'S&P Global Energy',       url: 'https://www.spglobal.com/commodityinsights/en/rss-feed/energy',       authority: 84, category: 'energy' },
]
