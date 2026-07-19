// Terminal symbol universes. Every symbol here is quotable on Finnhub's free
// tier from Vercel: US equities, ETFs, and Binance crypto pairs. Indices, FX,
// and global markets use liquid ETF proxies (SPY≈S&P 500, UUP≈US Dollar,
// EWJ≈Japan) because Finnhub free can't quote raw indices/FX and Yahoo blocks
// datacenter IPs. Charts (Twelve Data) can chart any of these directly.

export interface StripSymbol {
  symbol: string
  label: string
}

export const STRIP_SYMBOLS: StripSymbol[] = [
  { symbol: 'SPY', label: 'S&P 500' },
  { symbol: 'QQQ', label: 'NASDAQ' },
  { symbol: 'DIA', label: 'DOW' },
  { symbol: 'IWM', label: 'RUSSELL' },
  { symbol: 'VIXY', label: 'VIX' },
  { symbol: 'TLT', label: 'US 20Y' },
  { symbol: 'GLD', label: 'GOLD' },
  { symbol: 'USO', label: 'OIL' },
  { symbol: 'UUP', label: 'USD' },
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
  { symbol: 'SPY', name: 'S&P 500', group: 'US Indices' },
  { symbol: 'QQQ', name: 'Nasdaq 100', group: 'US Indices' },
  { symbol: 'DIA', name: 'Dow Jones', group: 'US Indices' },
  { symbol: 'IWM', name: 'Russell 2000', group: 'US Indices' },
  { symbol: 'VIXY', name: 'VIX Futures', group: 'US Indices' },
  // Global (country ETF proxies)
  { symbol: 'EWU', name: 'United Kingdom', group: 'Global' },
  { symbol: 'EWG', name: 'Germany', group: 'Global' },
  { symbol: 'EWJ', name: 'Japan', group: 'Global' },
  { symbol: 'MCHI', name: 'China', group: 'Global' },
  { symbol: 'INDA', name: 'India', group: 'Global' },
  { symbol: 'EWY', name: 'South Korea', group: 'Global' },
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
  { symbol: 'UUP', name: 'US Dollar', group: 'FX' },
  { symbol: 'FXE', name: 'Euro', group: 'FX' },
  { symbol: 'FXY', name: 'Japanese Yen', group: 'FX' },
  { symbol: 'FXB', name: 'British Pound', group: 'FX' },
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
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Communication' },
  { symbol: 'META', name: 'Meta', sector: 'Communication' },
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
  { symbol: 'PG', name: 'P&G', sector: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo', sector: 'Consumer' },
  { symbol: 'BRK.B', name: 'Berkshire', sector: 'Financials' },
  { symbol: 'JPM', name: 'JPMorgan', sector: 'Financials' },
  { symbol: 'V', name: 'Visa', sector: 'Financials' },
  { symbol: 'MA', name: 'Mastercard', sector: 'Financials' },
  { symbol: 'BAC', name: 'BofA', sector: 'Financials' },
  { symbol: 'WFC', name: 'Wells Fargo', sector: 'Financials' },
  { symbol: 'GS', name: 'Goldman', sector: 'Financials' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financials' },
  { symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'J&J', sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie', sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck', sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer', sector: 'Healthcare' },
  { symbol: 'XOM', name: 'Exxon', sector: 'Energy & Industrials' },
  { symbol: 'CVX', name: 'Chevron', sector: 'Energy & Industrials' },
  { symbol: 'CAT', name: 'Caterpillar', sector: 'Energy & Industrials' },
  { symbol: 'BA', name: 'Boeing', sector: 'Energy & Industrials' },
  { symbol: 'GE', name: 'GE', sector: 'Energy & Industrials' },
  { symbol: 'HON', name: 'Honeywell', sector: 'Energy & Industrials' },
  { symbol: 'UPS', name: 'UPS', sector: 'Energy & Industrials' },
  { symbol: 'RTX', name: 'RTX', sector: 'Energy & Industrials' },
]

export const MOVERS_UNIVERSE = HEATMAP_SYMBOLS

export const DEFAULT_WATCHLIST = [
  'SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'BRK.B', 'GLD', 'TLT',
]
