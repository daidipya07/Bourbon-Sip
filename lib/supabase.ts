import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy-initialized public client — avoids crash at build time when env vars
// are not yet available (Next.js collects page data before runtime)
let _publicClient: SupabaseClient | null = null

export function getPublicClient() {
  if (!_publicClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase public env vars not set')
    _publicClient = createClient(url, key)
  }
  return _publicClient
}

// Kept for backwards compat — any file importing `supabase` directly
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getPublicClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

// Admin client (server-only, service_role bypasses RLS)
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('Supabase admin env vars not set')
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
