# GSCdaddy Revamp Plan

A prioritized rebuild of the funnel based on the competitor analysis, mapped against what is already shipped in `implementation.md`. The single thesis driving this document is the same one the research keeps returning to. The product is fine. The funnel is broken. Three users signed up and never came back because the GSC connection step gates 100% of the value. Everything below is structured to fix that, in the order it should be fixed.

> **Last updated:** April 14, 2026 (P1.1 SEO Health Score tool shipped)

---

## Progress Checklist

Track overall revamp progress at a glance. Each item maps to a priority section below.

### P0. Close out Phase 1 gaps

- [x] **P0.1 Email notifications** — Weekly summary, trial ending, trial expired, welcome, nudge, top opportunity alert (7 templates shipped via Resend + React Email)
- [x] **P0.2 Settings pages** — Profile, sites management, billing, GDPR delete account, revoke Google access (all live at `/settings/*`)
- [x] **P0.3 API response format & validation** — Standardized envelope via `lib/api/response.ts`, rate limiting via `lib/api/rate-limit.ts`, zod validation on routes

### P1. Fix the cold start problem

- [x] **P1.1 Free SEO Health Score tool** — Public tool at `/seo-health-checker` with 0-100 score, email-gated PDF report, programmatic SEO per domain
- [ ] **P1.2 Demo mode with sample data** — Populated dashboard using gscdaddy.com data for users with no synced sites
- [ ] **P1.3 Two-track onboarding** — "How old is your website?" split: new site launchpad vs. established site flow
- [ ] **P1.4 Reverse trial after expiry** — Downgrade to read-only free tier instead of full lockout

### P2. Fix activation and retention emails

- [ ] **Signup completed email** — "Your SEO score is X/100, here are your top 3 fixes"
- [ ] **No GSC connection within 24h** — "Here is what you are missing" with sample striking distance report
- [ ] **GSC connected, sync completed** — "We found N striking distance keywords on your site"
- [ ] **No login for 3 days** — "Quick wins you are leaving on the table" with top 3 opportunities
- [ ] **7 days into trial** — "You are halfway through. Here is what you have unlocked."
- [ ] **11 days in (3 days before end)** — Personalized summary of access about to be lost
- [ ] **13 days in** — Final reminder + annual discount offer
- [ ] **Trial expired, no upgrade** — "What stopped you?" with Calendly link
- [ ] **Day 30 post-trial** — Win-back with new features shipped since they left
- [ ] **Email events tracking table** — `email_events` table for dedup and conversion tracking

### P3. Programmatic SEO and content expansion

- [ ] **P3.1 Comparison pages** — `/vs/seotesting`, `/vs/seo-gets`, `/vs/content-raptor`, `/vs/ahrefs`, `/vs/semrush`, `/vs/ubersuggest`
- [ ] **P3.2 Vertical-specific GSC guides** — `/for/bloggers`, `/for/agencies`, `/for/ecommerce`, `/for/saas`, `/for/affiliates`
- [x] **P3.3 Free tool landing pages** — 8 tools live at `/tools/*`: keyword calculator, SERP preview, keyword density checker, meta tag generator, OG generator, readability checker, robots.txt generator, slug generator
- [x] **P3.4 Build-in-public content** — 7 blog posts published, social media strategy active (see `socialmediahustle.md`)

### P4. Additional free tools (after SEO Health Score)

- [x] **Keyword calculator** — Live at `/tools/keyword-calculator` (position/impression to traffic gain estimates)
- [x] **SERP preview tool** — Live at `/tools/serp-preview`
- [ ] **Content decay checker** — URL input, checks Google cache date and flags freshness issues
- [ ] **Schema markup generator and validator** — URL input, detect existing schema, generate missing JSON-LD
- [ ] **AI Overviews visibility checker** — Check whether a domain appears in Google's AI Overviews

### P5. Browser extension

- [ ] **MVP Chrome extension** — Overlay on GSC Performance report showing striking distance keywords with opportunity score

### P6. Phase 2 features from original implementation doc

