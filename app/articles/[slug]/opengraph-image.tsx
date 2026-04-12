import { ImageResponse } from 'next/og'
import { getArticleBySlug } from '@/lib/articles'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  const title = article?.title ?? 'Bourbon Pour Intelligence'
  const categoryLabel = article?.categoryLabel ?? 'Analysis'
  const categoryColor = article?.categoryColor === 'var(--blue)' ? '#3498DB'
    : article?.categoryColor === 'var(--red)' ? '#E74C3C'
    : '#C47A2A'
  const proofScore = article?.proofScore ?? 90
  const readTime = article?.readTime ?? '8 min'
  const excerpt = article?.excerpt ?? 'Evidence-scored intelligence for serious professionals.'

  // Truncate title to prevent overflow
  const displayTitle = title.length > 80 ? title.slice(0, 78) + '…' : title
  const displayExcerpt = excerpt.length > 120 ? excerpt.slice(0, 118) + '…' : excerpt

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0A0805',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Amber glow background */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,122,42,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #C47A2A, #E8A94B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 900,
                color: '#0A0805',
              }}
            >
              B
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#F5EFE4', letterSpacing: 0.5 }}>
              Bourbon Pour
            </span>
          </div>

          {/* Category badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              border: `1px solid ${categoryColor}`,
              borderRadius: 4,
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: categoryColor }} />
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: categoryColor, letterSpacing: 2, textTransform: 'uppercase' }}>
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, justifyContent: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#F5EFE4', lineHeight: 1.15, letterSpacing: -0.5 }}>
            {displayTitle}
          </div>
          <div style={{ fontSize: 18, color: '#9C9080', lineHeight: 1.5, maxWidth: 840 }}>
            {displayExcerpt}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 28,
            borderTop: '1px solid rgba(245,239,228,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 500, color: '#2ECC71' }}>
                {proofScore}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#5C5445', textTransform: 'uppercase', letterSpacing: 1 }}>
                Proof Score
              </span>
            </div>
            <div style={{ width: 1, height: 24, background: 'rgba(245,239,228,0.1)' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#5C5445' }}>{readTime} read</span>
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#3a2e22', letterSpacing: 1 }}>
            DATA IS THE NEW CURRENCY™
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
