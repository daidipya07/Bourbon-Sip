'use client'

import { useEffect, useState } from 'react'
import type { SupabaseClient, Session } from '@supabase/supabase-js'
import { getPublicClient } from '@/lib/supabase'

// `session === undefined` means "not yet resolved"; `null` means signed out.
export function useSupabaseSession(): { client: SupabaseClient | null; session: Session | null | undefined } {
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    try {
      const c = getPublicClient()
      setClient(c)
      c.auth.getSession().then(({ data }) => setSession(data.session))
      const { data: sub } = c.auth.onAuthStateChange((_e, s) => setSession(s))
      return () => sub.subscription.unsubscribe()
    } catch {
      setSession(null)
    }
  }, [])

  return { client, session }
}
