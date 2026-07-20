'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SupabaseClient, Session } from '@supabase/supabase-js'
import { getPublicClient } from '@/lib/supabase'

type Mode = 'signin' | 'signup'

const card: React.CSSProperties = {
  background: 'var(--card, #111)',
  border: '1px solid var(--border, #1e1e1e)',
  borderRadius: '6px',
  padding: '24px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0a0a0a',
  border: '1px solid #262626',
  borderRadius: '4px',
  color: '#e8e8e8',
  padding: '11px 14px',
  fontSize: '14px',
  outline: 'none',
  marginBottom: '12px',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--amber, #c8963e)',
  color: '#0a0a0a',
  border: 'none',
  borderRadius: '4px',
  padding: '12px',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  cursor: 'pointer',
}

export default function AccountPanel() {
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [paperCash, setPaperCash] = useState<number | null>(null)

  // Client init — degrade gracefully if Supabase env isn't configured.
  useEffect(() => {
    try {
      const c = getPublicClient()
      setClient(c)
      c.auth.getSession().then(({ data }) => setSession(data.session))
      const { data: sub } = c.auth.onAuthStateChange((_e, s) => setSession(s))
      return () => sub.subscription.unsubscribe()
    } catch {
      setClient(null)
    }
  }, [])

  const loadPaperAccount = useCallback(async (c: SupabaseClient, userId: string) => {
    const { data } = await c.from('paper_accounts').select('cash').eq('user_id', userId).maybeSingle()
    if (data) { setPaperCash(Number(data.cash)); return }
    // First login (or trigger not installed) — self-provision, RLS permits own row.
    const { data: created } = await c
      .from('paper_accounts')
      .insert({ user_id: userId })
      .select('cash')
      .maybeSingle()
    setPaperCash(created ? Number(created.cash) : null)
  }, [])

  useEffect(() => {
    if (client && session?.user) loadPaperAccount(client, session.user.id)
  }, [client, session, loadPaperAccount])

  async function submit() {
    if (!client) return
    const mail = email.trim()
    if (!mail || password.length < 8) {
      setNotice({ kind: 'err', text: 'Enter your email and a password of at least 8 characters.' })
      return
    }
    setBusy(true)
    setNotice(null)
    try {
      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email: mail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/account` },
        })
        if (error) throw error
        // Supabase returns an empty identities array when the email is already registered.
        if (data.user && data.user.identities?.length === 0) {
          setNotice({ kind: 'err', text: 'That email already has an account — sign in instead.' })
          setMode('signin')
        } else {
          setNotice({ kind: 'ok', text: 'Account created — check your inbox and confirm your email to activate it.' })
        }
      } else {
        const { error } = await client.auth.signInWithPassword({ email: mail, password })
        if (error) throw error
        setNotice(null)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setNotice({ kind: 'err', text: msg.includes('Email not confirmed') ? 'Email not confirmed yet — check your inbox for the confirmation link.' : msg })
    }
    setBusy(false)
  }

  async function signOut() {
    await client?.auth.signOut()
    setPaperCash(null)
  }

  if (!client) {
    return <div style={card}><p style={{ color: '#9a9a9a', fontSize: '14px' }}>Accounts are unavailable in this environment.</p></div>
  }

  // ── Signed in ──
  if (session?.user) {
    return (
      <div style={card}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#666', marginBottom: '6px' }}>Signed in as</div>
        <div style={{ fontSize: '16px', color: '#e8e8e8', marginBottom: '20px', wordBreak: 'break-all' }}>{session.user.email}</div>

        <div style={{ background: '#0d0b08', border: '1px solid #2a2010', borderLeft: '3px solid var(--amber, #c8963e)', borderRadius: '4px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--amber, #c8963e)', marginBottom: '4px' }}>
            Paper Trading — Coming Soon
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#e8e8e8' }}>
            {paperCash != null
              ? `$${paperCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              : '$100,000.00'}
          </div>
          <div style={{ fontSize: '12px', color: '#8a8a6a', marginTop: '4px' }}>
            Virtual starting balance — reserved and waiting. Trades, positions and a leaderboard land here next.
          </div>
        </div>

        <button onClick={signOut} style={{ ...buttonStyle, background: 'none', color: '#9a9a9a', border: '1px solid #2a2a2a' }}>
          Sign Out
        </button>
      </div>
    )
  }

  // ── Signed out ──
  return (
    <div style={card}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {(['signup', 'signin'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setNotice(null) }}
            style={{
              flex: 1, padding: '9px', borderRadius: '4px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px',
              background: mode === m ? 'rgba(200,150,62,0.12)' : 'none',
              color: mode === m ? 'var(--amber, #c8963e)' : '#8a8a8a',
              border: mode === m ? '1px solid rgba(200,150,62,0.4)' : '1px solid #262626',
            }}
          >
            {m === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        ))}
      </div>

      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={inputStyle}
        autoComplete="email"
      />
      <input
        type="password"
        placeholder={mode === 'signup' ? 'Password (8+ characters)' : 'Password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        style={inputStyle}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />

      {notice && (
        <div style={{
          fontSize: '13px', lineHeight: 1.5, padding: '10px 12px', borderRadius: '4px', marginBottom: '12px',
          color: notice.kind === 'ok' ? '#7fbf8f' : '#e08a8a',
          background: notice.kind === 'ok' ? 'rgba(46,158,91,0.08)' : 'rgba(213,72,79,0.08)',
          border: `1px solid ${notice.kind === 'ok' ? 'rgba(46,158,91,0.3)' : 'rgba(213,72,79,0.3)'}`,
        }}>
          {notice.text}
        </div>
      )}

      <button onClick={submit} disabled={busy} style={{ ...buttonStyle, opacity: busy ? 0.6 : 1 }}>
        {busy ? '…' : mode === 'signup' ? 'Create Free Account' : 'Sign In'}
      </button>

      <p style={{ fontSize: '11px', color: '#6a6a6a', lineHeight: 1.6, marginTop: '14px' }}>
        Free forever — this is a personal, non-commercial project. Your email is used only for sign-in
        and account recovery; the newsletter is a separate, optional subscription.
      </p>
    </div>
  )
}
