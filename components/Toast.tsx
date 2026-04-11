'use client'

import { useEffect, useRef, useCallback } from 'react'

// Global singleton toast — call window.__showToast from anywhere
// Components use the useToast hook instead
let globalShow: ((msg: string) => void) | null = null

export function showToast(msg: string) {
  if (globalShow) globalShow(msg)
}

export default function ToastProvider() {
  const toastRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((msg: string) => {
    const el = toastRef.current
    if (!el) return
    el.textContent = msg
    el.classList.add('show')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => el.classList.remove('show'), 2500)
  }, [])

  useEffect(() => {
    globalShow = show
    return () => { globalShow = null }
  }, [show])

  return <div className="toast" ref={toastRef} />
}
