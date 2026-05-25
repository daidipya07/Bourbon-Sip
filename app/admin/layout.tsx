import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Bourbon Pour',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e8dcc8',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}>
      {children}
    </div>
  )
}
