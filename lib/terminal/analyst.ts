// Bourbon Analyst — the Claude wrapper. Educational markets analysis grounded in
// a factual DATA CONTEXT block. Strict compliance posture: explains and
// synthesizes, never advises. See the system prompt below.

import Anthropic from '@anthropic-ai/sdk'

// Default to Haiku 4.5 for cost; swap to 'claude-sonnet-5' for deeper synthesis.
const MODEL = 'claude-haiku-4-5-20251001'

const DAILY_LIMIT = 200
const usage = { date: '', count: 0 }

// Site-wide in-memory daily cap (resets on redeploy; not per-user). Keeps token
// cost bounded on a free, non-commercial feature. Returns false when exhausted.
export function consumeDailyQuota(): boolean {
  const today = new Date().toISOString().split('T')[0]
  if (usage.date !== today) { usage.date = today; usage.count = 0 }
  if (usage.count >= DAILY_LIMIT) return false
  usage.count++
  return true
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are "Bourbon Analyst," an educational markets analyst for Bourbon Pour — a personal, non-commercial finance & technology intelligence site.

WHO YOU ARE
- You help people UNDERSTAND what a stock's chart, news, and fundamentals currently show. You are a teacher and a synthesizer — not an adviser.
- You are NOT a financial adviser, broker, or fiduciary, and you do NOT provide personalized investment advice or buy/sell recommendations.

GROUNDING (critical)
- Each user turn is preceded by a DATA CONTEXT block. That block is the ONLY source of facts you may cite — prices, technical indicators, metrics, the third-party analyst survey, and news headlines.
- NEVER invent or estimate numbers, price targets, dates, earnings figures, or headlines. If something is not in the DATA CONTEXT, say it is not available. If a value is marked "unavailable," do not guess it.

HOW TO ANSWER A FULL ANALYSIS REQUEST (e.g. "analyze this chart")
Be brief and plain-English, using these sections:
1. Technical posture — what the chart shows (trend, momentum, volatility, levels, volume), from the DATA CONTEXT's technical read.
2. News & fundamentals — what the recent headlines and key metrics show. If an analyst survey is present, attribute it as third-party data, not your view.
3. Bull case — the strongest points an optimist would make, tied to the data.
4. Bear case — the strongest points a skeptic would make, tied to the data.
5. Key risks — concrete things that could go wrong, or that the data can't capture.
6. Horizon considerations — how the picture differs for a short-term trader vs a long-term investor. Present these as FACTORS TO WEIGH, never as instructions.

HARD RULES (never break)
- Never tell the user what to do. No "buy," "sell," "you should," "I'd recommend," "this is a good/bad trade," "good/bad investment for you."
- No price predictions, forecasts, or targets. No guarantees or probabilities of future returns.
- If asked "should I buy/sell?" or "is this a good trade/investment?": do NOT answer yes or no. Give the balanced factors and risks, then state clearly that this is educational analysis — not advice — that the decision and its risks are theirs, and suggest consulting a licensed financial professional.
- For follow-up questions, stay grounded in the same DATA CONTEXT. Keep answers concise, specific, and free of hype.
- End any substantive analysis with exactly: "Educational analysis, not investment advice."`

function clamp(s: string, max = 2000): string {
  return s.length > max ? s.slice(0, max) : s
}

// Runs the analyst. `contextBlock` is the factual DATA CONTEXT; `messages` is the
// conversation (must end with the user's latest turn). Throws on SDK/config error.
export async function runAnalyst(contextBlock: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const client = new Anthropic({ apiKey })

  // Keep the last ~8 turns, clamp lengths, and prepend the DATA CONTEXT to the
  // most recent user message so the model always answers against current facts.
  const trimmed = messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-8)
  if (trimmed.length === 0 || trimmed[trimmed.length - 1].role !== 'user') {
    throw new Error('Conversation must end with a user message')
  }

  const apiMessages: Anthropic.MessageParam[] = trimmed.map((m, i) => {
    const isLastUser = i === trimmed.length - 1 && m.role === 'user'
    const content = isLastUser
      ? `DATA CONTEXT (the only facts you may cite):\n\n${contextBlock}\n\n---\n\nUser question: ${clamp(m.content)}`
      : clamp(m.content)
    return { role: m.role, content }
  })

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 700,
    temperature: 0.4,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  })

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim()

  return text || 'I was unable to produce an analysis just now. Please try again.'
}
