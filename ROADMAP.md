# Bourbon Pour — Build-Up Roadmap

> North star: make the site **genuinely useful and engaging** for its three
> audiences — **investors**, **researchers**, and **general readers** — so it
> reads as one cohesive product, not a Bloomberg clone bolted to a newsletter.
>
> Working mode: **roadmap first, cleanup folded into each initiative** (no
> separate dead-code sprint). Production (`main`) **stays dark behind
> `MAINTENANCE_MODE`** until the owner decides to relaunch; all work ships to
> `dev` / preview.
>
> Status legend: ☐ not started · ◐ in progress · ☑ shipped
> Last updated: 2026-10-03 (after the Terminal↔editorial unification commit).

---

## Where we are now (honest baseline)

**Strong already:** a deep Terminal (7 tabs — Chart, Markets, Heatmap, Macro,
News, Earnings, Tools; real indicators, correlation/beta/DCA/XIRR tools, live
Finnhub WebSocket quotes), a working Paper Trading desk ($100k virtual, real
server-side pricing), an AI-scored Tipsy Reads pipeline (40 feeds), a Tiptap
article CMS, FRED-backed Data Pulse + AI weekly signal, double-opt-in newsletter,
and — as of the latest commit — persona-based nav, Trade buttons wired through
the Terminal, and a bidirectional editorial↔Terminal ticker bridge.

**The gaps that actually limit "useful + engaging":**

1. **Accounts barely matter.** Signing in only unlocks paper trading. Watchlist
   and portfolio are `localStorage`-only — no cross-device sync, nothing saved,
   no reason to come back logged in. This is the single biggest retention lever
   sitting unused.
2. **Proof Score is aspirational, not real.** `/proof-score` publishes a precise
   formula (`DD×0.35 + XR×0.30 + RW×0.20 + AC×0.15`) that **nothing in the code
   computes**. Articles store four independently hand-typed numbers; Tipsy Reads
   use a totally different AI rubric. For a site whose entire brand is
   "evidence-scored / Data Is The New Currency," this is the biggest credibility
   risk on the site.
3. **No discovery/screening.** The one obvious Bloomberg-grade feature missing
   for investors/researchers is a **screener** — no way to find stocks by
   criteria; everything starts from a ticker you already know. Symbol universe is
   a hardcoded 48 large-caps.
4. **Two orphaned concept pages** (`/pour-journal`, `/proof-of-work`) describe
   features — a personal annotation journal and community-submitted intelligence
   — that were never built. They're linked from nowhere and fully non-functional.
5. **Homepage freshness is faked in places** — hardcoded hero stat, a
   `StreakCounter` with a hardcoded target, a legacy article fallback carrying
   fake March dates.

---

## Phase 1 — Make accounts matter (engagement foundation) ☐

**Why first:** everything engaging (saved work, personalization, coming back)
depends on account-tied server state, and we already have Supabase Auth +
`paper_accounts`/`paper_trades` proving the pattern. Highest retention leverage.

- **Server-side watchlist.** New `user_watchlists` table (RLS: owner-only),
  migrate `WatchlistPanel` + `TerminalStrip` custom lists off `localStorage` with
  a localStorage→DB one-time import on first signed-in load. Signed-out users
  keep the current localStorage behavior (graceful).
- **Server-side portfolio (Tools tab).** Same treatment for the
  `bourbon-terminal-portfolio` holdings in `PortfolioTool`.
- **Resurrect "Pour Journal" as saved/annotated reads** — the orphaned concept
  page already pitches exactly this. Let a signed-in reader save a Tipsy Read or
  article and add a one-line note; surface them on a real `/pour-journal`.
  - *Cleanup folded in:* replace the dead concept page with the working feature,
    or retire the route if we don't build it this phase.
- *Audience:* investors + researchers (sticky watchlist/portfolio), readers
  (saved reads).

## Phase 2 — Make Proof Score real (credibility) ☐

**Why:** it's the brand promise. Either compute it honestly or stop publishing a
formula we don't use.

