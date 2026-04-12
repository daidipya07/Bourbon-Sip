'use client'

import { useEffect, useRef, useState } from 'react'

const TARGET = 5

export default function StreakCounter() {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !done.current) {
            done.current = true
            let cur = 0
            const iv = setInterval(() => {
              cur += Math.ceil((TARGET - cur) * 0.06) + 1
              if (cur >= TARGET) {
                cur = TARGET
                clearInterval(iv)
              }
              setCount(cur)
            }, 25)
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="sip-streak" ref={ref}>
      <div className="sip-streak-fire">🔥</div>
      <div>
        <div className="sip-streak-num">{count}</div>
        <div className="sip-streak-label">Articles published</div>
      </div>
    </div>
  )
}
