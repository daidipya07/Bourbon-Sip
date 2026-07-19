// Shared symbol universes for the terminal. Yahoo-native symbols —
// the batch quotes and candles routes proxy Yahoo's chart API.

export interface StripSymbol {
  symbol: string
  label: string
}

export const STRIP_SYMBOLS: StripSymbol[] = [
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: '^IXIC', label: 'NASDAQ' },
  { symbol: '^DJI', label: 'DOW' },
  { symbol: '^RUT', label: 'RUS 2K' },
  { symbol: '^VIX', label: 'VIX' },
  { symbol: '^TNX', label: 'US 10Y' },
  { symbol: 'GLD', label: 'GOLD' },
  { symbol: 'USO', label: 'OIL' },
  { symbol: 'BTC-USD', label: 'BTC' },
  { symbol: 'ETH-USD', label: 'ETH' },
  { symbol: 'EURUSD=X', label: 'EUR/USD' },
  { symbol: 'JPY=X', label: 'USD/JPY' },
]

export interface MarketSymbol {
  symbol: string
  name: string
  group: string
}

export const MARKET_SYMBOLS: MarketSymbol[] = [
  // US Indices
  { symbol: '^GSPC', name: 'S&P 500', group: 'US Indices' },
  { symbol: '^IXIC', name: 'Nasdaq Comp', group: 'US Indices' },
  { symbol: '^DJI', name: 'Dow Jones', group: 'US Indices' },
  { symbol: '^RUT', name: 'Russell 2000', group: 'US Indices' },
  { symbol: '^VIX', name: 'VIX', group: 'US Indices' },
  { symbol: '^TNX', name: 'US 10Y Yield', group: 'US Indices' },
  // Global Indices
  { symbol: '^FTSE', name: 'FTSE 100', group: 'Global Indices' },
  { symbol: '^GDAXI', name: 'DAX', group: 'Global Indices' },
  { symbol: '^N225', name: 'Nikkei 225', group: 'Global Indices' },
  { symbol: '^HSI', name: 'Hang Seng', group: 'Global Indices' },
  { symbol: '^FCHI', name: 'CAC 40', group: 'Global Indices' },
  { symbol: '^BSESN', name: 'Sensex', group: 'Global Indices' },
  // Sectors
  { symbol: 'XLK', name: 'Tech', group: 'US Sectors' },
  { symbol: 'XLF', name: 'Financials', group: 'US Sectors' },
  { symbol: 'XLE', name: 'Energy', group: 'US Sectors' },
  { symbol: 'XLV', name: 'Healthcare', group: 'US Sectors' },
  { symbol: 'XLI', name: 'Industrials', group: 'US Sectors' },
  { symbol: 'XLP', name: 'Staples', group: 'US Sectors' },
  { symbol: 'XLY', name: 'Discretionary', group: 'US Sectors' },
  { symbol: 'XLU', name: 'Utilities', group: 'US Sectors' },
  // FX
  { symbol: 'EURUSD=X', name: 'EUR/USD', group: 'FX' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', group: 'FX' },
  { symbol: 'JPY=X', name: 'USD/JPY', group: 'FX' },
  { symbol: 'DX-Y.NYB', name: 'Dollar Index', group: 'FX' },
  // Commodities
  { symbol: 'GC=F', name: 'Gold', group: 'Commodities' },
  { symbol: 'SI=F', name: 'Silver', group: 'Commodities' },
  { symbol: 'CL=F', name: 'WTI Crude', group: 'Commodities' },
  { symbol: 'NG=F', name: 'Nat Gas', group: 'Commodities' },
  // Bonds
  { symbol: 'TLT', name: '20Y+ Treasury', group: 'Bonds' },
  { symbol: 'IEF', name: '7-10Y Treasury', group: 'Bonds' },
  { symbol: 'HYG', name: 'High Yield', group: 'Bonds' },
  { symbol: 'LQD', name: 'IG Corporate', group: 'Bonds' },
  // Crypto
  { symbol: 'BTC-USD', name: 'Bitcoin', group: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', group: 'Crypto' },
  { symbol: 'SOL-USD', name: 'Solana', group: 'Crypto' },
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
  { symbol: 'BRK-B', name: 'Berkshire', sector: 'Financials' },
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
  'SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'BRK-B', 'GLD', 'TLT',
]
