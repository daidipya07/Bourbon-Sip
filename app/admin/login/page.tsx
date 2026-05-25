'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setError(data.error || 'Invalid password')
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '32px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 900, color: '#c8963e', marginBottom: '8px' }}>
            Bourbon Pour
          </div>
          <div style={{ fontSize: '14px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Admin Panel
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#161616',
                border: '1px solid #2a2a2a',
                borderRadius: '6px',
                color: '#e8dcc8',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#e05252', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#555' : '#c8963e',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
