// Symbols mapped to Finnhub-compatible quote symbols
// Finnhub free tier supports US stocks and forex
const SYMBOLS: { sym: string; finnhub: string; isCrypto?: boolean; isForex?: boolean; isIndex?: boolean }[] = [
  { sym: 'SPX',     finnhub: 'SPY',      isIndex: true  }, // SPY as SPX proxy
  { sym: 'NDX',     finnhub: 'QQQ',      isIndex: true  }, // QQQ as NDX proxy
  { sym: 'NVDA',    finnhub: 'NVDA'      },
  { sym: 'AAPL',    finnhub: 'AAPL'      },
  { sym: 'BTC',     finnhub: 'BINANCE:BTCUSDT', isCrypto: true },
  { sym: 'DXY',     finnhub: 'UUP',      isIndex: true  }, // UUP as DXY proxy
  { sym: 'Gold',    finnhub: 'GLD',      isIndex: true  }, // GLD as Gold proxy
  { sym: 'WTI',     finnhub: 'USO',      isIndex: true  }, // USO as WTI proxy
  { sym: 'EUR/USD', finnhub: 'OANDA:EUR_USD', isForex: true },
  { sym: 'META',    finnhub: 'META'      },
  { sym: 'MSFT',    finnhub: 'MSFT'      },
  { sym: 'AMZN',    finnhub: 'AMZN'      },
  { sym: 'TSLA',    finnhub: 'TSLA'      },
]

function formatVal(price: number, sym: string): string {
  if (sym === 'EUR/USD') return price.toFixed(4)
  if (sym === 'BTC') return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price.toFixed(2)
}

function formatChg(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY

  if (!apiKey) {
    return Response.json({ error: 'FINNHUB_API_KEY not configured' }, { status: 503 })
  }

  try {
    const results = await Promise.allSettled(
      SYMBOLS.map(async ({ sym, finnhub }) => {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhub)}&token=${apiKey}`,
          { next: { revalidate: 60 } }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!data.c || data.c === 0) throw new Error('No price data')

        const price: number = data.c
        const prevClose: number = data.pc
        const pct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0

        return {
          sym,
          val: formatVal(price, sym),
          chg: formatChg(pct),
          up: pct >= 0,
        }
      })
    )

    const tickers = SYMBOLS.map(({ sym }, i) => {
      const result = results[i]
      if (result.status === 'fulfilled') return result.value
      // Fallback label if a symbol fails
      return { sym, val: '—', chg: '—', up: true }
    })

    return Response.json({ tickers }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
    })
  } catch (err) {
    console.error('Ticker fetch error:', err)
    return Response.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
