'use client'

import { useEffect, useRef } from 'react'

export default function ReadingProgress() {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onScroll() {
      const body = document.getElementById('articleBody')
      if (!body || !fillRef.current) return
      const rect = body.getBoundingClientRect()
      const scrolled = Math.max(0, -rect.top)
      const pct = Math.min(100, Math.max(0, (scrolled / body.scrollHeight) * 100))
      fillRef.current.style.width = pct + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="progress-bar">
      <div className="progress-fill" ref={fillRef} />
    </div>
  )
}
