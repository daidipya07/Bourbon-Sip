export interface ArticleSource {
  text: string
  type: 'primary' | 'secondary' | 'analysis'
}

export interface Article {
  id: string
  cat: string
  catLabel: string
  catColor: string
  headline: string
  subtitle: string
  proof: number
  dd: number   // data density
  xr: number   // cross-references
  rw: number   // recency weight
  time: string
  read: string
  date: string
  dataPoints: number
  crossRefs: number
  sources: ArticleSource[]
  content: string
  excerpt: string
}

export const articles: Article[] = [
  {
    id: 'ai-infrastructure-bet',
    cat: 'ai',
    catLabel: 'AI / ML',
    catColor: 'var(--red)',
    headline: 'The $40B AI Infrastructure Bet Nobody Is Talking About',
    subtitle: 'While everyone watches the model wars, the real AI play is happening in the plumbing.',
    proof: 92,
    dd: 94,
    xr: 88,
    rw: 91,
    time: '4 hours ago',
    read: '6 min',
    date: 'Mar 25, 2026',
    dataPoints: 14,
    crossRefs: 5,
    excerpt:
      'While everyone watches OpenAI, a quiet GPU build-out is reshaping enterprise compute.',
    sources: [
      { text: 'Azure GPU capacity reservation data — Q1 2026 allocation reports', type: 'primary' },
      { text: 'NVIDIA distribution and shipment filings — SEC quarterly reports', type: 'primary' },
      { text: 'Cloud procurement contract analysis — enterprise software database', type: 'analysis' },
      { text: 'Fortune 50 financial services firm infrastructure filings', type: 'primary' },
      { text: 'Comparable cloud infrastructure cost modeling', type: 'analysis' },
    ],
    content: `<p>Microsoft's Azure GPU reservations hit an all-time high last week. That alone isn't surprising — demand has been climbing for 18 months straight, and every earnings call from Satya Nadella includes the phrase "unprecedented demand" at least twice. What's surprising is the <em>pattern.</em></p>
<p>A single enterprise customer appears to have reserved roughly 40% of all new GPU capacity added in Q1 2026. Not 10%. Not 20%. <strong>Forty percent.</strong> That's not a customer running a few experiments with copilots. That's someone building a foundation model — in-house, behind closed doors, at a scale that rivals what OpenAI was doing 18 months ago.</p>

<div class="data-callout"><div class="dc-label">Key Data Point</div><div class="dc-value">40%</div><div class="dc-context">Share of new Azure GPU capacity reserved by a single enterprise customer in Q1 2026 — the largest single-customer allocation in Azure's history.</div><div class="dc-source">Source: Azure capacity API data, cross-referenced with NVIDIA distribution filings</div></div>

<p>We cross-referenced Azure capacity data with cloud procurement filings and NVIDIA's distribution schedules. The math eliminates most obvious candidates. It's not Microsoft itself (they use separate internal allocations). It's not OpenAI (they have dedicated Azure capacity under a different contract structure). It's not a hyperscaler — Google and Amazon build their own.</p>

<h2>The Financial Services Signal</h2>

<p>The evidence points to a Fortune 50 financial services firm building an internal foundation model for risk assessment and trade execution. Three data points converge:</p>

<p><strong>First,</strong> the GPU reservation pattern matches internal model training, not inference. The allocation is front-loaded — massive compute blocks reserved for 8-week periods with option to extend. That's a training cadence, not a deployment pattern.</p>

<p><strong>Second,</strong> enterprise software contract filings show a major financial services firm signed a $200M+ multi-year Azure commitment in late Q4 2025 — one of the largest non-tech enterprise cloud deals ever recorded. The timing aligns perfectly with the capacity reservations.</p>

<div class="signal-box"><div class="signal-box-title"><div class="signal-dot"></div> Disruptor Radar Signal</div><div class="signal-text">This pattern was flagged by our Disruptor Radar 14 days before this article published. The signal type: "Compute Infrastructure Anomaly" in the Financial Services sector. Proof Score at detection: 78. Current score with additional evidence: 92.</div></div>

<p><strong>Third,</strong> and this is the piece that locks it in — hiring data. A Fortune 50 financial services firm (which we're choosing not to name until we have filing confirmation) has hired 34 machine learning engineers from Google DeepMind, Meta FAIR, and Anthropic in the last 90 days. That's not an "AI strategy" hire. That's a foundation model team.</p>

<h2>What This Means</h2>

<p>If a major bank is building its own foundation model, the implications cascade through the entire AI value chain. First, it validates the thesis that <em>inference economics will matter more than model capabilities</em> within 18 months. A bank doesn't build its own model because GPT-5 isn't good enough — they build it because they can't send proprietary trading data to someone else's API.</p>

<div class="pull-quote"><p>A bank doesn't build its own model because GPT-5 isn't good enough. They build it because they can't send proprietary trading data to someone else's API.</p><cite>Bourbon Pour Analysis</cite></div>

<p>Second, it means GPU demand isn't peaking — it's <strong>bifurcating.</strong> We're entering a world where the AI compute market splits between model providers (OpenAI, Anthropic, Google) and enterprise builders who need sovereign compute. CoreWeave's IPO timing suddenly makes even more sense.</p>

<p>Third, watch the talent pipeline. If one bank is building, others are watching. Goldman, JPMorgan, and Citadel all have the balance sheet to follow. The AI talent war is about to get a new front — and compensation in AI just got a new ceiling.</p>

<h2>The Bottom Line</h2>

<p>The biggest AI infrastructure bet of 2026 isn't happening in Silicon Valley. It's happening on a trading floor. And by the time it becomes public, the market will have already moved.</p>

<p>We'll be tracking this signal through the Disruptor Radar. Set your alerts for Financial Services sector, compute infrastructure anomaly type, at 80+ Proof Score threshold. When the announcement comes — and it will — you'll know 30 days before everyone else.</p>`,
  },
  {
    id: 'fed-silence',
    cat: 'markets',
    catLabel: 'Markets',
    catColor: 'var(--amber)',
    headline: "The Fed's Silence Is Louder Than Its Last Three Rate Decisions Combined",
    subtitle: "Powell hasn't spoken in 23 days. Every time this has happened, markets weren't ready for what came next.",
    proof: 94,
    dd: 96,
    xr: 90,
    rw: 93,
    time: '6 hours ago',
    read: '8 min',
    date: 'Mar 25, 2026',
    dataPoints: 18,
    crossRefs: 6,
    excerpt:
      "Powell's calculated absence from the discourse says more than 12 FOMC statements combined.",
    sources: [
      { text: 'Federal Reserve communication records — historical analysis 1994–2026', type: 'primary' },
      { text: 'FOMC meeting transcripts and minutes', type: 'primary' },
      { text: 'Bond market positioning data — CFTC weekly reports', type: 'primary' },
      { text: 'Fed funds futures curves — CME FedWatch', type: 'primary' },
      { text: 'Historical silence-to-policy-shift correlation analysis', type: 'analysis' },
      { text: 'Treasury market microstructure data', type: 'analysis' },
    ],
    content: `<p>Jerome Powell has not made a public statement in 23 days. No press conferences, no Congressional testimony, no off-the-record briefings, no carefully worded speeches at economic conferences. Twenty-three days of silence from the most powerful central banker on Earth.</p>
<p>That's the longest silence from a sitting Fed Chair since Ben Bernanke's 19-day stretch in May 2013 — which preceded the Taper Tantrum, a bond market sell-off that wiped out <strong>$1.4 trillion</strong> in global bond value in 8 weeks.</p>

<div class="data-callout"><div class="dc-label">Historical Pattern</div><div class="dc-value">8 of 9</div><div class="dc-context">Times a Fed Chair silence of 14+ days preceded a policy shift that surprised markets (since 1994). The only exception: Yellen's 16-day stretch in 2015, which preceded a widely telegraphed rate hike.</div><div class="dc-source">Source: Federal Reserve communication records, FOMC historical analysis</div></div>

<p>We analyzed every Fed Chair silence longer than 14 days since 1994. There have been 9 instances. In <strong>8 of those 9 cases,</strong> the silence preceded a policy shift that caught markets off guard. The one exception was Yellen's 16-day silence in late 2015, which preceded the most telegraphed rate hike in modern history — and even then, the <em>pace</em> of subsequent hikes surprised the market.</p>

<h2>What the Bond Market Already Knows</h2>

<p>Here's the part nobody is writing about: the bond market is already pricing something in. Fed funds futures have shifted 12 basis points in the last 10 trading days despite no new economic data, no Fed communication, and no meaningful change in inflation expectations. That's the bond market moving on the <em>absence</em> of information — treating the silence itself as a signal.</p>

<p>CFTC positioning data shows net short positions in 10-year Treasury futures at 18-month highs. The smart money isn't waiting for Powell to speak. They're positioning for what they think he'll say when he finally does.</p>

<div class="pull-quote"><p>The bond market is moving on the absence of information — treating the silence itself as a signal.</p><cite>Bourbon Pour Analysis</cite></div>

<p>The question isn't <em>whether</em> Powell's next statement will move markets. It's whether you're positioned correctly before it happens. The 10-year Treasury yield has traded in a 5 basis point range for 12 consecutive sessions — the tightest range since 2019. Historically, that kind of calm breaks violently. Direction unknown. Magnitude? Usually 40+ basis points.</p>

<p>Set your alerts. The silence won't last forever — and when it breaks, it will break fast.</p>`,
  },
  {
    id: 'fintech-goldman-analysts',
    cat: 'tech',
    catLabel: 'Technology',
    catColor: 'var(--blue)',
    headline: "The Fintech Goldman's Analysts Are All Downloading Quietly",
    subtitle: 'Internal adoption metrics tell a story Wall Street isn\'t ready to hear.',
    proof: 79,
    dd: 81,
    xr: 74,
    rw: 82,
    time: '8 hours ago',
    read: '5 min',
    date: 'Mar 25, 2026',
    dataPoints: 9,
    crossRefs: 3,
    excerpt: "Internal adoption metrics tell a story Wall Street isn't ready to hear.",
    sources: [
      { text: 'Enterprise software download and usage analytics — anonymized corporate data', type: 'analysis' },
      { text: 'App store enterprise category rankings — Q1 2026', type: 'primary' },
      { text: 'LinkedIn job posting analysis — financial services sector', type: 'analysis' },
    ],
    content: `<p>There's a fintech app that Goldman Sachs analysts are downloading — not on company devices, on personal phones. Not because Goldman told them to. Because it's genuinely better than what Goldman provides internally for a specific workflow that matters deeply to junior analysts.</p>

<p>We noticed the pattern in enterprise app store data. A B2B fintech with no press, no funding announcements in 18 months, and a team of 12 people is sitting at the top of the "Finance — Professional Tools" category. Its users skew heavily toward employees at bulge-bracket banks, and the usage pattern is telling: it's being used during market hours, on weekdays, in 15-to-45-minute sessions.</p>

<h2>What the App Does</h2>

<p>Without naming it (we're still verifying the internal adoption numbers), the product automates a specific type of comparable company analysis that junior analysts currently spend 4–6 hours building manually in Excel. The app does it in under 3 minutes. The output quality, based on our testing, is roughly equivalent to a second-year analyst's work — not perfect, but good enough to use as a starting point.</p>

<div class="data-callout"><div class="dc-label">Time Savings</div><div class="dc-value">4–6 hrs → 3 min</div><div class="dc-context">Time to complete comparable company analysis — manual Excel vs. this tool. Based on our direct testing across 12 different comp sets.</div><div class="dc-source">Source: Bourbon Pour internal testing, enterprise app analytics</div></div>

<p>The implication is obvious: if a 12-person startup has built something that replaces 4–6 hours of junior analyst work, and the junior analysts themselves are adopting it in secret, the product-market fit is real. The only question is when the banks notice — and whether they acquire, block, or try to replicate it.</p>

<h2>The Bottom Line</h2>

<p>Watch this space. When a tool gets adopted bottom-up inside Goldman Sachs, it either becomes a firm-wide platform or it gets banned. There's rarely a middle ground. Either outcome is a signal worth tracking.</p>`,
  },
]
