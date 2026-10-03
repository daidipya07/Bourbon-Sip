import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bourbon Pour — Coming Soon',
  description: 'Bourbon Pour is being poured. Back soon.',
}

export default function ComingSoonPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--deep)',
        color: '#e8dcc8',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: 'var(--amber)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--deep)',
          marginBottom: '28px',
        }}
      >
        B
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          margin: '0 0 12px',
        }}
      >
        Bourbon Pour
      </h1>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'var(--amber)',
          margin: '0 0 32px',
        }}
      >
        Pouring something new
      </p>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          color: '#9a8f7e',
          maxWidth: '420px',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        We&apos;re rebuilding behind the scenes. Check back shortly.
      </p>
    </main>
  )
}
