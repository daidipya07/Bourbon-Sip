'use client'

import RiskTool from './RiskTool'
import BacktestTool from './BacktestTool'
import CorrelationTool from './CorrelationTool'
import PortfolioTool from './PortfolioTool'

export type ToolId = 'portfolio' | 'backtest' | 'risk' | 'correlation'

const TOOLS: Array<{ id: ToolId; label: string; blurb: string; code: string }> = [
  { id: 'portfolio', label: 'Portfolio Analyzer', blurb: 'Live value, P&L, sector mix, beta/vol vs SPY', code: 'PORT' },
  { id: 'backtest', label: 'DCA Backtester', blurb: 'What if you’d invested monthly — real history', code: 'DCA' },
  { id: 'risk', label: 'Position Size & Risk', blurb: 'Shares to buy from account, risk %, stop', code: 'RISK' },
  { id: 'correlation', label: 'Correlation Matrix', blurb: 'Are your tickers actually diversified?', code: 'CORR' },
]

export default function ToolsPanel({ active, onSelectTool, symbol, onSelectSymbol }: {
  active: ToolId
  onSelectTool: (t: ToolId) => void
  symbol: string
  onSelectSymbol: (s: string) => void
}) {
  return (
    <div className="terminal-tools">
      <div className="terminal-tools-nav">
        <div className="terminal-sector-label" style={{ padding: '10px 12px 6px' }}>Analysis Tools</div>
        {TOOLS.map(t => (
          <button
            key={t.id}
            className={`terminal-tools-navitem ${active === t.id ? 'active' : ''}`}
            onClick={() => onSelectTool(t.id)}
          >
            <span className="terminal-tools-navlabel">{t.label}</span>
            <span className="terminal-tools-navblurb">{t.blurb}</span>
            <span className="terminal-tools-navcode">{t.code}</span>
          </button>
        ))}
        <div className="terminal-tools-note">
          All tools run on real market data (Twelve Data + Finnhub). Nothing you
          enter leaves your browser — holdings and inputs stay in local storage.
        </div>
      </div>
      <div className="terminal-tools-body">
        {active === 'portfolio' && <PortfolioTool onSelectSymbol={onSelectSymbol} />}
        {active === 'backtest' && <BacktestTool defaultSymbol={symbol} />}
        {active === 'risk' && <RiskTool />}
        {active === 'correlation' && <CorrelationTool defaultSymbol={symbol} />}
      </div>
    </div>
  )
}

export function ToolDisclaimer() {
  return (
    <div className="terminal-tool-disclaimer">
      Educational tool · Not investment advice · Past performance does not guarantee future results
    </div>
  )
}
