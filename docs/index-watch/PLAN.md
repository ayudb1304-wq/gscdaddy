# Index Watch: build plan

Work one task at a time, top to bottom (`/iw-next` picks the first unchecked one). A task is done when its **Accept** items are true and `/iw-verify` passes. Tick the box, add a line to the Decision log if you chose anything the spec didn't say, and commit: `feat(index-watch): <task id> <summary>`.

Rough size: 60–80 hours across 3 weeks. Phases 0–5 are the usable product; 6–7 make it sell; 8 is optional.

**Stop and ask Ayush before:** applying a migration to the live Supabase project, changing prices, sending any real email, editing `.github/workflows/crons.yml` schedules of existing jobs, or deleting files.

---

## Phase 0 — Baseline and hygiene

- [ ] **0.1 Record the baseline.** Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`. Paste pass/fail and error counts into the Decision log. Don't fix unrelated errors; if typecheck or build fails, stop and report.
  - Accept: baseline recorded.
- [ ] **0.2 One "active users" helper.** Create `lib/billing/active-users.ts` exporting `getActiveUserIds(admin)` (active subscription OR `trial_ends_at > now`), matching `checkAccess`. Use it in `scripts/cron-sync-gsc.ts` (currently syncs every site) and `app/api/cron/sync-gsc/route.ts`.
  - Accept: the script only syncs sites of active users; the route behaves the same as before; a log line says how many sites were skipped.
- [ ] **0.3 Schema drift check.** With the Supabase MCP, list columns of `users`, `sites`, `subscriptions`. If `users.email_unsubscribed` (or anything else the code uses) exists live but not in `supabase/migrations/`, add a catch-up migration with `ADD COLUMN IF NOT EXISTS` at the next free number (start at 015). Index Watch then takes the number after it.
  - Accept: every column the code reads is created by some migration file. Note the final migration numbers in the Decision log.
- [ ] **0.4 Add Vitest for pure logic.** Dev-dependency `vitest`, `vitest.config.ts` with the `@/` alias and `environment: "node"`, script `"test": "vitest run"`. One smoke test.
  - Accept: `npm test` passes; `npm run build` still passes.

## Phase 1 — Data layer

- [ ] **1.1 Migration.** Start from `docs/index-watch/drafts/015_index_watch.sql`. Compare with the live schema, rename to the next free number, keep RLS on every table, keep `reserve_inspections` callable only by the service role. Show Ayush the final SQL, then apply with the Supabase MCP after he says yes.
  - Accept: tables `index_watch_urls`, `index_watch_events`, `index_watch_daily` exist with RLS; new `sites`/`users` columns exist; `select reserve_inspections('<site>', 5, 1800)` returns 5 and then increments `inspections_used`.
- [ ] **1.2 Types.** `lib/indexing/types.ts`: `Bucket`, `Severity`, `DiagnosisCode` (union of every code in `DIAGNOSIS-RULES.md`), `WatchedUrlRow`, `IndexEventRow`, `IndexDailyRow`.
  - Accept: typecheck passes; no `any`.
- [ ] **1.3 Plan limits.** In `lib/billing/plans.ts` add `indexWatch: { urlsPerSite, dailyChecks, bulkPerRun }` per plan as in SPEC §9 and the feature `"index_watch"` for blogger/pro/agency. Add `getIndexWatchLimits(effectivePlan)`. Free plan values exist but are only used when `process.env.INDEX_WATCH_FREE_TIER === "true"`.
  - Accept: unit test covers trial→pro limits and the free-tier flag.

## Phase 2 — Google clients and URL discovery

- [ ] **2.1 URL Inspection client.** Move `drafts/url-inspection.ts` to `lib/google/url-inspection.ts`. Keep `InspectionError` with `quotaExhausted` / `permissionDenied`.
  - Accept: unit tests for `urlBelongsToProperty` (URL-prefix, sc-domain, subdomain, look-alike domain).
- [ ] **2.2 Sitemaps client + discovery.** `lib/google/sitemaps.ts` (API list) and `lib/indexing/discover-urls.ts`: sources = GSC sitemaps, robots.txt `Sitemap:` lines, `<origin>/sitemap.xml` fallback, distinct `gsc_data.page` with impressions in the last 90 days, manual URLs. Normalize (drop `#fragment`, keep query strings, trim whitespace), keep only URLs inside the property, cap at the plan's `urlsPerSite` (priority: gsc pages, then newest sitemap entries). Upsert into `index_watch_urls` (merge `sources`, set `in_sitemap`, `last_seen_in_sitemap_at`; set `removed_from_sitemap_at` for URLs that disappeared). Update `sites.sitemaps_fetched_at`.
  - Accept: unit tests for `<loc>` extraction (urlset, sitemapindex, `&amp;` entities), normalization and capping. Manual run against gscdaddy.com's own property discovers its blog URLs.

