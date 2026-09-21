# GSCdaddy - Product Requirements Document (PRD)

## Document Info
- **Product Name:** GSCdaddy
- **Version:** 1.0
- **Last Updated:** April 2026
- **Author:** Solo Indie Developer
- **Tech Stack:** Next.js 14+ (App Router), Supabase, Dodo Payments
- **Target MRR:** $1,000 - $2,000

---

## 1. Executive Summary

### 1.1 Product Vision
GSCdaddy is a focused Google Search Console analytics tool that helps indie bloggers, freelance SEO consultants, and small e-commerce owners find hidden ranking opportunities and get AI-powered action plans to improve their organic traffic.

### 1.2 Core Value Proposition
**"GSCdaddy tells you exactly what to do to get more traffic — not just what the data says."**

Unlike competitors that show dashboards and charts, GSCdaddy provides:
1. **Striking Distance Keywords** — Pages ranking positions 5-15 with high traffic potential
2. **AI Action Plans** — Weekly personalized recommendations delivered via email/dashboard

### 1.3 Target Market
- **Primary:** Indie bloggers and content creators ($19/mo tier)
- **Secondary:** Freelance SEO consultants managing 2-5 client sites ($49/mo tier)
- **Tertiary:** Small agencies managing up to 15 sites ($99/mo tier)

### 1.4 Success Metrics
| Metric | Target (Month 6) |
|--------|------------------|
| Monthly Recurring Revenue | $1,000 - $2,000 |
| Paying Customers | 35-70 |
| Free Trial → Paid Conversion | 15-25% |
| Monthly Churn Rate | < 5% |
| Organic Traffic (Blog) | 5,000+ visits/mo |

---

## 2. Development Phases Overview

### Phase 1: MVP (Weeks 1-4)
- User authentication (Google OAuth)
- GSC integration & data fetching
- Striking Distance Keywords report
- AI-powered recommendations
- Basic dashboard
- Dodo Payments integration (3 tiers)
- 14-day free trial system

### Phase 2: Retention Features (Weeks 5-7)
- Content Decay Alerts
- Email notification system (Resend)
- Alert preferences management
- Historical data storage begins

### Phase 3: Advanced Features (Weeks 8-10)
- Keyword Cannibalization Detection
- Historical data archival (beyond 16 months)
- PDF report export
- Slack integration (optional)

---

## 3. Technical Architecture

### 3.1 System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    Next.js 14 (App Router)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Auth    │  │Dashboard │  │ Reports  │  │ Settings/Billing │ │
│  │  Pages   │  │   Page   │  │  Pages   │  │      Pages       │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES (Next.js)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ /api/auth  │  │ /api/sites │  │/api/reports│  │/api/billing│ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│    Supabase      │ │   Google APIs    │ │  External APIs   │
│  ┌────────────┐  │ │  ┌────────────┐  │ │  ┌────────────┐  │
│  │ PostgreSQL │  │ │  │Search      │  │ │  │  OpenAI    │  │
│  │  Database  │  │ │  │Console API │  │ │  │  GPT-4o    │  │
│  ├────────────┤  │ │  ├────────────┤  │ │  ├────────────┤  │
│  │   Auth     │  │ │  │  OAuth 2.0 │  │ │  │   Resend   │  │
│  │  (Google)  │  │ │  │            │  │ │  │  (Email)   │  │
│  ├────────────┤  │ │  └────────────┘  │ │  ├────────────┤  │
│  │  Storage   │  │ │                  │ │  │   Dodo     │  │
│  │  (Reports) │  │ │                  │ │  │ Payments   │  │
│  └────────────┘  │ │                  │ │  └────────────┘  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKGROUND JOBS (Vercel Cron)                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │ Daily GSC Sync │  │ Weekly AI      │  │ Decay Detection    │ │
│  │   (4 AM UTC)   │  │ Recommendations│  │   (Daily check)    │ │
│  └────────────────┘  └────────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Tech Stack Details

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | Next.js 14 (App Router) | SSR for SEO, API routes, React Server Components |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, consistent UI |
| **Database** | Supabase (PostgreSQL) | Free tier generous, built-in auth, real-time |
| **Authentication** | Supabase Auth (Google OAuth) | Required for GSC API access |
| **Hosting** | Vercel | Free tier, seamless Next.js integration |
| **Payments** | Dodo Payments | India-friendly, global payments, simple API |
| **Email** | Resend | Developer-friendly, generous free tier (100/day) |
| **AI** | OpenAI GPT-4o | Best quality/cost ratio for recommendations |
| **Background Jobs** | Vercel Cron | Simple, built-in, free tier sufficient |
| **Analytics** | Plausible or PostHog | Privacy-friendly, simple |

### 3.3 Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth & APIs
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# OpenAI
OPENAI_API_KEY=

# Dodo Payments
DODO_API_KEY=
DODO_WEBHOOK_SECRET=
NEXT_PUBLIC_DODO_PUBLISHABLE_KEY=

