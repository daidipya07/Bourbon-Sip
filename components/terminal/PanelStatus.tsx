'use client'

import { useEffect, useState } from 'react'
import { freshness } from './usePolling'

// Compact freshness / stale / error indicator for a panel header.
// Re-renders on its own so "3s ago" advances without the parent polling.
export default function PanelStatus({
  lastUpdated,
  stale,
  error,
  onRetry,
}: {
  lastUpdated: number | null
  stale: boolean
  error: boolean
  onRetry: () => void
}) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 5000)
    return () => clearInterval(id)
  }, [])

  if (error) {
    return (
      <button className="terminal-panel-status err" onClick={onRetry} title="Retry">
        ⚠ error · retry
      </button>
    )
  }
  if (lastUpdated == null) return null

  return (
    <span className={`terminal-panel-status ${stale ? 'stale' : ''}`} title={stale ? 'Data may be delayed' : 'Up to date'}>
      <span className="terminal-panel-status-dot" />
      {stale ? 'delayed' : freshness(lastUpdated)}
    </span>
  )
}
