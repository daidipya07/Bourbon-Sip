# Bourbon Pour — Claude Context

This file is auto-loaded by Claude Code at the start of every session. Keep it up to date.

---

## Project Overview

**Bourbon Pour** (`bourbonpour.vercel.app`) is a personal, non-commercial finance and technology intelligence site. Built by the repo owner as a hobby project.

**Stack:** Next.js 15 (App Router) · TypeScript · Supabase (PostgreSQL) · Vercel · Mailchimp · Finnhub · FRED API · OpenAI gpt-4o-mini

**Key constraint:** Site is personal and non-commercial. No monetization, no paid tiers, no business entity. Owner is on F1 OPT — this must remain non-commercial.

---

## Current Site Status

**SITE IS ONLINE** — Compliance review completed. Non-commercial, editorial, F1 OPT safe. Middleware only protects `/admin` routes. Goldman OBA disclosure pending filing by owner.

---

## Architecture

### Routes
| URL | File | Notes |
|-----|------|-------|
| `/` | `app/page.tsx` | Server Component, fetches from Supabase + markdown |
| `/articles` | `app/articles/page.tsx` | Lists all articles |
| `/articles/[slug]` | `app/articles/[slug]/page.tsx` | Markdown article detail |
| `/tipsy-reads` | `app/tipsy-reads/page.tsx` | Full Tipsy Reads page, Supabase data |
| `/data-pulse` | `app/data-pulse/page.tsx` | Live — real FRED + Finnhub data, AI weekly signal |
| `/disruptor-radar` | `app/disruptor-radar/page.tsx` | Static hardcoded radar entries |
| `/proof-score` | `app/proof-score/page.tsx` | Methodology page, static |
| `/about` | `app/about/page.tsx` | Static |
| `/manifesto` | `app/manifesto/page.tsx` | Static |
| `/terminal` | `app/terminal/page.tsx` | Bloomberg-style terminal — client component, own CSS (`terminal.css`), 7 views (Chart/Markets/Heatmap/Macro/News/Earnings/Tools). Command codes: `AAPL GP/DES/N`, `MKT HM ECO ERN TOOLS PORT DCA RISK CORR`, keys 1–7 |
| `/privacy` | `app/privacy/page.tsx` | Privacy Policy |
| `/terms` | `app/terms/page.tsx` | Terms of Use |
| `/admin` | `app/admin/` | Protected by JWT middleware |

### Key API Routes
| Route | Purpose |
|-------|---------|
| `POST /api/subscribe` | Mailchimp email signup |
| `POST /api/admin/login` | Sets httpOnly JWT cookie |
| `GET /api/admin/tipsy-reads` | List tipsy reads by status |
| `PUT /api/admin/tipsy-reads/[id]` | Update a tipsy read (sets published_at when status→published) |
| `POST /api/admin/tipsy-reads/[id]/analyze` | OpenAI analysis — requires admin cookie |
| `POST /api/admin/run-rss-import` | Triggers RSS import — requires admin cookie |
| `GET /api/cron/import-tipsy` | Vercel cron — requires CRON_SECRET header |
| `GET /api/cron/weekly-signal` | Vercel cron every Friday 9 AM ET — generates draft AI signal |
| `GET /api/data-pulse` | Returns MarketSnapshot JSON (FRED + Finnhub), 15-min cache |
| `GET /api/terminal/quotes?symbols=` | Batch quotes — Finnhub (60/min, works from Vercel), 60s cache |
| `GET /api/terminal/quote?symbol=` | Single quote + profile + key stats — Finnhub, Twelve Data fallback |
| `GET /api/terminal/candles?symbol=&range=` | OHLCV — Twelve Data time_series (Finnhub candles paid-only, Yahoo blocks Vercel IPs), 5-min cache |
| `GET /api/terminal/news` | Finnhub company/market news |
| `GET /api/terminal/search?q=` | Finnhub symbol search |
| `GET /api/terminal/earnings` | Finnhub earnings calendar, next 7 days, 1h cache |
| `GET /api/admin/weekly-signals` | List all weekly signals |
| `POST /api/admin/weekly-signals` | Trigger manual signal generation |
| `PUT /api/admin/weekly-signals/[id]` | Update signal status (draft → published sets published_at) |
| `POST /api/admin/fetch-og` | Fetches OG data for a URL |

### Auth
- JWT via `jose` in `lib/auth.ts`
- httpOnly cookie `admin_token`, 24h expiry
- Middleware in `middleware.ts` protects all `/admin/*` except `/admin/login`
- Admin password set via `ADMIN_SECRET` env var

