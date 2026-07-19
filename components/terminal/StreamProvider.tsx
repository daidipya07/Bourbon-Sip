'use client'

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'

// One shared Finnhub WebSocket for the whole terminal. Panels subscribe to the
// symbols they display; the store fans trade ticks out to just those consumers.
// Uses the public key (NEXT_PUBLIC_FINNHUB_KEY) since a browser WS can't hide it.
// Finnhub streams US equities/ETFs during market hours and BINANCE:* crypto 24/7;
// when no socket/tick is available, panels fall back to their REST baseline.

interface Tick { price: number; ts: number }

class StreamStore {
  private ws: WebSocket | null = null
  private prices = new Map<string, Tick>()
  private listeners = new Map<string, Set<() => void>>()
  private refcount = new Map<string, number>()
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private readonly token: string
  connected = false

  constructor(token: string) {
    this.token = token
    this.connect()
  }

  private connect() {
    if (typeof window === 'undefined' || !this.token) return
    try {
      this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.token}`)
    } catch {
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.connected = true
      this.reconnectAttempts = 0
      // (Re)subscribe to everything currently referenced.
      for (const sym of this.refcount.keys()) this.send('subscribe', sym)
    }

    this.ws.onmessage = ev => {
      let msg: { type?: string; data?: Array<{ s: string; p: number; t: number }> }
      try { msg = JSON.parse(ev.data) } catch { return }
      if (msg.type !== 'trade' || !Array.isArray(msg.data)) return
      // Keep only the last trade per symbol in this batch.
      const latest = new Map<string, { p: number; t: number }>()
      for (const d of msg.data) latest.set(d.s, { p: d.p, t: d.t })
      for (const [sym, d] of latest) {
        this.prices.set(sym, { price: d.p, ts: d.t })
        this.emit(sym)
      }
    }

    this.ws.onclose = () => { this.connected = false; this.scheduleReconnect() }
    this.ws.onerror = () => { this.ws?.close() }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    const delay = Math.min(30_000, 1000 * 2 ** this.reconnectAttempts)
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => { this.reconnectTimer = null; this.connect() }, delay)
  }

  private send(type: 'subscribe' | 'unsubscribe', symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ type, symbol }))
  }

  private emit(symbol: string) {
    const ls = this.listeners.get(symbol)
    if (ls) for (const l of ls) l()
  }

  subscribe(symbol: string, cb: () => void): () => void {
    if (!this.listeners.has(symbol)) this.listeners.set(symbol, new Set())
    this.listeners.get(symbol)!.add(cb)

    const n = (this.refcount.get(symbol) || 0) + 1
    this.refcount.set(symbol, n)
    if (n === 1) this.send('subscribe', symbol)

    return () => {
      const set = this.listeners.get(symbol)
      set?.delete(cb)
      const left = (this.refcount.get(symbol) || 1) - 1
      if (left <= 0) {
        this.refcount.delete(symbol)
        this.send('unsubscribe', symbol)
      } else {
        this.refcount.set(symbol, left)
      }
    }
  }

  getPrice(symbol: string): Tick | undefined {
    return this.prices.get(symbol)
  }

  close() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
  }
}

const StreamContext = createContext<StreamStore | null>(null)

export function StreamProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StreamStore | null>(null)
  if (storeRef.current === null && typeof window !== 'undefined') {
    const token = process.env.NEXT_PUBLIC_FINNHUB_KEY || ''
    if (token) storeRef.current = new StreamStore(token)
  }

  useEffect(() => {
    return () => { storeRef.current?.close(); storeRef.current = null }
  }, [])

  return <StreamContext.Provider value={storeRef.current}>{children}</StreamContext.Provider>
}

// Latest streamed trade price for a symbol, or null when unavailable (no socket,
// market closed, or the feed doesn't cover this symbol). Subscribes on mount.
export function useStreamedPrice(symbol: string | null): number | null {
  const store = useContext(StreamContext)

  const subscribe = (cb: () => void) => {
    if (!store || !symbol) return () => {}
    return store.subscribe(symbol, cb)
  }
  const getSnapshot = () => (store && symbol ? store.getPrice(symbol)?.price ?? null : null)

  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}

// Flash direction class for a value that just changed ('flash-up'/'flash-down'),
// auto-clearing after a moment. Used to pulse prices green/red on each tick.
export function useFlash(value: number | null): string {
  const prev = useRef<number | null>(null)
  const [dir, setDir] = useState('')

  useEffect(() => {
    if (value == null) return
    if (prev.current != null && value !== prev.current) {
      setDir(value > prev.current ? 'flash-up' : 'flash-down')
      const id = setTimeout(() => setDir(''), 500)
      prev.current = value
      return () => clearTimeout(id)
    }
    prev.current = value
  }, [value])

  return dir
}