- [ ] **Content decay alerts** — Daily cron comparing 28-day windows, severity thresholds, alerts UI at `/alerts`
- [ ] **Onboarding checklist** — Persistent dashboard checklist with persona-adapted items, endowed progress
- [ ] **Keyword cannibalization detection** — Find queries where 2+ pages rank, recommend merge/differentiate/301
- [ ] **PDF export (Agency plan only)** — `@react-pdf/renderer` for monthly client reports

### P7. Landing page revamp

- [x] Hero section with CTA
- [x] Trust bar (Trustpilot badge)
- [x] Problem section
- [x] How it works (3 steps)
- [x] Features comparison
- [x] Founder section with Twitter link
- [x] Build-in-public social proof
- [x] Blog highlights section
- [x] Pricing cards with annual toggle
- [x] FAQ with FAQPage schema
- [x] Final CTA section
- [x] Navigation and footer
- [x] SoftwareApplication, Organization, WebSite, BreadcrumbList JSON-LD
- [ ] Inline SEO Health Score input on hero (depends on P1.1)
- [ ] Real build-in-public tweet embeds as social proof
- [ ] Page speed optimization (target LCP < 2.5s, INP < 200ms)

---

## What is already shipped

Phase 1 MVP is **complete**. All 12 steps from `implementation.md` are marked DONE.

**Core product (Steps 1-8):**
- Database, RLS, materialized view for striking distance (13 migrations)
- Google OAuth with PKCE and encrypted token storage
- 4-step onboarding wizard with persona selection and pre-permission priming
- Daily GSC sync with cron and rate limiting
- Dashboard with metrics cards, performance chart, top opportunities, recent recs
- Striking distance report with filters, sorting, opportunity score, CSV export
- AI recommendations via Claude with rate limiting and weekly auto-generation
- Dodo Payments billing with checkout, webhooks, customer portal, trial logic (Blogger $19, Pro $49, Agency $99)

**Supporting systems (Steps 9-12):**
- Settings pages — profile, sites management, billing, GDPR delete, Google access revocation
- Standardized API response format with zod validation and rate limiting
- Email notifications — 7 templates (welcome, weekly summary, trial ending, trial expired, nudge recommendations, top opportunity alert, shared utilities) via Resend + React Email
- Blog system — 7 published posts with BlogPosting/FAQPage schema, RSS feed, sticky TOC
- 8 free SEO tools at `/tools/*` with tools landing page
- Full landing page with 15 component sections and structured data
- IndexNow pinging on every deploy

**P1.1 SEO Health Score tool (shipped):**
- Free SEO Health Checker at `/seo-health-checker` with 0-100 score across 6 categories
- HTML crawler (meta tags, headings, images, links, schema detection, robots.txt, sitemap)
- PageSpeed Insights API integration for Lighthouse scores and Core Web Vitals
- Weighted scoring engine: Performance (20%), On-Page SEO (25%), Indexability (20%), Mobile (15%), Schema (10%), Security (10%)
- Email-gated report via Resend (lead capture)
- Programmatic SEO pages at `/seo-health-checker/[domain]` with cached results
- 1-hour result caching per domain, rate limiting by IP
- Featured in main navigation, tools page, footer, and sitemap

Phase 2 and Phase 3 from the original plan (decay alerts, alert UI, cannibalization, PDF export, archival) are not built.

---

## What the competitor analysis says is missing

The research findings can be collapsed into seven gaps. Each one is a direct cause of either weak organic acquisition or weak signup-to-activation conversion.

1. **No free tools.** Every successful competitor (Ahrefs, Semrush, Mangools, Ubersuggest, HubSpot) runs free URL-input tools as the top of funnel. GSCdaddy has zero. Ahrefs alone gets ~36k organic visits/month from its free tools page.
2. **All value sits behind GSC connection.** New users land in an empty dashboard if their site has no GSC data, or hit a connection wall if they have not authorized yet. There is no instant value path.
3. **No demo mode.** Loggly, Linear, Vercel, and most modern SaaS show populated sample dashboards. GSCdaddy shows nothing until sync completes.
4. **No two-track onboarding.** A blogger with a 2-month-old site and a consultant with 5 mature client sites both get the same flow. The research shows persona-routed onboarding lifts activation 3x.
5. **No trigger-based email sequence.** The implementation doc mentions weekly summary and trial reminder emails (and these are the bare minimum), but the research shows behavioral triggers convert 70% better than time-based sends.
6. **Thin comparison and alternative-to content.** This is the highest-converting BOFU traffic in SaaS. GSCdaddy publishes some, but nowhere near the volume Ahrefs, Mangools, or Backlinko run.
7. **No browser extension.** Keyword Surfer (100k+ users), Keywords Everywhere, MozBar all use this distribution channel to get daily touchpoints. GSCdaddy has no surface area outside the app.

