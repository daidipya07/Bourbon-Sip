export interface Ticker {
  sym: string
  val: string
  chg: string
  up: boolean
}

export const tickers: Ticker[] = [
  { sym: 'SPX',     val: '5,487.32', chg: '+0.42%', up: true  },
  { sym: 'NDX',     val: '19,241.88',chg: '+0.67%', up: true  },
  { sym: 'NVDA',    val: '892.14',   chg: '+2.31%', up: true  },
  { sym: 'AAPL',    val: '178.52',   chg: '-0.18%', up: false },
  { sym: 'BTC',     val: '68,412',   chg: '+1.84%', up: true  },
  { sym: 'DXY',     val: '104.23',   chg: '+0.12%', up: true  },
  { sym: '10Y',     val: '4.28%',    chg: '+2bps',  up: false },
  { sym: 'Gold',    val: '2,342',    chg: '+0.53%', up: true  },
  { sym: 'WTI',     val: '78.41',    chg: '-0.34%', up: false },
  { sym: 'EUR/USD', val: '1.0847',   chg: '-0.08%', up: false },
  { sym: 'META',    val: '502.18',   chg: '+1.12%', up: true  },
  { sym: 'MSFT',    val: '421.90',   chg: '+0.38%', up: true  },
  { sym: 'AMZN',    val: '186.37',   chg: '+0.91%', up: true  },
  { sym: 'TSLA',    val: '174.88',   chg: '-1.24%', up: false },
]
