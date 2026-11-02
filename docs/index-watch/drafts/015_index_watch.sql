-- DRAFT — Index Watch schema. Do not apply as-is.
-- Before applying (PLAN.md task 1.1): inspect the live schema with the Supabase MCP,
-- confirm column names on users/sites, then copy to supabase/migrations/015_index_watch.sql.

-- 1. Site-level settings and run state -------------------------------------
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS index_watch_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS index_watch_status TEXT NOT NULL DEFAULT 'idle'
    CHECK (index_watch_status IN ('idle', 'running', 'error')),
  ADD COLUMN IF NOT EXISTS index_watch_error TEXT,
  ADD COLUMN IF NOT EXISTS index_watch_last_run_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sitemaps_fetched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS index_first_report_sent_at TIMESTAMPTZ;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS index_alerts_enabled BOOLEAN NOT NULL DEFAULT true;

-- 2. Watched URLs: one row per (site, url), latest state ---------------------
CREATE TABLE IF NOT EXISTS index_watch_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sources TEXT[] NOT NULL DEFAULT '{}',          -- 'sitemap' | 'robots_sitemap' | 'gsc' | 'manual'
  in_sitemap BOOLEAN NOT NULL DEFAULT false,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_in_sitemap_at TIMESTAMPTZ,
  removed_from_sitemap_at TIMESTAMPTZ,
  user_marked_intentional BOOLEAN NOT NULL DEFAULT false,

  -- latest Google URL Inspection result
  verdict TEXT,
  coverage_state TEXT,
  robots_txt_state TEXT,
  indexing_state TEXT,
  page_fetch_state TEXT,
  last_crawl_time TIMESTAMPTZ,
  google_canonical TEXT,
  user_canonical TEXT,
  referring_urls TEXT[],
  google_sitemaps TEXT[],
  crawled_as TEXT,
  inspection_link TEXT,
  last_inspection_error TEXT,

  -- derived
  bucket TEXT NOT NULL DEFAULT 'unknown'
    CHECK (bucket IN ('indexed', 'not_indexed', 'excluded_ok', 'blocked', 'unknown', 'error')),
  bucket_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diagnosis_code TEXT,
  severity TEXT CHECK (severity IN ('critical', 'warning', 'info', 'ok')),
  onpage JSONB,                                   -- our own fetch signals
  impressions_28d INTEGER NOT NULL DEFAULT 0,

  -- scheduling
  last_inspected_at TIMESTAMPTZ,
  next_inspect_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_id, url)
);

CREATE INDEX IF NOT EXISTS idx_iwu_site_next ON index_watch_urls (site_id, next_inspect_at);
CREATE INDEX IF NOT EXISTS idx_iwu_site_bucket ON index_watch_urls (site_id, bucket);
CREATE INDEX IF NOT EXISTS idx_iwu_site_severity ON index_watch_urls (site_id, severity);

ALTER TABLE index_watch_urls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own watched urls"
  ON index_watch_urls FOR ALL
  USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));

-- 3. Status transitions (history + alert source) ----------------------------
CREATE TABLE IF NOT EXISTS index_watch_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  url_id UUID REFERENCES index_watch_urls(id) ON DELETE CASCADE,  -- null for site-wide events
  kind TEXT NOT NULL CHECK (kind IN (
    'status_change', 'stuck', 'sitewide_dropout', 'sitewide_blocker',
    'sitewide_crawl_backlog', 'sitemap_issue', 'property_access_lost'
  )),
  from_bucket TEXT,
  to_bucket TEXT,
  diagnosis_code TEXT,
  coverage_state TEXT,
  severity TEXT CHECK (severity IN ('critical', 'warning', 'info', 'ok')),
  details JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_iwe_site_time ON index_watch_events (site_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_iwe_unnotified ON index_watch_events (site_id) WHERE notified_at IS NULL;

ALTER TABLE index_watch_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own index events"
  ON index_watch_events FOR SELECT
  USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));

-- 4. Daily snapshot per site (trend chart + quota accounting) ----------------
CREATE TABLE IF NOT EXISTS index_watch_daily (
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  indexed INTEGER NOT NULL DEFAULT 0,
  not_indexed INTEGER NOT NULL DEFAULT 0,
  excluded_ok INTEGER NOT NULL DEFAULT 0,
  blocked INTEGER NOT NULL DEFAULT 0,
  unknown INTEGER NOT NULL DEFAULT 0,
  error INTEGER NOT NULL DEFAULT 0,
  inspections_used INTEGER NOT NULL DEFAULT 0,   -- scheduled + on-demand, against Google's 2,000/day/site (Pacific day)
  PRIMARY KEY (site_id, date)
);

ALTER TABLE index_watch_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own index daily"
  ON index_watch_daily FOR SELECT
  USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));

-- 5. Atomic quota reservation (call before each inspection batch) ------------
-- Returns how many of the requested calls may proceed today for this site.
CREATE OR REPLACE FUNCTION reserve_inspections(p_site_id UUID, p_requested INTEGER, p_daily_cap INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_used INTEGER;
  v_granted INTEGER;
  -- Google API daily quotas usually reset at midnight Pacific; count on the same clock.
  v_day DATE := (NOW() AT TIME ZONE 'America/Los_Angeles')::date;
BEGIN
  INSERT INTO index_watch_daily (site_id, date) VALUES (p_site_id, v_day)
  ON CONFLICT (site_id, date) DO NOTHING;

  SELECT inspections_used INTO v_used
  FROM index_watch_daily
  WHERE site_id = p_site_id AND date = v_day
  FOR UPDATE;

  v_granted := GREATEST(0, LEAST(p_requested, p_daily_cap - v_used));

  UPDATE index_watch_daily
  SET inspections_used = inspections_used + v_granted
  WHERE site_id = p_site_id AND date = v_day;

  RETURN v_granted;
END;
$$;

REVOKE ALL ON FUNCTION reserve_inspections(UUID, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
-- Only the service role (cron + server routes via admin client) may call it.

-- Note: index_watch_daily.date is the Pacific-time quota day for inspections_used.
-- The bucket counts written by the cron use the same date so one row = one quota day.
