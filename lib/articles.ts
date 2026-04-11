import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

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
}

export interface ArticleSource {
  text: string
  type: 'primary' | 'secondary' | 'analysis'
}

export interface FullArticle extends ArticleMeta {
  contentHtml: string
  sources: ArticleSource[]
}

function getSlugFromFilename(filename: string): string {
  // Remove the date prefix (YYYY-MM-DD-) and .md extension
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  const filenames = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))

  const articles = filenames.map(filename => {
    const fullPath = path.join(CONTENT_DIR, filename)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)

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
    } as ArticleMeta
  })

  // Sort by date descending
  return articles.sort((a, b) => {
    if (a.date > b.date) return -1
    if (a.date < b.date) return 1
    return 0
  })
}

export function getRecentArticles(count: number): ArticleMeta[] {
  return getAllArticles().slice(0, count)
}

export async function getArticleBySlug(slug: string): Promise<FullArticle | null> {
  if (!fs.existsSync(CONTENT_DIR)) return null

  const filenames = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))

  const filename = filenames.find(f => {
    const fileSlug = matter(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8')).data.slug
      || getSlugFromFilename(f)
    return fileSlug === slug
  })

  if (!filename) return null

  const fullPath = path.join(CONTENT_DIR, filename)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const processedContent = await remark()
    .use(remarkHtml, { allowDangerousHtml: true })
    .process(content)
  const contentHtml = processedContent.toString()

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
    contentHtml,
    sources: data.sources || [],
  }
}

export function getAllArticleSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  const filenames = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
  return filenames.map(filename => {
    const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf8'))
    return data.slug || getSlugFromFilename(filename)
  })
}