---

## Database (Supabase)

**Table: `tipsy_reads`**
Key columns: `id, url, title, publication, category, description, bourbon_take, proof_score, bourbon_strength, market_impact, geo_impact, tech_disruption, regulatory_weight, og_image, source_authority, article_date, status, analyzed, published_at, created_at, updated_at`

Status values: `suggested` → `published` | `discarded`

**Important:** `published_at` is set automatically by the PUT route when `status` becomes `published`. If old rows have `null` published_at`, run:
```sql
UPDATE tipsy_reads SET published_at = created_at WHERE status = 'published' AND published_at IS NULL;
```

**Table: `weekly_signals`**
Key columns: `id, week_of (date unique), signal_text, data_snapshot (jsonb), regime, status, generated_at, published_at`
Status values: `draft` → `published` | `discarded`. Created via SQL in `supabase-weekly-signals.sql`.

**Table: `articles`** — Supabase-stored articles (editor-published via Tiptap CMS)

---

## Content Sources

### Articles (two sources, merged)
1. **Markdown files** → `content/daily-sip/*.md` — frontmatter schema: `title, subtitle, date, slug, category, categoryLabel, readTime, proofScore, dataDensity, crossRefs, recencyWeight, excerpt, featured`
2. **Supabase `articles` table** — published via admin Tiptap editor

Both sources merged and deduped in `lib/articles.ts`.

### Tipsy Reads
- Auto-imported daily via RSS (28 feeds) at 6 AM ET via Vercel cron
- Logic in `lib/rss-importer.ts` → `runRssImport()`
- OG data fetched via `lib/og-fetcher.ts`
- AI analysis via `lib/tipsy-analyzer.ts` (gpt-4o-mini, 20/day hard limit)
- Admin reviews in `/admin/tipsy-reads` → Edit → AI Analyze → Publish

---

## Key Libraries & Files

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Supabase client — `getAdminClient()` uses service role key |
| `lib/auth.ts` | `signAdminToken()` / `verifyAdminToken()` |
| `lib/articles.ts` | `getAllArticles()`, `getArticleBySlug()`, `getRecentArticles()` — async, await everywhere |
| `lib/rss-importer.ts` | `runRssImport()` — full RSS pipeline, called by cron + admin |
| `lib/og-fetcher.ts` | `fetchOGData(url)` — reads first 50KB of HTML for OG tags |
| `lib/tipsy-analyzer.ts` | `analyzeArticle()` — OpenAI call, returns scores + bourbon_take |
| `lib/rss-feeds.ts` | 28 RSS feeds, all open/free (WSJ + FT removed — paywalled) |
| `lib/data/radar.ts` | Hardcoded Disruptor Radar entries — needs admin UI eventually |
| `lib/data/articles.ts` | Legacy hardcoded articles — still used as fallback, should be removed |
| `lib/data/tickers.ts` | Ticker symbols for the homepage ticker strip |
| `lib/terminal/finnhub.ts` | Finnhub quote helpers — single + batch (bounded concurrency). Workhorse for live quotes: 60/min, no daily cap, works from Vercel IPs (Yahoo does NOT — it rate-limits datacenter IPs) |
| `lib/terminal/twelvedata.ts` | Twelve Data helpers — candles/time_series for charts ONLY (free tier 800 req/day, so never used for polling). Symbol mapping to TD format |
| `lib/terminal/symbols.ts` | Terminal symbol universes. All Finnhub-quotable: US equities, ETFs (ticker-first labels — they're proxies, not index levels), Binance crypto pairs. Strip's real VIX/10Y/DXY come from FRED via /api/data-pulse, NOT proxies |
| `lib/terminal/indicators.ts` | Client-side chart math: SMA/EMA/Bollinger/RSI/MACD + perfStats(candles, barInterval). Period returns null unless window spans them; vol annualized per bar interval, null on intraday |
| `lib/terminal/analysis.ts` | Pure math for Tools tab: daily returns, day-aligned intersection, Pearson corr, OLS beta, blended portfolio returns, DCA/lump-sum backtests, bisection XIRR. Validated against identities (corr/beta self=1, XIRR 10% exact) |

---

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| `Nav.tsx` | Server | 4 variants: home, hub, tool, article |
| `Footer.tsx` | Server | full / minimal variants |
| `TipsyReads.tsx` | Client | Homepage Tipsy Reads section with category filters + og_image |
| `TipsyCard.tsx` | Client | Card + CellarRow used on /tipsy-reads page |
| `GaugeGrid.tsx` | Client | Legacy Data Pulse gauges — ILLUSTRATIVE ONLY, no longer used on /data-pulse |
| `components/data-pulse/MarketStrip.tsx` | Client | Live ticker strip, polls /api/data-pulse every 15 min |
| `components/data-pulse/RegimeIndicator.tsx` | Client | Current macro regime with colored dot + scale |
| `components/data-pulse/StressGauges.tsx` | Client | 7 FRED stress indicators with low/medium/high badges |
| `components/data-pulse/ProofLeaderboard.tsx` | Server | Tipsy Reads aggregated by publication, auto-ranking |
| `components/data-pulse/WeeklySignalBlock.tsx` | Server | Latest published weekly signal from Supabase |
| `EmailSignupForm.tsx` | Client | Mailchimp signup, used in 4 places |
| `Ticker.tsx` | Client | Homepage stock ticker strip |
| `StreakCounter.tsx` | Client | Article count — TARGET hardcoded to 5, needs dynamic fix |
| `SparklineChart.tsx` | Client | Chart.js sparkline on Data Pulse |
| `ProofBarAnimated.tsx` | Client | Animated proof score bar |
| `components/admin/TipsyReadForm.tsx` | Client | Full admin form for tipsy reads with AI Analyze button |

---

## Environment Variables

Required in `.env.local` and Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET=
NEXT_PUBLIC_SITE_URL=https://bourbonpour.vercel.app
MAILCHIMP_API_KEY=
MAILCHIMP_LIST_ID=
MAILCHIMP_DC=
FINNHUB_API_KEY=
NEXT_PUBLIC_FINNHUB_KEY=  # same value as FINNHUB_API_KEY — browser WS for Terminal live quotes
OPENAI_API_KEY=
CRON_SECRET=
FRED_API_KEY=        # free at fred.stlouisfed.org/docs/api/api_key.html
TWELVE_DATA_API_KEY= # free at twelvedata.com — Terminal charts/candles only (800 req/day)
```

---

## Known Issues / Pending Work

### Quick fixes (not done yet)
- `components/Nav.tsx` — Tipsy Reads links to `/#tipsy` (anchor), should be `/tipsy-reads`
- `app/page.tsx` — hero stat "5 Articles Live" hardcoded, should be dynamic
- `components/StreakCounter.tsx` — `TARGET = 5` hardcoded
- `app/page.tsx` — legacy fallback archive with fake March dates still present
- Share/Save buttons on article pages have no functionality
- `lib/data/tipsy-reads.ts` — empty file, unused, should be deleted
- `lib/data/articles.ts` — legacy data, should be removed once markdown is sole source

### Bigger features not yet built
- Disruptor Radar — static hardcoded, no admin UI to update signals
- Tipsy Reads category filter on `/tipsy-reads` — URL param `?category=` not handled
- Article read time is hardcoded "6 min" on cards

---

## Design System

- **No Tailwind** — custom CSS variables in `app/globals.css`
- Key vars: `--amber: #c8963e`, `--deep: #0a0a0a`, `--card: #111`, `--border: #1e1e1e`
- Fonts: Playfair Display (`--font-display`), DM Mono (`--font-mono`), DM Sans (`--font-body`)
- All via `next/font/google` in `app/layout.tsx`

---

## Important Decisions & Rules

1. **No Tailwind** — keep the CSS variable system, do not add Tailwind
2. **Server vs Client split** — pages = Server Components. Anything with useState, useEffect, event handlers, Chart.js = `'use client'`
3. **No false accuracy claims** — Data Pulse gauges are editorial/illustrative only (disclaimer added)
4. **Disruptor Radar** — editorial opinions disclaimer added, signals are speculative
5. **Financial disclaimers** — present in Footer, Terms, About. Must be preserved
6. **Non-commercial language** — no pricing, no paid tiers, no monetization. Ever.
7. **RSS title preferred over OG title** — OG titles often have "| Site Name" appended or return paywall junk
8. **`published_at` must be set** on PUT/POST when status → published (was a bug, now fixed)
9. **No internal HTTP fetch on Vercel** — use shared lib functions instead (learned the hard way with run-rss-import)

---

## Dev Commands

```bash
npm run dev          # local dev server → localhost:3000
npm run build        # production build check
git push             # auto-deploys to Vercel
```

Admin panel: `/admin/login` → password is `ADMIN_SECRET` env var value
