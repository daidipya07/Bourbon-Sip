export interface OGData {
  title: string
  description: string
  image: string | null
  siteName: string
  url: string
}

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return ''
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1]?.trim() || ''
}

export async function fetchOGData(url: string): Promise<OGData> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BourbonPour/1.0; +https://bourbonpour.vercel.app)',
        'Accept': 'text/html',
      },
    })
    clearTimeout(timeout)

    // Only read first 50KB — enough for head tags
    const reader = res.body?.getReader()
    let html = ''
    let bytes = 0
    if (reader) {
      while (bytes < 50000) {
        const { done, value } = await reader.read()
        if (done) break
        html += new TextDecoder().decode(value)
        bytes += value?.length || 0
      }
      reader.cancel()
    }

    const ogTitle       = extractMeta(html, 'og:title')
    const ogDescription = extractMeta(html, 'og:description')
    const ogImage       = extractMeta(html, 'og:image')
    const ogSiteName    = extractMeta(html, 'og:site_name')
    const twitterImage  = extractMeta(html, 'twitter:image')
    const metaDesc      = extractMeta(html, 'description')
    const pageTitle     = extractTitle(html)

    return {
      title:       ogTitle || pageTitle,
      description: ogDescription || metaDesc,
      image:       ogImage || twitterImage || null,
      siteName:    ogSiteName,
      url,
    }
  } catch {
    return { title: '', description: '', image: null, siteName: '', url }
  }
}
