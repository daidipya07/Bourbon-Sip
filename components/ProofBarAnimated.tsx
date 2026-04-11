'use client'

import { useEffect, useRef } from 'react'

interface Props {
  target: number
  delay?: number
  observeParent?: boolean
}

export default function ProofBarAnimated({ target, delay = 600, observeParent = false }: Props) {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (observeParent) {
      const parent = fillRef.current?.closest('.sip-preview') as HTMLElement | null
      if (!parent) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(e => {
            if (e.isIntersecting && fillRef.current) {
              fillRef.current.style.width = target + '%'
              observer.unobserve(e.target)
            }
          })
        },
        { threshold: 0.3 }
      )
      observer.observe(parent)
      return () => observer.disconnect()
    } else {
      const timer = setTimeout(() => {
        if (fillRef.current) fillRef.current.style.width = target + '%'
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [target, delay, observeParent])

  return (
    <div className="proof-bar-track">
      <div className="proof-bar-fill" ref={fillRef} />
    </div>
  )
}
