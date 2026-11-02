# Index Watch: diagnosis rules

These rules turn one URL Inspection result (plus our own cheap page fetch) into **one** diagnosis a non-SEO can act on. They're the product's core, so they live as data in `lib/indexing/diagnosis-rules.ts` (codes, copy, severity) and logic in `lib/indexing/diagnose.ts` (a pure function, unit-tested). The same data generates the public `/indexing-status/[slug]` pages, so in-app copy and SEO pages can't drift.

## Inputs

```ts
type DiagnoseInput = {
  url: string
  google: {
    verdict: "PASS" | "FAIL" | "NEUTRAL" | "PARTIAL" | "VERDICT_UNSPECIFIED" | null
    coverageState: string | null        // free text, e.g. "Crawled - currently not indexed"
    robotsTxtState: "ALLOWED" | "DISALLOWED" | "ROBOTS_TXT_STATE_UNSPECIFIED" | null
    indexingState: "INDEXING_ALLOWED" | "BLOCKED_BY_META_TAG" | "BLOCKED_BY_HTTP_HEADER" | "BLOCKED_BY_ROBOTS_TXT" | "INDEXING_STATE_UNSPECIFIED" | null
    pageFetchState: "SUCCESSFUL" | "SOFT_404" | "BLOCKED_ROBOTS_TXT" | "NOT_FOUND" | "ACCESS_DENIED" | "SERVER_ERROR" | "REDIRECT_ERROR" | "ACCESS_FORBIDDEN" | "BLOCKED_4XX" | "INTERNAL_CRAWL_ERROR" | "INVALID_URL" | "PAGE_FETCH_STATE_UNSPECIFIED" | null
    lastCrawlTime: string | null
    googleCanonical: string | null
    userCanonical: string | null
    sitemaps: string[]                  // sitemaps Google knows list this URL
    referringUrls: string[]
  } | null                              // null = inspection failed or not run
  inspectionError?: { status: number; message: string }
  onpage?: {                            // our own fetch; optional, may be blocked
    status: number | null
    finalUrl: string | null
    metaRobots: string | null
    xRobotsTag: string | null
    canonical: string | null
    wordCount: number | null
    title: string | null
  }
  context: {
    inOurSitemaps: boolean              // from our own sitemap read
    firstSeenAt: string                 // when Index Watch first saw the URL
    previousBucket: Bucket | null
    impressions28d: number              // from gsc_data
    siteShareDiscoveredNotIndexed: number // 0..1 across the site's inspected URLs
    userMarkedIntentional: boolean      // user said "this is meant to be excluded"
  }
}

type Diagnosis = {
  code: DiagnosisCode
  bucket: "indexed" | "not_indexed" | "excluded_ok" | "blocked" | "unknown" | "error"
  severity: "critical" | "warning" | "info" | "ok"
}
```

Normalize `coverageState` before matching: lowercase, replace en/em dashes with "-", collapse spaces, strip quotes. **Match enum fields first, coverage text second.** Any coverage text we don't recognise → `unknown_state` + a `console.warn` with the raw string (and later a weekly review).

## Evaluation order (first match wins)