## Phase 3 — Diagnosis

- [ ] **3.1 Rules data.** `lib/indexing/diagnosis-rules.ts`: one entry per code with `title`, `gscLabel`, `whatItMeans`, `isItAProblem`, `fixSteps[]`, `whenToRecheckDays`, `learnMoreSlug`, default `severity`. Copy rules from `DIAGNOSIS-RULES.md`; plain English, no jargon without a gloss.
  - Accept: every `DiagnosisCode` has an entry (enforced with `satisfies Record<DiagnosisCode, Rule>`).
- [ ] **3.2 `diagnose()`.** Pure function in `lib/indexing/diagnose.ts` implementing the evaluation order and sub-rules A/B/C exactly. Coverage-text normalization as specified.
  - Accept: `lib/indexing/__tests__/diagnose.test.ts` has a fixture per table row (≥ 30 cases) and passes.
- [ ] **3.3 Page signals.** Extract `fetchPageSignals(url)` from `lib/health-check/crawler.ts` into `lib/indexing/page-signals.ts` (status, final URL, meta robots, `X-Robots-Tag`, canonical, word count, title). Make the crawler call it so there's one HTML parser. Health-check output must not change.
  - Accept: health checker still returns the same score for gscdaddy.com before/after (compare manually); unit test on a fixture HTML string.

## Phase 4 — Engine and scheduling

- [ ] **4.1 Scheduler.** `lib/indexing/scheduler.ts`: pure `buildQueue(rows, now, budget)` with the 5-tier priority from SPEC §8, and `nextInspectAt(bucket, now)` (3 / 14 / 30 days; 1 day for `error`).
  - Accept: unit tests for ordering, budget cut-off and intervals.
- [ ] **4.2 Site runner.** `lib/indexing/run-site.ts` → `runIndexWatchForSite(siteId, { maxChecks, deadline })`:
  1. load site + owner's effective plan → limits; skip if `index_watch_enabled` is false; set `index_watch_status = 'running'`.
  2. `getValidAccessToken(user_id)`.
  3. discover URLs if `sitemaps_fetched_at` is older than 24 h.
  4. refresh `impressions_28d` from `gsc_data` (one grouped query).
  5. `buildQueue`, then `reserve_inspections` in batches of 50 against `min(dailyChecks, 1800)`.
  6. inspect at ≤ 5 requests/second (reuse `lib/sync/rate-limiter.ts`), stop at the deadline.
  7. for non-indexed results, `fetchPageSignals` (≤ 200 per run, ≤ 1/s).
  8. `diagnose()`; update the URL row; on bucket change insert an `index_watch_events` row (`status_change`); mark `stuck` when a sitemap URL is still not indexed 14 days after `first_seen_at` (once per URL).
  9. site-wide checks from `DIAGNOSIS-RULES.md` → events.
  10. upsert today's `index_watch_daily` bucket counts (Pacific quota day, same row as the quota counter); set status `idle`, `index_watch_last_run_at`.
  - Errors: `quotaExhausted` → stop this site quietly. `permissionDenied` → `property_access_lost` event, status `error`, `index_watch_error` message. Anything else → status `error`, rethrow to the caller's log.
  - Accept: a manual run on gscdaddy.com's property inspects ≤ `maxChecks` URLs, writes rows/events/daily, and a second run the same day respects the remaining quota.
- [ ] **4.3 Daily job.** `scripts/cron-index-watch.ts` (dotenv like the other scripts): active users only (helper from 0.2), all their sites with Index Watch on, up to 3 sites concurrently, a global 55-minute deadline, and a summary log. Add an `index-watch` job to `.github/workflows/crons.yml` at `30 5 * * *`, `timeout-minutes: 60`, the same secrets as `sync-gsc`, plus a `workflow_dispatch` option. Add `app/api/cron/index-watch/route.ts` (CRON_SECRET) calling the same lib function.
  - Accept: `npx tsx scripts/cron-index-watch.ts` runs locally end-to-end; workflow YAML validates (`actionlint` if available).
- [ ] **4.4 First results within minutes.** After a site's first GSC sync completes (in the `after()` block of `app/api/sites/[siteId]/sync/route.ts`) and when a site is added without data, call `runIndexWatchForSite(siteId, { maxChecks: 150, deadline: now + 120s })`. Keep it after the striking-distance work so it can't delay that.
  - Accept: connecting a new property shows Index Watch results within ~3 minutes.
- [ ] **4.5 "Check now".** `POST /api/indexing/[siteId]/run`: owner only, refused if `index_watch_status = 'running'` or `index_watch_last_run_at` is under an hour old (database-backed, because the in-memory limiter resets per serverless instance), `maxChecks: 200`, runs in `after()`.
  - Accept: second call within the hour returns `RATE_LIMITED`.

