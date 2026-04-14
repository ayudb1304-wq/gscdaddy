# GSCdaddy - Implementation Plan

## Overview
Complete implementation plan derived from `GSCdaddy-PRD.md`. Phase 1 (MVP) is detailed with file paths, acceptance criteria, and step-by-step instructions. Phase 2 & 3 are outlined for future work.

**Tech Stack:**
- Next.js 16 (App Router, Turbopack)
- Supabase (PostgreSQL, Auth, RLS)
- Anthropic Claude (AI recommendations)
- Dodo Payments (subscriptions)
- Resend (transactional email)
- Tailwind CSS + shadcn/ui
- Vercel (hosting, cron jobs)

**AI Provider:** Anthropic Claude (user has API key)
**Payments:** Dodo Payments
**Supabase:** Already provisioned (migrations run, env configured)

---

## Phase 1: MVP (Weeks 1-4)

### Step 1: Project Setup & Database ✅

**1.1 Environment Variables**

Create `.env.local` with:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth & APIs
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Anthropic
ANTHROPIC_API_KEY=

# Dodo Payments
DODO_API_KEY=
DODO_WEBHOOK_SECRET=
NEXT_PUBLIC_DODO_PUBLISHABLE_KEY=

# Resend (Email)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=
```

**1.2 Install Dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @anthropic-ai/sdk
npm install @dodopayments/sdk
npm install resend
npm install zod
npm install recharts
npm install date-fns
```

**1.3 Database Migrations**

Run these SQL migrations in your Supabase project (in order):

**Migration 001: Users table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at TIMESTAMPTZ,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  trial_ends_at TIMESTAMPTZ,
  sites_limit INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE USING (auth.uid() = id);
```

**Migration 002: Sites table**
```sql
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  site_url TEXT NOT NULL,
  display_name TEXT,
  permission_level TEXT,
  is_verified BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, site_url)
);

CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_last_synced ON sites(last_synced_at);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sites"
  ON sites FOR ALL USING (auth.uid() = user_id);
```

**Migration 003: GSC Data table**
```sql
CREATE TABLE gsc_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  query TEXT NOT NULL,
  page TEXT NOT NULL,
  country TEXT DEFAULT 'ALL',
  device TEXT DEFAULT 'ALL',
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, date, query, page, country, device)
);

CREATE INDEX idx_gsc_data_site_date ON gsc_data(site_id, date DESC);
CREATE INDEX idx_gsc_data_position ON gsc_data(position) WHERE position >= 5 AND position <= 15;
CREATE INDEX idx_gsc_data_query ON gsc_data(query);
CREATE INDEX idx_gsc_data_page ON gsc_data(page);

ALTER TABLE gsc_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own site data"
  ON gsc_data FOR SELECT
  USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));
```

**Migration 004: Striking Distance materialized view**
```sql
CREATE MATERIALIZED VIEW striking_distance_keywords AS
SELECT
  gsc.site_id,
  gsc.query,
  gsc.page,
  AVG(gsc.position) as avg_position,
  SUM(gsc.impressions) as total_impressions,
  SUM(gsc.clicks) as total_clicks,
  AVG(gsc.ctr) as avg_ctr,
  SUM(gsc.impressions) * (15 - AVG(gsc.position)) / 10 as opportunity_score,
  MAX(gsc.date) as last_seen
FROM gsc_data gsc
WHERE
  gsc.date >= CURRENT_DATE - INTERVAL '28 days'
  AND gsc.position >= 5
  AND gsc.position <= 15
GROUP BY gsc.site_id, gsc.query, gsc.page
HAVING SUM(gsc.impressions) >= 50
ORDER BY opportunity_score DESC;

CREATE UNIQUE INDEX idx_sdk_site_query_page
  ON striking_distance_keywords(site_id, query, page);

CREATE OR REPLACE FUNCTION refresh_striking_distance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY striking_distance_keywords;
END;
$$ LANGUAGE plpgsql;
```

**Migration 005: Recommendations table**
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'title_optimization', 'content_expansion',
    'internal_linking', 'content_refresh',
    'cannibalization_fix', 'quick_win'
  )),
  query TEXT,
  page TEXT,
  current_position DECIMAL(5,2),
  potential_position DECIMAL(5,2),
  estimated_traffic_gain INTEGER,
  recommendation_text TEXT NOT NULL,
  action_items JSONB,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_recommendations_site_id ON recommendations(site_id);
CREATE INDEX idx_recommendations_priority ON recommendations(priority, is_completed);
CREATE INDEX idx_recommendations_created ON recommendations(created_at DESC);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR ALL
  USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));
```

**Migration 006: Subscriptions table**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dodo_subscription_id TEXT UNIQUE,
  dodo_customer_id TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'agency')),
  status TEXT NOT NULL CHECK (status IN (
    'active', 'canceled', 'past_due', 'trialing', 'paused'
  )),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);
