'use client'

import { useCallback } from 'react'
import { usePolling } from './usePolling'

interface DataPulse { regimeLabel?: string; regimeColor?: string }

// Compact macro-regime indicator (from the FRED-backed /api/data-pulse) for the
// terminal status bar. Clicking switches to the Macro tab.
export default function RegimePill({ onClick }: { onClick?: () => void }) {
  const fetcher = useCallback(async (): Promise<DataPulse> => {
    const res = await fetch('/api/data-pulse')
    if (!res.ok) throw new Error('regime')
    return await res.json()
  }, [])

  const { data } = usePolling(fetcher, { intervalMs: 15 * 60_000 })

  if (!data?.regimeLabel) return null
  const color = data.regimeColor || '#c8963e'

  return (
    <button className="terminal-regime-pill" onClick={onClick} title="Macro regime — click for Macro tab" style={{ color }}>
      <span className="terminal-regime-dot" style={{ background: color }} />
      {data.regimeLabel}
    </button>
  )
}