# Resend (Email)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://gscaddy.com
CRON_SECRET= # For securing cron endpoints
```

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram
```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │     sites       │       │   gsc_data      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │───┐   │ id (PK)         │
│ email           │   │   │ user_id (FK)    │   │   │ site_id (FK)    │
│ name            │   └──▶│ site_url        │   └──▶│ date            │
│ avatar_url      │       │ is_verified     │       │ query           │
│ google_token    │       │ last_synced     │       │ page            │
│ refresh_token   │       │ created_at      │       │ clicks          │
│ plan            │       └─────────────────┘       │ impressions     │
│ trial_ends_at   │                                 │ ctr             │
│ subscription_id │       ┌─────────────────┐       │ position        │
│ created_at      │       │ recommendations │       │ created_at      │
└─────────────────┘       ├─────────────────┤       └─────────────────┘
        │                 │ id (PK)         │
        │                 │ site_id (FK)    │       ┌─────────────────┐
        │                 │ type            │       │    alerts       │
        │                 │ query           │       ├─────────────────┤
        │                 │ page            │       │ id (PK)         │
        │                 │ recommendation  │       │ site_id (FK)    │
        │                 │ priority        │       │ type            │
        │                 │ is_completed    │       │ page            │
        │                 │ created_at      │       │ query           │
        │                 └─────────────────┘       │ message         │
        │                                           │ is_read         │
        │                 ┌─────────────────┐       │ created_at      │
        │                 │  subscriptions  │       └─────────────────┘
        │                 ├─────────────────┤
        └────────────────▶│ id (PK)         │
                          │ user_id (FK)    │
                          │ dodo_sub_id     │
                          │ plan            │
                          │ status          │
                          │ current_period_ │
                          │   start         │
                          │ current_period_ │
                          │   end           │
                          │ created_at      │
                          └─────────────────┘
```

### 4.2 Table Definitions

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  google_access_token TEXT, -- Encrypted
  google_refresh_token TEXT, -- Encrypted
  google_token_expires_at TIMESTAMPTZ,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  trial_ends_at TIMESTAMPTZ,
  sites_limit INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### sites
```sql
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  site_url TEXT NOT NULL,
  display_name TEXT,
  permission_level TEXT, -- 'siteOwner', 'siteFullUser', 'siteRestrictedUser'
  is_verified BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, site_url)
);

-- Indexes
CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_last_synced ON sites(last_synced_at);

-- RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sites"
  ON sites FOR ALL
  USING (auth.uid() = user_id);
```

#### gsc_data
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
  
  -- Composite unique constraint to prevent duplicates
  UNIQUE(site_id, date, query, page, country, device)
);

-- Indexes for common queries
CREATE INDEX idx_gsc_data_site_date ON gsc_data(site_id, date DESC);
CREATE INDEX idx_gsc_data_position ON gsc_data(position) WHERE position >= 5 AND position <= 15;
CREATE INDEX idx_gsc_data_query ON gsc_data(query);
CREATE INDEX idx_gsc_data_page ON gsc_data(page);

-- Partitioning by month (optional, for scale)
-- Consider implementing if data grows beyond 10M rows

-- RLS
ALTER TABLE gsc_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own site data"
  ON gsc_data FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE user_id = auth.uid()
    )
  );
```

#### striking_distance_keywords
```sql
-- Materialized view for fast striking distance queries
CREATE MATERIALIZED VIEW striking_distance_keywords AS
SELECT 
  gsc.site_id,
  gsc.query,
  gsc.page,
  AVG(gsc.position) as avg_position,
  SUM(gsc.impressions) as total_impressions,
  SUM(gsc.clicks) as total_clicks,
  AVG(gsc.ctr) as avg_ctr,
  -- Opportunity score: impressions * position improvement potential
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

-- Refresh this view daily via cron
CREATE UNIQUE INDEX idx_sdk_site_query_page 
  ON striking_distance_keywords(site_id, query, page);

-- Function to refresh the view
CREATE OR REPLACE FUNCTION refresh_striking_distance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY striking_distance_keywords;
END;
$$ LANGUAGE plpgsql;
```

#### recommendations
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'title_optimization',
    'content_expansion',
    'internal_linking',
    'content_refresh',
    'cannibalization_fix',
    'quick_win'
  )),
  query TEXT,
  page TEXT,
  current_position DECIMAL(5,2),
  potential_position DECIMAL(5,2),
  estimated_traffic_gain INTEGER,
  recommendation_text TEXT NOT NULL, -- AI-generated
  action_items JSONB, -- Array of specific actions
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes
CREATE INDEX idx_recommendations_site_id ON recommendations(site_id);
CREATE INDEX idx_recommendations_priority ON recommendations(priority, is_completed);
CREATE INDEX idx_recommendations_created ON recommendations(created_at DESC);

-- RLS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR ALL
  USING (
    site_id IN (
      SELECT id FROM sites WHERE user_id = auth.uid()
    )
  );
```

#### subscriptions
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

-- Index
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

#### alerts (Phase 2)
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'content_decay',
    'ranking_drop',
    'ranking_gain',
    'cannibalization',
    'new_opportunity'
  )),
  severity TEXT CHECK (severity IN ('critical', 'warning', 'info')),
  page TEXT,
  query TEXT,
  message TEXT NOT NULL,
  data JSONB, -- Additional context (before/after metrics, etc.)
  is_read BOOLEAN DEFAULT false,
  is_emailed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_alerts_site_id ON alerts(site_id, created_at DESC);
CREATE INDEX idx_alerts_unread ON alerts(site_id) WHERE is_read = false;

-- RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON alerts FOR ALL
  USING (
    site_id IN (
      SELECT id FROM sites WHERE user_id = auth.uid()
    )
  );
```

#### alert_preferences (Phase 2)
```sql
CREATE TABLE alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'daily' CHECK (email_frequency IN ('instant', 'daily', 'weekly')),
  content_decay_threshold INTEGER DEFAULT 20, -- % drop to trigger alert
  position_change_threshold INTEGER DEFAULT 3, -- positions change to alert
  slack_webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON alert_preferences FOR ALL
  USING (auth.uid() = user_id);
```

---

## 5. API Routes Structure

