'use client'

import { useState, type ReactNode } from 'react'

// Collapsible per-tool education block: how to use it, exactly how the numbers
// are computed, and honest caveats. Credibility = showing the methodology.
export default function ToolHelp({ howTo, meaning, methodology, caveats }: {
  howTo: string[]
  meaning: Array<[string, string]>
  methodology: string[]
  caveats: string[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="terminal-tool-help">
      <button className="terminal-tool-help-toggle" onClick={() => setOpen(o => !o)}>
        <span className="terminal-tool-help-icon">{open ? '−' : '?'}</span>
        How to use this tool & what the numbers mean
      </button>
      {open && (
        <div className="terminal-tool-help-body">
          <HelpSection title="How to use">
            <ol>{howTo.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </HelpSection>
          <HelpSection title="What the output means">
            <dl>
              {meaning.map(([term, def]) => (
                <div key={term} className="terminal-tool-help-def">
                  <dt>{term}</dt>
                  <dd>{def}</dd>
                </div>
              ))}
            </dl>
          </HelpSection>
          <HelpSection title="Methodology (exactly what we compute)">
            <ul>{methodology.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </HelpSection>
          <HelpSection title="Limitations — read before relying on this">
            <ul className="terminal-tool-help-caveats">{caveats.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </HelpSection>
        </div>
      )}
    </div>
  )
}

function HelpSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="terminal-tool-help-section">
      <div className="terminal-sector-label" style={{ padding: '6px 0 2px' }}>{title}</div>
      {children}
    </div>
  )
}