The biggest single lever, by a wide margin, is the free SEO Health Score tool. Everything else compounds, but that one solves the cold start problem on its own.

---

## Priority 0. Close out the Phase 1 gaps ✅ COMPLETE

All Phase 1 gaps have been closed. These shipped as part of the MVP completion.

### P0.1 Email notifications ✅

Seven email templates shipped via Resend + React Email, triggered by a daily cron job at `/api/cron/send-emails`:

- **Welcome email** — sent on signup
- **Weekly summary** — top opportunities, week-over-week metric changes
- **Trial ending warning** — sent 3 days before `trial_ends_at`
- **Trial expired notice** — sent on `trial_ends_at`
- **Nudge recommendations** — sent once per site when user has synced data + striking distance keywords but hasn't generated recommendations (tracked via `nudge_email_sent_at` on sites table)
- **Top opportunity alert** — highlights highest-potential keyword
- **Shared template utilities** — common email components

### P0.2 Settings pages ✅

- `/settings/profile` with name, email (read-only from Google), avatar
- `/settings/sites` with add, remove, manual sync, last synced timestamp
- `/settings/billing` with current plan, usage, trial countdown, upgrade/downgrade, customer portal
- "Delete my account" with cascading delete (GDPR)
- "Revoke Google access" button

### P0.3 API response format and validation ✅

- Standardized response envelope via `lib/api/response.ts`
- Rate limiting via `lib/api/rate-limit.ts` (50 req/min per user)
- Zod validation on API inputs
- Proper HTTP status codes across all routes

---

## Priority 1. Fix the cold start problem

This is the biggest single revenue lever in the entire document. The research is unambiguous. Until there is a way to deliver value without GSC connection, every other improvement is downstream of broken activation.

### P1.1 Build the free SEO Health Score tool ✅

This is the HubSpot Website Grader playbook applied to the GSCdaddy niche. Shipped April 14, 2026.

**Mechanics**

- Public URL, `gscdaddy.com/seo-health-checker`
- Single input field, "Enter your website URL"
- Returns a 0-100 score within 15 seconds
- Breakdown across 6 categories, each with pass/warning/fail indicators
  - Performance (via PageSpeed Insights API, free, 25k req/day)
  - Mobile friendliness (via PageSpeed Insights API)
  - On-page SEO (HTML crawl, meta tags, headings, alt text, word count)
  - Schema markup (HTML crawl, JSON-LD detection)
  - Security (HTTPS, security headers via response headers)
  - Indexability (robots.txt, sitemap, canonical tags)
- Show the score immediately, no signup required
- Email gate ONLY for the full PDF report (lead capture mechanism)
- Show a teaser at the bottom, "We found 14 striking distance keywords for this site in Google. Connect GSC to see them."

**Why this works**

- Ahrefs, HubSpot, Seobility, SEOptimer have all proven the model
- HubSpot's grader has graded 4M+ sites and generated 40k+ backlinks since 2007
- It is the natural top of funnel for the rest of the GSCdaddy product
- It generates organic traffic on its own (the URL ranks for "website seo checker" type queries)
- It captures emails from people who are actively interested in SEO
- It creates a natural reason to connect GSC, "you've seen the surface, now see the keywords"

**Files to create**

