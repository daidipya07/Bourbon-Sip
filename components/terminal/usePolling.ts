'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface PollingState<T> {
  data: T | null
  loading: boolean
  error: boolean
  lastUpdated: number | null
  stale: boolean
  refetch: () => void
}

interface PollingOptions {
  // Refresh interval in ms. Polling pauses while the tab is hidden.
  intervalMs?: number
  // Data older than this (ms) is flagged `stale`. Defaults to 2.5× interval.
  staleAfterMs?: number
  // Skip fetching entirely (e.g. missing symbol).
  enabled?: boolean
}

// Shared polling primitive for terminal panels. Adds: in-flight dedup, automatic
// pause when the tab is hidden (saves API calls), a refetch on tab re-focus, a
// lastUpdated timestamp, and error/stale flags with manual retry. `fetcher` is
// re-read from a ref each tick so callers don't need to memoize it.
export function usePolling<T>(fetcher: () => Promise<T>, options: PollingOptions = {}): PollingState<T> {
  const { intervalMs = 60_000, enabled = true } = options
  const staleAfterMs = options.staleAfterMs ?? intervalMs * 2.5

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const inFlight = useRef(false)
  const mounted = useRef(true)

  const run = useCallback(async () => {
    if (inFlight.current || !enabled) return
    inFlight.current = true
    try {
      const result = await fetcherRef.current()
      if (!mounted.current) return
      setData(result)
      setError(false)
      setLastUpdated(Date.now())
    } catch {
      if (!mounted.current) return
      setError(true)
    } finally {
      inFlight.current = false
      if (mounted.current) setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    mounted.current = true
    if (!enabled) {
      setLoading(false)
      return
    }

    run()

    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (timer) return
      timer = setInterval(() => {
        if (document.visibilityState === 'visible') run()
      }, intervalMs)
    }
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null }
    }

    // Refetch immediately when the tab becomes visible again after being hidden.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') { run(); start() }
      else stop()
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)

    // Tick a clock so `stale` recomputes even without new data.
    const clock = setInterval(() => mounted.current && setNow(Date.now()), 15_000)

    return () => {
      mounted.current = false
      stop()
      clearInterval(clock)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [run, enabled, intervalMs])

  const stale = lastUpdated != null && now - lastUpdated > staleAfterMs

  return { data, loading, error, lastUpdated, stale, refetch: run }
}

// "3s ago" / "2m ago" — shared freshness formatter for panel headers.
export function freshness(lastUpdated: number | null): string {
  if (lastUpdated == null) return ''
  const diff = Math.floor((Date.now() - lastUpdated) / 1000)
  if (diff < 5) return 'live'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}
