import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { createClient } from '@supabase/supabase-js'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'daily-sip')

export interface ArticleMeta {
  slug: string
  title: string
  subtitle: string
  date: string
  category: string
  categoryLabel: string
  categoryColor: string
  readTime: string
  proofScore: number
  dataDensity: number
  crossRefs: number
  recencyWeight: number
  dataPoints: number
  sourcesCount: number
  excerpt: string
  featured: boolean
  heroImage?: string
  source: 'supabase' | 'markdown'
}

export interface ArticleSource {
  text: string
  type: 'primary' | 'secondary' | 'analysis'
}

export interface FullArticle extends ArticleMeta {
  contentHtml: string
  sources: ArticleSource[]
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToMeta(row: any): ArticleMeta {
  return {
    slug: row.slug,
    title: row.title || '',
    subtitle: row.subtitle || '',
    date: row.published_at ? row.published_at.split('T')[0] : row.created_at?.split('T')[0] || '',
    category: row.category || '',
    categoryLabel: row.category_label || '',
    categoryColor: 'var(--amber)',
    readTime: row.read_time || '5 min',
    proofScore: row.proof_score || 0,
    dataDensity: row.data_density || 0,
    crossRefs: row.cross_refs || 0,
    recencyWeight: row.recency_weight || 0,
    dataPoints: 0,
    sourcesCount: 0,
    excerpt: row.excerpt || '',
    featured: false,
    heroImage: row.cover_image || undefined,
    source: 'supabase',
  }
}

// ── Markdown helpers ──────────────────────────────────────────────────────────

function getSlugFromFilename(filename: string): string {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
}

function getMarkdownArticles(): ArticleMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  const filenames = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))

  return filenames.map(filename => {
    const fullPath = path.join(CONTENT_DIR, filename)
    const { data } = matter(fs.readFileSync(fullPath, 'utf8'))
    return {
      slug: data.slug || getSlugFromFilename(filename),
      title: data.title || '',
      subtitle: data.subtitle || '',
      date: data.date || '',
      category: data.category || '',
      categoryLabel: data.categoryLabel || '',
      categoryColor: data.categoryColor || 'var(--amber)',
      readTime: data.readTime || '5 min',
      proofScore: data.proofScore || 0,
      dataDensity: data.dataDensity || 0,
      crossRefs: data.crossRefs || 0,
      recencyWeight: data.recencyWeight || 0,
      dataPoints: data.dataPoints || 0,
      sourcesCount: (data.sources || []).length,
      excerpt: data.excerpt || '',
      featured: data.featured || false,
      heroImage: data.heroImage || undefined,
      source: 'markdown' as const,
    }
  }).sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAllArticles(): Promise<ArticleMeta[]> {
  const supabase = getSupabaseServerClient()
  const dbArticles: ArticleMeta[] = []

  if (supabase) {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    if (data) dbArticles.push(...data.map(dbRowToMeta))
  }

  const mdSlugs = new Set(dbArticles.map(a => a.slug))
  const mdArticles = getMarkdownArticles().filter(a => !mdSlugs.has(a.slug))

  const combined = [...dbArticles, ...mdArticles]
  combined.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
  return combined
}

export async function getRecentArticles(count: number): Promise<ArticleMeta[]> {
  const all = await getAllArticles()
  return all.slice(0, count)
}

export async function getArticleBySlug(slug: string): Promise<FullArticle | null> {
  // Try Supabase first
  const supabase = getSupabaseServerClient()
  if (supabase) {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (data) {
      return {
        ...dbRowToMeta(data),
        contentHtml: data.body_html || '',
        sources: (data.sources || '')
          .split('\n')
          .filter(Boolean)
          .map((s: string) => ({ text: s, type: 'primary' as const })),
      }
    }
  }

  // Fall back to markdown
  if (!fs.existsSync(CONTENT_DIR)) return null
  const filenames = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
  const filename = filenames.find(f => {
    const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8'))
    return (data.slug || getSlugFromFilename(f)) === slug
  })

  if (!filename) return null
  const fullPath = path.join(CONTENT_DIR, filename)
  const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'))
  const processed = await remark().use(remarkHtml, { allowDangerousHtml: true }).process(content)

  return {
    slug: data.slug || getSlugFromFilename(filename),
    title: data.title || '',
    subtitle: data.subtitle || '',
    date: data.date || '',
    category: data.category || '',
    categoryLabel: data.categoryLabel || '',
    categoryColor: data.categoryColor || 'var(--amber)',
    readTime: data.readTime || '5 min',
    proofScore: data.proofScore || 0,
    dataDensity: data.dataDensity || 0,
    crossRefs: data.crossRefs || 0,
    recencyWeight: data.recencyWeight || 0,
    dataPoints: data.dataPoints || 0,
    sourcesCount: (data.sources || []).length,
    excerpt: data.excerpt || '',
    featured: data.featured || false,
    heroImage: data.heroImage || undefined,
    source: 'markdown',
    contentHtml: processed.toString(),
    sources: data.sources || [],
  }
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const all = await getAllArticles()
  return all.map(a => a.slug)
}
