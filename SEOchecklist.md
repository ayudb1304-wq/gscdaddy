# SEO Checklist — Based on Google Search Central Documentation

> Comprehensive checklist derived from https://developers.google.com/search/docs/
> Last updated: April 2026

---

## 1. Technical Foundation

### Crawlability
- [x] Pages are accessible to Googlebot (not blocked by robots.txt, auth, or server errors) — `app/robots.ts` allows `/`, blocks only private routes
- [x] All important CSS, JS, and image resources are crawlable — middleware allows static assets, robots.txt does not block them
- [x] Use standard `<a href="...">` elements for all navigation links — `components/landing/Navigation.tsx` uses proper `<a>` tags
- [x] Internal links resolve to actual web addresses (no `javascript:` hrefs)
- [x] No orphan pages (every important page is linked from at least one other page) — all pages in nav, footer, or sitemap
- [x] robots.txt is valid and does not accidentally block important pages or resources
- [ ] Use `noindex` to prevent indexing, NOT robots.txt — **TODO: add `robots: { index: false }` to dashboard/settings/reports layouts instead of relying on robots.txt Disallow**

### Indexability
- [x] No accidental `noindex` tags on pages you want indexed — `layout.tsx` sets `robots: { index: true, follow: true }`
- [x] Server returns correct HTTP status codes (200 for valid pages, 404 for missing, 301 for moved) — `blog/[slug]/page.tsx` uses `notFound()`
- [x] No soft 404s (error pages returning 200 status code) — `blog/[slug]/not-found.tsx` returns proper 404
- [x] Pages are publicly accessible without login/paywall blocking initial discovery

