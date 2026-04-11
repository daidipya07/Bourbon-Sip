export interface TipsyRead {
  cat: string
  tag: string
  time: string
  text: string
  proof: number
}

export const tipsyData: TipsyRead[] = [
  {
    cat: 'markets',
    tag: 'Markets',
    time: '2h ago',
    text: `<strong>Nvidia's market cap just passed the GDP of Canada.</strong> Canada has not commented. To be fair, Canada rarely does. But here's the thing: NVDA added the equivalent of Argentina's entire economy in the last 90 days alone. At this rate, Jensen Huang will be eligible for a seat at the G7 by December.`,
    proof: 72,
  },
  {
    cat: 'ai',
    tag: 'AI',
    time: '3h ago',
    text: `A 23-year-old made <strong>$4.2M shorting a stock recommended by an AI chatbot.</strong> The chatbot has not been fired. The 23-year-old has started a hedge fund called "Inverse GPT Capital." We wish we were joking. His thesis: "If the AI is bullish, reality is probably more complicated." He's not wrong.`,
    proof: 68,
  },
  {
    cat: 'crypto',
    tag: 'Crypto',
    time: '4h ago',
    text: `<strong>Bitcoin just spent 47 consecutive days above $65K</strong> — the longest sustained run in its history. And the weirdest part? Search interest for "Bitcoin" on Google is at a 2-year low. The retail crowd isn't here yet. Institutional wallets are doing all the heavy lifting. When retail figures this out, things get interesting.`,
    proof: 84,
  },
  {
    cat: 'culture',
    tag: 'Culture',
    time: '5h ago',
    text: `<strong>Goldman Sachs just made "AI literacy" a requirement for all incoming analysts.</strong> Not optional. Not a suggested Coursera course. Mandatory. Starting June 2026, every new analyst must pass an internal AI proficiency exam before their first day on the desk. The finance industry is about to have a very awkward summer.`,
    proof: 78,
  },
  {
    cat: 'tech',
    tag: 'Tech',
    time: '6h ago',
    text: `<strong>Apple's App Store rejected 14 AI apps last week</strong> — all for the same reason: "insufficient human oversight." None of the rejections were made public. We found them buried in developer forum complaints. The pattern suggests Apple is quietly building a moat around "human-first AI" as a brand differentiator.`,
    proof: 81,
  },
  {
    cat: 'energy',
    tag: 'Energy',
    time: '7h ago',
    text: `A single <strong>hyperscale data center in Virginia now consumes more electricity than the entire city of Richmond.</strong> The data center has 340 employees. Richmond has 230,000 residents. Amazon, which operates the facility, has applied for permits to build three more in the same county.`,
    proof: 89,
  },
  {
    cat: 'markets',
    tag: 'Markets',
    time: '8h ago',
    text: `<strong>The 10-year Treasury yield has moved less than 5 basis points in 12 consecutive sessions.</strong> That's the longest period of calm since 2019. Every time this has happened in the last 30 years, a significant move followed within 3 weeks. Direction unknown. Magnitude? Usually 40+ bps. Set your alerts.`,
    proof: 91,
  },
  {
    cat: 'ai',
    tag: 'AI',
    time: '9h ago',
    text: `<strong>OpenAI is now spending $2.4M per day on compute.</strong> That's $876M annualized, up from $560M last year. At current trajectory, their compute costs will exceed the R&D budgets of Ford, General Motors, and Stellantis combined by Q4. The question isn't whether this is sustainable. The question is: what are they building that requires this?`,
    proof: 87,
  },
  {
    cat: 'tech',
    tag: 'Tech',
    time: '10h ago',
    text: `<strong>Spotify just quietly acquired a podcast analytics company for $40M.</strong> Nobody covered it. The company — AudioGraph — had 6 employees and one product: an AI that predicts podcast ad performance before the episode airs. Accuracy rate? 84%. Spotify's ad revenue is about to get very interesting.`,
    proof: 74,
  },
]