### 5.1 Route Map
```
/api
├── /auth
│   ├── /callback          POST - Google OAuth callback
│   ├── /refresh           POST - Refresh Google tokens
│   └── /logout            POST - Clear session
│
├── /sites
│   ├── GET                List user's sites
│   ├── POST               Add new site (from GSC)
│   ├── /[siteId]
│   │   ├── GET            Get site details
│   │   ├── DELETE         Remove site
│   │   └── /sync          POST - Trigger manual sync
│   └── /available         GET - List available sites from GSC
│
├── /reports
│   ├── /striking-distance
│   │   └── /[siteId]      GET - Get striking distance keywords
│   ├── /recommendations
│   │   └── /[siteId]      GET - Get AI recommendations
│   ├── /content-decay     (Phase 2)
│   │   └── /[siteId]      GET - Get decaying content
│   └── /cannibalization   (Phase 3)
│       └── /[siteId]      GET - Get cannibalization issues
│
├── /recommendations
│   ├── /[recommendationId]
│   │   ├── PATCH          Mark as complete/incomplete
│   │   └── DELETE         Dismiss recommendation
│   └── /generate
│       └── /[siteId]      POST - Generate new AI recommendations
│
├── /alerts                (Phase 2)
│   ├── GET                List user's alerts
│   ├── /[alertId]
│   │   └── PATCH          Mark as read
│   └── /preferences
│       ├── GET            Get alert preferences
│       └── PUT            Update preferences
│
├── /billing
│   ├── /checkout          POST - Create Dodo checkout session
│   ├── /portal            POST - Get Dodo customer portal URL
│   ├── /webhook           POST - Dodo webhook handler
│   └── /usage             GET - Current plan usage stats
│
└── /cron                  (Protected by CRON_SECRET)
    ├── /sync-gsc          POST - Daily GSC data sync
    ├── /generate-recs     POST - Weekly recommendation generation
    ├── /check-decay       POST - Daily content decay check (Phase 2)
    └── /refresh-views     POST - Refresh materialized views
```

### 5.2 API Response Format
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "You must be logged in to access this resource",
    "details": { ... }
  }
}
```

---

## 6. Feature Specifications

### 6.1 Phase 1: MVP Features

#### 6.1.1 User Authentication
**Description:** Users sign in with Google to grant GSC access.

**User Flow:**
1. User clicks "Sign in with Google" on landing page
2. Redirected to Google OAuth consent screen
3. User grants access to:
   - Email & profile info
   - Google Search Console (read-only)
4. Redirected back to app with tokens
5. Account created/updated in database
6. 14-day trial automatically started
7. Redirected to onboarding or dashboard

**Technical Requirements:**
- OAuth 2.0 with PKCE flow
- Request scopes: `email profile https://www.googleapis.com/auth/webmasters.readonly`
- Store encrypted refresh tokens in database
- Auto-refresh access tokens before expiry
- Handle token revocation gracefully

**Acceptance Criteria:**
- [ ] User can sign in with Google in < 10 seconds
- [ ] Tokens are securely stored (encrypted at rest)
- [ ] Failed auth shows clear error message
- [ ] User can sign out and revoke access
- [ ] Trial automatically starts for new users

---

#### 6.1.2 Site Management
**Description:** Users can add, view, and remove GSC properties.

**User Flow:**
1. After login, user sees list of available GSC properties
2. User selects which sites to add (limited by plan)
3. Selected sites are added and initial sync begins
4. Dashboard shows sync status per site
5. User can remove sites (with confirmation)

**Data from GSC API:**
```typescript
// GET https://www.googleapis.com/webmasters/v3/sites
{
  "siteEntry": [
    {
      "siteUrl": "https://example.com/",
      "permissionLevel": "siteOwner"
    },
    {
      "siteUrl": "sc-domain:example.com",
      "permissionLevel": "siteFullUser"
    }
  ]
}
```

**Site Limits by Plan:**
| Plan | Sites Limit |
|------|-------------|
| Free Trial | 1 |
| Starter ($19/mo) | 1 |
| Pro ($49/mo) | 5 |
| Agency ($99/mo) | 15 |

**Acceptance Criteria:**
- [ ] Available sites load within 3 seconds
- [ ] User cannot exceed plan's site limit
- [ ] Site removal requires confirmation
- [ ] Sync status updates in real-time
- [ ] Domain properties (sc-domain:) supported

---

#### 6.1.3 GSC Data Sync
**Description:** Fetch and store GSC performance data daily.

**Sync Strategy:**
- **Initial sync:** Last 90 days of data
- **Daily sync:** Previous 3 days (GSC data has 2-3 day delay)
- **Schedule:** 4 AM UTC via Vercel Cron
- **Rate limits:** 20 QPS, batch requests where possible

**GSC API Call:**
```typescript
// POST https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
{
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "dimensions": ["query", "page", "date", "country", "device"],
  "rowLimit": 25000,
  "startRow": 0,
  "dataState": "final"
}
```

**Pagination Logic:**
```typescript
async function fetchAllGSCData(siteUrl: string, startDate: string, endDate: string) {
  const allRows = [];
  let startRow = 0;
  const rowLimit = 25000;
  
  while (true) {
    const response = await gscApi.searchAnalytics.query({
      siteUrl,
      startDate,
      endDate,
      dimensions: ['query', 'page', 'date'],
      rowLimit,
      startRow
    });
    
    if (!response.rows || response.rows.length === 0) break;
    
    allRows.push(...response.rows);
    startRow += rowLimit;
    
    if (response.rows.length < rowLimit) break;
  }
  
  return allRows;
}
```

