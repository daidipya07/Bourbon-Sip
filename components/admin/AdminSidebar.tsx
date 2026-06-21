'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavItem { label: string; href: string; icon: string; external?: boolean }
interface NavGroup { section: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: '◉' },
    ],
  },
  {
    section: 'Content',
    items: [
      { label: 'Articles',       href: '/admin/articles',        icon: '✦' },
      { label: 'Tipsy Reads',    href: '/admin/tipsy-reads',     icon: '◈' },
      { label: 'Weekly Signals', href: '/admin/weekly-signals',  icon: '◎' },
    ],
  },
  {
    section: 'Site',
    items: [
      { label: 'View Site', href: '/', icon: '↗', external: true },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      background: '#080808',
      borderRight: '1px solid #161616',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #111' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 900, color: '#c8963e', letterSpacing: '-0.3px' }}>
          Bourbon Pour
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#333', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Admin
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {NAV.map(group => (
          <div key={group.section} style={{ marginBottom: '4px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '2px', padding: '10px 20px 6px' }}>
              {group.section}
            </div>
            {group.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 20px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  textDecoration: 'none',
                  color: isActive(item.href) ? '#e8dcc8' : '#555',
                  background: isActive(item.href) ? '#111' : 'transparent',
                  borderLeft: isActive(item.href) ? '2px solid #c8963e' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '10px', color: isActive(item.href) ? '#c8963e' : '#333' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #111' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#333',
            background: 'transparent',
            border: '1px solid #1a1a1a',
            borderRadius: '5px',
            padding: '8px 12px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          ← Sign out
        </button>
      </div>
    </aside>
  )
}
