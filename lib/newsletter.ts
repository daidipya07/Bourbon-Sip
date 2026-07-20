// The Daily Pour — automated daily newsletter.
//
// Authenticity model: the email is assembled ONLY from
//   1. tipsy_reads rows with status='published' — every one was human-approved
//      in the admin before publishing, and each links to its original source
//      with the publication credited;
//   2. live market data from FRED + Finnhub via getMarketSnapshot();
//   3. the latest human-published weekly_signals row (labeled as editorial).
// Nothing is generated or fetched from unvetted sources at send time.

import { getAdminClient } from './supabase'
import { getMarketSnapshot, type MarketSnapshot } from './market-data'

export interface NewsletterRead {
  id: string
  title: string
  publication: string | null
  url: string
  category: string | null
  description: string | null
  bourbon_take: string | null
  proof_score: number | null
  published_at: string
}

interface WeeklySignal {
  week_of: string
  signal_text: string | null
  regime: string | null
}

export interface NewsletterPayload {
  itemCount: number
  subject: string
  previewText: string
  html: string
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bourbonsip.com'

// Reads published in the last `hours` (default 24) — the send gate counts these.
export async function getRecentPublishedReads(hours = 24): Promise<NewsletterRead[]> {
  const supabase = getAdminClient()
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString()
  const { data, error } = await supabase
    .from('tipsy_reads')
    .select('id, title, publication, url, category, description, bourbon_take, proof_score, published_at')
    .eq('status', 'published')
    .gte('published_at', since)
    .order('proof_score', { ascending: false, nullsFirst: false })
    .limit(8)
  if (error) throw new Error(`tipsy_reads query failed: ${error.message}`)
  return (data || []) as NewsletterRead[]
}

async function getLatestSignal(): Promise<WeeklySignal | null> {
  try {
    const supabase = getAdminClient()
    const { data } = await supabase
      .from('weekly_signals')
      .select('week_of, signal_text, regime')
      .eq('status', 'published')
      .order('week_of', { ascending: false })
      .limit(1)
      .maybeSingle()
    return (data as WeeklySignal) || null
  } catch {
    return null
  }
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function pctCell(label: string, price: number | null | undefined, pct: number | null | undefined, prefix = '$'): string {
  if (price == null) return ''
  const up = (pct ?? 0) >= 0
  const color = up ? '#2e9e5b' : '#d5484f'
  return `<td style="padding:8px 10px;background:#141414;border-radius:3px;">
    <div style="font-size:10px;color:#8a8a8a;letter-spacing:1px;text-transform:uppercase;">${label}</div>
    <div style="font-size:15px;color:#e8e8e8;font-weight:600;">${prefix}${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
    ${pct != null ? `<div style="font-size:11px;color:${color};">${up ? '+' : ''}${pct.toFixed(2)}%</div>` : ''}
  </td><td style="width:6px;"></td>`
}

function readBlock(r: NewsletterRead): string {
  return `
  <tr><td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
    <div style="font-size:10px;color:#c8963e;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">
      ${esc(r.publication || 'Source')}${r.category ? ` · ${esc(r.category)}` : ''}${r.proof_score != null ? ` · Proof ${r.proof_score}` : ''}
    </div>
    <a href="${esc(r.url)}" style="font-size:16px;color:#f0f0f0;font-weight:600;text-decoration:none;line-height:1.4;">${esc(r.title)}</a>
    ${r.description ? `<div style="font-size:13px;color:#9a9a9a;line-height:1.5;margin-top:5px;">${esc(r.description.slice(0, 220))}${r.description.length > 220 ? '…' : ''}</div>` : ''}
    ${r.bourbon_take ? `<div style="font-size:12px;color:#b09a6a;font-style:italic;line-height:1.5;margin-top:7px;border-left:2px solid #c8963e;padding-left:9px;">The Bourbon Take (editorial opinion): ${esc(r.bourbon_take)}</div>` : ''}
  </td></tr>`
}

export function renderNewsletterHtml(
  reads: NewsletterRead[],
  snap: MarketSnapshot | null,
  signal: WeeklySignal | null,
  dateLabel: string
): string {
  const marketRow = snap
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:6px 0 2px;"><tr>
        ${pctCell('S&P 500 · SPY', snap.spy?.price, snap.spy?.pctChange)}
        ${pctCell('Nasdaq · QQQ', snap.qqq?.price, snap.qqq?.pctChange)}
        ${pctCell('Bitcoin', snap.btc?.price, snap.btc?.pctChange)}
      </tr></table>
      <div style="font-size:11px;color:#8a8a8a;margin-top:8px;line-height:1.7;">
        ${snap.fred.vix != null ? `VIX <b style="color:#cfcfcf;">${snap.fred.vix.toFixed(1)}</b> · ` : ''}
        ${snap.fred.yield10y != null ? `US 10Y <b style="color:#cfcfcf;">${snap.fred.yield10y.toFixed(2)}%</b> · ` : ''}
        ${snap.fred.yieldCurve != null ? `Curve (10Y−2Y) <b style="color:#cfcfcf;">${snap.fred.yieldCurve.toFixed(2)}%</b> · ` : ''}
        Regime <b style="color:${snap.regimeColor};">${esc(snap.regimeLabel)}</b>
      </div>`
    : ''

  const signalBlock = signal?.signal_text
    ? `<tr><td style="padding:16px 0 4px;">
        <div style="font-size:11px;color:#c8963e;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">This Week's Signal · week of ${esc(signal.week_of)}</div>
        <div style="font-size:13px;color:#cfc3ad;line-height:1.6;border-left:3px solid #c8963e;padding:8px 12px;background:#14100a;border-radius:3px;">${esc(signal.signal_text)}</div>
      </td></tr>`
    : ''

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#0a0a0a;">
<tr><td align="center" style="padding:28px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:Georgia,'Times New Roman',serif;">

  <tr><td style="padding-bottom:18px;border-bottom:2px solid #c8963e;">
    <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c8963e;font-weight:bold;">■ Bourbon Pour</div>
    <div style="font-size:26px;color:#f0f0f0;font-weight:bold;margin-top:6px;">The Daily Pour</div>
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#8a8a8a;margin-top:4px;">${esc(dateLabel)} · ${reads.length} new read${reads.length === 1 ? '' : 's'}, hand-picked &amp; reviewed</div>
  </td></tr>

  <tr><td style="padding:18px 0 4px;">
    <div style="font-family:Arial,sans-serif;font-size:11px;color:#c8963e;letter-spacing:2px;text-transform:uppercase;">Market Pulse</div>
    ${marketRow}
  </td></tr>

  ${signalBlock}

  <tr><td style="padding-top:16px;">
    <div style="font-family:Arial,sans-serif;font-size:11px;color:#c8963e;letter-spacing:2px;text-transform:uppercase;">Today's Tipsy Reads</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
      ${reads.map(readBlock).join('')}
    </table>
  </td></tr>

  <tr><td align="center" style="padding:22px 0 6px;">
    <a href="${SITE}/tipsy-reads" style="font-family:Arial,sans-serif;display:inline-block;background:#c8963e;color:#0a0a0a;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;padding:11px 26px;border-radius:3px;text-decoration:none;">Read Everything on Bourbon Pour</a>
    <div style="font-family:Arial,sans-serif;font-size:11px;color:#8a8a8a;margin-top:10px;">
      <a href="${SITE}/data-pulse" style="color:#8a8a8a;">Data Pulse</a> · <a href="${SITE}/terminal" style="color:#8a8a8a;">Terminal</a> · <a href="${SITE}/articles" style="color:#8a8a8a;">Intelligence Desk</a>
    </div>
  </td></tr>

  <tr><td style="padding-top:22px;border-top:1px solid #1e1e1e;font-family:Arial,sans-serif;font-size:10px;color:#6a6a6a;line-height:1.7;">
    Every read above was hand-selected and reviewed before publishing; headlines link to the original source and the publication is credited. Market data: FRED (Federal Reserve) &amp; Finnhub, delayed. "The Bourbon Take" and the weekly signal are editorial opinion — not investment advice, research, or a recommendation. Bourbon Pour is a personal, non-commercial project.
    <br><br>
    You're receiving this because you subscribed (and confirmed) at bourbonsip.com. The Daily Pour only goes out on days with three or more new reads — no filler.
    <br><br>
    <a href="*|ARCHIVE|*" style="color:#8a8a8a;">View in browser</a> · <a href="*|UNSUB|*" style="color:#8a8a8a;">Unsubscribe</a><br>
    *|LIST:ADDRESSLINE|*
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export async function buildDailyNewsletter(): Promise<NewsletterPayload> {
  const [reads, snap, signal] = await Promise.all([
    getRecentPublishedReads(24),
    getMarketSnapshot().catch(() => null),
    getLatestSignal(),
  ])

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York',
  })

  const top = reads[0]
  return {
    itemCount: reads.length,
    subject: `The Daily Pour — ${reads.length} new reads · ${dateLabel.split(',')[0]}`,
    previewText: top ? `${top.title} — plus ${reads.length - 1} more, with today's market pulse.` : 'Today’s hand-picked reads and market pulse.',
    html: renderNewsletterHtml(reads, snap, signal, dateLabel),
  }
}

// Create + send a Mailchimp campaign to the full list.
export async function sendMailchimpCampaign(payload: NewsletterPayload): Promise<{ campaignId: string }> {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const listId = process.env.MAILCHIMP_LIST_ID
  const dc = process.env.MAILCHIMP_DC || 'us1'
  if (!apiKey || !listId) throw new Error('Mailchimp env vars not set')

  const base = `https://${dc}.api.mailchimp.com/3.0`
  const headers = { Authorization: `apikey ${apiKey}`, 'Content-Type': 'application/json' }
  const replyTo = process.env.MAILCHIMP_REPLY_TO || 'daidipyasharma@gmail.com'

  const createRes = await fetch(`${base}/campaigns`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'regular',
      recipients: { list_id: listId },
      settings: {
        subject_line: payload.subject,
        preview_text: payload.previewText,
        title: `Daily Pour ${new Date().toISOString().split('T')[0]}`,
        from_name: 'Bourbon Pour',
        reply_to: replyTo,
        auto_footer: false,
      },
    }),
  })
  const campaign = await createRes.json()
  if (!createRes.ok || !campaign.id) {
    throw new Error(`Campaign create failed: ${campaign.detail || createRes.status}`)
  }

  const contentRes = await fetch(`${base}/campaigns/${campaign.id}/content`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ html: payload.html }),
  })
  if (!contentRes.ok) {
    const d = await contentRes.json().catch(() => ({}))
    throw new Error(`Campaign content failed: ${d.detail || contentRes.status}`)
  }

  const sendRes = await fetch(`${base}/campaigns/${campaign.id}/actions/send`, {
    method: 'POST',
    headers,
  })
  if (!sendRes.ok) {
    const d = await sendRes.json().catch(() => ({}))
    throw new Error(`Campaign send failed: ${d.detail || sendRes.status}`)
  }

  return { campaignId: campaign.id }
}
