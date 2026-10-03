// Terminal symbol universes. Every symbol here is quotable on Finnhub's free
// tier from Vercel: US equities, ETFs, and Binance crypto pairs. Indices, FX,
// and global markets use liquid ETF proxies (SPY≈S&P 500, UUP≈US Dollar,
// EWJ≈Japan) because Finnhub free can't quote raw indices/FX and Yahoo blocks
// datacenter IPs. Charts (Twelve Data) can chart any of these directly.

export interface StripSymbol {
  symbol: string
  label: string
}

// Ticker-first labels: these are ETF proxies, not index levels — say so.
// Real VIX / 10Y / DXY come from FRED via /api/data-pulse (see TerminalStrip).
export const STRIP_SYMBOLS: StripSymbol[] = [
  { symbol: 'SPY', label: 'SPY · S&P500' },
  { symbol: 'QQQ', label: 'QQQ · NASDAQ' },
  { symbol: 'DIA', label: 'DIA · DOW' },
  { symbol: 'IWM', label: 'IWM · RUS2K' },
  { symbol: 'TLT', label: 'TLT · 20Y' },
  { symbol: 'GLD', label: 'GLD · GOLD' },
  { symbol: 'USO', label: 'USO · OIL' },
  { symbol: 'BINANCE:BTCUSDT', label: 'BTC' },
  { symbol: 'BINANCE:ETHUSDT', label: 'ETH' },
]

export interface MarketSymbol {
  symbol: string
  name: string
  group: string
}

