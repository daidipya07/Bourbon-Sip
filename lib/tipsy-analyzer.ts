import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface AnalysisResult {
  bourbon_take: string
  proof_score: number
  market_impact: number
  geo_impact: number
  tech_disruption: number
  regulatory_weight: number
  bourbon_strength: number
}

const DAILY_LIMIT = 20

// Simple in-memory counter — resets on server restart (fine for a cron + admin setup)
const usageTracker = { date: '', count: 0 }

function checkDailyLimit(): boolean {
  const today = new Date().toISOString().split('T')[0]
  if (usageTracker.date !== today) {
    usageTracker.date = today
    usageTracker.count = 0
  }
  if (usageTracker.count >= DAILY_LIMIT) return false
  usageTracker.count++
  return true
}

export async function analyzeArticle(
  title: string,
  publication: string,
  description: string,
  category: string,
  authority: number = 70
): Promise<AnalysisResult> {
  if (!checkDailyLimit()) {
    throw new Error('Daily AI analysis limit reached (20/day). Resets at midnight.')
  }

  const prompt = `You are an editor at Bourbon Pour — a sharp, evidence-focused finance and technology intelligence publication. Your voice is precise, direct, and analytical. No hype. No fluff.

Analyze this article and return a JSON object with exactly these fields:

1. "bourbon_take": A 2-3 sentence editorial take in Bourbon Pour's voice. Lead with the most important implication. Be specific. Reference the numbers if available.

2. "proof_score": 0-100. How credible and well-sourced is this article?
   - 90-100: Primary source (official filing, direct statement, government data)
   - 75-89: Major established outlet (Reuters, FT, WSJ, Bloomberg) with multiple sources
   - 60-74: Single journalist report with named sources
   - 40-59: Analysis piece, few primary sources
   - 0-39: Opinion, blog, speculation

3. "market_impact": 0-100. How much does this move financial markets or affect asset prices/valuations?

4. "geo_impact": 0-100. Geopolitical significance — trade, sanctions, elections, war, diplomacy?

5. "tech_disruption": 0-100. Does this change how an industry works or accelerate/threaten existing tech?

6. "regulatory_weight": 0-100. Policy, legal, regulatory implications for companies or markets?

7. "bourbon_strength": The integer average of market_impact + geo_impact + tech_disruption + regulatory_weight divided by 4.

Publication authority baseline: ${authority}/100 (use this to calibrate proof_score).

Article:
Title: ${title}
Publication: ${publication}
Category: ${category}
Description: ${description}

Return ONLY valid JSON. No markdown. No explanation.`

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 400,
    response_format: { type: 'json_object' },
  })

  const raw = response.choices[0].message.content || '{}'
  const parsed = JSON.parse(raw)

  return {
    bourbon_take:       String(parsed.bourbon_take || ''),
    proof_score:        Math.min(100, Math.max(0, Number(parsed.proof_score) || 70)),
    market_impact:      Math.min(100, Math.max(0, Number(parsed.market_impact) || 50)),
    geo_impact:         Math.min(100, Math.max(0, Number(parsed.geo_impact) || 50)),
    tech_disruption:    Math.min(100, Math.max(0, Number(parsed.tech_disruption) || 50)),
    regulatory_weight:  Math.min(100, Math.max(0, Number(parsed.regulatory_weight) || 50)),
    bourbon_strength:   Math.min(100, Math.max(0, Number(parsed.bourbon_strength) || 50)),
  }
}