**Acceptance Criteria:**
- [ ] Initial sync completes within 5 minutes per site
- [ ] Daily sync runs reliably at scheduled time
- [ ] No duplicate data entries
- [ ] Handles GSC API errors gracefully
- [ ] Sync status visible to user

---

#### 6.1.4 Striking Distance Keywords Report
**Description:** Surface keywords ranking 5-15 with optimization potential.

**Algorithm:**
```typescript
interface StrikingDistanceKeyword {
  query: string;
  page: string;
  avgPosition: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  opportunityScore: number; // impressions * (15 - position) / 10
  estimatedTrafficGain: number;
}

// Filters
const filters = {
  minPosition: 5,
  maxPosition: 15,
  minImpressions: 50,
  dateRange: 28, // days
};

// Sorting options
type SortBy = 'opportunityScore' | 'impressions' | 'position' | 'clicks';
```

**Opportunity Score Calculation:**
```typescript
function calculateOpportunityScore(impressions: number, position: number): number {
  // Higher impressions + closer to page 1 = higher score
  const positionFactor = (15 - position) / 10; // 0 to 1 scale
  return impressions * positionFactor;
}

function estimateTrafficGain(impressions: number, currentPosition: number, targetPosition: number = 3): number {
  // CTR estimates by position
  const ctrByPosition: Record<number, number> = {
    1: 0.30, 2: 0.15, 3: 0.10, 4: 0.07, 5: 0.05,
    6: 0.04, 7: 0.03, 8: 0.025, 9: 0.02, 10: 0.018,
    11: 0.015, 12: 0.013, 13: 0.011, 14: 0.010, 15: 0.009
  };
  
  const currentCtr = ctrByPosition[Math.round(currentPosition)] || 0.01;
  const targetCtr = ctrByPosition[targetPosition];
  
  const currentClicks = impressions * currentCtr;
  const potentialClicks = impressions * targetCtr;
  
  return Math.round(potentialClicks - currentClicks);
}
```

**UI Components:**
- Data table with sorting and filtering
- Search/filter by query or page
- Export to CSV
- Quick action buttons (generate recommendation)

**Acceptance Criteria:**
- [ ] Report loads within 2 seconds
- [ ] Correctly identifies positions 5-15
- [ ] Opportunity score ranks best opportunities first
- [ ] Traffic gain estimates are reasonable
- [ ] Can filter by page, query, min impressions
- [ ] Can sort by all columns
- [ ] CSV export works

---

#### 6.1.5 AI-Powered Recommendations
**Description:** Generate actionable SEO recommendations using GPT-4o.

**Recommendation Types:**
| Type | Trigger | Priority |
|------|---------|----------|
| `title_optimization` | High impressions, low CTR | High |
| `content_expansion` | Position 6-10, thin content | High |
| `internal_linking` | Good position, low authority | Medium |
| `quick_win` | Position 11-15, high impressions | High |

**AI Prompt Structure:**
```typescript
const systemPrompt = `You are an expert SEO consultant. Analyze the provided Google Search Console data and generate specific, actionable recommendations to improve rankings.

For each recommendation:
1. Explain WHY this is an opportunity (data-driven)
2. Provide SPECIFIC action items (not generic advice)
3. Estimate the effort (quick/medium/significant)
4. Predict potential traffic gain

Format your response as JSON matching this schema:
{
  "recommendations": [
    {
      "type": "title_optimization" | "content_expansion" | "internal_linking" | "quick_win",
      "query": "target keyword",
      "page": "/page-url",
      "priority": "high" | "medium" | "low",
      "recommendation_text": "Clear explanation of what to do and why",
      "action_items": [
        "Specific action 1",
        "Specific action 2"
      ],
      "estimated_traffic_gain": 150,
      "effort": "quick" | "medium" | "significant"
    }
  ]
}`;

const userPrompt = `
Here is the GSC data for ${siteUrl}:

Top Striking Distance Keywords (positions 5-15):
${JSON.stringify(strikingDistanceKeywords.slice(0, 20), null, 2)}

Current page titles and meta descriptions:
${JSON.stringify(pageMetadata, null, 2)}

Generate 5-7 prioritized recommendations to improve rankings and traffic.
Focus on quick wins that can be implemented in under 30 minutes each.
`;
```

**Generation Schedule:**
- Weekly automatic generation (Sunday night)
- Manual generation on-demand (limited: 2/day free, 5/day paid)
- Recommendations expire after 7 days

**Acceptance Criteria:**
- [ ] Recommendations are specific and actionable
- [ ] Action items can be completed in stated timeframe
- [ ] Traffic estimates are conservative but motivating
- [ ] User can mark recommendations as complete
- [ ] User can dismiss irrelevant recommendations
- [ ] Weekly email summary sent to users

---

#### 6.1.6 Dashboard
**Description:** Overview of key metrics and recent recommendations.