```

**Files to create:**
```
lib/supabase/client.ts       -- Browser Supabase client
lib/supabase/server.ts       -- Server Supabase client (cookies-based)
lib/supabase/admin.ts        -- Service role client (for cron jobs, webhooks)
lib/supabase/middleware.ts    -- Auth middleware helper
middleware.ts                 -- Next.js middleware for auth route protection
```

**Acceptance Criteria:**
- [x] All 6 migrations run successfully
- [x] RLS policies active on all tables
- [x] Materialized view in private schema (not exposed via PostgREST)
- [x] Supabase clients configured for browser, server, and admin contexts
- [x] Middleware protects `/dashboard/*`, `/reports/*`, `/settings/*` routes
- [x] API response helpers created (lib/api/response.ts)
- [x] Auth helpers created (lib/auth.ts)
- [x] Plan definitions and access control created (lib/billing/)
- [x] Vercel cron config created (vercel.json)

**STATUS: COMPLETE**

---

### Step 2: Google OAuth Authentication ✅

**2.1 Google Cloud Setup (Manual)**
1. Create project in Google Cloud Console
2. Enable Google Search Console API
3. Create OAuth 2.0 credentials (Web Application)
4. Add authorized redirect URI: `{APP_URL}/api/auth/callback`
5. Request scopes: `email`, `profile`, `https://www.googleapis.com/auth/webmasters.readonly`

**2.2 Auth Flow Implementation**

```
User clicks "Sign in with Google"
  -> GET /api/auth/login (redirects to Google consent)
  -> Google redirects to GET /api/auth/callback
  -> Exchange code for tokens
  -> Create/update user in Supabase (with service role)
  -> Set session cookie
  -> Redirect to /onboarding (new) or /dashboard (returning)
```

**Files to create:**
```
app/api/auth/login/route.ts        -- Redirect to Google OAuth
app/api/auth/callback/route.ts     -- Handle OAuth callback, store tokens, set session
app/api/auth/refresh/route.ts      -- Refresh Google access token
app/api/auth/logout/route.ts       -- Clear session
app/login/page.tsx                 -- Login page with "Sign in with Google" button
lib/google/oauth.ts                -- Google OAuth helpers (URL builder, token exchange)
lib/google/tokens.ts               -- Token encryption/decryption, refresh logic
lib/auth.ts                        -- getCurrentUser(), requireAuth() helpers
```

**Key Implementation Details:**

`lib/google/oauth.ts`:
- Build authorization URL with PKCE (code_verifier, code_challenge)
- Exchange authorization code for access_token + refresh_token
- Scope: `email profile https://www.googleapis.com/auth/webmasters.readonly`
- Store code_verifier in httpOnly cookie for PKCE validation

`app/api/auth/callback/route.ts`:
- Validate state parameter
- Exchange code for tokens
- Fetch user profile from Google
- Upsert user in `users` table (using admin client)
- Store encrypted google_access_token and google_refresh_token
- Set trial_ends_at = NOW() + 14 days for new users
- Create Supabase auth session
- Redirect to `/onboarding` (first time) or `/dashboard` (returning)

`lib/google/tokens.ts`:
- Encrypt tokens before storing in DB (AES-256-GCM)
- Decrypt tokens when needed for API calls
- Auto-refresh: check `google_token_expires_at`, refresh if within 5 min of expiry
- Handle token revocation (user revokes in Google settings)

`middleware.ts`:
- Check for valid Supabase session on protected routes
- Redirect unauthenticated users to `/login`
- Protected route patterns: `/dashboard`, `/reports`, `/settings`, `/onboarding`, `/alerts`

**Acceptance Criteria:**
- [x] User can sign in with Google in < 10 seconds
- [x] Tokens are encrypted at rest in DB (AES-256-GCM)
- [x] Failed auth shows clear error message
- [x] User can sign out and session is cleared
- [x] Trial automatically starts (14 days) for new users
- [x] Token auto-refresh works before expiry
- [x] Protected routes redirect to login when unauthenticated

**STATUS: COMPLETE**

**Note:** Add `ENCRYPTION_KEY` (64-char hex string) to `.env.local`. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

### Step 3: Onboarding & Site Management ✅

**3.1 Conversion-Optimized Onboarding (based on onboarding.md research)**

4-step wizard with endowed progress bar. Research shows 82% completion improvement
with visible head-start progress, and pre-permission priming pushes GSC grant rates
from 60% to 80%+.

**The 4-step flow:**
```
/onboarding (client component, single page wizard)
  Step 1: "Account created ✓" (pre-checked, endowed progress)
  Step 2: Persona selection - "What best describes you?" (3 visual cards)
  Step 3: Pre-permission priming → Fetch GSC sites → Pick site
  Step 4: Celebration + first value preview → "Go to Dashboard"
```

**DB Migration needed:**
```sql
ALTER TABLE users ADD COLUMN persona TEXT CHECK (persona IN ('blogger', 'consultant', 'agency'));
```

**Files to create:**
```
lib/google/search-console.ts             -- GSC API wrapper (list sites, fetch data)
app/api/sites/available/route.ts         -- GET: Fetch available GSC properties
app/api/sites/route.ts                   -- GET: List user sites, POST: Add site
app/api/sites/[siteId]/route.ts          -- GET: Site details, DELETE: Remove site
app/api/sites/[siteId]/sync/route.ts     -- POST: Trigger manual sync
app/api/users/persona/route.ts           -- PATCH: Save persona selection
app/onboarding/page.tsx                  -- 4-step wizard (client component)
components/onboarding/steps.tsx          -- Step components (persona, priming, site picker, celebration)
```

**3.2 Step Details**

**Step 2 - Persona Selection:**
- 3 visual cards: Indie Blogger / SEO Consultant / Small Agency
- Each has icon, title, 1-line description of tailored experience
- Single click saves persona via PATCH /api/users/persona and advances
- Persona stored in users.persona, used to customize dashboard experience later

**Step 3 - Pre-Permission Priming + GSC Connection:**
- Priming screen (NOT the Google consent screen) shown first:
  - "Connect Google Search Console"
  - What they get: 3 bullets (striking-distance keywords, trends, AI action plans)
  - 3 trust signals adjacent to CTA: read-only / encrypted / disconnect anytime
  - Primary CTA: "Connect Google Search Console" (large, full-width)
- After clicking: fetch available sites via GET /api/sites/available
- Site picker: list of GSC properties as selectable cards
- "Start with your main site - you can add more later"
- User picks one -> POST /api/sites -> advance to Step 4

**Step 4 - Celebration + First Value:**
- Trigger initial sync in background
- Stepped progress indicator (not spinner): "Connecting... -> Pulling data... -> Building..."
- On complete: "Found X striking-distance keywords!" with celebration animation
- Preview top 3-5 keywords if sync is fast
- "Go to Dashboard" CTA
- Fallback if sync >30s: "Your dashboard is being prepared" + go to dashboard anyway

**3.3 Site Management API**

`lib/google/search-console.ts`:
- `listAvailableSites(accessToken)` - GET googleapis/webmasters/v3/sites
- `fetchSearchAnalytics(accessToken, siteUrl, startDate, endDate)` - paginated (25K rows)
- Rate limit handling with exponential backoff

`app/api/sites/route.ts` (POST):
- Validate plan site limit server-side
- Insert into sites table
- Return new site record

**Acceptance Criteria:**
- [x] 4-step wizard with progress bar showing endowed progress
- [x] Persona selection saves to DB and advances flow
- [x] Pre-permission priming screen with 3 trust signals shows before GSC site fetch
- [x] Available sites load via API with already-added filtering
- [x] User cannot exceed plan's site limit (enforced server-side)
- [x] Domain properties (sc-domain:) supported
- [x] Celebration screen with stepped sync progress
- [x] Fallback UX if sync takes >30 seconds ("Go to dashboard anyway" + timeout state)

**STATUS: COMPLETE**

**Note:** Run migration 007 in Supabase SQL Editor to add `persona` column to users table.

---

### Step 4: GSC Data Sync ✅

**4.1 Sync Strategy**
- **Initial sync:** Last 90 days of data
- **Daily sync:** Previous 3 days (GSC data has 2-3 day delay)
- **Schedule:** 4 AM UTC via Vercel Cron
- **Rate limits:** 20 QPS, batch requests where possible

**Files to create:**
```
app/api/cron/sync-gsc/route.ts         -- Cron endpoint: daily GSC sync for all sites
app/api/cron/refresh-views/route.ts     -- Cron endpoint: refresh materialized views
lib/sync/gsc-sync.ts                    -- Core sync logic (fetch, dedupe, upsert)
lib/sync/rate-limiter.ts                -- Simple rate limiter for GSC API calls
```

**Key Implementation Details:**

`lib/sync/gsc-sync.ts`:
- `syncSite(siteId)` - main sync function
- Fetch user tokens, decrypt, refresh if needed
- Determine date range (initial: 90 days ago to 3 days ago, daily: 6 days ago to 3 days ago)
- Paginate through GSC API (25K rows per request)
- Upsert data into `gsc_data` using `ON CONFLICT DO UPDATE`
- Update `sites.last_synced_at` and `sites.sync_status`
- Handle errors: set `sync_status = 'failed'`, log error

`app/api/cron/sync-gsc/route.ts`:
- Protected by `CRON_SECRET` header check
- Fetch all sites that need syncing (last_synced_at > 24h ago or never synced)
- Process sites sequentially (to respect rate limits)
- Update sync_status throughout: pending -> syncing -> completed/failed
- Log sync results

`app/api/cron/refresh-views/route.ts`:
- Protected by `CRON_SECRET`
- Call `refresh_striking_distance()` SQL function
- Run after sync-gsc completes

**Vercel Cron Config (`vercel.json`):**
```json
{
  "crons": [
    { "path": "/api/cron/sync-gsc", "schedule": "0 4 * * *" },
    { "path": "/api/cron/refresh-views", "schedule": "30 4 * * *" },
    { "path": "/api/cron/generate-recs", "schedule": "0 5 * * 0" }
  ]
}
```

**Acceptance Criteria:**
- [x] Initial sync completes within 5 minutes per site
- [x] Daily sync runs reliably at 4 AM UTC
- [x] No duplicate data entries (upsert handles conflicts)
- [x] Handles GSC API errors gracefully (retries, backoff)
- [x] Sync status visible to user on dashboard
- [x] Materialized view refreshes after sync

**STATUS: COMPLETE**

---

### Step 5: Dashboard ✅

**5.1 Dashboard Layout**

Main dashboard at `/dashboard` showing:
1. Site selector dropdown (for multi-site plans)
2. Metrics cards: Total Clicks, Impressions, Avg Position, Striking Distance count (28 days, with % change vs prior 28 days)
3. Performance chart: Line chart of clicks/impressions over last 28 days (Recharts)
4. Top Opportunities widget: Top 5 striking distance keywords
5. Recent Recommendations widget: Latest AI recommendations with completion status

**Files to create:**
```
app/(dashboard)/layout.tsx                   -- Dashboard shell (sidebar, header, site selector)
app/(dashboard)/dashboard/page.tsx           -- Main dashboard page
app/(dashboard)/dashboard/loading.tsx        -- Loading skeleton
components/dashboard/sidebar.tsx             -- Navigation sidebar
components/dashboard/header.tsx              -- Top bar with user menu, trial badge
components/dashboard/site-selector.tsx       -- Site switcher dropdown
components/dashboard/metrics-cards.tsx       -- 4 KPI cards with % change
components/dashboard/performance-chart.tsx   -- Recharts line chart
components/dashboard/top-opportunities.tsx   -- Top 5 striking distance keywords
components/dashboard/recent-recs.tsx         -- Recent recommendations list
app/api/dashboard/metrics/route.ts           -- GET: Aggregated metrics for a site
app/api/dashboard/chart/route.ts             -- GET: Daily time series data for chart
```

**Key Implementation Details:**

`app/(dashboard)/layout.tsx`:
- Route group with shared sidebar layout
- Sidebar: Dashboard, Reports (sub-items), Settings (sub-items)
- Header: site selector, trial days remaining badge, user avatar dropdown
- Responsive: sidebar collapses to hamburger on mobile

`app/api/dashboard/metrics/route.ts`:
- Query params: `siteId`, `dateRange` (default 28)
- Returns: clicks, impressions, avg_position, striking_distance_count
- Also returns prior period values for % change calculation
- Uses direct SQL queries against `gsc_data` table

`components/dashboard/performance-chart.tsx`:
- Client component using Recharts
- Line chart with toggle: Clicks / Impressions / Position
- Hover tooltip with daily values
- Responsive container

**Acceptance Criteria:**
- [x] Dashboard loads within 3 seconds
- [x] Metrics are accurate and match GSC data
- [x] Chart is interactive (hover, toggle metrics)
- [x] Site selector works for multi-site plans
- [x] Empty states handled gracefully (no data yet, sync in progress)
- [x] Trial countdown badge shows days remaining
- [x] Responsive: usable on tablet (768px+)

**STATUS: COMPLETE**

---

### Step 6: Striking Distance Keywords Report ✅

**6.1 Report Page**

Full-featured data table at `/reports/striking-distance`.

**Files to create:**
```
app/(dashboard)/reports/striking-distance/page.tsx    -- Report page
app/(dashboard)/reports/striking-distance/loading.tsx  -- Loading skeleton
components/reports/keywords-table.tsx                  -- Data table component
components/reports/keywords-filters.tsx                -- Filter controls
components/reports/export-csv.tsx                      -- CSV export button
app/api/reports/striking-distance/[siteId]/route.ts    -- GET: Striking distance data
lib/algorithms/opportunity-score.ts                    -- Scoring algorithm
```

**Key Implementation Details:**

`app/api/reports/striking-distance/[siteId]/route.ts`:
- Query the `striking_distance_keywords` materialized view
- Support query params: `sortBy` (opportunityScore, impressions, position, clicks), `sortOrder`, `page`, `limit`, `search` (query/page text filter), `minImpressions`, `minPosition`, `maxPosition`
- Return paginated results with total count

`lib/algorithms/opportunity-score.ts`:
```typescript
function calculateOpportunityScore(impressions: number, position: number): number {
  const positionFactor = (15 - position) / 10;
  return impressions * positionFactor;
}

function estimateTrafficGain(impressions: number, currentPosition: number, targetPosition: number = 3): number {
  const ctrByPosition: Record<number, number> = {
    1: 0.30, 2: 0.15, 3: 0.10, 4: 0.07, 5: 0.05,
    6: 0.04, 7: 0.03, 8: 0.025, 9: 0.02, 10: 0.018,
    11: 0.015, 12: 0.013, 13: 0.011, 14: 0.010, 15: 0.009
  };
  const currentCtr = ctrByPosition[Math.round(currentPosition)] || 0.01;
  const targetCtr = ctrByPosition[targetPosition];
  return Math.round(impressions * (targetCtr - currentCtr));
}
```

`components/reports/keywords-table.tsx`:
- Client component with sortable columns
- Columns: Query, Page, Avg Position, Impressions, Clicks, CTR, Opportunity Score, Est. Traffic Gain
- Click row to expand details
- "Generate recommendation" action per row

`components/reports/export-csv.tsx`:
- Fetches all matching rows (not just current page)
- Generates CSV with all columns
- Triggers browser download

**Acceptance Criteria:**
- [x] Report loads within 2 seconds
- [x] Correctly shows positions 5-15 only
- [x] Opportunity score ranks best opportunities first
- [x] Traffic gain estimates are reasonable
- [x] Can filter by page, query, min impressions
- [x] Can sort by all columns
- [x] CSV export works with all filtered data
- [x] Pagination works for large datasets

**STATUS: COMPLETE**

---

### Step 7: AI-Powered Recommendations ✅

**7.1 Recommendation Generation**

Uses Anthropic Claude to generate actionable SEO recommendations.

**Files to create:**
```
app/(dashboard)/reports/recommendations/page.tsx       -- Recommendations list page
app/(dashboard)/reports/recommendations/loading.tsx    -- Loading skeleton
components/reports/recommendation-card.tsx             -- Individual recommendation display
app/api/recommendations/generate/[siteId]/route.ts    -- POST: Generate new AI recs
app/api/recommendations/[recommendationId]/route.ts   -- PATCH: Complete/dismiss, DELETE: Remove
app/api/cron/generate-recs/route.ts                   -- Cron: Weekly auto-generation
lib/ai/generate-recommendations.ts                    -- Core AI recommendation logic
lib/ai/prompts.ts                                     -- System and user prompt templates
```

**Key Implementation Details:**

`lib/ai/prompts.ts`:
- System prompt: expert SEO consultant persona, output format spec (JSON)
- User prompt template: includes top 20 striking distance keywords, site URL, current page titles
- Response schema matching the `recommendations` table structure

`lib/ai/generate-recommendations.ts`:
- Fetch top striking distance keywords for the site
- Build prompt with real data
- Call Anthropic Claude API (`claude-sonnet-4-20250514` for cost efficiency)
- Parse JSON response
- Validate with zod schema
- Upsert into `recommendations` table
- Set `expires_at` to 7 days from now

**Recommendation types:**
| Type | Trigger | Priority |
|------|---------|----------|
| `title_optimization` | High impressions, low CTR | High |
| `content_expansion` | Position 6-10, thin content | High |
| `internal_linking` | Good position, low authority | Medium |
| `quick_win` | Position 11-15, high impressions | High |

`app/api/recommendations/generate/[siteId]/route.ts`:
- Rate limit: 2/day free trial, 5/day paid plans
- Check rate limit before generating
- Return generated recommendations

`app/api/recommendations/[recommendationId]/route.ts`:
- PATCH: toggle `is_completed`, set `completed_at`
- DELETE: remove recommendation

`components/reports/recommendation-card.tsx`:
- Shows: type badge, query, page, priority, recommendation text, action items checklist
- Actions: mark complete, dismiss
- Visual: completed items are grayed out

**Generation Schedule:**
- Automatic: Weekly via Vercel Cron (Sunday 5 AM UTC)
- Manual: On-demand from dashboard (rate limited)

**Acceptance Criteria:**
- [x] Recommendations are specific and actionable (not generic)
- [x] Action items can be completed in stated timeframe
- [x] Traffic estimates are conservative but motivating
- [x] User can mark recommendations as complete
- [x] User can dismiss irrelevant recommendations
- [x] Rate limiting works (2/day free, 5/day paid)
- [x] Weekly auto-generation runs reliably

**STATUS: COMPLETE**

---

### Step 8: Billing & Subscriptions (Dodo Payments) ✅

**8.1 Integration**

**Files to create:**
```
app/(dashboard)/settings/billing/page.tsx    -- Billing/subscription management page
app/api/billing/checkout/route.ts            -- POST: Create Dodo checkout session
app/api/billing/portal/route.ts              -- POST: Get customer portal URL
app/api/billing/webhook/route.ts             -- POST: Dodo webhook handler
app/api/billing/usage/route.ts               -- GET: Current plan usage stats
lib/billing/dodo.ts                          -- Dodo Payments client wrapper
lib/billing/plans.ts                         -- Plan definitions, limits, feature gates
lib/billing/access.ts                        -- checkAccess(), requirePlan() helpers
```

**Key Implementation Details:**

`lib/billing/plans.ts` (updated — "starter" renamed to "blogger" per migration 011):
```typescript
export const PLANS = {
  free: { sites: 1, aiRecsPerDay: 3, features: ['striking_distance', 'weekly_email'] },
  blogger: { sites: 1, aiRecsPerDay: 5, price: { monthly: 19, annual: 15 }, features: ['striking_distance', 'weekly_email', 'decay_alerts'] },
  pro: { sites: 5, aiRecsPerDay: 25, price: { monthly: 49, annual: 39 }, features: ['striking_distance', 'ai_recs', 'decay_alerts', 'csv_exports', 'weekly_email', 'priority_support'] },
  agency: { sites: 25, aiRecsPerDay: 50, price: { monthly: 99, annual: 79 }, features: ['striking_distance', 'ai_recs', 'decay_alerts', 'pdf_exports', 'team_access', 'white_label', 'weekly_email', 'priority_support'] },
};
```

`lib/billing/access.ts`:
```typescript
function checkAccess(user): AccessLevel {
  // 1. Check active paid subscription
  // 2. Check if trial still valid (trial_ends_at > now)
  // 3. Return { hasAccess, plan, daysRemaining?, reason? }
}
```

`app/api/billing/checkout/route.ts`:
- Accept plan selection
- Create Dodo checkout session with user's email and metadata
- Return checkout URL for redirect

`app/api/billing/webhook/route.ts`:
- Verify Dodo webhook signature
- Handle events:
  - `checkout.session.completed` -> activate subscription, update user plan
  - `invoice.paid` -> renew subscription period
  - `invoice.payment_failed` -> mark past_due, notify user
  - `customer.subscription.deleted` -> cancel subscription, downgrade at period end

`app/(dashboard)/settings/billing/page.tsx`:
- Show current plan, usage (sites used / limit)
- Trial countdown if on trial
- Upgrade/downgrade buttons
- Link to Dodo customer portal for managing payment method
- Invoice history

**Trial Logic:**
- New users get `trial_ends_at = NOW() + 14 days`
- During trial, all Pro features are available
- 3 days before trial end: send reminder email
- After trial expires: restrict to read-only (can view data, can't generate new recs)
- Clear upgrade CTA on dashboard when trial expiring/expired

**Acceptance Criteria:**
- [x] Users can subscribe to any paid plan
- [x] Webhooks update subscription status reliably
- [x] Users can access customer portal (manage payment, cancel)
- [x] Trial countdown shows days remaining on dashboard
- [x] Feature gates work based on plan (site limits, AI rec limits)
- [x] Failed payments trigger appropriate notices
- [x] Cancellation downgrades at period end (not immediate)

**STATUS: COMPLETE**

---

### Step 9: Settings Pages ✅

**Files:**
```
app/(dashboard)/settings/layout.tsx            -- Settings layout with tabs
app/(dashboard)/settings/profile/page.tsx      -- User profile (name, email, avatar)
app/(dashboard)/settings/sites/page.tsx        -- Site management (add, remove, sync status)
app/(dashboard)/settings/billing/page.tsx      -- (covered in Step 8)
```

**Settings/Profile:**
- Display name, email (read-only from Google), avatar
- "Delete my account" button (GDPR - deletes all data)
- "Revoke Google access" button

**Settings/Sites:**
- List of connected sites with sync status
- "Add site" button (opens site picker, respects plan limits)
- Per-site actions: manual sync, remove (with confirmation)
- Last synced timestamp per site

**Acceptance Criteria:**
- [x] User can view and update profile
- [x] User can delete account (cascading delete of all data)
- [x] Site management works correctly
- [x] Manual sync triggers correctly

---

### Step 10: API Response Format & Validation ✅

**Files:**
```
lib/api/response.ts          -- Standardized success/error response helpers
lib/api/errors.ts            -- Error codes and classes
lib/api/validate.ts          -- Zod validation middleware
lib/api/rate-limit.ts        -- Rate limiting (in-memory or Supabase-based)
```

**Standard response format:**
```typescript
// Success: { success: true, data: {...}, meta?: { page, limit, total } }
// Error: { success: false, error: { code, message, details? } }
```

**Error codes:** UNAUTHORIZED, FORBIDDEN, NOT_FOUND, RATE_LIMITED, VALIDATION_ERROR, INTERNAL_ERROR, PLAN_LIMIT_EXCEEDED, TRIAL_EXPIRED, SYNC_FAILED

**Acceptance Criteria:**
- [x] All API routes use consistent response format
- [x] All inputs validated with zod
- [x] Rate limiting works (50 req/min per user)
- [x] Proper HTTP status codes

---

### Step 11: Email Notifications ✅

**Files:**
```
lib/email/resend.ts                              -- Resend client wrapper
lib/email/templates/welcome.tsx                  -- Welcome email on signup
lib/email/templates/weekly-summary.tsx           -- React Email template for weekly summary
lib/email/templates/trial-ending.tsx             -- Trial ending warning email
lib/email/templates/trial-expired.tsx            -- Trial expired email
lib/email/templates/nudge-recommendations.tsx    -- Nudge for users who haven't generated recs
lib/email/templates/top-opportunity-alert.tsx    -- Top keyword opportunity highlight
lib/email/templates/shared.tsx                   -- Shared email components and utilities
app/api/cron/send-emails/route.ts                -- Cron: weekly summaries, trial reminders
app/api/test-emails/route.ts                     -- Email testing endpoint
```

**Shipped emails (7 templates):**
1. **Welcome** - sent on signup
2. **Weekly Summary** (Sunday 9 AM) - top opportunities, metrics overview, CTA
3. **Trial Ending** (3 days before) - progress made, upgrade CTA
4. **Trial Expired** (day of) - limited access notice, upgrade CTA
5. **Nudge: Recommendations** (daily check) - sent once per site when user has synced GSC data + striking distance keywords but hasn't generated recommendations yet. Highlights their top keyword by opportunity score with real data. Uses `nudge_email_sent_at` column on sites table to prevent repeat sends.
6. **Top Opportunity Alert** - highlights highest-potential striking distance keyword
7. **Shared utilities** - common email layout components

**Additional files:**
```
lib/email/templates/nudge-recommendations.tsx  -- Nudge email for users stuck before generating recs
supabase/migrations/012_add_nudge_email_sent_at.sql  -- Adds nudge_email_sent_at to sites table
```

**Acceptance Criteria:**
- [x] Emails render correctly in Gmail, Outlook, Apple Mail
- [x] Weekly summary includes real data from user's site
- [x] Trial emails trigger at correct times
- [x] User's email preferences respected
- [x] Nudge email sends only once per site (tracked via nudge_email_sent_at)
- [x] Nudge email includes real keyword data (top keyword, position, impressions, total opportunities)
- [x] Nudge skips users who already generated recommendations

---

### Step 12: Blog & Content Marketing ✅

**12.1 Blog System**

Static blog using TypeScript content files rendered as HTML. No MDX or CMS needed. 7 posts published.

**Files:**
```
lib/blog.ts                                              -- Blog post type, getAllPosts, getPostBySlug, reading time, heading extraction
app/blog/page.tsx                                        -- Blog index page
app/blog/[slug]/page.tsx                                 -- Blog post page with TOC sidebar, JSON-LD, related posts
components/blog/table-of-contents.tsx                    -- Sticky TOC with scroll-spy, scrollable overflow
content/blog/striking-distance-keywords-guide.ts         -- Post #1
content/blog/low-hanging-fruit-keywords-gsc.ts           -- Post #2
content/blog/google-search-console-beginners-guide.ts    -- Post #3
content/blog/improve-ctr-google-search-console.ts        -- Post #4
content/blog/ahrefs-vs-semrush-vs-google-search-console.ts  -- Post #5 (comparison)
content/blog/keyword-cannibalization-google-search-console.ts -- Post #6
content/blog/google-search-console-alternatives.ts       -- Post #7 (alternatives listicle)
app/feed.xml/route.ts                                    -- RSS feed (auto-generates from getAllPosts)
```

**Features:**
- BlogPosting + BreadcrumbList + FAQPage JSON-LD schema per post
- Table of contents sidebar with IntersectionObserver scroll-spy
- TOC is scrollable when it overflows the viewport (`max-h-[calc(100vh-8rem)]`)
- Related posts section scored by shared tags
- Reading time estimate
- RSS feed at `/feed.xml` with auto-discovery link
- All posts cross-linked to each other where relevant

**12.2 Dashboard Bug Fixes**

- Fixed striking distance stat card counting raw `gsc_data` rows (no impression threshold) while Top Opportunities used materialized view (requires >= 50 impressions). Stat card now reads from same data source as opportunities list.

**STATUS: COMPLETE**

---

## Phase 1 - File Structure Summary

```
app/
  (dashboard)/
    layout.tsx
    dashboard/
      page.tsx, loading.tsx
    reports/
      striking-distance/
        page.tsx, loading.tsx
      recommendations/
        page.tsx, loading.tsx
    settings/
      layout.tsx
      profile/page.tsx
      sites/page.tsx
      billing/page.tsx
  api/
    auth/
      login/route.ts
      callback/route.ts
      refresh/route.ts
      logout/route.ts
    sites/
      route.ts
      available/route.ts
      [siteId]/
        route.ts
        sync/route.ts
    dashboard/
      metrics/route.ts
      chart/route.ts
    reports/
      striking-distance/[siteId]/route.ts
    recommendations/
      generate/[siteId]/route.ts
      [recommendationId]/route.ts
    billing/
      checkout/route.ts
      portal/route.ts
      webhook/route.ts
      usage/route.ts
    cron/
      sync-gsc/route.ts
      refresh-views/route.ts
      generate-recs/route.ts
      send-emails/route.ts
  login/page.tsx
  onboarding/page.tsx

components/
  dashboard/
    sidebar.tsx
    header.tsx
    site-selector.tsx
    metrics-cards.tsx
    performance-chart.tsx
    top-opportunities.tsx
    recent-recs.tsx
  reports/
    keywords-table.tsx
    keywords-filters.tsx
    export-csv.tsx
    recommendation-card.tsx
  landing/ (already built)

lib/
  supabase/client.ts, server.ts, admin.ts, middleware.ts
  google/oauth.ts, tokens.ts, search-console.ts
  ai/generate-recommendations.ts, prompts.ts
  billing/dodo.ts, plans.ts, access.ts
  sync/gsc-sync.ts, rate-limiter.ts
  algorithms/opportunity-score.ts
  api/response.ts, errors.ts, validate.ts, rate-limit.ts
  email/resend.ts
  email/templates/weekly-summary.tsx, trial-ending.tsx, trial-expired.tsx
  email/templates/welcome.tsx, nudge-recommendations.tsx, shared.tsx
  blog.ts
  constants.ts (already exists)
  utils.ts (already exists)

content/
  blog/
    striking-distance-keywords-guide.ts
    low-hanging-fruit-keywords-gsc.ts
    google-search-console-beginners-guide.ts
    improve-ctr-google-search-console.ts
    ahrefs-vs-semrush-vs-google-search-console.ts
    keyword-cannibalization-google-search-console.ts
    google-search-console-alternatives.ts

scripts/
  cron-sync-gsc.ts
  cron-refresh-views.ts
  cron-generate-recs.ts
  cron-send-emails.ts
  test-emails.ts

middleware.ts
vercel.json
```

---

## Phase 2: Retention Features (Weeks 5-7) - Outline

### 2.1 Content Decay Alerts
- **Detection:** Daily cron compares last 28 days vs prior 28 days per page
- **Threshold:** 20%+ traffic drop on pages with >50 prior clicks
- **Severity:** Critical (>50% drop), Warning (>30%), Info (>20%)
- **DB:** `alerts` table + `alert_preferences` table (migrations provided in PRD)
- **Cron:** `/api/cron/check-decay` runs daily after sync
- **No duplicate alerts** for same page within 7 days

### 2.2 Alert Management UI
- New route: `/alerts`
- List view with filters (type, site, severity, date range)
- Mark as read (individual + bulk)
- Dismiss permanently
- "Get Recommendations" action triggers AI for that specific page
- Unread count badge in sidebar navigation

### 2.3 Email Notifications (Extended)
- Alert digest email (daily, if new alerts exist)
- Per-user alert preferences (email frequency: instant/daily/weekly)
- Configurable thresholds per user
- Unsubscribe links per email type
- Route: `/settings/notifications`

### 2.4 Onboarding Enhancements (from onboarding.md research)
- **9-email behavioral sequence:** Day 0 welcome, Day 0 data-ready, Day 1 education, Day 3 social proof, Day 5 progress/re-engagement, Day 7 midpoint, Day 11 trial warning, Day 13 final+offer, Day 17 post-trial feedback. Behavioral triggers > time-based sends (70.5% higher open rates). Achievement-based prompts convert 258% higher than calendar-based.
- **Persistent dashboard checklist:** 4 persona-adapted items, pinned to sidebar. Item 1 pre-checked (endowed progress). Celebration animation on completion. 3x more likely to convert (UserGuiding).
- **Pre-signup demo dashboard:** Show sample striking-distance data before account creation. Users who see value before committing are 2-3x more likely to activate.
- **Reverse trial model:** After trial expires, downgrade to read-only free tier (can see data, can't generate new recs). 10-40% increase in freemium-to-premium conversion (Dropbox research).
- **Mobile-specific onboarding:** Simplified flow, magic link to desktop for full dashboard.
- **Post-trial win-back emails:** Day 30 win-back with new features. 50% of eventual conversions happen post-trial.

### 2.5 Files to create (Phase 2)
```
app/(dashboard)/alerts/page.tsx
app/api/alerts/route.ts
app/api/alerts/[alertId]/route.ts
app/api/alerts/preferences/route.ts
app/api/cron/check-decay/route.ts
components/alerts/alert-card.tsx
components/alerts/alert-filters.tsx
lib/alerts/decay-detection.ts
lib/email/templates/alert-digest.tsx
lib/email/templates/welcome.tsx
lib/email/templates/data-ready.tsx
lib/email/templates/trial-warning.tsx
lib/email/templates/win-back.tsx
components/dashboard/onboarding-checklist.tsx
app/(dashboard)/settings/notifications/page.tsx
```

---

## Phase 3: Advanced Features (Weeks 8-10) - Outline

### 3.1 Keyword Cannibalization Detection
- **Detection:** Find queries where 2+ pages rank, both with >20 impressions
- **Severity:** Based on position proximity of competing pages
- **Recommendations:** Merge, differentiate, or 301 redirect
- **UI:** Dedicated report at `/reports/cannibalization`
- **DB:** Can use existing `gsc_data` with SQL aggregation (no new tables)

### 3.2 Historical Data Archival
- **Strategy:** Data older than 18 months aggregated to weekly granularity
- **DB:** New `gsc_data_archived` table
- **Cron:** Monthly archival job
- **UI:** "Data since [date]" indicator, historical comparison selectors

### 3.3 PDF Report Export (Agency plan)
- **Library:** `@react-pdf/renderer` (React components to PDF)
- **Contents:** Executive summary, striking distance table, completed recs, decay alerts, action items
- **Gate:** Agency plan only
- **Route:** `/api/reports/export/[siteId]`

### 3.4 Files to create (Phase 3)
```
app/(dashboard)/reports/cannibalization/page.tsx
app/api/reports/cannibalization/[siteId]/route.ts
lib/algorithms/cannibalization.ts
components/reports/cannibalization-card.tsx
lib/archive/archival.ts
app/api/cron/archive-data/route.ts
app/api/reports/export/[siteId]/route.ts
lib/pdf/report-generator.tsx
```

---

## Implementation Order (Recommended)

Build in this order within Phase 1. Each step depends on the previous:

1. **Project Setup & Database** (Step 1) - foundation
2. **Google OAuth** (Step 2) - can't do anything without auth
3. **Onboarding & Site Management** (Step 3) - users need to add sites
4. **GSC Data Sync** (Step 4) - need data before showing reports
5. **API Response Format** (Step 10) - standardize before building more endpoints
6. **Striking Distance Report** (Step 6) - core value proposition
7. **Dashboard** (Step 5) - overview of data
8. **AI Recommendations** (Step 7) - second core feature
9. **Billing & Subscriptions** (Step 8) - monetization
10. **Settings Pages** (Step 9) - management
11. **Email Notifications** (Step 11) - retention

---

## Testing Strategy

| Level | Tools | What to test |
|-------|-------|--------------|
| Unit | Vitest | Opportunity score calc, decay detection, access checks, token encryption |
| Integration | Vitest + MSW | API routes, DB queries, webhook handling |
| E2E | Playwright | Sign in -> connect site -> view report -> generate rec -> upgrade |

**Critical test cases:**
1. Auth flow: sign in -> token storage -> refresh -> sign out
2. Site connection: OAuth -> fetch sites -> add site -> initial sync
3. Striking distance: correct filtering, sorting, opportunity score
4. Recommendations: AI prompt -> parse response -> save to DB
5. Billing: checkout -> webhook -> subscription active -> feature gates

---

## Security Checklist

- [x] Google OAuth 2.0 with PKCE (`lib/google/oauth.ts`)
- [x] Encrypted token storage — AES-256-GCM (`lib/google/tokens.ts`)
- [x] Row Level Security on all tables (6 tables with RLS policies)
- [x] All API routes check authentication (`lib/auth.ts` — `requireAuth()`)
- [x] Rate limiting: 50 req/min per user (`lib/api/rate-limit.ts`)
- [x] Input validation with zod on all endpoints
- [x] Webhook signature verification (Dodo) (`app/api/billing/webhook/route.ts`)
- [x] Cron endpoints protected by CRON_SECRET header
- [x] No GSC data shared between users (RLS policies + `user_id` scoping)
- [x] GDPR: users can delete their data (`/settings/profile` — cascading delete)

---

## Phase 4: Free SEO Tools — Lead-Gen Strategy

### Strategy

Build **8 free SEO tools** on gscdaddy.com/tools/ that:

1. **Strengthen topical authority** around "Google Search Console" and SEO
2. **Drive organic traffic** via low-KD, SEO-adjacent keywords
3. **Funnel visitors to paid GSCDaddy features** (every tool page has a CTA to sign up)
4. **Are 100% client-side** — no backend, no auth required, zero incremental cost

These are NOT generic utility tools (mortgage calculators, BMI, etc.). Every tool directly relates to what a GSCDaddy user cares about: SEO, keywords, content optimization, and technical SEO.

---

### The 8 Tools

#### All 8 Tools — COMPLETE ✅
| # | Tool | Slug | Primary Keyword | US/Mo | KD | Status |
|---|------|------|-----------------|-------|----|----|
| 1 | Keyword Opportunity Calculator | `/tools/keyword-calculator` | striking distance keywords calculator | — | — | ✅ Done |
| 2 | Meta Tag Generator | `/tools/meta-tag-generator` | meta tag generator | 56,000 | 20 | ✅ Done |
| 3 | Open Graph Generator | `/tools/open-graph-generator` | open graph meta tag generator | 29,250 | 14 | ✅ Done |
| 4 | Robots.txt Generator | `/tools/robots-txt-generator` | robots txt generator | 38,000 | 16 | ✅ Done |
| 5 | Keyword Density Checker | `/tools/keyword-density-checker` | keyword density checker | 42,000 | 25 | ✅ Done |
| 6 | Readability Score Checker | `/tools/readability-checker` | readability score checker | 18,000 | 16 | ✅ Done |
| 7 | SERP Snippet Preview | `/tools/serp-preview` | google serp preview tool | ~12,000 | 12 | ✅ Done |
| 8 | Slug Generator | `/tools/slug-generator` | slug generator | 22,000 | 12 | ✅ Done |

**Combined estimated US search volume: ~217,250/mo**
**Average KD: 16.4** (all rankable within 2-3 months)

---

### Why These 7 (and Not Others from SEOTOOLS-IMPLEMENTATION.md)

**Included — SEO relevance to GSCDaddy users:**
- Every tool solves a problem that GSCDaddy surfaces: "your title tag is too long" → Meta Tag Generator. "This page has low CTR" → SERP Snippet Preview. "You're not indexed" → Robots.txt Generator.
- Each tool page links back to the relevant GSCDaddy feature or blog post, creating an internal linking web around SEO topics.
- The audience searching for these tools overlaps ~80% with GSCDaddy's target market.

**Excluded — Tools that don't fit:**
- **Mortgage/BMI/Salary Calculators** — Zero topical relevance. Hurts domain authority signals.
- **JSON Formatter, Base64, UUID Generator** — Developer tools, not SEO tools. Different audience.
- **Password Generator, QR Code Generator** — High volume but wrong audience entirely.
- **Word Counter, Case Converter** — Generic text tools. Weak funnel to GSCDaddy.
- **Sitemap Generator** — Requires server-side crawling to be useful. Can't do client-side properly.

If you want to build those, start a separate project on a separate domain.

---

### Tool Page Template Spec

Every tool page follows the same structure (matching the existing keyword-calculator pattern):

```
/app/tools/[tool-slug]/
  page.tsx          — Metadata, JSON-LD schema, page layout
  [tool]-form.tsx   — Client component with the interactive tool UI
```

#### Page Structure
```
┌─────────────────────────────────────────────┐
│ Logo + "← Back to Tools" breadcrumb         │
├─────────────────────────────────────────────┤
│ H1: {Tool Name}                             │
│ Short description (1-2 sentences)           │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ TOOL UI (client component)              │ │
│ │ - Input fields                          │ │
│ │ - Output / results                      │ │
│ │ - Copy to clipboard button              │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ CTA BANNER                                  │
│ "Want to find which pages need these fixes? │
│  GSCDaddy scans your Search Console data    │
│  and tells you exactly what to optimize."   │
│ [Try GSCDaddy Free →]                       │
├─────────────────────────────────────────────┤
│ How to Use (3-4 steps)                      │
├─────────────────────────────────────────────┤
│ Why Use This Tool (3-4 bullet points)       │
├─────────────────────────────────────────────┤
│ FAQ (5 unique questions, with FAQ schema)    │
├─────────────────────────────────────────────┤
│ Related Tools (links to other /tools/ pages) │
│ Related Blog Posts (links to /blog/ posts)   │
├─────────────────────────────────────────────┤
│ Footer                                      │
└─────────────────────────────────────────────┘
```

#### SEO Per Page
- Unique `<title>`: `{Tool Name} - Free Online Tool | GSCDaddy`
- Unique `<meta description>` targeting primary + 1 secondary keyword
- Canonical URL: `https://gscdaddy.com/tools/{slug}`
- JSON-LD: `WebApplication` schema (matching keyword-calculator pattern)
- JSON-LD: `FAQPage` schema
- JSON-LD: `BreadcrumbList` schema
- Open Graph + Twitter Card meta

---

### Build Order & Estimates

All tools are client-side only. Each follows the established pattern from keyword-calculator.

| Priority | Tool | Complexity | Notes |
|----------|------|------------|-------|
| 1 | SERP Snippet Preview | Low | Text inputs → live Google-styled preview. Great visual appeal. |
| 2 | Meta Tag Generator | Low | Form fields → generates `<meta>` tags with copy button. Character count validation. |
| 3 | Open Graph Generator | Low | Form + image URL → generates OG tags + live preview card. |
| 4 | Slug Generator | Trivial | Text input → slugified output. Add options (separator, lowercase, transliteration). |
| 5 | Robots.txt Generator | Low | Checkbox/select UI → generates robots.txt content. |
| 6 | Keyword Density Checker | Medium | Textarea → parse text, count word/phrase frequency, show density %. |
| 7 | Readability Score Checker | Medium | Textarea → Flesch-Kincaid, Gunning Fog, sentence/word stats. All client-side math. |

---

### Internal Linking Strategy

Each tool page links to:
1. **2-3 other tools** in the "Related Tools" section
2. **1-2 blog posts** in the "Related Blog Posts" section
3. **GSCDaddy signup** via the CTA banner

Each blog post should link to relevant tools where natural:
- "Beginners Guide to GSC" → link to Keyword Opportunity Calculator
- "Improve CTR" → link to SERP Snippet Preview, Meta Tag Generator
- "Low Hanging Fruit Keywords" → link to Keyword Density Checker
- "Striking Distance Keywords" → link to Keyword Opportunity Calculator

#### Link Map
```
keyword-calculator ←→ keyword-density-checker
meta-tag-generator ←→ open-graph-generator ←→ serp-preview
robots-txt-generator ←→ slug-generator
readability-checker ←→ keyword-density-checker

Blog: improve-ctr → serp-preview, meta-tag-generator
Blog: beginners-guide → keyword-calculator, robots-txt-generator
Blog: low-hanging-fruit → keyword-density-checker, keyword-calculator
Blog: striking-distance → keyword-calculator
```

---

### Tools Index Page

Create `/app/tools/page.tsx` — a listing page for all free tools.

- H1: "Free SEO Tools"
- Grid of tool cards (icon, name, one-line description, link)
- Grouped by category if >6 tools
- CTA at bottom: "These tools fix individual pages. GSCDaddy finds which pages need fixing across your entire site."
- Target keyword: `free seo tools` (KD ~35, 180K US/mo — ambitious but the page builds authority over time)

---

### Funnel Logic

```
Google Search → "/tools/meta-tag-generator" (free, no signup)
                         │
                         ▼
            User finds tool useful
                         │
                         ▼
         CTA: "GSCDaddy tells you WHICH pages
               need better meta tags"
                         │
                         ▼
              /login → free trial signup
                         │
                         ▼
               Dashboard → paid conversion
```

Every tool solves ONE problem manually. GSCDaddy solves that problem at scale, automatically. That's the pitch on every tool page.

---

### What NOT to Build on gscdaddy.com

To keep GSCDaddy focused, do NOT add:
- Generic developer tools (JSON formatter, base64, regex tester)
- Calculator tools (mortgage, BMI, salary, tip)
- Converter tools (binary, temperature, hex)
- Text utility tools (word counter, case converter, lorem ipsum)
- Any tool requiring a backend API call
- Any tool requiring user authentication

If you want to build those, start a separate project on a separate domain per SEOTOOLS-IMPLEMENTATION.md.