export const MARKET_SYMBOLS: MarketSymbol[] = [
  // US Indices (ETF proxies)
  { symbol: 'SPY', name: 'S&P 500', group: 'US Indices · ETF proxies' },
  { symbol: 'QQQ', name: 'Nasdaq 100', group: 'US Indices · ETF proxies' },
  { symbol: 'DIA', name: 'Dow Jones', group: 'US Indices · ETF proxies' },
  { symbol: 'IWM', name: 'Russell 2000', group: 'US Indices · ETF proxies' },
  { symbol: 'VIXY', name: 'VIX Futures ETF (decays)', group: 'US Indices · ETF proxies' },
  // Global (country ETF proxies)
  { symbol: 'EWU', name: 'United Kingdom', group: 'Global · country ETFs' },
  { symbol: 'EWG', name: 'Germany', group: 'Global · country ETFs' },
  { symbol: 'EWJ', name: 'Japan', group: 'Global · country ETFs' },
  { symbol: 'MCHI', name: 'China', group: 'Global · country ETFs' },
  { symbol: 'INDA', name: 'India', group: 'Global · country ETFs' },
  { symbol: 'EWY', name: 'South Korea', group: 'Global · country ETFs' },
  // Sectors
  { symbol: 'XLK', name: 'Technology', group: 'US Sectors' },
  { symbol: 'XLF', name: 'Financials', group: 'US Sectors' },
  { symbol: 'XLE', name: 'Energy', group: 'US Sectors' },
  { symbol: 'XLV', name: 'Healthcare', group: 'US Sectors' },
  { symbol: 'XLI', name: 'Industrials', group: 'US Sectors' },
  { symbol: 'XLP', name: 'Staples', group: 'US Sectors' },
  { symbol: 'XLY', name: 'Discretionary', group: 'US Sectors' },
  { symbol: 'XLU', name: 'Utilities', group: 'US Sectors' },
  // FX (ETF proxies)
  { symbol: 'UUP', name: 'US Dollar', group: 'FX · currency ETFs' },
  { symbol: 'FXE', name: 'Euro', group: 'FX · currency ETFs' },
  { symbol: 'FXY', name: 'Japanese Yen', group: 'FX · currency ETFs' },
  { symbol: 'FXB', name: 'British Pound', group: 'FX · currency ETFs' },
  // Commodities (ETFs)
  { symbol: 'GLD', name: 'Gold', group: 'Commodities' },
  { symbol: 'SLV', name: 'Silver', group: 'Commodities' },
  { symbol: 'USO', name: 'WTI Crude', group: 'Commodities' },
  { symbol: 'UNG', name: 'Nat Gas', group: 'Commodities' },
  // Bonds (ETFs)
  { symbol: 'TLT', name: '20Y+ Treasury', group: 'Bonds' },
  { symbol: 'IEF', name: '7-10Y Treasury', group: 'Bonds' },
  { symbol: 'HYG', name: 'High Yield', group: 'Bonds' },
  { symbol: 'LQD', name: 'IG Corporate', group: 'Bonds' },
  // Crypto
  { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin', group: 'Crypto' },
  { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum', group: 'Crypto' },
  { symbol: 'BINANCE:SOLUSDT', name: 'Solana', group: 'Crypto' },
]

export interface HeatmapSymbol {
  symbol: string
  name: string
  sector: string
  // Alternate press names that don't appear in the ticker's own company name
  // (e.g. GOOGL's Finnhub profile name is "Alphabet", but press/articles say
  // "Google"). Used by matchCompanyInText() for the editorial->terminal match.
  aliases?: string[]
}

export const HEATMAP_SYMBOLS: HeatmapSymbol[] = [
  { symbol: 'AAPL', name: 'Apple', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology' },
  { symbol: 'NVDA', name: 'Nvidia', sector: 'Technology' },
  { symbol: 'AVGO', name: 'Broadcom', sector: 'Technology' },
  { symbol: 'ORCL', name: 'Oracle', sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce', sector: 'Technology' },
  { symbol: 'AMD', name: 'AMD', sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe', sector: 'Technology' },
  { symbol: 'QCOM', name: 'Qualcomm', sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Communication', aliases: ['Google'] },
  { symbol: 'META', name: 'Meta', sector: 'Communication', aliases: ['Facebook'] },
  { symbol: 'NFLX', name: 'Netflix', sector: 'Communication' },
  { symbol: 'DIS', name: 'Disney', sector: 'Communication' },
  { symbol: 'TMUS', name: 'T-Mobile', sector: 'Communication' },
  { symbol: 'AMZN', name: 'Amazon', sector: 'Consumer' },
  { symbol: 'TSLA', name: 'Tesla', sector: 'Consumer' },
  { symbol: 'HD', name: 'Home Depot', sector: 'Consumer' },
  { symbol: 'MCD', name: "McDonald's", sector: 'Consumer' },
  { symbol: 'NKE', name: 'Nike', sector: 'Consumer' },
  { symbol: 'SBUX', name: 'Starbucks', sector: 'Consumer' },
  { symbol: 'COST', name: 'Costco', sector: 'Consumer' },
  { symbol: 'WMT', name: 'Walmart', sector: 'Consumer' },
  { symbol: 'PG', name: 'P&G', sector: 'Consumer', aliases: ['Procter & Gamble'] },
  { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo', sector: 'Consumer' },
  { symbol: 'BRK.B', name: 'Berkshire', sector: 'Financials', aliases: ['Berkshire Hathaway'] },
  { symbol: 'JPM', name: 'JPMorgan', sector: 'Financials', aliases: ['JP Morgan', 'JPMorgan Chase'] },
  { symbol: 'V', name: 'Visa', sector: 'Financials' },
  { symbol: 'MA', name: 'Mastercard', sector: 'Financials' },
  { symbol: 'BAC', name: 'BofA', sector: 'Financials', aliases: ['Bank of America'] },
  { symbol: 'WFC', name: 'Wells Fargo', sector: 'Financials' },
  { symbol: 'GS', name: 'Goldman', sector: 'Financials', aliases: ['Goldman Sachs'] },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financials' },
  { symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'J&J', sector: 'Healthcare', aliases: ['Johnson & Johnson'] },
  { symbol: 'ABBV', name: 'AbbVie', sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck', sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer', sector: 'Healthcare' },
  { symbol: 'XOM', name: 'Exxon', sector: 'Energy & Industrials', aliases: ['ExxonMobil'] },
  { symbol: 'CVX', name: 'Chevron', sector: 'Energy & Industrials' },
  { symbol: 'CAT', name: 'Caterpillar', sector: 'Energy & Industrials' },
  { symbol: 'BA', name: 'Boeing', sector: 'Energy & Industrials' },
  { symbol: 'GE', name: 'GE', sector: 'Energy & Industrials', aliases: ['General Electric'] },
  { symbol: 'HON', name: 'Honeywell', sector: 'Energy & Industrials' },
  { symbol: 'UPS', name: 'UPS', sector: 'Energy & Industrials' },
  { symbol: 'RTX', name: 'RTX', sector: 'Energy & Industrials' },
]

export const MOVERS_UNIVERSE = HEATMAP_SYMBOLS

// Company-name search terms from a Finnhub profile name — strip corporate
// suffixes so "Apple Inc" → "Apple", "JPMorgan Chase & Co" → "JPMorgan".
export function searchTermFromName(name: string): string {
  const cleaned = name
    .replace(/\b(inc|corp|corporation|co|company|ltd|plc|group|holdings|the|sa|nv|ag)\b\.?/gi, '')
    .replace(/[.,&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.split(' ')[0] || name
}

export interface CompanyMatch { symbol: string; name: string }

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Scans free text (a Tipsy Read or article title/description) for a known
// large-cap company from HEATMAP_SYMBOLS. Requires a whole-word match on both
// sides (so "GE" doesn't fire on "Georgia") — first confident match wins,
// null when nothing in the known universe is mentioned. Pure/sync — no
// network call, safe to call during SSR.
export function matchCompanyInText(text: string): CompanyMatch | null {
  for (const { symbol, name, aliases } of HEATMAP_SYMBOLS) {
    for (const candidate of [name, ...(aliases ?? [])]) {
      const re = new RegExp(`\\b${escapeRegex(candidate)}\\b`, 'i')
      if (re.test(text)) return { symbol, name }
    }
  }
  return null
}

export const DEFAULT_WATCHLIST = [
  'SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'BRK.B', 'GLD', 'TLT',
]
