'use client'

import { useState } from 'react'
import { ToolDisclaimer } from './ToolsPanel'
import ToolHelp from './ToolHelp'

// Position sizing from account risk: pure client-side, instant recompute.
export default function RiskTool() {
  const [account, setAccount] = useState('10000')
  const [riskPct, setRiskPct] = useState('1')
  const [entry, setEntry] = useState('')
  const [stop, setStop] = useState('')
  const [target, setTarget] = useState('')

  const acct = parseFloat(account)
  const risk = parseFloat(riskPct)
  const e = parseFloat(entry)
  const s = parseFloat(stop)
  const t = parseFloat(target)

  const valid = acct > 0 && risk > 0 && e > 0 && s > 0 && e !== s
  const dollarRisk = valid ? acct * (risk / 100) : null
  const perShareRisk = valid ? Math.abs(e - s) : null
  const shares = valid && dollarRisk != null && perShareRisk ? Math.floor(dollarRisk / perShareRisk) : null
  const positionValue = shares != null ? shares * e : null
  const pctOfAccount = positionValue != null && acct > 0 ? (positionValue / acct) * 100 : null
  const isLong = valid && e > s
  const rr = valid && t > 0 && perShareRisk
    ? (isLong ? (t - e) : (e - t)) / perShareRisk
    : null

  return (
    <div className="terminal-tool">
      <div className="terminal-tool-header">
        <span className="terminal-panel-title">Position Size & Risk Calculator</span>
      </div>

      <div className="terminal-tool-form">
        <label className="terminal-tool-field">
          <span>Account Size ($)</span>
          <input value={account} onChange={ev => setAccount(ev.target.value)} inputMode="decimal" />
        </label>
        <label className="terminal-tool-field">
          <span>Risk per Trade (%)</span>
          <input value={riskPct} onChange={ev => setRiskPct(ev.target.value)} inputMode="decimal" />
        </label>
        <label className="terminal-tool-field">
          <span>Entry Price ($)</span>
          <input value={entry} onChange={ev => setEntry(ev.target.value)} inputMode="decimal" placeholder="e.g. 100" />
        </label>
        <label className="terminal-tool-field">
          <span>Stop Loss ($)</span>
          <input value={stop} onChange={ev => setStop(ev.target.value)} inputMode="decimal" placeholder="e.g. 95" />
        </label>
        <label className="terminal-tool-field">
          <span>Target ($ · optional)</span>
          <input value={target} onChange={ev => setTarget(ev.target.value)} inputMode="decimal" placeholder="e.g. 115" />
        </label>
      </div>

      {valid && shares != null ? (
        <>
          <div className="terminal-tool-results">
            <Result label="Direction" value={isLong ? 'LONG' : 'SHORT'} cls={isLong ? 't-green' : 't-red'} />
            <Result label="Dollar Risk" value={`$${dollarRisk!.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
            <Result label="Risk / Share" value={`$${perShareRisk!.toFixed(2)}`} />
            <Result label="Shares to Trade" value={shares.toLocaleString('en-US')} highlight />
            <Result label="Position Value" value={`$${positionValue!.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
            <Result
              label="% of Account"
              value={`${pctOfAccount!.toFixed(1)}%`}
              cls={pctOfAccount! > 100 ? 't-red' : undefined}
            />
            {rr != null && (
              <Result label="Reward : Risk" value={`${rr.toFixed(2)} : 1`} cls={rr >= 2 ? 't-green' : rr < 1 ? 't-red' : undefined} />
            )}
          </div>
          {risk > 3 && (
            <div className="terminal-tool-warn">
              Risking {risk}% per trade is aggressive — most position-sizing frameworks cap risk at 1–2% of the account so that a losing streak is survivable (ten straight 2% losses ≈ −18%; ten 10% losses ≈ −65%).
            </div>
          )}
          {pctOfAccount! > 100 && (
            <div className="terminal-tool-warn">
              Position exceeds account size — this would require margin/leverage.
            </div>
          )}
          {shares === 0 && (
            <div className="terminal-tool-warn">
              Risk budget too small for even 1 share at this stop distance.
            </div>
          )}
        </>
      ) : (
        <div className="terminal-tool-empty">
          Enter account size, risk %, entry and stop — results update instantly.
        </div>
      )}

      <ToolHelp
        howTo={[
          'Enter your account size and the % of it you are willing to lose if this one trade fails (1–2% is the common professional cap).',
          'Enter your planned entry price and stop-loss price. Entry above stop = long; entry below stop = short.',
          'Optionally add a target price to see the reward:risk ratio. The tool tells you how many shares keep your loss at the chosen limit.',
        ]}
        meaning={[
          ['Dollar Risk', 'The most you lose if the stop is hit at its price: account × risk %.'],
          ['Risk / Share', 'Distance between entry and stop — the loss per share if stopped out.'],
          ['Shares to Trade', 'Dollar risk ÷ risk per share, rounded down. The core output: this size makes any stopped-out trade cost the same fraction of your account.'],
          ['% of Account', 'How much of your capital the position ties up. Over 100% means leverage.'],
          ['Reward : Risk', 'Distance to target ÷ distance to stop. At 2:1 you can be wrong more often than right and still break even — below 1:1 the math is against you.'],
        ]}
        methodology={[
          'shares = floor((account × risk%) ÷ |entry − stop|). Direction is inferred from entry vs stop.',
          'Reward:risk = |target − entry| ÷ |entry − stop|, using your prices exactly as entered.',
          'Everything is computed locally in your browser — no data leaves the page.',
        ]}
        caveats={[
          'A stop-loss order does not guarantee the stop price — gaps and fast markets can fill worse (gap risk), so real losses can exceed the calculated dollar risk.',
          'No commissions, borrowing costs (shorts), or taxes are included.',
          'Position sizing controls loss per trade; it says nothing about whether the trade idea itself is good.',
        ]}
      />

      <ToolDisclaimer />
    </div>
  )
}

function Result({ label, value, cls, highlight }: { label: string; value: string; cls?: string; highlight?: boolean }) {
  return (
    <div className={`terminal-tool-result ${highlight ? 'highlight' : ''}`}>
      <span className="terminal-tool-result-label">{label}</span>
      <span className={`terminal-tool-result-value ${cls || ''}`}>{value}</span>
    </div>
  )
}
