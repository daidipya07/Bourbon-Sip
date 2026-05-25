'use client'

import { useRouter } from 'next/navigation'

export default function AdminLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'transparent',
        border: '1px solid #2a2a2a',
        color: '#888',
        padding: '8px 14px',
        borderRadius: '6px',
        fontSize: '13px',
        cursor: 'pointer',
      }}
    >
      Sign out
    </button>
  )
}
