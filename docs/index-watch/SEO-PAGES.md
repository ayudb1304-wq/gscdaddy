# Index Watch: SEO pages

Keyword data: OpenSEO, US, pulled Nov 2, 2026. Trend = Jul–Sep 2026 vs Jul–Sep 2025. Don't invent other volumes; if a page needs a number that isn't here, leave it out or ask Ayush to pull it.

## Cluster

| Keyword | Searches/mo | KD | CPC | Trend YoY | Page |
| --- | --- | --- | --- | --- | --- |
| google indexing | 4,400 | 53 | $25.09 | 141% | 10 (refresh) |
| submit website to google | 1,000 | 39 | $19.75 | 48% ↓ | 7 |
| index checker | 720 | 38 | $17.72 | 153% | 4 |
| google index checker | 590 | 39 | $11.86 | 117% | 4 |
| why is my website not showing up on google | 480 | 5 | $18.44 | 76% | 3 |
| bulk index checker | 390 | 21 | $19.34 | 496% | 4 |
| crawled currently not indexed | 320 | 20 | $16.38 | 38% ↓ | 2 |
| how to get google to index my site | 320 | 39 | $12.62 | 62% | 7 |
| discovered currently not indexed | 260 | 9 | $19.14 | 98% | 1 |
| google indexing api | 260 | 16 | $12.05 | 87% | 5 |
| url indexer | 260 | 9 | $12.90 | 93% | 6 |
| check google index status (long tail) | 260 | 16 | – | – | 4 |
| bulk google index checker tool | 210 | 24 | – | – | 4 |
| indexing tool | 170 | 36 | $26.62 | 88% | 9 |
| request indexing | 140 | 35 | $63.06 | 103% | 8 |
| google search console indexing | 110 | 44 | $77.74 | 117% | 10 |

Competitor brands people search (don't build pages on these yet; volumes for "<brand> alternative" weren't measured): Omega Indexer 480, Rapid URL Indexer 320, IndexMeNow 170, SpeedyIndex 90.

## The first 10 pages (publish in this order)

| # | Type | Path | Primary keyword | Angle |
| --- | --- | --- | --- | --- |
| 1 | status | `/indexing-status/discovered-currently-not-indexed` | discovered currently not indexed (260, KD 9) | Google knows the URL but hasn't fetched it. The 4 causes (new, orphan, crawl backlog, slow server) and how to tell which one you have. |
| 2 | status | `/indexing-status/crawled-currently-not-indexed` | crawled currently not indexed (320, KD 20) | Google read it and passed. Page-by-page triage: thin, orphan, canonical, quality. Includes a "wait or act?" rule of thumb. |
| 3 | blog | `/blog/why-is-my-website-not-showing-up-on-google` | why is my website not showing up on google (480, KD 5) | A 10-minute checklist for small-site owners, in order: is it indexed at all → noindex/robots → sitemap → links → patience. Ends with the free checker. |
| 4 | tool | `/tools/index-checker` | index checker (720) + bulk index checker (390) + google index checker (590) | No-login indexability check, then real Google status for 50 URLs after sign-in. Honest about what each mode can and can't see. |
| 5 | blog | `/blog/google-indexing-api` | google indexing api (260, KD 16) | What it is, Google's rule that it's only for job postings and livestreams, the spam-policy warning in Google's own docs, and what to do instead. The trust-building post. |
| 6 | blog | `/blog/url-indexer` | url indexer (260, KD 9) | What "URL indexer" services actually do, why they sell credits, the risks, and the safe path (fix the cause, Request indexing). Fair, not a hit piece. |
| 7 | blog | `/blog/how-to-get-google-to-index-my-site` | how to get google to index my site (320, KD 39); also submit website to google (1,000) | Step-by-step for a new site: Search Console, sitemap, internal links, first links from outside, Request indexing for 3–5 key pages, then monitor. |
| 8 | blog | `/blog/request-indexing-google-search-console` | request indexing (140, KD 35, CPC $63) | What the button does and doesn't do, that Search Console caps how many requests you can make, when it's wasted, how to check it worked. |
| 9 | blog | `/blog/indexing-tool-for-agencies` | indexing tool (170, KD 36) | Monitoring indexing across client sites: what to watch weekly, alerts, client reporting. Soft product page for consultant/agency personas. |
| 10 | refresh | `/blog/what-is-indexing-in-seo` (existing) | google indexing (4,400, KD 53); google search console indexing (110) | Retitle toward "Google indexing: how it works and how to check yours", add a "check your pages" section with the tool, link to all status pages. Refresh instead of a new post to avoid two pages competing. Keep the slug. |

## Programmatic pattern

- **Now (Phase 7.2):** `/indexing-status/<code-slug>`, one page per public diagnosis (about 15), generated from `lib/indexing/diagnosis-rules.ts`. Google's exact label is the H1 keyword. Same data as the in-app sheet, so every page is genuinely useful and stays accurate.
- **Later (not measured yet):** `<status> on <platform>` (Shopify, WordPress, Webflow, Wix, Squarespace, Next.js, Framer…), about 15 × 7 ≈ 100 pages. Pull volumes before building any of them; only build combinations with real searches.

## Page rules (for `/iw-seo-page`)

- Format: `content/blog/<slug>.ts` exporting a `BlogPost` (see `content/blog/what-is-indexing-in-seo.ts`), registered in `lib/blog.ts`. Author Ayush (`https://x.com/ayu_theindiedev`). `schema: ["FAQPage"]` with 3–5 FAQs.
- Title ≤ 60 characters with the primary keyword near the front; description ≤ 155 characters. Check with the existing SERP preview tool logic.
- Open with the answer in the first two sentences. Then a scannable how-to. Short paragraphs.
- Use real examples from gscdaddy.com's own Search Console where possible (Ayush supplies screenshots/numbers; leave `<!-- TODO screenshot: … -->` markers rather than inventing data).
- Every post links to: `/tools/index-checker`, 2 relevant `/indexing-status/*` pages, 1 existing related post. Every status page links back to posts 3 and 7.
- Don't promise indexing. Don't claim Google behaviour that isn't in Google's docs; link the doc when citing it.
- Facts that need a source: Indexing API restriction → https://developers.google.com/search/apis/indexing-api/v3/using-api ; URL Inspection limits → https://developers.google.com/webmaster-tools/limits .

## Internal links to add to existing posts

- `google-search-console-beginners-guide` → page 3 and the tool.
- `what-is-crawl-budget` → page 1 (discovered – currently not indexed).
- `free-seo-audit-checklist` → the tool and page 2.
- `content-audit-google-search-console` → page 2.