```
app/seo-health-checker/page.tsx              -- Public landing + tool
app/seo-health-checker/[domain]/page.tsx     -- Cached results page (programmatic SEO)
app/api/health-check/route.ts                -- POST: run checks for a URL
app/api/health-check/pdf/route.ts            -- POST: generate PDF, gate by email
lib/health-check/crawler.ts                  -- HTML crawl, parse meta/headings/schema
lib/health-check/pagespeed.ts                -- PageSpeed Insights API wrapper
lib/health-check/scoring.ts                  -- Aggregate score calculation
lib/health-check/pdf-report.tsx              -- React PDF report template
```

**DB additions**

```sql
CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  score INTEGER,
  results JSONB,
  email TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_checks_domain ON health_checks(domain);
CREATE INDEX idx_health_checks_created ON health_checks(created_at DESC);
```

**Programmatic SEO win.** Cache results per domain. The URL `gscdaddy.com/seo-health-checker/example.com` becomes a public ranking page for "example.com seo audit" type searches. Ahrefs and Semrush both do this with millions of pages.

### P1.2 Demo mode with sample data

For users who land in the dashboard before sync completes (or whose site has no GSC data yet), show a fully populated dashboard with anonymized real data from gscdaddy.com itself. This is the dogfooding angle, applied to onboarding.

- Add a `is_demo` flag on the dashboard query layer
- When user has no synced data, render dashboard against a static demo dataset
- Banner at top, "This is sample data from gscdaddy.com. Your data will appear here once sync completes."
- Every interactive element works (filters, sort, generate recommendation, export)
- The recommendation cards show real AI-generated recs from Ayush's actual site

**Why this works**

- Eliminates the imagination gap, users see exactly what they will get
- Doubles as social proof (dogfooding is the brand)
- Removes the empty state, which the research calls out as the #1 onboarding killer
- Users who see value before committing are 2-3x more likely to activate

### P1.3 Two-track onboarding

Add a single question to the persona step in the existing 4-step wizard, "How old is your website?" with two options, "Less than 3 months" and "More than 3 months."

- **New site track.** Skip the GSC sync expectation. Route to a "New Site Launchpad" dashboard that runs the SEO Health Check on their site, surfaces foundation issues (sitemap, robots, schema, mobile, speed), and shows a guided GSC setup with the message "Your keyword data will appear within 48-72 hours as Google crawls your site."
- **Established site track.** Current flow, but with sample data shown while sync runs.

**DB addition**

```sql
ALTER TABLE users ADD COLUMN site_age TEXT
  CHECK (site_age IN ('new', 'established'));
```

### P1.4 Reverse trial after expiry

When the 14-day trial ends, instead of locking the user out, downgrade to a read-only free tier. They can still see their data, they just cannot generate new AI recommendations or add new sites. This pattern (Dropbox, Loom, Figma) lifts freemium-to-premium conversion 10-40%.

This requires a small change to `lib/billing/access.ts`. The trial-expired state currently restricts access entirely. Change it to return a `read_only` access level, and update the dashboard to render a non-blocking upgrade prompt instead of a paywall.

---

## Priority 2. Fix activation and retention emails

The implementation doc mentions weekly summary and trial reminder emails. The research says behavioral triggers outperform time-based by 70.5%. Here is the trigger-based sequence to ship.

| Trigger | Email | Goal |
|---|---|---|
| Signup completed | "Your SEO score is X/100, here are your top 3 fixes" | Deliver value in hour 1, no GSC required |
| Did not connect GSC within 24h | "Here is what you are missing" with sample striking distance report | Push GSC connection |
| GSC connected, sync completed | "We found N striking distance keywords on your site" | Bring user back to dashboard |
| No login for 3 days | "Quick wins you are leaving on the table" with top 3 opportunities | Re-engage |
| 7 days into trial | "You are halfway through. Here is what you have unlocked." | Mid-trial value reminder |
| 11 days in (3 days before trial end) | Personalized summary of access about to be lost | Trial conversion |
| 13 days in | Final reminder + offer (annual discount, 20% off first month) | Trial conversion |
| Trial expired, no upgrade | "What stopped you?" with a Calendly link to Ayush directly | Feedback loop, often converts |
| Day 30 post-trial | Win-back with new features shipped since they left | 50% of eventual conversions happen post-trial |

**DB addition for tracking**

