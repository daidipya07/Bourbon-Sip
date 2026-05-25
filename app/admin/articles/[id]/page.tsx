import { getAdminClient } from '@/lib/supabase'
import ArticleForm from '@/components/admin/ArticleForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = getAdminClient()
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).single()

  if (error || !data) notFound()

  return <ArticleForm mode="edit" initialData={data} />
}