- **Decide the model:** either (a) actually compute article Proof Score from its
  sub-scores via the published weights, and document Tipsy Reads' separate AI
  rubric as a distinct thing, or (b) revise `/proof-score` to describe what the
  scores *actually* are. Recommendation: do both halves of (a) — compute the
  article formula (trivial, it's four stored numbers) and clearly label the two
  scoring systems so the methodology page stops overpromising.
- *Cleanup folded in:* reconcile the article vs. Tipsy scoring story end-to-end;
  remove "institutional-grade" / overclaiming language where it's not earned.
- *Audience:* all three — it's trust infrastructure.

## Phase 3 — Discovery & deeper analysis (investors + researchers) ☐

**Why:** turns the Terminal from "look up what you know" into "find what you
don't" — the step-change toward actually-useful.

- **Stock screener** — new Terminal tab/tool filtering on fields Finnhub already
  gives us (sector, market cap, P/E, beta, div yield, % change). Start with the
  known universe, designed to scale.
- **Expand the symbol universe** beyond the hardcoded 48 (heatmap/movers/sector
  map) toward S&P 500 coverage; make the heatmap size tiles by market cap.
  - *Cleanup folded in:* the 5 crypto pairs mapped in `lib/terminal/crypto.ts`
    but never surfaced in any panel (BNB/XRP/ADA/DOGE/AVAX) — expose or delete.
- **Historical macro charting** on the Macro tab (yield curve over time, VIX
  history) — today it's only latest value + 1-week delta.
- *Audience:* investors (screener), researchers (macro history, exports).

## Phase 4 — Editorial engagement & homepage honesty (general readers) ☐

**Why:** the "Read" persona is the top of the funnel; make the front door live
and the reading loop rewarding.

- **Dynamic homepage** — replace the hardcoded hero stat ("5 Articles Live") and
  `StreakCounter` target with real counts from the data we already fetch.
  - *Cleanup folded in:* remove `lib/data/articles.ts` legacy fallback and its
    fake March dates once markdown + Supabase are the sole article sources;
    delete the unused `components/GaugeGrid.tsx`.
- **Working Share/Save on article pages** (Save ties into Phase 1 saved-reads;
  Share is a simple Web Share / copy-link).
- **Personalized "For You" strip** (optional, needs Phase 1) — recent saves +
  watchlist-matched Tipsy Reads.
- **Decide on `/proof-of-work`** (community-submitted intelligence): either build
  a lightweight signed-in submission → admin-review flow, or retire the orphaned
  page. Recommend retire for now (moderation overhead is high for a solo site).

## Phase 5 — Go-live readiness (deferred — owner-triggered) ☐

Not started until the owner says so. Documented so it's ready:

- Flip `MAINTENANCE_MODE=false` (or set `MAINTENANCE_DEFAULT=false`) for
  production only.
- Restore the real homepage on `main` (currently the coming-soon placeholder;
  note the middleware maintenance gate is the actual thing taking the site dark).
- Verify `bourbonsip.com` DNS/SSL resolves (prior `ERR_SSL_PROTOCOL_ERROR` /
  SSO-protection history).
- Confirm all env vars exist in Vercel **Production** scope (not just Preview),
  and the Supabase Auth redirect allow-list includes the production domain.
- Re-run the compliance pass (F1 OPT: non-commercial, editorial, disclaimers
  intact) before anything public.

---

## Standing cleanup ledger (fold into the phase that touches each)

| Item | Where | Folds into |
|------|-------|-----------|
| Orphaned, non-functional concept page | `app/pour-journal/` | Phase 1 (build) |
| Orphaned, non-functional concept page | `app/proof-of-work/` | Phase 4 (retire/build) |
| Legacy article fallback w/ fake March dates | `lib/data/articles.ts` | Phase 4 |
| Unused component | `components/GaugeGrid.tsx` | Phase 4 |
| Unused crypto mappings (5 coins) | `lib/terminal/crypto.ts` | Phase 3 |
| Proof Score formula vs. reality mismatch | `app/proof-score/` | Phase 2 |
| Hardcoded hero stat / streak target | `app/page.tsx`, `components/StreakCounter.tsx` | Phase 4 |
| Non-functional Share/Save buttons | `app/articles/[slug]/` | Phase 4 |

---

## Suggested sequencing

```
Phase 1 (accounts matter) ──┬──► Phase 3 (screener/discovery)   [investor/researcher value]
                            └──► Phase 4 (editorial + homepage)  [reader value, needs saves]
Phase 2 (Proof Score real) ── independent, can slot anytime; do before relaunch
Phase 5 (go-live) ── owner-triggered, last
```

Phase 1 is the keystone — it unlocks saved reads (Phase 4) and makes the whole
site worth logging into. Phase 2 is independent and should land before any public
relaunch. Phase 3 is the biggest "useful" step-change for the analytical side.
