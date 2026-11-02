# Index Watch: product spec

Status: approved for build · Owner: Ayush · Version 1.0 (Nov 2, 2026)

## 1. One sentence

Every day, GSCdaddy checks which of your pages Google has really indexed, tells you in plain words why each stuck page isn't in and what to do, and alerts you when indexed pages drop out.

## 2. Why now (evidence)

From the Nov 2, 2026 Opportunity Brief (OpenSEO US data, live threads):

- **Pain, fresh and repeated.** r/SEO, Nov 1: a two-week-old site "barely showing up", asking how to force indexing (13 upvotes, 27 comments). On X, Nov 1: one operator found 134 pages on 16 sites crawled or discovered but not indexed and triaged each by hand; another mocked Search Console for saying pages aren't indexed "because they're currently not indexed".
- **Search demand: about 9,290 a month** across 19 non-brand terms, at 102% of last year. Core "google indexing" is 4,400 (141% YoY). Six terms have KD ≤ 25 and 100+ searches: why is my website not showing up on google (480, KD 5), bulk index checker (390, KD 21), crawled currently not indexed (320, KD 20), discovered currently not indexed (260, KD 9), google indexing api (260, KD 16), url indexer (260, KD 9). CPC is $12–$26 on checker terms.
- **Page one is weak.** "crawled currently not indexed" shows only agency blog posts (several from 2023–24) and forums, with no products.
- **Warning.** People pay for indexing mostly per credit (IndexCheckr $15 packs; Omega Indexer, Rapid URL Indexer). Indie subscription indexers are tiny on TrustMRR (IndexerNow $57 MRR). So Index Watch must **not** be sold as a standalone "indexer". It's a reason to connect GSC and a retention loop inside GSCdaddy's existing subscription.

## 3. Who it's for

| Persona (existing `users.persona`) | Job | What they need from Index Watch |
| --- | --- | --- |
| blogger | "I publish 2–8 posts a month and some never show up." | Know which new posts are stuck and the one fix for each. |
| consultant | "I look after 3–10 client sites." | One list of stuck pages across sites; proof for clients. |
| agency | "25 sites, someone breaks noindex on a deploy." | Drop-out alerts within a day; a client-ready summary. |

Not for: people who want a guaranteed "instant indexing" button, or link-building indexers (backlink indexing).

## 4. Positioning change

- Homepage promise moves from one feature to two problems: **"Pages Google won't index. Keywords that almost rank. GSCdaddy finds both and tells you what to fix."**
- Honest angle vs. paid indexers: **"We don't game Google's Indexing API. We tell you why Google skipped your page, and you fix the cause."**
- Free entry point: a public indexability checker (no login) plus a real bulk index checker after Google sign-in (no card, works during and after the trial).

## 5. Scope

### v1 features (must ship)

