import TerminalClient from '@/components/terminal/TerminalClient'
import type { TerminalView } from '@/components/terminal/CommandBar'
import type { ToolId } from '@/components/terminal/tools/ToolsPanel'

const VIEWS: TerminalView[] = ['chart', 'markets', 'heatmap', 'macro', 'news', 'earnings', 'tools']
const TOOLS: ToolId[] = ['technicals', 'portfolio', 'backtest', 'risk', 'correlation']
const SYMBOL_RE = /^[A-Z0-9.:-]{1,20}$/i

export default async function TerminalPage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string; view?: string; tool?: string }>
}) {
  const sp = await searchParams
  const symbol = sp.symbol && SYMBOL_RE.test(sp.symbol) ? sp.symbol.toUpperCase() : undefined
  const view = (VIEWS as string[]).includes(sp.view ?? '') ? (sp.view as TerminalView) : undefined
  const tool = (TOOLS as string[]).includes(sp.tool ?? '') ? (sp.tool as ToolId) : undefined

  return <TerminalClient initialSymbol={symbol} initialView={view} initialTool={tool} />
}