```sql
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

CREATE INDEX idx_email_events_user_type ON email_events(user_id, email_type);
```

Use this table to prevent double-sends and to track which emails actually drive conversion.

---

## Priority 3. Programmatic SEO and content expansion

The research is clear that comparison and alternative-to pages are the highest-converting BOFU traffic in SaaS. GSCdaddy already publishes some of this content. The goal here is to scale it.

### P3.1 Comparison pages to build

Each one is its own static page at `gscdaddy.com/vs/[competitor]` with honest comparison tables and pricing.

- `gscdaddy.com/vs/seotesting` (direct competitor at $50+/mo, GSCdaddy is cheaper)
- `gscdaddy.com/vs/seo-gets` (closest direct competitor)
- `gscdaddy.com/vs/content-raptor` (closest price-point competitor)
- `gscdaddy.com/vs/ahrefs` (high-volume positioning, "Ahrefs alternative for bloggers")
- `gscdaddy.com/vs/semrush` ("cheap Semrush alternative")
- `gscdaddy.com/vs/ubersuggest`

Each page should include a Schema.org `Product` and `AggregateOffer` markup, an honest table that admits where the competitor is better (this builds trust and ranks better), and a CTA to start the trial.

### P3.2 Vertical-specific GSC guides

Almost no competitor creates industry-specific content. These are underserved and high-intent.

- "Striking distance keywords for ecommerce sites"
- "How bloggers can use GSC for quick traffic wins"
- "GSC optimization for SaaS companies"
- "Local SEO quick wins from Google Search Console"
- "GSC for affiliate sites"

Each guide should pair with a persona-specific landing page (`gscdaddy.com/for/bloggers`, `gscdaddy.com/for/agencies`) with a tailored hero, copy, and pricing recommendation. The `users.persona` field is already in the schema for this exact purpose.

### P3.3 Free tool landing pages as programmatic SEO ✅ PARTIALLY COMPLETE

8 free tools are already live at `gscdaddy.com/tools/*` with a tools landing page. Each has its own public page targeting relevant keywords.

**Already live:**
- `gscdaddy.com/tools/keyword-calculator` → "striking distance keywords calculator"
- `gscdaddy.com/tools/serp-preview` → "serp preview tool"
- `gscdaddy.com/tools/keyword-density-checker` → "keyword density checker"
- `gscdaddy.com/tools/meta-tag-generator` → "meta tag generator"
- `gscdaddy.com/tools/open-graph-generator` → "open graph generator"
- `gscdaddy.com/tools/readability-checker` → "readability checker"
- `gscdaddy.com/tools/robots-txt-generator` → "robots txt generator"
- `gscdaddy.com/tools/slug-generator` → "slug generator"

**Still to build (depend on P1.1 and P4):**
- `gscdaddy.com/seo-health-checker` → "website seo checker"
- `gscdaddy.com/tools/schema-validator` → "schema markup generator"
- `gscdaddy.com/tools/content-decay-checker` → "content decay checker"

### P3.4 The build-in-public content angle ✅ IN PROGRESS

Ayush is actively sharing the journey. 7 blog posts published, social media strategy running (see `socialmediahustle.md` and `30-day-plan.md`).

**Published blog posts:**
1. `/blog/striking-distance-keywords-guide` — Pillar page on striking distance keywords
2. `/blog/low-hanging-fruit-keywords-gsc` — Finding low-hanging fruit in GSC
3. `/blog/google-search-console-beginners-guide` — GSC beginner guide
4. `/blog/improve-ctr-google-search-console` — CTR improvement with GSC data
5. `/blog/ahrefs-vs-semrush-vs-google-search-console` — Comparison page (BOFU)
6. `/blog/keyword-cannibalization-google-search-console` — Cannibalization detection in GSC
7. `/blog/google-search-console-alternatives` — Alternatives listicle (BOFU)