1. **URL discovery per site.** Sources: (a) sitemaps listed in Search Console (Sitemaps API), (b) `Sitemap:` lines in robots.txt, (c) pages already in `gsc_data` (they have impressions), (d) URLs the user adds by hand. Sitemap indexes are followed (max depth 2, max 50 child sitemaps, max 50,000 URLs read).
2. **Daily inspection engine.** Calls URL Inspection for each watched URL on a priority schedule (§8) within the per-site budget. Stores the latest result on the URL row and a history row only when the status changes.
3. **Diagnosis.** Each non-indexed URL gets one `diagnosis_code` with a plain-English title, explanation, fix steps, severity and "is this actually a problem?" flag (see `DIAGNOSIS-RULES.md`). Signals: the Google result fields + our own fetch (status, meta robots, X-Robots-Tag, canonical, word count) + `referringUrls` + sitemap membership + impressions.
4. **Indexing overview page** (`/indexing`): counts by status bucket, indexed-pages trend (daily snapshot), "needs attention" list sorted by severity × traffic potential, recent changes (indexed → dropped, stuck → indexed).
5. **Pages table** (`/indexing/pages`): filters (bucket, diagnosis, in sitemap, has impressions), search, sort, CSV export (pro+). Row opens a side sheet with the full diagnosis, Google's raw fields, history and an **"Open in Search Console"** link (`inspectionResultLink`) for "Request indexing".
6. **Bulk index checker** (`/indexing/check`, also mounted at `/app/tools/index-checker`): paste up to 50 URLs of a connected property → live inspection → results table. Counts against the same per-site daily quota.
7. **Alerts.** Daily digest email when (a) an indexed URL drops out, (b) a sitemap URL is still not indexed 14 days after first seen, (c) a site-wide blocker appears (robots.txt disallow or noindex on ≥ 3 URLs that were indexed). Plus an "Indexing" band on `/today` and a section in the weekly summary email.
8. **First-run activation.** After the first Index Watch run for a new site, send "We checked N pages: X aren't indexed. Here's the top fix." (fills revamp.md P2 "GSC connected, sync completed").
9. **Public SEO surface.** `/tools/index-checker` (public page; no-login indexability check using our crawler + CTA to sign in for Google's real verdict), `/indexing-status/[slug]` programmatic pages generated from the same rules data, and the blog posts in `SEO-PAGES.md`.

### Non-goals for v1

- Any use of the Google Indexing API, or any "submit for indexing" automation.
- Checking whether URLs on sites the user doesn't own are indexed (that needs `site:` scraping or a paid SERP API).
- Backlink indexing, rank tracking, AI writing.
- IndexNow submission for users' sites (needs a key file on their domain; maybe v2).
- Team seats and white-label PDFs (agency roadmap, separate).

## 6. Google APIs used (verified Nov 2, 2026)

| API | Call | Limit | Notes |
| --- | --- | --- | --- |
| URL Inspection | `POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect` | 2,000/day and 600/min per site; 10M/day per project | Scopes: `webmasters` or `webmasters.readonly`. `inspectionUrl` must be inside `siteUrl`. [Docs](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect), [limits](https://developers.google.com/webmaster-tools/limits) |
| Sitemaps | `GET https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps` | not separately listed | Returns submitted sitemaps (path, lastDownloaded, isSitemapsIndex, errors, warnings, contents). We fetch the XML ourselves. |
| Search Analytics | existing sync | existing | `gsc_data` already gives pages with impressions. |

Response fields we store from `indexStatusResult` ([reference](https://developers.google.com/webmaster-tools/v1/urlInspection.index/UrlInspectionResult)): `verdict` (PASS / FAIL / NEUTRAL / PARTIAL / VERDICT_UNSPECIFIED), `coverageState` (free-text, e.g. "Crawled - currently not indexed"), `robotsTxtState`, `indexingState`, `pageFetchState`, `lastCrawlTime`, `googleCanonical`, `userCanonical`, `sitemap[]`, `referringUrls[]`, `crawledAs`; plus top-level `inspectionResultLink`.

Google's Indexing API is documented as usable "only … to crawl pages with either JobPosting or BroadcastEvent embedded in a VideoObject" ([docs](https://developers.google.com/search/apis/indexing-api/v3/using-api)). We don't use it.

## 7. Data model (draft in `drafts/015_index_watch.sql`)

- `index_watch_urls` — one row per (site, url): sources, sitemap membership, first/last seen, latest Google fields, derived `bucket`, `bucket_since`, `diagnosis_code`, `onpage` JSONB, `impressions_28d`, `last_inspected_at`, `next_inspect_at`, `priority`.
- `index_watch_events` — status transitions (from_bucket → to_bucket, coverage state, occurred_at, notified_at). Feeds alerts, `/today` and history.
- `index_watch_daily` — per site per day: counts per bucket, inspections used. Feeds the trend chart and quota accounting.
- `sites` new columns: `index_watch_enabled`, `index_watch_status` (idle / running / error), `index_watch_error`, `index_watch_last_run_at`, `sitemaps_fetched_at`.
- `users` new column: `index_alerts_enabled` (default true).

Buckets (derived, stored): `indexed`, `not_indexed` (Google knows it and chose not to index, or hasn't crawled it), `excluded_ok` (intentionally out: redirect, alternate canonical, noindex the user wants), `blocked` (robots, noindex, 4xx/5xx the user probably doesn't want), `unknown` (never inspected or URL unknown to Google), `error` (inspection failed).

## 8. Scheduling and quota

Per site per day: `budget = min(1,800, plan_daily_cap)`. Each run builds a queue in this order and stops at the budget:

1. URLs never inspected (newest first by `first_seen_at`).
2. URLs whose impressions dropped to 0 in the last 7 days while bucket = `indexed` (possible drop-out; from `gsc_data`).
3. `not_indexed` / `blocked` / `unknown` URLs not checked in 3 days.
4. `indexed` URLs not checked in 14 days (oldest first).
5. `excluded_ok` URLs not checked in 30 days.

Set `next_inspect_at` after each check using the same intervals. Throttle to ≤ 5 calls/second per site (well under 600/min). Different sites may run concurrently (max 3 at once). Stop the site for the day on 429/`RESOURCE_EXHAUSTED`. Record calls used in `index_watch_daily.inspections_used`; on-demand checks (bulk checker, "re-check" button) read the same counter and refuse past 2,000.

The GitHub Actions job (`index-watch`) runs daily at 05:30 UTC (after GSC sync at 04:00 and recs at 05:00), with a 55-minute internal time budget inside a 60-minute job timeout. Unfinished sites carry over to the next day.

## 9. Plans and gating

| Plan | Sites | Watched URLs per site | Scheduled checks/day/site | Bulk checker | CSV export | Alerts |
| --- | --- | --- | --- | --- | --- | --- |
| Trial (= pro) | 5 | 5,000 | 1,800 | 50 URLs/run | yes | yes |
| Blogger $19 | 1 | 1,000 | 500 | 50 URLs/run | no | yes |
| Pro $49 | 5 | 5,000 | 1,800 | 50 URLs/run | yes | yes |
| Agency $99 | 25 | 10,000 | 1,800 | 50 URLs/run | yes | yes |
| Free / expired | 1 | 100 | weekly, 100 | 10 URLs/day | no | no |

The free row is a **decision for Ayush** (it implements revamp.md P1.4 "reverse trial"). It's built behind a flag (`INDEX_WATCH_FREE_TIER`) so it can ship later. Add `index_watch` to the feature lists in `lib/billing/plans.ts` and the pricing copy in `lib/constants.ts`.

## 10. UX notes

- Sidebar: new top-level "Indexing" section after "Today" (Overview, Pages, Check URLs). Keep `?siteId=` on links like the other items.
- Empty states: "We're reading your sitemaps" (first run running), "No sitemap found — add one or paste URLs" (no URLs), "Google lost access to this property" (403).
- Each diagnosis shows severity (critical / warning / info / ok), "Is this a problem?" in one line, numbered fix steps, and "Open in Search Console".
- GSC's own status words are shown verbatim in a muted line under our plain-English title, so users can match them to Search Console.
- Never say "we'll get you indexed". Say "Fix the cause, then use Request indexing in Search Console."

## 11. Success metrics

- Activation: % of new signups who see an Index Watch result within 10 minutes of connecting GSC (target 60%; today's striking-distance flow needs a 90-day sync and often shows nothing for small sites).
- Retention: % of active users who open `/indexing` or click an alert in week 2 (target 40%).
- Revenue: trial → paid conversion before vs after launch (baseline now: ~0 paying).
- SEO: organic clicks to the 10 launch pages + `/tools/index-checker` (target 300 visits/month by day 60).

Kill criteria are in `LAUNCH.md`.

## 12. Risks

| Risk | Mitigation |
| --- | --- |
| Quota exhaustion on big sites | Budgeted queue, priority order, per-site counter, carry-over. |
| Google changes coverageState wording | Rules key on enum fields first; unknown strings map to `unknown_state` and are logged for review. |
| Users expect "instant indexing" | Copy says so up front; the honest angle is the pitch. |
| Our fetch is blocked by the user's WAF | Treat our fetch as optional evidence; Google's fields always win. |
| Cron runtime grows with users | Time budget + carry-over; move to a queue only if the daily job exceeds 45 minutes for a week. |
| AI cost | v1 has none; Phase 8 explanations are cached per URL and capped per plan. |