| # | Condition | Code | Bucket | Severity |
| --- | --- | --- | --- | --- |
| 1 | `google == null` and `inspectionError.status == 403` | `property_access_lost` | error | critical |
| 2 | `google == null` (other errors) | `inspection_failed` | error | info |
| 3 | `verdict == PASS` and coverage contains "indexed, though blocked by robots.txt" | `indexed_but_robots_blocked` | indexed | warning |
| 4 | `verdict == PASS` and coverage contains "indexed without content" | `indexed_without_content` | indexed | warning |
| 5 | `verdict == PASS` and not `inOurSitemaps` | `indexed_not_in_sitemap` | indexed | info |
| 6 | `verdict == PASS` | `indexed` | indexed | ok |
| 7 | `pageFetchState == NOT_FOUND` | `not_found_404` | blocked (excluded_ok if not in sitemap and impressions28d == 0) | warning (critical if previousBucket == indexed) |
| 8 | `pageFetchState == SOFT_404` | `soft_404` | blocked | warning |
| 9 | `pageFetchState == SERVER_ERROR` | `server_error_5xx` | blocked | critical |
| 10 | `pageFetchState == REDIRECT_ERROR` | `redirect_error` | blocked | warning |
| 11 | `pageFetchState in (ACCESS_DENIED, ACCESS_FORBIDDEN, BLOCKED_4XX)` | `blocked_4xx` | blocked | warning |
| 12 | `robotsTxtState == DISALLOWED` or `pageFetchState == BLOCKED_ROBOTS_TXT` | `blocked_by_robots` | excluded_ok if `userMarkedIntentional`, else blocked | critical if in sitemap or previousBucket == indexed, else warning |
| 13 | `indexingState in (BLOCKED_BY_META_TAG, BLOCKED_BY_HTTP_HEADER)` | `noindex` (detail: meta vs header) | excluded_ok if `userMarkedIntentional` or (not in sitemap and impressions28d == 0), else blocked | critical if previousBucket == indexed; warning if in sitemap; else info |
| 14 | coverage contains "page with redirect" | `page_with_redirect` | excluded_ok | info (warning if in sitemap: "remove redirected URLs from your sitemap") |
| 15 | coverage contains "alternate page with proper canonical" | `alternate_canonical_ok` | excluded_ok | ok |
| 16 | coverage contains "google chose different canonical" | `google_chose_other_canonical` | not_indexed | warning |
| 17 | coverage contains "duplicate without user-selected canonical" | `duplicate_no_canonical` | not_indexed | warning |
| 18 | coverage contains "crawled - currently not indexed" → sub-rules A | `crawled_not_indexed_*` | not_indexed | see A |
| 19 | coverage contains "discovered - currently not indexed" → sub-rules B | `discovered_not_indexed_*` | not_indexed | see B |
| 20 | coverage contains "url is unknown to google" → sub-rules C | `unknown_to_google_*` | unknown | see C |
| 21 | anything else | `unknown_state` | unknown | info |

### A. Crawled – currently not indexed (Google fetched it and passed)

| Sub-condition (in order) | Code | Severity | Plain-English reason |
| --- | --- | --- | --- |
| first seen < 14 days ago and `lastCrawlTime` < 7 days ago | `crawled_not_indexed_new` | info | Google read it recently. New pages often wait 1–3 weeks. Check back before changing anything. |
| `onpage.wordCount` < 300 | `crawled_not_indexed_thin` | warning | The page is short. Google often skips pages that don't add much beyond what's already indexed. |
| `referringUrls` empty and not in any Google-known sitemap | `crawled_not_indexed_orphan` | warning | Google can't see any page linking here. Pages without internal links look unimportant. |
| `onpage.canonical` set and ≠ URL | `crawled_not_indexed_canonical_mismatch` | warning | Your page points its canonical at another URL, so Google may be treating it as a copy. |
| otherwise | `crawled_not_indexed_quality` | warning | Google read the page and decided it isn't worth indexing yet. Usually: too similar to other pages, or not useful enough for the query. |

### B. Discovered – currently not indexed (Google knows the URL but hasn't fetched it)

| Sub-condition | Code | Severity | Plain-English reason |
| --- | --- | --- | --- |
| first seen < 14 days ago | `discovered_not_indexed_new` | info | Google has it on its to-do list. Give it 1–2 weeks. |
| `siteShareDiscoveredNotIndexed` > 0.3 | `discovered_not_indexed_sitewide` | critical | A large share of your site is waiting. Google is rationing crawls: usually many low-value URLs (filters, tags, parameters), slow responses, or a young site with few links. |
| `referringUrls` empty | `discovered_not_indexed_orphan` | warning | Google only knows this URL from your sitemap. Link to it from pages that are already indexed. |
| otherwise | `discovered_not_indexed_queue` | warning | Google hasn't prioritised crawling it. Strengthen internal links and check server speed. |