**Still to write (from 30-day plan and revamp ideas):**
- "I analyzed 10,000 striking distance keywords from gscdaddy.com, here is what I learned"
- "Month 1 building an SEO tool, lessons from $0 MRR"
- "How I am competing against Ahrefs as a solo developer in Bangalore"
- "Why I built GSCdaddy after 3 years of staring at GSC data"
- Glossary pages (crawl budget, keyword difficulty, search intent, content decay, long-tail keywords)
- WordPress GSC setup guide
- Content audit guide
- Regex in GSC tutorial

These posts cross-promote on Reddit (r/indiehackers, r/SEO, r/juststart) and Twitter as the experiment threads from the 30-day plan.

---

## Priority 4. Additional free tools (after the SEO Health Score)

**Already shipped (8 tools live at `/tools/*`):**

1. ~~**Keyword calculator**~~ ✅ Live at `/tools/keyword-calculator` — enter position, impressions, CTR, get traffic gain estimates
2. ~~**SERP preview tool**~~ ✅ Live at `/tools/serp-preview` — title and description preview as it appears in Google
3. ~~**Keyword density checker**~~ ✅ Live at `/tools/keyword-density-checker`
4. ~~**Meta tag generator**~~ ✅ Live at `/tools/meta-tag-generator`
5. ~~**Open Graph generator**~~ ✅ Live at `/tools/open-graph-generator`
6. ~~**Readability checker**~~ ✅ Live at `/tools/readability-checker`
7. ~~**Robots.txt generator**~~ ✅ Live at `/tools/robots-txt-generator`
8. ~~**Slug generator**~~ ✅ Live at `/tools/slug-generator`

**Still to build (in priority order, one per 1-2 weeks after the Health Score ships):**

1. **Content decay checker.** URL input, checks Google cache date and flags freshness issues. Targets the growing content decay keyword cluster.
2. **Schema markup generator and validator.** URL input, see what schema exists, generate missing JSON-LD. Targets "schema generator."
3. **AI Overviews visibility checker.** Check whether a domain appears in Google's AI Overviews. Connects striking distance to the hot 2026 topic. Higher build effort but high differentiation.

Each tool follows the same pattern, public landing page, no signup for the free tier, email gate for advanced features or the PDF report.

---

## Priority 5. Browser extension

This is the long-bet distribution channel. Keyword Surfer has 100k+ users from its extension alone. Keywords Everywhere monetizes a credit model on top of an extension.

**MVP feature set**

- Detects when user is on `search.google.com/search-console`
- Overlays a "Find striking distance" button on the Performance report
- Clicking opens a panel showing positions 5-15 keywords with the GSCdaddy opportunity score
- "Connect to GSCdaddy" CTA in the panel, deep-links to signup with the data pre-loaded

This is a 3-4 week build for a solo dev. Defer until Priority 1-3 are in place. The point is that every GSC user's daily workflow becomes a touchpoint.

---

## Priority 6. Phase 2 features from the original implementation doc

These were already planned but not built. They become more valuable once the funnel improvements above are in place, because a higher-activated user base actually uses retention features.

### Content decay alerts

- Daily cron compares last 28 days vs prior 28 days per page
- Threshold, 20%+ traffic drop on pages with >50 prior clicks
- Severity, critical (>50%), warning (>30%), info (>20%)
- Alerts table, alert preferences table
- Alerts UI at `/alerts` with mark as read, dismiss, "get recommendations" action

### Onboarding checklist (persistent in dashboard)

Per the research, persistent dashboard checklists make users 3x more likely to convert. Pin to the sidebar with 4 persona-adapted items, first item pre-checked (endowed progress effect).

### Keyword cannibalization detection (Phase 3)

Find queries where 2+ pages rank with >20 impressions each. Recommend merge, differentiate, or 301. Uses existing `gsc_data` with SQL aggregation, no new tables. Pairs with the cannibalization free tool from Priority 4.

### PDF export (Agency plan only)

`@react-pdf/renderer` for monthly client reports. This is the single biggest reason agencies stay on the plan. Gate it to the $99 tier.

---

## Priority 7. Landing page revamp ✅ PARTIALLY COMPLETE

The landing page has been built with 15 component sections. Most of the structural work is done. What remains are refinements that depend on P1 (Health Score tool) and performance optimization.

