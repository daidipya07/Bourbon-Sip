import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  redirects: async () => [
    { source: '/index.html', destination: '/', permanent: true },
    { source: '/articles.html', destination: '/articles', permanent: true },
    { source: '/article.html', destination: '/articles', permanent: true },
    { source: '/data-pulse.html', destination: '/data-pulse', permanent: true },
    { source: '/disruptor-radar.html', destination: '/disruptor-radar', permanent: true },
    { source: '/proof-score.html', destination: '/proof-score', permanent: true },
    { source: '/proof-of-work.html', destination: '/proof-of-work', permanent: true },
    { source: '/pour-journal.html', destination: '/pour-journal', permanent: true },
  ],
}

export default nextConfig