## Phase 5 — In-app UI

- [ ] **5.1 API routes** (all owner-checked, envelope responses, zod-validated):
  - `GET /api/indexing/[siteId]/overview` → bucket counts, severity counts, last run, quota used today, 90-day trend from `index_watch_daily`, top 10 needs-attention URLs (critical first, then by `impressions_28d`), last 20 events.
  - `GET /api/indexing/[siteId]/urls` → paginated, filters `bucket`, `diagnosis`, `severity`, `inSitemap`, `hasImpressions`, `search`; sort `severity|impressions|last_inspected|first_seen`.
  - `GET /api/indexing/[siteId]/urls/[urlId]` → row + rule copy + last 20 events.
  - `PATCH /api/indexing/[siteId]/urls/[urlId]` → `{ userMarkedIntentional }` (re-diagnose immediately).
  - `POST /api/indexing/[siteId]/inspect` → `{ urls: string[] (≤ plan.bulkPerRun) }`; validate property membership; reserve quota; inspect live; diagnose; upsert as `manual` source; return results.
  - Accept: each route returns `NOT_FOUND` for another user's site.
- [ ] **5.2 Sidebar + Overview page.** Add an "Indexing" section (Overview `/indexing`, Pages `/indexing/pages`, Check URLs `/indexing/check`) after Today, preserving `?siteId=`. Overview: 4 metric cards (Indexed, Not indexed, Blocked, Needs attention), recharts line of indexed vs not indexed over time, needs-attention list with the rule title + "Fix" link, recent changes feed, "Last checked … · N of 2,000 checks used today · Check now".
  - Accept: matches the existing dashboard look (same Card/metric components); loading skeleton; works in dark mode.
- [ ] **5.3 Pages table + detail sheet.** Reuse table patterns from `components/reports/keywords-table.tsx`. Columns: URL, status (our title + GSC label muted), severity badge, impressions 28d, last crawled, last checked. Row click opens a `Sheet` with what it means / is it a problem / fix steps / Google's raw fields / referring URLs (first 5) / history / "Open in Search Console" (`inspection_link`) / "Re-check" / "This is intentional". CSV export behind `hasFeature(plan, "csv_exports")`.
  - Accept: filters persist in the URL query; 5,000-row site paginates without slowdown.
- [ ] **5.4 Bulk checker.** `/indexing/check`: textarea (one URL per line, up to `bulkPerRun`), site from the selector, results table with the same status cells, quota left shown. Also mount it as an in-app tool (`/app/tools/index-checker`) via `app/(dashboard)/app/tools/[slug]/page.tsx`.
  - Accept: URLs outside the property are rejected with a clear message before any API call.
- [ ] **5.5 Today + Dashboard.** `/today`: an "Indexing" band showing new drop-outs and stuck pages since yesterday (max 5, link to the sheet). Dashboard: an "Indexed pages" metric card with the 7-day change.
  - Accept: bands hide when there's nothing to show.
- [ ] **5.6 States and settings.** Empty states from SPEC §10. `/settings/sites`: per-site Index Watch toggle + last run + error. `/settings/profile`: "Indexing alerts" email toggle (`users.index_alerts_enabled`).
  - Accept: a 403 property shows the reconnect message, not a crash.

## Phase 6 — Alerts and lifecycle emails

- [ ] **6.1 Daily alert digest.** Template `lib/email/templates/index-alert-digest.tsx` (match `shared.tsx` styling). Sent at the end of `scripts/cron-index-watch.ts` for users with unnotified `critical`/`warning` events of kind `status_change` (to a non-indexed bucket from `indexed`), `stuck`, `sitewide_*`, `sitemap_issue`, `property_access_lost`; respects `index_alerts_enabled` and `email_unsubscribed`; max one email per user per day; marks `notified_at`. Subject leads with the worst event, e.g. "12 pages on example.com dropped out of Google".
  - Accept: `scripts/test-emails.ts` can render it with fixture data; no real sends in dev.
- [ ] **6.2 First-run report.** After the first completed run for a site (`index_first_report_sent_at` is null and ≥ 20 URLs inspected): "We checked N pages on example.com: X aren't indexed. Start here: <top diagnosis>." Set the timestamp.
  - Accept: sent once per site.
- [ ] **6.3 Weekly summary.** Add an "Indexing this week" block to `weekly-summary.tsx` (indexed count and change, new problems, fixed pages) in `scripts/cron-send-emails.ts`.
  - Accept: block hides for sites without Index Watch data.

## Phase 7 — Repositioning and SEO surface

