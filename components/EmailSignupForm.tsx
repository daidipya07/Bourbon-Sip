'use client'

import { useState, KeyboardEvent } from 'react'
import { showToast } from './Toast'

interface Props {
  inputId?: string
  placeholder?: string
  buttonLabel?: string
  source: string
  inputClassName?: string
  buttonClassName?: string
}

export default function EmailSignupForm({
  inputId,
  placeholder = 'your@email.com',
  buttonLabel = 'Pour Me In',
  source,
  inputClassName = 'sip-input',
  buttonClassName = 'sip-submit',
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit() {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      showToast('Enter a valid email address')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source }),
      })
      const data = await res.json()

      if (res.ok) {
        setEmail('')
        setStatus('success')
        showToast(data.message || "You're in. First Sip drops tomorrow at 6:30 AM ET 🥃")
      } else {
        setStatus('error')
        showToast(data.error || 'Something went wrong — try again.')
      }
    } catch {
      setStatus('error')
      showToast('Network error — please try again.')
    } finally {
      // Reset so form can be used again
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <>
      <input
        id={inputId}
        type="email"
        className={inputClassName}
        placeholder={placeholder}
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={handleKey}
        autoComplete="email"
        disabled={status === 'loading'}
      />
      <button
        className={buttonClassName}
        onClick={handleSubmit}
        disabled={status === 'loading'}
        style={{ opacity: status === 'loading' ? 0.7 : 1 }}
      >
        {status === 'loading' ? '...' : buttonLabel}
      </button>
    </>
  )
}