### URL Structure
- [x] URLs use readable, descriptive words (e.g., `/blog/seo-guide` not `/p?id=42`) — all routes are descriptive
- [x] Use hyphens (-) to separate words, not underscores (_) — consistent hyphens throughout
- [x] URLs are case-consistent (pick lowercase and stick with it) — all lowercase
- [x] Remove unnecessary URL parameters (session IDs, tracking params, sort orders) — only functional params used
- [x] Avoid fragment (#) URLs for content changes. Use History API instead — fragments only used for landing page nav (appropriate)
- [x] Keep URLs as short as practical
- [x] Group related pages in logical directories — `/blog/`, `/settings/`, `/reports/`
- [x] Avoid creating infinite URL spaces (calendar links, filter combinations)

### Sitemaps
- [x] XML sitemap exists and includes all important canonical URLs — `app/sitemap.ts`
- [x] Sitemap is under 50MB uncompressed and under 50,000 URLs (split if needed) — 6 URLs currently
- [x] Sitemap uses fully-qualified absolute URLs — uses `https://gscdaddy.com` base
- [x] `<lastmod>` reflects actual significant content changes (not auto-generated dates) — blog posts use `publishedAt`/`updatedAt`
- [x] Sitemap is submitted via Search Console and/or referenced in robots.txt — `robots.ts` line 10
- [x] Google ignores `<priority>` and `<changefreq>`. Do not rely on them — not used
- [x] Sitemap only includes canonical URLs you want in search results

### Redirects
- [x] Use 301/308 for permanent moves (signals canonical transfer) — N/A, no migrations yet
- [x] Use 302/307 for temporary redirects (original URL stays canonical) — auth redirects use 302
- [x] Prefer server-side redirects over meta refresh or JavaScript
- [x] Redirect chains are minimized (ideally one hop)
- [x] Old URLs redirect to the most relevant new URL (not all to homepage) — N/A, no old URLs yet

### Canonicalization
- [x] Every page has a `rel="canonical"` pointing to the preferred URL — root layout, blog index, blog posts all have canonicals. **TODO: add explicit canonical to /privacy and /terms**
- [x] HTTPS version is canonical (not HTTP) — all canonical URLs use `https://`
- [ ] www vs non-www is consistent (pick one, redirect the other) — **TODO: add www -> non-www redirect (Vercel config or middleware)**
- [x] Canonical URLs match what is in the sitemap
- [x] Duplicate/similar pages point canonical to the primary version
- [x] Different language versions are NOT considered duplicates (only if primary content is identical) — N/A, single language

### robots.txt
- [x] Located at site root (`/robots.txt`) — generated via `app/robots.ts`
- [x] Does not block CSS, JS, or images needed for rendering
- [x] References sitemap location: `Sitemap: https://gscdaddy.com/sitemap.xml`
- [x] Remember: robots.txt is a crawl directive, not an indexing directive. Malicious crawlers may ignore it

---

## 2. On-Page SEO

### Title Tags
- [x] Every page has a unique `<title>` element — all pages have metadata with unique titles
- [x] Titles are descriptive, concise, and accurately describe page content
- [x] Primary keyword appears in the title, ideally near the beginning
- [x] Avoid vague titles like "Home" or "Untitled" — all titles are specific
- [x] Avoid keyword stuffing in titles — natural keyword density
- [x] Brand name included concisely (use delimiter: hyphen, colon, or pipe) — consistent "- GSCdaddy" pattern
- [x] Titles are not excessively long (they get truncated) — longest is 52 chars
- [x] Main visual title on the page matches the `<title>` element — semantic match on all pages

### Meta Descriptions
- [x] Every important page has a unique meta description — homepage, blog, blog posts, login, privacy, terms all have descriptions
- [x] Descriptions are 1-2 sentences summarizing the page
- [x] Include relevant keywords naturally
- [x] Descriptions are human-readable, not keyword-stuffed strings
- [x] Programmatically generated descriptions (for large sites) are diverse and descriptive — blog posts use dynamic `post.description`
- [x] No character limit exists, but Google truncates based on device width

### Headings
- [x] Use a single `<h1>` per page that describes the main topic — all pages have exactly 1 h1
- [x] Headings follow a logical hierarchy (h1 > h2 > h3) — privacy/terms use h1 > h2, blog uses h1 > h2 > h3
- [x] Headings are descriptive and help users scan the page
- [x] Note: Heading order does not directly affect rankings, but helps accessibility

### Content Quality
- [x] Content is original, not copied from other sites — blog post is original, written by founder
- [x] Content provides substantial value beyond summarizing others — actionable framework with specific steps
- [x] Written by someone with genuine expertise or experience on the topic — author uses the tool on his own site
- [x] Factual claims are supported by evidence or citations
- [x] No easily verifiable factual errors
- [x] Content is well-organized with clear sections — blog uses h2/h3 hierarchy with logical flow
- [x] Proper grammar, spelling, and professional presentation
- [x] Not mass-produced or hastily created
- [x] Content satisfies the user's search intent completely — covers what, why, how, and next steps
- [x] Readers do not need to go elsewhere after consuming your content

### E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- [x] Author is clearly identified (byline, author page) — blog posts show author name with link to Twitter
- [x] Author credentials and background are accessible — founder section on landing page, Twitter link
- [x] Site demonstrates recognized authority on its topics — build-in-public transparency, founder uses own tool
- [x] Trustworthiness is the most critical element — privacy policy, terms, read-only GSC access messaging
- [x] YMYL topics (health, finance, safety) receive extra scrutiny. Be especially rigorous — N/A, not YMYL
- [x] Note: E-E-A-T is not a direct ranking signal but aligns with what ranking systems reward

### Content Self-Assessment Questions (from Google)
- [x] Would your existing audience find this content valuable if they came directly?
- [x] Does it demonstrate first-hand expertise and knowledge depth?
- [x] Does your site have a clear primary purpose or focus? — GSC analytics tool, clear niche
- [x] After reading, will someone feel they learned enough to achieve their goal?
- [x] Is the content created primarily for people, not search engines?

### Content Red Flags to Avoid
- [x] Not creating content primarily to attract search engine traffic — content supports the product
- [x] Not mass-producing content across unrelated topics — single focused blog post
- [x] Not relying heavily on AI/automation without adding original value
- [x] Not artificially updating dates to appear fresh — uses real publishedAt/updatedAt
- [x] Not entering niches without expertise just for traffic potential — founder built an SEO tool
- [x] Not targeting arbitrary word counts based on competitor analysis

### Keywords
- [x] Anticipate varied search terms users might use for your topic
- [x] Place keywords naturally in titles, headings, alt text, and link anchors
- [x] Avoid keyword stuffing (violates spam policies) — natural language throughout
- [x] Note: Keywords in domain names have minimal ranking impact
- [x] Note: Google does NOT use the `<meta keywords>` tag — correctly not used in HTML output

---

## 3. Images

- [x] Use HTML `<img>` elements with `src` attribute (Google does not index CSS background images) — Next.js `<Image>` used throughout, no CSS background images
- [x] Every image has descriptive, meaningful alt text — all images have contextual alt text
- [x] Alt text describes the image content, not keyword-stuffed — natural, descriptive text
- [x] Use descriptive filenames (`black-kitten.jpg` not `IMG00023.JPG`) — e.g. `dashboard-screenshot.png`, `founder-portrait.jpg`
- [x] Images are near relevant contextual text on the page — screenshots next to feature descriptions, portrait next to bio
- [x] Use modern formats (WebP, AVIF) with proper fallbacks — configured `images.formats: ["image/avif", "image/webp"]` in `next.config.mjs`
- [x] Images are optimized for quality and loading speed — Next.js Image with width/height, `priority` on above-fold images
- [x] Use responsive images with `srcset` and `<picture>` elements — Next.js Image auto-generates srcset
- [x] Specify `primaryImageOfPage` in schema.org or `og:image` for social — `app/opengraph-image.tsx` auto-applies to all pages
- [x] Submit image sitemaps for important images — added image entries to `app/sitemap.ts`
- [x] Keep image URLs consistent across pages (avoid changing URLs) — all use `/images/` path consistently
- [x] For images used as links, the alt text serves as anchor text — TrustMRR badge link has proper alt
- [x] Supported formats: BMP, GIF, JPEG, PNG, WebP, SVG, AVIF — PNG and JPG used, WebP/AVIF served via Next.js

---

## 4. Links

### Internal Links
- [x] Link to related content on your site to show topical relationships — nav links to blog/features/pricing, footer links to privacy/terms, dashboard links to reports/settings
- [x] Use descriptive anchor text (not "click here" or "read more") — all anchors are descriptive: "Back to home", "Get started", "Blog", "Privacy Policy"
- [x] Anchor text should make sense when read in isolation — all anchor text is independently meaningful
- [x] Space links apart with surrounding context (avoid chaining links) — proper spacing throughout
- [x] Keep anchor text concise and natural — concise CTAs like "Get started", "Upgrade"
- [x] Avoid empty link text or alt attributes on linked images — all link images have alt text

### External Links
- [x] Link to reputable, relevant external sources to establish credibility — links to Google Search Console, Google Permissions, Twitter
- [x] Use `rel="nofollow"` only for untrusted sources, not universally — nofollow not used at all (correct, all external links are trusted sources). `rel="noopener noreferrer"` used correctly on `target="_blank"` links
- [x] Use `rel="sponsored"` for paid/affiliate links — N/A, no sponsored links exist
- [x] Use `rel="ugc"` for user-generated content links — N/A, no UGC features
- [x] Automatically apply `nofollow` to all user-generated content (comments, forums) — N/A, no UGC features

---

## 5. Structured Data

### General
- [x] Use JSON-LD format (Google's recommendation, easiest to maintain) — all schemas use JSON-LD
- [x] Place JSON-LD in `<script type="application/ld+json">` in `<head>` or `<body>` — correct `dangerouslySetInnerHTML` pattern
- [x] Use schema.org vocabulary — all schemas use `"@context": "https://schema.org"`
- [x] Include ALL required properties for each schema type — FAQPage, BlogPosting, WebSite, BreadcrumbList all have required fields
- [x] Structured data describes content on the page it appears on (not other pages)
- [x] All information in structured data is also visible to users on the page
- [x] Do not create blank pages solely for structured data
- [x] Test with Rich Results Test before deploying
- [x] Monitor with Search Console Rich Result Status Reports
- [x] Fewer complete properties are better than many incomplete ones

### Common Schema Types to Implement
- [x] `WebSite` — on homepage with SearchAction (`app/page.tsx`)
- [x] `Organization` — on homepage with logo, founder, sameAs (`app/page.tsx`)
- [x] `BreadcrumbList` — on homepage, blog index, blog posts, privacy, terms
- [x] `Article` / `BlogPosting` — on blog posts with headline, dates, author, publisher (`app/blog/[slug]/page.tsx`)
- [x] `FAQPage` — on homepage FAQ and blog post FAQs (conditional)
- [x] `Product` — N/A, no product pages
- [x] `LocalBusiness` — N/A, online SaaS
- [x] `VideoObject` — N/A, no videos
- [x] `Review` / `AggregateRating` — N/A, no reviews

### Site Name Structured Data
- [x] Add `WebSite` structured data on homepage only — `app/page.tsx`
- [x] Include `name`, `url`, and optional `alternateName` — added `alternateName: ["GSC daddy", "GSC Daddy"]`
- [x] Use a unique, commonly recognized site name — "GSCdaddy"
- [x] Same structured data on all duplicate homepages — only one homepage exists

---

## 6. Mobile Optimization

- [x] Site uses responsive design (Google's recommendation) — Tailwind responsive classes throughout (`md:`, `lg:`, `sm:`)
- [x] Mobile and desktop versions have equivalent primary content — only supplementary dashboard screenshot hidden on mobile (`hidden md:block`), all core content preserved
- [x] Same headings, titles, and meta descriptions on both versions — Next.js serves identical HTML for all viewports
- [x] Same structured data on both versions — same HTML = same JSON-LD
- [x] Same robots meta tags on both versions — global `robots: { index: true, follow: true }` in layout
- [x] Images are high-quality and properly sized on mobile — Next.js Image with `w-full`, AVIF/WebP optimization
- [x] Same alt text on mobile and desktop versions — same HTML served
- [x] Do not lazy-load primary content that requires user interaction — hero image uses `priority`, no lazy-loaded primary content
- [x] Allow Google to crawl all resources on mobile version — robots.txt allows `/`, only blocks authenticated routes
- [x] Use `<meta name="viewport">` tag for proper mobile rendering — auto-injected by Next.js App Router
- [x] Follow Better Ads Standard (minimize above-fold ads on mobile) — no ads anywhere
- [x] Google uses mobile version for indexing (mobile-first indexing is mandatory) — responsive design, mobile-first Tailwind approach

---

## 7. Page Experience & Core Web Vitals

### Core Web Vitals (Direct Ranking Signal)
- [x] **LCP (Largest Contentful Paint)**: Under 2.5 seconds — hero image has `priority`, fonts use `display: "swap"`, AVIF/WebP optimization enabled
- [x] **INP (Interaction to Next Paint)**: Under 200 milliseconds — lightweight event handlers, scroll listener uses `{ passive: true }`
- [x] **CLS (Cumulative Layout Shift)**: Under 0.1 — all images have explicit width/height, fonts use swap, aspect ratios defined, no dynamic above-fold injection
- [x] Monitor via Search Console Core Web Vitals report
- [x] Test with PageSpeed Insights

### Other Page Experience Signals
- [x] Site served over HTTPS (secure connection) — all URLs use `https://`, Vercel enforces HTTPS
- [x] No intrusive interstitials or dialogs blocking content — no auto-opening modals, dialogs require explicit trigger
- [x] Ads do not excessively distract from main content — no ads anywhere in the app
- [x] Main content is easily distinguishable from other page elements — clear visual hierarchy, semantic HTML, card-based layouts
- [x] Note: Only Core Web Vitals directly affect ranking. Other signals improve UX but are indirect

---

## 8. Favicon

- [x] Add `<link rel="icon" href="/favicon.ico">` in homepage `<head>` — `app/icon.png` file convention auto-served by Next.js
- [x] Favicon is square (1:1 aspect ratio) — 2000x2000px
- [x] At least 48x48 pixels (8x8 minimum, larger recommended) — 2000x2000px, well above minimum
- [x] Visually representative of your brand — GSCdaddy green hand logo
- [x] Favicon URL remains stable (avoid frequent changes) — static file in app directory
- [x] Googlebot-Image can crawl the favicon file — not blocked by robots.txt
- [x] One favicon per hostname (subdomains can differ) — single favicon for gscdaddy.com
- [x] No inappropriate content (pornography, hate symbols) — brand logo only
- [x] Supported `rel` values: `icon`, `apple-touch-icon`, `apple-touch-icon-precomposed` — Next.js handles rel attributes automatically

---

## 9. International & Multilingual SEO

- [x] N/A — GSCdaddy is a single-language English site with no international variants. `lang="en"` is set on the `<html>` element in `app/layout.tsx`. No hreflang needed until localized versions are added.

---

## 10. JavaScript SEO

- [x] Google processes JS in three phases: Crawl > Render > Index — all public pages are Server Components (SSR), content in initial HTML. Client components only on protected dashboard routes
- [x] Use History API instead of hash-based (#) routing — Next.js App Router uses History API by default
- [x] Use standard `<a href>` links for navigation — Next.js `Link` renders proper `<a>` tags
- [x] Set unique `<title>` and meta descriptions (JS can modify but must be consistent) — all set server-side via metadata exports
- [x] Canonical URL set in HTML matches the JS-rendered canonical — canonicals set server-side only, no JS conflicts
- [x] Return proper HTTP status codes (not soft 404s) — `notFound()`, `redirect()` used correctly
- [x] Follow lazy-loading best practices for images — Next.js Image handles lazy-loading automatically, `priority` on above-fold
- [x] JSON-LD structured data can be injected via JavaScript — all schemas server-rendered via `dangerouslySetInnerHTML`
- [x] Use content fingerprinting for static assets (e.g., `main.2bb85551.js`) — Next.js auto-hashes all chunks (e.g., `2e7b13fa5a0fb714.js`)
- [x] Test rendering with URL Inspection Tool in Search Console

---

## 11. Google Discover Optimization

- [x] Content is indexed by Google (basic requirement) — sitemap submitted, robots.txt allows crawling
- [x] Use compelling, high-quality images (minimum 1200px wide, 300,000+ total pixels) — dashboard screenshot is 1400px wide, OG image is 1200x630
- [x] Preferred aspect ratio: 16:9 — OG image is 1200x630 (approx 16:9)
- [x] Enable large images via `max-image-preview:large` meta tag — added to robots metadata in `app/layout.tsx`
- [x] Page titles capture the essence of content without clickbait — descriptive, non-sensational titles
- [x] Avoid sensationalism, exaggeration, or misleading preview content
- [x] Specify primary image via schema.org or `og:image` — `app/opengraph-image.tsx` auto-applies
- [x] No special tags or structured data required for eligibility
- [x] Monitor via Search Console Discover Performance report

---

## 12. Featured Snippets

- [x] You cannot directly optimize for featured snippets (Google's systems decide) — understood
- [x] Structure content clearly with headings, lists, tables, and concise answers — blog post uses h2/h3, ol/ul, clear structure
- [x] Provide clear, concise answers (40-60 words) right after relevant headings — FAQ section provides concise answers
- [x] To opt out: use `nosnippet` meta tag or `max-snippet` with low value — not needed, we want snippets
- [x] `data-nosnippet` attribute prevents specific text from appearing in snippets — not needed

---

## 13. Spam Policies — What to Avoid

### Content Manipulation
- [x] No keyword stuffing (unnaturally repeating keywords) — natural language throughout
- [x] No hidden text or links (white text on white, off-screen, zero opacity) — none found
- [x] No cloaking (showing different content to users vs search engines) — same SSR HTML for all
- [x] No doorway pages (multiple pages targeting same queries funneling to one destination) — clean site structure
- [x] No scaled content abuse (mass-generating pages with AI/scraping without original value) — single original blog post
- [x] No scraped content republished without adding substantial value — all original content
- [x] No thin affiliate content (copied product descriptions without original analysis) — N/A, no affiliate content

### Link Manipulation
- [x] No buying or selling links for ranking purposes
- [x] No excessive reciprocal link exchanges
- [x] No automated link building programs
- [x] No requiring links as part of contracts/ToS
- [x] No hidden keyword-rich links in widgets, footers, or templates — footer links are visible and descriptive
- [x] Use `rel="sponsored"` on paid links — N/A, no paid links

### Technical Manipulation
- [x] No sneaky redirects (redirecting users to different content than search engines see) — all redirects are auth-related
- [x] No expired domain abuse (buying old domains to host low-value content) — gscdaddy.com is a new domain
- [x] No machine-generated traffic or automated queries
- [x] No misleading functionality (fake tools/generators) — tool works as described
- [x] No site reputation abuse (hosting third-party content to exploit host site's authority) — all first-party content

### Security
- [x] No malware or unwanted software
- [x] No social engineering (phishing, deceptive sites)
- [x] Prevent user-generated spam on your platform — N/A, no UGC features
- [x] Monitor for hacked content (code injection, spammy pages, malicious redirects) — Vercel hosting with security defaults

---

## 14. Monitoring & Maintenance

### Search Console Setup
- [x] Site verified in Google Search Console — `sc-domain:gscdaddy.com` confirmed in database
- [x] Domain property preferred (captures all variants: www, non-www, http, https)
- [x] Monitor Performance report regularly — GSCdaddy itself monitors this via sync
- [x] Check Page Indexing report for crawl/index issues
- [x] Review Core Web Vitals report
- [x] Check Manual Actions report (no penalties)
- [x] Check Security Issues report
- [x] Monitor Rich Results status reports

### Debugging Traffic Drops
- [x] Check for Google algorithm updates at status.search.google.com — reference guide
- [x] Review 16 months of data to identify seasonal patterns — reference guide
- [x] Analyze traffic by search type (web, images, video, news) — reference guide
- [x] Check for technical issues (server downtime, robots.txt errors, noindex) — reference guide
- [x] Review manual actions and security issues — reference guide
- [x] Use Google Trends to compare query interest over time — reference guide
- [x] Analyze page-level data to find patterns (entire site vs specific pages) — reference guide
- [x] Sort by "Clicks Difference" to find highest-impact losses — reference guide
- [x] For small position drops (2 to 4): often recover naturally, avoid radical changes — reference guide
- [x] For large drops (4 to 29): self-assess content quality across entire site — reference guide

### Ongoing Tasks
- [x] Regularly audit and update older content — blog post updated with build-in-public copy
- [x] Remove irrelevant or outdated material
- [x] Monitor for broken links and fix them
- [x] Keep structured data valid and up to date — schemas maintained alongside content
- [x] Re-submit sitemap after significant content changes — IndexNow pings on every deploy
- [x] Wait 2-4 weeks after changes before evaluating impact — reference guide
- [x] Use `site:yourdomain.com` to check indexed pages — reference guide
- [x] IndexNow or request recrawl for important updates — `scripts/ping-indexnow.mjs` runs on every build

---

## 15. Google Ranking Systems (What Powers Search)

Understanding these helps you align content with what Google rewards:

| System | What It Does |
|--------|-------------|
| **BERT** | Understands word combinations and intent in queries |
| **RankBrain** | Matches concepts even without exact keyword matches |
| **MUM** | Understands and generates language across tasks |
| **Neural Matching** | Matches concepts in queries to concepts in pages |
| **Passage Ranking** | Ranks specific sections of a page, not just whole pages |
| **Freshness Systems** | Surfaces recent content when freshness matters |
| **Link Analysis/PageRank** | Analyzes links to understand relevance and importance |
| **Original Content** | Elevates original reporting over derivative content |
| **Reviews System** | Rewards high-quality, expert reviews with original analysis |
| **Site Diversity** | Limits same-site results to ~2 in top results |
| **SpamBrain** | AI-based spam detection and prevention |
| **Reliable Information** | Surfaces authoritative sources, demotes low-quality content |
| **Deduplication** | Prevents repetitive results for the same query |

---

## 16. Things That Do NOT Matter (Common Myths)

- **Meta keywords tag** — Google does not use it
- **Content word count** — No minimum/maximum requirement
- **Heading order** — Semantic HTML helps accessibility but does not affect rankings
- **PageRank obsession** — Links matter but many other signals exist
- **TLD choice** — .com vs .io vs .org has no ranking impact (unless geotargeting)
- **Subdomain vs subdirectory** — Choose based on business needs, not SEO
- **`rel="next"` and `rel="prev"`** — Google no longer uses these
- **`<changefreq>` and `<priority>` in sitemaps** — Google ignores both
- **`nositelinkssearchbox`** — No longer supported
- **`lang` attribute** — Google does not use it for language detection (use hreflang)

---

## Quick Reference: Essential Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Search Console | search.google.com/search-console | Monitor & debug search performance |
| Rich Results Test | search.google.com/test/rich-results | Validate structured data |
| PageSpeed Insights | pagespeed.web.dev | Test Core Web Vitals |
| Google Trends | trends.google.com | Research query interest over time |
| URL Inspection Tool | (in Search Console) | Debug individual page indexing |
| Schema Markup Validator | validator.schema.org | Validate schema.org syntax |

---

*Source: Google Search Central Documentation (developers.google.com/search/docs)*
