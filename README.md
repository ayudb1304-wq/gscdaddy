# GSCdaddy

Find your almost-ranking keywords in Google Search Console and get AI-powered action plans to push them to page 1.

**Live at:** [gscdaddy.com](https://gscdaddy.com)

---

## What it does

GSCdaddy connects to your Google Search Console data, identifies keywords ranking in positions 5-15 (the "striking distance" zone), and generates AI-powered recommendations for each one. Instead of staring at raw GSC data, you get a prioritized list of exactly what to fix and why.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL, Auth, RLS)
- **AI:** Anthropic Claude (recommendations)
- **Payments:** Dodo Payments (subscriptions)
- **Email:** Resend + React Email (transactional)
- **Styling:** Tailwind CSS + shadcn/ui
- **Hosting:** Vercel (with cron jobs)
- **Analytics:** Vercel Analytics

## Features

### Core product
- Google OAuth with PKCE and encrypted token storage
- 4-step onboarding wizard with persona selection
- Daily automated GSC data sync (cron at 4 AM UTC)
- Dashboard with metrics cards, performance chart, top opportunities
- Striking distance report with filters, sorting, opportunity score, CSV export
- AI recommendations via Claude (6 types: title optimization, content expansion, internal linking, content refresh, cannibalization fix, quick wins)
- 3-tier billing (Blogger $19, Pro $49, Agency $99) with 14-day free trial

### Email system
7 transactional email templates: welcome, weekly summary, trial ending, trial expired, nudge recommendations, top opportunity alert

### Free SEO tools (8 tools at `/tools/*`)
Keyword calculator, SERP preview, keyword density checker, meta tag generator, Open Graph generator, readability checker, robots.txt generator, slug generator

### Blog
7 published posts with BlogPosting + FAQPage schema, RSS feed, sticky table of contents

### Landing page
15 component sections with SoftwareApplication, Organization, WebSite, BreadcrumbList, FAQPage JSON-LD schemas

## Project structure

```
app/                    Next.js App Router (pages, API routes, cron jobs)
  (dashboard)/          Protected dashboard, reports, settings
  api/                  Auth, billing, cron, dashboard, recommendations, reports, sites
  blog/                 Blog system with [slug] routing
  tools/                8 free public SEO tools
components/             React components (dashboard, landing, reports, blog, UI)
lib/                    Core logic (AI, algorithms, API, billing, email, Google, sync, Supabase)
content/blog/           Blog post content (TypeScript files)
supabase/migrations/    13 database migrations
```

## Database

6 tables with Row Level Security:
- `users` — accounts, Google tokens, subscription info, persona
- `sites` — connected GSC properties, sync status
- `gsc_data` — search analytics (queries, pages, clicks, impressions, CTR, position)
- `striking_distance_keywords` — materialized view for positions 5-15
- `recommendations` — AI-generated SEO recommendations
- `subscriptions` — Dodo Payments subscription records

## Development

```bash
npm install
npm run dev     # Starts Next.js with Turbopack
```

Requires `.env.local` with keys for: Supabase, Google OAuth, Anthropic, Dodo Payments, Resend, and a cron secret. See `implementation.md` Step 1 for the full list.

## Documentation

| File | Description |
|------|-------------|
| `implementation.md` | Full feature spec with 12 implementation steps (all complete), Phase 2-3 outlines |
| `revamp.md` | Prioritized funnel rebuild plan with progress checklist |
| `30-day-plan.md` | Day-by-day organic growth execution plan |
| `SEOchecklist.md` | SEO compliance checklist based on Google Search Central docs |
| `socialmediahustle.md` | Social media posting log and strategy |

## Current status

Phase 1 MVP is **complete** (all 12 implementation steps shipped). Currently executing the 30-day organic growth plan and planning the revamp priorities (SEO Health Score tool, demo mode, comparison pages) to fix the cold-start activation problem.
