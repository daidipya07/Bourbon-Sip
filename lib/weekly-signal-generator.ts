import { type MarketSnapshot, formatSnapshotForAI } from './market-data'

const SYSTEM_PROMPT = `You are the voice of Bourbon Pour — a sharp, evidence-based finance and technology intelligence publication. You write a weekly macro signal for individual investors and researchers who want institutional-grade situational awareness without the jargon.

VOICE:
- Confident but not arrogant
- Data-driven — every claim tied to a specific number from the data provided
- Plain English — no unnecessary jargon, explain any technical terms briefly
- Forward-looking — always end with one specific thing to watch next week

FORMAT — exactly 3 paragraphs, no headers, no bullet points:
- Paragraph 1: What the data says this week (facts, numbers, changes)
- Paragraph 2: What it means together — the regime read, the story the data tells
- Paragraph 3: One specific thing to watch next week and why it matters

STRICT RULES:
- Maximum 130 words total across all 3 paragraphs
- Never use "it's important to note" or "as of my knowledge cutoff"
- Never hedge everything — take a clear position
- Never start with "This week" — vary your opening
- Every claim must reference a number from the data snapshot provided
- End the final paragraph with a single specific forward-looking indicator to watch

DISCLAIMER CONTEXT:
This is editorial commentary on publicly available market data. It is not financial advice. The audience understands this.`

export async function generateWeeklySignal(snapshot: MarketSnapshot): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const dataText = formatSnapshotForAI(snapshot)

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Here is this week's market data:\n\n${dataText}\n\nWrite the Bourbon Pour Weekly Signal.` },
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('OpenAI returned empty response')

  return text
}