**Dashboard Components:**
```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, [Name]!                    [Site Selector ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Total Clicks │ │ Impressions  │ │ Avg Position │        │
│  │   12,450     │ │   384,200    │ │     8.4      │        │
│  │  ↑ 12% vs LW │ │  ↑ 8% vs LW  │ │  ↑ 0.3 vs LW │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Performance Chart (Last 28 Days)          │   │
│  │  [Clicks] [Impressions] [Position]                   │   │
│  │           📈 Line chart here                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────┐ ┌────────────────────────────┐ │
│  │  🎯 Top Opportunities  │ │  ✅ Recent Recommendations │ │
│  │  (Striking Distance)   │ │                            │ │
│  │                        │ │  □ Update title for...     │ │
│  │  1. "best widgets" #8  │ │  □ Add section about...    │ │
│  │     2,400 impressions  │ │  ☑ Internal links to...    │ │
│  │     [View Details →]   │ │                            │ │
│  │                        │ │  [View All →]              │ │
│  │  2. "widget guide" #11 │ │                            │ │
│  │     1,800 impressions  │ └────────────────────────────┘ │
│  │     [View Details →]   │                                │
│  │                        │                                │
│  │  [See All Keywords →]  │                                │
│  └────────────────────────┘                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Metrics Cards:**
- Total Clicks (28 days) with % change vs prior period
- Total Impressions (28 days) with % change
- Average Position (28 days) with change
- Striking Distance Keywords count

**Chart:**
- Line chart: clicks, impressions over time
- Toggle between metrics
- Hover for daily values
- Use Recharts or Chart.js

**Acceptance Criteria:**
- [ ] Dashboard loads within 3 seconds
- [ ] Metrics are accurate and match GSC
- [ ] Chart is interactive and performant
- [ ] Site selector works for multi-site plans
- [ ] Empty states handled gracefully

---

#### 6.1.7 Billing & Subscription (Dodo Payments)
**Description:** Handle subscriptions, plan limits, and payments.

**Pricing Tiers:**
| Plan | Price | Sites | Features |
|------|-------|-------|----------|
| **Free Trial** | $0 (14 days) | 1 | All Pro features |
| **Starter** | $19/month | 1 | Core features, weekly recommendations |
| **Pro** | $49/month | 5 | All features, daily recommendations |
| **Agency** | $99/month | 15 | All features, PDF exports, priority support |

**Dodo Payments Integration:**

```typescript
// Create checkout session
// POST /api/billing/checkout
import { DodoPayments } from '@dodopayments/sdk';

const dodo = new DodoPayments(process.env.DODO_API_KEY);

