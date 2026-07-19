'use client'

import { useState } from 'react'
import { ToolDisclaimer } from './ToolsPanel'

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