### C. URL is unknown to Google

| Sub-condition | Code | Severity | Plain-English reason |
| --- | --- | --- | --- |
| not `inOurSitemaps` | `unknown_not_in_sitemap` | warning | Google has never seen this URL. Add it to your sitemap and link to it. |
| in sitemap, first seen < 7 days ago | `unknown_new` | info | It's in your sitemap; Google hasn't read the sitemap since. Check the sitemap's "last read" date in Search Console. |
| otherwise | `unknown_sitemap_not_read` | warning | It's been in your sitemap a while and Google still hasn't seen it. Resubmit the sitemap and make sure it returns 200 and valid XML. |

## Copy for each code

Each rule in `diagnosis-rules.ts` carries: `title` (≤ 60 chars), `gscLabel` (Google's wording, shown muted), `whatItMeans` (1–2 sentences), `isItAProblem` (one line), `fixSteps` (2–5 numbered steps, imperative), `whenToRecheck` (days), `learnMoreSlug` (the `/indexing-status/[slug]` page). Write it for a blogger, not an SEO. Examples:

**`crawled_not_indexed_thin`**
- Title: Google read this page but skipped it: it's thin
- Is it a problem? Yes, if you want this page to get search traffic.
- Fix: 1) Add what a searcher would still be missing: examples, steps, data, images with alt text. 2) Merge it into a stronger related page if it overlaps one, and 301 the old URL. 3) Link to it from 2–3 indexed pages with descriptive anchor text. 4) Then open it in Search Console and click Request indexing.
- Recheck: 14 days.

**`noindex`** (critical variant: was indexed)
- Title: This page tells Google not to index it
- Is it a problem? Almost always, if it used to be indexed. A deploy or SEO plugin setting often flips this.
- Fix: 1) Look for `<meta name="robots" content="noindex">` in the page source (or an `X-Robots-Tag: noindex` header). 2) In WordPress: Settings → Reading → "Discourage search engines" and your SEO plugin's per-page setting. 3) Remove it, redeploy, then Request indexing.
- Recheck: 3 days.

**`alternate_canonical_ok`**
- Title: A duplicate that points to the right page (fine)
- Is it a problem? No. Google indexed the version you chose.
- Fix: nothing to do. Hide these with the "Hide fine" filter.

## Site-wide checks (run once per site per run, after inspections)

| Check | Trigger | Event |
| --- | --- | --- |
| Mass drop-out | ≥ 3 URLs moved indexed → not indexed/blocked since the last run, or ≥ 5% of indexed URLs | `sitewide_dropout` (critical alert) |
| New blocker | ≥ 3 previously indexed URLs now `noindex` or `blocked_by_robots` | `sitewide_blocker` (critical alert) |
| Crawl backlog | `siteShareDiscoveredNotIndexed` > 0.3 with ≥ 20 URLs | `sitewide_crawl_backlog` (warning, weekly at most) |
| Sitemap problems | Sitemaps API reports errors, or our fetch fails, or > 10% of sitemap URLs are redirects/404s | `sitemap_issue` (warning) |

## Our own page fetch (`onpage`)

Only for URLs whose bucket isn't `indexed`, at most 200 a site per run, ≤ 1 request/second per host, 10-second timeout, our existing bot user agent from `lib/health-check/crawler.ts`. Extract a small `fetchPageSignals(url)` helper from the crawler rather than running the full health check. If the fetch fails, diagnose from Google's fields alone; never show "your site is down" from our fetch alone.

## Tests (Vitest, `lib/indexing/__tests__/diagnose.test.ts`)

One fixture per row above (21 + sub-rules), plus: unknown coverage string → `unknown_state`; en-dash vs hyphen coverage text matches the same rule; PASS + not in sitemap → `indexed_not_in_sitemap`; previously indexed + noindex → critical.