- [ ] **7.1 Public index checker tool.** `app/tools/index-checker/page.tsx` + `index-checker-form.tsx`, following the keyword-calculator page pattern (metadata, FAQs, `ToolJsonLd`, how-to, related posts). No-login mode: enter one URL → `POST /api/tools/indexability` (IP rate limit 10/hour, like the health check) runs `fetchPageSignals` + robots.txt rule check + sitemap presence and lists blockers. Then a clear CTA: "This checks what Google would see. Sign in with Google to get Google's actual index status for up to 50 URLs." Register in `lib/tools.ts`, the public `/tools` grid, `app/sitemap.ts`. Title target: "Free Google Index Checker (Bulk) | GSCdaddy".
  - Accept: page passes the existing SEO checklist (`SEOchecklist.md`): unique title ≤ 60 chars, description ≤ 155, canonical, FAQ schema valid.
- [ ] **7.2 Status pages.** `app/indexing-status/[slug]/page.tsx` with `generateStaticParams` from `diagnosis-rules.ts` (one page per public-facing code, ~15). Each: Google's label as H1 ("Crawled – currently not indexed: what it means and how to fix it"), what it means, is it a problem, fix steps, FAQ (3), CTA to the index checker, links to related statuses. Add to the sitemap. In-app "Learn more" links point here.
  - Accept: pages build statically; titles ≤ 60 chars; no duplicate descriptions.
- [ ] **7.3 Launch posts.** Use `/iw-seo-page <slug>` for every `blog` and `refresh` entry in `SEO-PAGES.md` (the `tool` and `status` entries are built in 7.1 and 7.2), one commit each, in the listed order.
  - Accept: each post registered in `lib/blog.ts` (or updated in place for the refresh), has FAQs + schema, links to the index checker and 2 status pages.
- [ ] **7.4 Homepage and pricing.** Hero: keep the layout, change the eyebrow to "Google Search Console, explained", H1 to "Pages Google won't index. Keywords that almost rank.", sub to "GSCdaddy checks your pages in Google every day, tells you why some aren't indexed, and finds the keywords one push from page 1." CTA: "Check my pages free". Add an `IndexWatch` landing section (problem → screenshot placeholder → 3 bullets) after `ProblemSection`. Add FAQ items ("Do you force-index pages?" → no, and why), a Comparison row, and "Index Watch: daily checks for up to N pages" to each tier in `lib/constants.ts` (show Ayush the copy before committing).
  - Accept: Lighthouse performance on `/` doesn't drop (compare before/after locally).
- [ ] **7.5 Onboarding.** In the last onboarding step, show Index Watch progress ("Reading your sitemap… Checked 40 of 150 pages…") by polling `/api/indexing/[siteId]/overview`, and land the user on `/indexing` if the striking-distance report is still empty.
  - Accept: a brand-new small site lands on a populated page instead of an empty dashboard.

## Phase 8 — Optional, behind flags

- [ ] **8.1 Free-tier Index Watch (reverse trial).** With `INDEX_WATCH_FREE_TIER=true`, expired users keep `/indexing` for 1 site, 100 URLs, weekly checks; `AccessGate` lets `/indexing*` through; other pages stay gated with an upgrade prompt. Needs Ayush's go-ahead.
- [ ] **8.2 AI explanation.** For `crawled_not_indexed_quality` only: "Why might Google skip this page?" button → Claude Haiku (`claude-haiku-4-5`) with the page's title, word count, H1/H2s and the top 3 queries from `gsc_data`; cached on the URL row for 30 days; 10 per day per user.
- [ ] **8.3 Client report.** Agency plan: a shareable read-only link per site (`/r/indexing/<token>`) showing the overview and fixed-this-month list.

---

## Decision log

| Date | Task | Decision / finding |
| --- | --- | --- |
| 2026-11-02 | 0.3 / 1.1 | Migration 015 is taken by `015_fix_refresh_striking_distance.sql` (applied live). Index Watch's migration becomes **016**; any schema catch-up migration from 0.3 takes 017 or slots before it — renumber the draft accordingly. |
| 2026-11-02 | 5.x | The app was redesigned on `redesign/marketing-and-app`: build Index Watch UI with the new tokens (`tile-*`, status `critical/warning/info/ok`), `components/dashboard/page-header.tsx`, the sidebar's "Keywords" section pattern (add an "Indexing" section), and `lib/supabase/fetch-all.ts` for any gsc_data read that can exceed 1,000 rows. |
| 2026-11-02 | 7.4 | The homepage was rebuilt (Reasonal style). Positioning still leads with striking distance; add Index Watch as a feature tile + hero copy change only when it ships. |
| 2026-11-02 | 0.1 | Baseline on the redesign branch: typecheck and `next build` pass; lint has pre-existing errors in `components/logo.tsx`, `components/theme-toggle.tsx`, `components/dashboard/welcome-modal.tsx`. |