**Already shipped (in `components/landing/`):**
- ✅ Hero section with CTA (`Hero.tsx`)
- ✅ Trust bar with Trustpilot badge (`TrustBar.tsx`)
- ✅ Problem section (`ProblemSection.tsx`)
- ✅ How it works — 3 steps (`HowItWorks.tsx`)
- ✅ Features comparison (`Features.tsx`, `Comparison.tsx`)
- ✅ Founder section with Twitter link, "I built this for myself" narrative (`FounderSection.tsx`)
- ✅ Build-in-public social proof section (`BuildInPublic.tsx`)
- ✅ Blog highlights section (`BlogSection.tsx`)
- ✅ Pricing cards with annual toggle (`Pricing.tsx`)
- ✅ FAQ section with FAQPage schema (`FAQ.tsx`)
- ✅ Final CTA section (`FinalCTA.tsx`)
- ✅ Navigation and footer (`Navigation.tsx`, `Footer.tsx`)
- ✅ Fade-in animations (`FadeInSection.tsx`)
- ✅ SoftwareApplication, Organization, WebSite, BreadcrumbList JSON-LD schemas (`app/page.tsx`)

**Still to do (after P1.1 ships):**
- [ ] Add SEO Health Score tool inline on the hero (input field right on the homepage)
- [ ] Embed real build-in-public tweets as social proof (replace static section)
- [ ] Page speed optimization — target LCP under 2.5s, INP under 200ms
- [ ] Real product screenshots in hero and feature sections

---

## Suggested execution order (updated from original 12-week plan)

P0 is complete. 8 free tools and 7 blog posts already shipped. Updated timeline reflects remaining work only.

| Weeks | Focus | Deliverable | Status |
|---|---|---|---|
| ~~1~~ | ~~P0 closeout~~ | ~~Settings pages, email MVP, API response format~~ | ✅ Done |
| ~~1-2~~ | ~~P1.1 Free SEO Health Score~~ | ~~Public tool at `/seo-health-checker`, email gated PDF, programmatic SEO~~ | ✅ Done |
| 3 | P1.2, P1.3 | Demo mode with gscdaddy.com data, two-track onboarding | Not started |
| 4 | P1.4, P2 | Reverse trial, full trigger-based email sequence (9 new emails) | Not started |
| 5-6 | P3.1, P3.2 | 6 comparison pages, 5 vertical guides | Not started |
| ~~7~~ | ~~P4.1, P4.2~~ | ~~Keyword calculator, SERP preview tool~~ | ✅ Done |
| 7 | P4.3, P4.4 | Content decay checker, schema generator | Not started |
| 8-9 | P7 | Landing page rebuild (inline Health Score, tweet embeds, perf) | Partially done |
| 10-11 | P6 | Decay alerts + onboarding checklist + cannibalization report | Not started |
| Ongoing | P5 | Browser extension build (background project) | Not started |

---

## Metrics to track from day 1

The point of the revamp is measurable. Add these to the dashboard analytics from the start so the impact is visible.

- Landing page → free tool conversion rate (visitors who run a health check)
- Free tool → signup conversion rate (health check users who create an account)
- Signup → GSC connection rate (the current bottleneck)
- GSC connection → first recommendation generated (activation moment)
- First recommendation → trial day 7 retention
- Trial → paid conversion rate, by persona and by site age
- Email open rate by trigger type (validate the 70% lift the research promises)

The current funnel is, roughly, "100 visitors → 3 signups → 0 retained." The goal of the revamp is to get to "100 visitors → 15 free tool users → 8 signups → 5 GSC-connected → 3 retained → 1 paid." That is a 33x improvement on the paid conversion rate from the same top-of-funnel volume, and the research from competitors confirms each of those numbers is achievable.

---

## The one thing that matters most

~~If only one item from this document gets built, build the **free SEO Health Score tool**.~~ **Done.** The SEO Health Score tool shipped April 14, 2026 at `/seo-health-checker`. It delivers a 0-100 score in ~15 seconds from any URL, captures emails via gated reports, and creates programmatic SEO pages per domain. Next priority: P1.2 demo mode and P1.3 two-track onboarding to complete the cold start fix.
