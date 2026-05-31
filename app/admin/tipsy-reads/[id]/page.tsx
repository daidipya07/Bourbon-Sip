import { getAdminClient } from '@/lib/supabase'
import TipsyReadForm from '@/components/admin/TipsyReadForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditTipsyReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getAdminClient()
  const { data, error } = await supabase.from('tipsy_reads').select('*').eq('id', id).single()
  if (error || !data) notFound()
  return <TipsyReadForm mode="edit" initialData={data} />
}
