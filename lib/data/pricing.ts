export interface PricingPlan {
  tier: string
  name: string
  price: string
  per: string
  desc: string
  popular: boolean
  features: string[]
  cta: 'btn-primary' | 'btn-ghost'
  label: string
}

export const plans: PricingPlan[] = [
  {
    tier: 'Free',
    name: 'The Pour',
    price: '$0',
    per: '',
    desc: 'The daily edge, on us.',
    popular: false,
    features: [
      'The Daily Sip™ 5x/week',
      'Tipsy Reads™ feed access',
      '3 Data Pulse gauges',
      'Proof Score on all articles',
      'Weekly Radar snapshot',
    ],
    cta: 'btn-ghost',
    label: 'Start Free',
  },
  {
    tier: 'Pro',
    name: 'Proof Pro',
    price: '$19',
    per: '/mo',
    desc: 'Full intelligence access for serious professionals.',
    popular: true,
    features: [
      'Everything in Free',
      'Full Data Pulse — all 6 gauges live',
      'Live Disruptor Radar — 32 companies',
      'Pour Journal™ AI intelligence log',
      'Proof of Work™ community access',
      'No advertisements',
    ],
    cta: 'btn-primary',
    label: 'Go Pro',
  },
  {
    tier: 'Intelligence',
    name: 'Proof Intelligence',
    price: '$99',
    per: '/mo',
    desc: 'For analysts who need the deepest edge.',
    popular: false,
    features: [
      'Everything in Pro',
      'Sector-specific Radars',
      'Custom alert thresholds',
      'Data API access',
      'Analyst Q&A sessions',
      'Exportable intelligence reports',
    ],
    cta: 'btn-ghost',
    label: 'Get Intelligence',
  },
  {
    tier: 'Institutional',
    name: 'Proof Institutional',
    price: '$999',
    per: '/mo',
    desc: 'Enterprise intelligence infrastructure.',
    popular: false,
    features: [
      'Everything in Intelligence',
      'White-label Data Pulse',
      'Custom monitoring dashboards',
      'Dedicated analyst support',
      'Bloomberg Terminal integration',
    ],
    cta: 'btn-ghost',
    label: 'Contact Sales',
  },
]
