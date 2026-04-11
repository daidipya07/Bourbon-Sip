export interface RadarEntry {
  name: string
  sector: string
  signal: string
  proof: number
  badge: 'HOT' | 'RISING' | 'WATCH'
  cls: 'hot' | 'rising' | 'watch'
}

export const radarData: RadarEntry[] = [
  {
    name: 'Perplexity AI',
    sector: 'AI',
    signal: 'Unusual Series C activity, talent acquisition from Google DeepMind accelerating',
    proof: 94,
    badge: 'HOT',
    cls: 'hot',
  },
  {
    name: 'Stripe Treasury',
    sector: 'Fintech',
    signal: 'Regulatory filing surge — banking infrastructure build signals $1B facility',
    proof: 87,
    badge: 'HOT',
    cls: 'hot',
  },
  {
    name: 'Anduril',
    sector: 'Defense Tech',
    signal: 'Patent velocity spike in autonomous systems, DOD procurement signals',
    proof: 81,
    badge: 'RISING',
    cls: 'rising',
  },
  {
    name: 'Mistral AI',
    sector: 'AI',
    signal: 'European compute infrastructure scaling, partnership signals with major cloud',
    proof: 78,
    badge: 'RISING',
    cls: 'rising',
  },
  {
    name: 'Figure AI',
    sector: 'AI',
    signal: 'Humanoid robotics talent migration, secondary market premium growing',
    proof: 72,
    badge: 'RISING',
    cls: 'rising',
  },
  {
    name: 'Databricks',
    sector: 'Cloud',
    signal: 'IPO preparation signals, governance restructuring detected',
    proof: 69,
    badge: 'WATCH',
    cls: 'watch',
  },
  {
    name: 'xAI Grok',
    sector: 'AI',
    signal: 'GitHub commit velocity unusual — new model architecture signals',
    proof: 66,
    badge: 'WATCH',
    cls: 'watch',
  },
  {
    name: 'CoreWeave',
    sector: 'Cloud',
    signal: 'GPU infrastructure expansion, S-1 preparation underway',
    proof: 61,
    badge: 'WATCH',
    cls: 'watch',
  },
]