async function createCheckout(userId: string, plan: 'starter' | 'pro' | 'agency') {
  const priceIds = {
    starter: 'price_starter_monthly',
    pro: 'price_pro_monthly',
    agency: 'price_agency_monthly'
  };

  const session = await dodo.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: priceIds[plan], quantity: 1 }],
    mode: 'subscription',
    success_url: `${APP_URL}/dashboard?checkout=success`,
    cancel_url: `${APP_URL}/pricing?checkout=canceled`,
    metadata: {
      user_id: userId
    }
  });

  return session.url;
}
```

**Webhook Handler:**
```typescript
// POST /api/billing/webhook
async function handleDodoWebhook(req: Request) {
  const signature = req.headers.get('dodo-signature');
  const body = await req.text();
  
  const event = dodo.webhooks.constructEvent(
    body,
    signature,
    process.env.DODO_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed':
      await activateSubscription(event.data);
      break;
    case 'invoice.paid':
      await renewSubscription(event.data);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data);
      break;
    case 'customer.subscription.deleted':
      await cancelSubscription(event.data);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

**Trial Logic:**
```typescript
function checkAccess(user: User): AccessLevel {
  // Check if on active paid plan
  if (user.subscription?.status === 'active') {
    return { hasAccess: true, plan: user.subscription.plan };
  }
  
  // Check if trial is still valid
  if (user.trial_ends_at && new Date(user.trial_ends_at) > new Date()) {
    return { hasAccess: true, plan: 'trial', daysRemaining: getDaysRemaining(user.trial_ends_at) };
  }
  
  // Trial expired, no subscription
  return { hasAccess: false, reason: 'trial_expired' };
}
```

**Acceptance Criteria:**
- [ ] Users can subscribe to any paid plan
- [ ] Webhooks update subscription status reliably
- [ ] Users can access customer portal to manage subscription
- [ ] Trial countdown shows days remaining
- [ ] Feature gates work based on plan
- [ ] Failed payments trigger appropriate emails/notices
- [ ] Cancellation downgrades at period end (not immediate)

---

### 6.2 Phase 2: Retention Features

#### 6.2.1 Content Decay Alerts
**Description:** Automatically detect pages losing traffic and alert users.

**Detection Algorithm:**
```typescript
interface DecayingPage {
  page: string;
  topQueries: string[];
  clicksLast28Days: number;
  clicksPrior28Days: number;
  percentChange: number;
  positionChange: number;
  severity: 'critical' | 'warning' | 'info';
}

async function detectContentDecay(siteId: string): Promise<DecayingPage[]> {
  const threshold = 20; // 20% drop triggers alert
  
  const pages = await db.query(`
    WITH current_period AS (
      SELECT page, SUM(clicks) as clicks, AVG(position) as position
      FROM gsc_data
      WHERE site_id = $1 AND date >= CURRENT_DATE - 28
      GROUP BY page
    ),
    prior_period AS (
      SELECT page, SUM(clicks) as clicks, AVG(position) as position
      FROM gsc_data
      WHERE site_id = $1 
        AND date >= CURRENT_DATE - 56 
        AND date < CURRENT_DATE - 28
      GROUP BY page
    )
    SELECT 
      c.page,
      c.clicks as current_clicks,
      p.clicks as prior_clicks,
      ROUND(((c.clicks - p.clicks)::decimal / NULLIF(p.clicks, 0)) * 100, 1) as percent_change,
      c.position - p.position as position_change
    FROM current_period c
    JOIN prior_period p ON c.page = p.page
    WHERE p.clicks > 50
      AND ((c.clicks - p.clicks)::decimal / NULLIF(p.clicks, 0)) * 100 < -$2
    ORDER BY percent_change ASC
  `, [siteId, threshold]);
  
  return pages.map(p => ({
    ...p,
    severity: p.percent_change < -50 ? 'critical' : 
              p.percent_change < -30 ? 'warning' : 'info'
  }));
}
```

**Alert Creation:**
```typescript
async function createDecayAlerts(siteId: string) {
  const decayingPages = await detectContentDecay(siteId);
  
  for (const page of decayingPages) {
    await db.insert('alerts', {
      site_id: siteId,
      type: 'content_decay',
      severity: page.severity,
      page: page.page,
      message: `This page lost ${Math.abs(page.percentChange)}% traffic in the last 28 days`,
      data: {
        currentClicks: page.clicksLast28Days,
        priorClicks: page.clicksPrior28Days,
        percentChange: page.percentChange,
        positionChange: page.positionChange
      }
    });
  }
}
```

**Acceptance Criteria:**
- [ ] Decay detection runs daily
- [ ] Only alerts for pages with meaningful prior traffic (>50 clicks)
- [ ] Severity levels are appropriate
- [ ] No duplicate alerts for same page within 7 days
- [ ] Alert includes context (% drop, position change)

---

#### 6.2.2 Email Notifications (Resend)
**Description:** Send alert digests and weekly summaries via email.

**Email Types:**
| Email | Trigger | Content |
|-------|---------|---------|
| Weekly Summary | Sunday 9AM user's timezone | Top opportunities, completed recs, new alerts |
| Alert Digest | Daily 8AM (if alerts exist) | New content decay and ranking alerts |
| Trial Ending | 3 days before trial end | Upgrade CTA with progress made |
| Trial Expired | Day trial ends | Limited access notice, upgrade CTA |

**Resend Implementation:**
```typescript
import { Resend } from 'resend';
import { WeeklySummaryEmail } from '@/emails/weekly-summary';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWeeklySummary(user: User, data: WeeklySummaryData) {
  await resend.emails.send({
    from: 'GSCdaddy <hello@gscaddy.com>',
    to: user.email,
    subject: `📊 Your weekly SEO report is ready`,
    react: WeeklySummaryEmail({ user, data })
  });
}
```

**Email Template (React Email):**
```tsx
// emails/weekly-summary.tsx
import { Html, Head, Body, Container, Section, Heading, Text, Button } from '@react-email/components';

export function WeeklySummaryEmail({ user, data }: Props) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container>
          <Heading>Hey {user.name}, here's your week in SEO</Heading>
          
          <Section>
            <Heading as="h2">📈 Traffic Overview</Heading>
            <Text>Clicks: {data.clicks} ({data.clicksChange}% vs last week)</Text>
            <Text>Impressions: {data.impressions}</Text>
          </Section>
          
          <Section>
            <Heading as="h2">🎯 Top Opportunities</Heading>
            {data.opportunities.slice(0, 3).map(opp => (
              <Text key={opp.query}>
                "{opp.query}" — Position {opp.position}, {opp.impressions} impressions
              </Text>
            ))}
          </Section>
          
          <Button href={`${APP_URL}/dashboard`}>
            View Full Report
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

**Acceptance Criteria:**
- [ ] Emails render correctly in major clients (Gmail, Outlook, Apple Mail)
- [ ] Users can unsubscribe from each email type
- [ ] Emails respect user's alert preferences
- [ ] Send rate stays within Resend limits
- [ ] Track email opens/clicks (optional)

---

#### 6.2.3 Alert Management UI
**Description:** View, filter, and manage all alerts.

**UI Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  🔔 Alerts                           [Mark All Read] [⚙️]   │
├─────────────────────────────────────────────────────────────┤
│  Filters: [All ▼] [All Sites ▼] [Last 30 days ▼]           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 CRITICAL • Content Decay • 2 hours ago           │   │
│  │                                                      │   │
│  │ /blog/best-widgets-2025                             │   │
│  │ Lost 45% traffic in the last 28 days                │   │
│  │ 1,240 clicks → 682 clicks | Position: 4.2 → 6.8     │   │
│  │                                                      │   │
│  │ [View Page] [Get Recommendations] [Dismiss]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟡 WARNING • Content Decay • Yesterday              │   │
│  │                                                      │   │
│  │ /guides/widget-comparison                            │   │
│  │ Lost 25% traffic in the last 28 days                │   │
│  │                                                      │   │
│  │ [View Page] [Get Recommendations] [Dismiss]          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Alerts sorted by severity and recency
- [ ] Filter by type, site, date range
- [ ] Mark individual or all alerts as read
- [ ] Dismiss removes alert permanently
- [ ] "Get Recommendations" triggers AI for that specific page
- [ ] Unread count shows in sidebar/nav

---

### 6.3 Phase 3: Advanced Features

#### 6.3.1 Keyword Cannibalization Detection
**Description:** Find queries where multiple pages compete against each other.

**Detection Algorithm:**
```typescript
interface CannibalizationIssue {
  query: string;
  pages: {
    url: string;
    avgPosition: number;
    clicks: number;
    impressions: number;
  }[];
  severity: 'high' | 'medium' | 'low';
  recommendation: 'merge' | 'differentiate' | '301_redirect';
}

async function detectCannibalization(siteId: string): Promise<CannibalizationIssue[]> {
  const issues = await db.query(`
    WITH query_pages AS (
      SELECT 
        query,
        page,
        AVG(position) as avg_position,
        SUM(clicks) as total_clicks,
        SUM(impressions) as total_impressions
      FROM gsc_data
      WHERE site_id = $1 AND date >= CURRENT_DATE - 28
      GROUP BY query, page
      HAVING SUM(impressions) > 20
    )
    SELECT 
      query,
      ARRAY_AGG(
        JSON_BUILD_OBJECT(
          'url', page,
          'avgPosition', avg_position,
          'clicks', total_clicks,
          'impressions', total_impressions
        ) ORDER BY total_impressions DESC
      ) as pages,
      COUNT(*) as page_count
    FROM query_pages
    GROUP BY query
    HAVING COUNT(*) > 1
    ORDER BY SUM(total_impressions) DESC
  `, [siteId]);
  
  return issues.map(issue => ({
    query: issue.query,
    pages: issue.pages,
    severity: calculateSeverity(issue.pages),
    recommendation: determineRecommendation(issue.pages)
  }));
}

function calculateSeverity(pages: any[]): 'high' | 'medium' | 'low' {
  const topTwoPositionDiff = Math.abs(pages[0].avgPosition - pages[1].avgPosition);
  
  if (topTwoPositionDiff < 3 && pages[0].impressions > 500) return 'high';
  if (topTwoPositionDiff < 5) return 'medium';
  return 'low';
}
```

**UI Display:**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Cannibalization Issues (12 found)                       │
├─────────────────────────────────────────────────────────────┤
│  Query: "best widgets for home"                             │
│  Severity: 🔴 High (2 pages competing closely)              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Page 1: /blog/best-widgets                          │   │
│  │ Position: 6.2 | Clicks: 89 | Impressions: 2,100     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Page 2: /guides/widget-buying-guide                 │   │
│  │ Position: 7.8 | Clicks: 34 | Impressions: 1,850     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💡 Recommendation: MERGE these pages                       │
│  Combine content into /blog/best-widgets and 301 redirect  │
│  the guide. Estimated traffic gain: +40-60 clicks/month    │
│                                                             │
│  [Mark as Resolved] [Ignore for this query]                │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Accurately identifies queries with multiple ranking pages
- [ ] Severity reflects actual competition impact
- [ ] Recommendations are appropriate (merge vs differentiate)
- [ ] User can mark issues as resolved
- [ ] Resolved issues don't reappear

---

#### 6.3.2 Historical Data Archival
**Description:** Store GSC data beyond the 16-month GSC limit.

**Implementation:**
- Continue daily syncs indefinitely
- Data older than 18 months moved to cold storage (compressed)
- UI shows full historical timeline
- Compare any two time periods

**Storage Optimization:**
```sql
-- Aggregate old data by week instead of day
CREATE TABLE gsc_data_archived (
  id UUID PRIMARY KEY,
  site_id UUID REFERENCES sites(id),
  week_start DATE NOT NULL, -- Monday of the week
  query TEXT NOT NULL,
  page TEXT NOT NULL,
  total_clicks INTEGER,
  total_impressions INTEGER,
  avg_ctr DECIMAL(5,4),
  avg_position DECIMAL(5,2),
  UNIQUE(site_id, week_start, query, page)
);

-- Monthly job to archive old data
CREATE OR REPLACE FUNCTION archive_old_gsc_data()
RETURNS void AS $$
BEGIN
  INSERT INTO gsc_data_archived (
    site_id, week_start, query, page,
    total_clicks, total_impressions, avg_ctr, avg_position
  )
  SELECT 
    site_id,
    DATE_TRUNC('week', date) as week_start,
    query,
    page,
    SUM(clicks),
    SUM(impressions),
    AVG(ctr),
    AVG(position)
  FROM gsc_data
  WHERE date < CURRENT_DATE - INTERVAL '18 months'
  GROUP BY site_id, DATE_TRUNC('week', date), query, page
  ON CONFLICT DO NOTHING;
  
  DELETE FROM gsc_data 
  WHERE date < CURRENT_DATE - INTERVAL '18 months';
END;
$$ LANGUAGE plpgsql;
```

**Acceptance Criteria:**
- [ ] Data persists beyond GSC's 16-month limit
- [ ] Historical data queryable (though at weekly granularity)
- [ ] Storage costs remain manageable
- [ ] Users see "data since [date]" indicator

---

#### 6.3.3 PDF Report Export
**Description:** Generate client-ready PDF reports (Agency plan).

**Report Contents:**
1. Executive Summary (traffic trends, key wins)
2. Striking Distance Keywords table
3. Completed Recommendations with results
4. Content Decay alerts addressed
5. Next period action items

**Implementation Options:**
- **@react-pdf/renderer** — React components to PDF
- **Puppeteer** — HTML to PDF (heavier, but pixel-perfect)
- **docx then convert** — Use docx skill if needed

**Acceptance Criteria:**
- [ ] Professional design with branding
- [ ] Includes all key metrics and charts
- [ ] Can customize date range
- [ ] Generate in under 30 seconds
- [ ] File size under 5MB

---

## 7. UI/UX Specifications

### 7.1 Design System

**Colors:**
```css
:root {
  /* Primary */
  --primary-500: #6366f1; /* Indigo - main brand */
  --primary-600: #4f46e5;
  --primary-700: #4338ca;
  
  /* Semantic */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Neutrals */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;
}
```

**Typography:**
- Headings: Inter (600, 700 weight)
- Body: Inter (400, 500 weight)
- Mono (code/numbers): JetBrains Mono

**Components:** Use shadcn/ui for consistency:
- Button, Card, Table, Dialog, Dropdown
- Tabs, Badge, Alert, Toast
- Charts: Recharts

### 7.2 Page Structure
```
/                       Landing page (public)
/pricing               Pricing page (public)
/login                 Google OAuth login
/onboarding           Site selection (post-signup)
/dashboard            Main dashboard
/reports
  /striking-distance  Keywords report
  /recommendations    AI recommendations list
  /content-decay      Decaying pages (Phase 2)
  /cannibalization    Cannibalization issues (Phase 3)
/alerts               Alert center (Phase 2)
/settings
  /profile            User profile
  /sites              Site management
  /billing            Subscription management
  /notifications      Alert preferences (Phase 2)
```

### 7.3 Responsive Breakpoints
```css
/* Mobile first */
sm: 640px   /* Large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

Dashboard must be fully usable on tablet (768px+).
Mobile (< 640px) shows simplified views with collapsible sections.

---

## 8. Security Requirements

### 8.1 Authentication & Authorization
- [x] Google OAuth 2.0 with PKCE
- [x] JWT tokens with short expiry (15 min access, 7 day refresh)
- [x] Row Level Security (RLS) on all tables
- [x] API routes check authentication before processing
- [x] Encrypted token storage (use Supabase Vault or encrypt at app level)

### 8.2 API Security
- [x] Rate limiting: 100 requests/minute per user
- [x] CORS configured for production domain only
- [x] Input validation on all endpoints (zod)
- [x] Webhook signature verification (Dodo)
- [x] CRON endpoints protected by secret header

### 8.3 Data Privacy
- [x] GDPR-ready: users can export/delete their data
- [x] No GSC data shared between users
- [x] Privacy policy and ToS required before Google OAuth approval
- [x] Minimal data collection (only what's needed)

### 8.4 Infrastructure
- [x] HTTPS everywhere (Vercel handles this)
- [x] Environment variables for all secrets
- [x] Regular dependency updates
- [x] Error logging without exposing sensitive data

---

## 9. Testing Strategy

### 9.1 Testing Pyramid
| Level | Tools | Coverage Target |
|-------|-------|-----------------|
| Unit | Vitest | Core algorithms (opportunity score, decay detection) |
| Integration | Vitest + MSW | API routes, database queries |
| E2E | Playwright | Critical user flows (signup, connect site, view report) |

### 9.2 Critical Test Cases
1. **Auth flow:** Sign in → token storage → refresh → sign out
2. **Site connection:** OAuth → fetch available sites → add site → initial sync
3. **Striking distance:** Correct filtering, sorting, opportunity score
4. **Recommendations:** AI prompt → parse response → save to DB
5. **Billing:** Checkout → webhook → subscription active → feature gates

### 9.3 Manual QA Checklist (Pre-Launch)
- [ ] Full signup flow on desktop/mobile
- [ ] All reports load with real GSC data
- [ ] Subscription purchase and cancellation
- [ ] Email delivery and rendering
- [ ] Edge cases: no data, single keyword, large site

---

## 10. Launch Checklist

### 10.1 Pre-Launch (Week before)
- [ ] Google OAuth app verified (production mode)
- [ ] Dodo Payments products/prices configured
- [ ] Transactional emails tested
- [ ] Privacy Policy and Terms of Service pages live
- [ ] Analytics installed (Plausible/PostHog)
- [ ] Error monitoring set up (Sentry)
- [ ] DNS and domain configured
- [ ] SSL certificate active

### 10.2 Launch Day
- [ ] Smoke test all critical flows
- [ ] Monitor error logs closely
- [ ] Post on Reddit (r/SideProject, r/SEO, r/indiehackers)
- [ ] Share build story on Twitter/X
- [ ] Enable uptime monitoring

### 10.3 Post-Launch (Week 1)
- [ ] Respond to all user feedback within 24 hours
- [ ] Fix any critical bugs immediately
- [ ] Start collecting testimonials
- [ ] Begin weekly blog content
- [ ] Schedule Product Hunt launch (Week 2-3)

---

## 11. Success Metrics & KPIs

### 11.1 North Star Metric
**Weekly Active Users generating recommendations**

This indicates real engagement — users who see value, not just sign up and leave.

### 11.2 Funnel Metrics
| Stage | Metric | Target |
|-------|--------|--------|
| Awareness | Website visitors | 2,000/month by M3 |
| Acquisition | Signups (trial started) | 200/month by M3 |
| Activation | Connected first site | 80% of signups |
| Retention | Weekly active (28-day) | 60% of activated |
| Revenue | Trial → Paid conversion | 15-25% |
| Referral | NPS score | 40+ |

### 11.3 Health Metrics
| Metric | Alert Threshold |
|--------|-----------------|
| Error rate (5xx) | > 1% |
| API p95 latency | > 2s |
| GSC sync failures | > 5% |
| Churn rate | > 8% monthly |

---

## 12. Open Questions / Decisions Needed

1. **Custom domain for users?** (e.g., reports.clientsite.com) — Agency tier only?
2. **Team/collaboration features?** Multiple users per account? (Consider for v2)
3. **White-labeling?** Allow agencies to remove GSCdaddy branding?
4. **Lifetime deal?** AppSumo or self-run? (Recommendation: avoid at launch)
5. **Annual pricing discount?** 2 months free (17% off) is standard

---

## 13. Appendix

### 13.1 GSC API Reference
- Search Analytics: https://developers.google.com/webmaster-tools/v1/searchanalytics
- Sites: https://developers.google.com/webmaster-tools/v1/sites
- Rate limits: 20 QPS, 30M queries/day

### 13.2 Competitor Reference
- SEO Gets: https://seogets.com ($49/mo)
- SEOTesting: https://seotesting.com ($50-375/mo)
- GSCTool: https://gsctool.com ($29/year)

### 13.3 Inspiration (UI/UX)
- Plausible Analytics (clean, simple)
- Linear (polish, interactions)
- Vercel Dashboard (developer-friendly)

---

*End of PRD — Version 1.0*
