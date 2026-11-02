-- Fixes from the second full audit (Nov 2026): Google connection status, Search
-- Console daily totals, AI generation quota, webhook ordering, faster dashboard
-- and Today queries, an honest striking-distance view, and cheaper writes.
-- The app works before this is applied (it falls back to the old paths); apply
-- it to get the fixes.

-- ---------------------------------------------------------------------------
-- 1. Google connection status: lets the app show "Reconnect Google" instead of
--    failing every sync silently after access is revoked.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_auth_status TEXT NOT NULL DEFAULT 'ok';

-- ---------------------------------------------------------------------------
-- 2. Site-level daily totals exactly as Search Console reports them (dimension
--    "date" only). Summing query x page rows misses anonymised queries and counts
--    impressions per page, so headline numbers came out 20-50% off GSC.
CREATE TABLE IF NOT EXISTS public.site_daily_totals (
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC NOT NULL DEFAULT 0,
  position NUMERIC NOT NULL DEFAULT 0,
  PRIMARY KEY (site_id, date)
);
ALTER TABLE public.site_daily_totals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own daily totals" ON public.site_daily_totals;
CREATE POLICY "Users can view own daily totals"
  ON public.site_daily_totals FOR SELECT
  USING (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 3. AI generation log. The daily limit counted surviving recommendation rows,
--    and each regeneration deleted the previous batch, so the limit never held.
CREATE TABLE IF NOT EXISTS public.recommendation_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('manual', 'auto')),
  rec_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rec_generations_user_created
  ON public.recommendation_generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rec_generations_site_created
  ON public.recommendation_generations(site_id, created_at DESC);
ALTER TABLE public.recommendation_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own generations" ON public.recommendation_generations;
CREATE POLICY "Users can view own generations"
  ON public.recommendation_generations FOR SELECT
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Subscriptions: billing interval (for the plan-change UI) and the timestamp
--    of the newest webhook applied (older, out-of-order events are skipped).
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_interval TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- 5. Indexes. query/page alone are never filtered without site_id, and the
--    partial position index (5-15) no longer matches anything; all three were
--    pure write cost on every upsert.
DROP INDEX IF EXISTS public.idx_gsc_data_query;
DROP INDEX IF EXISTS public.idx_gsc_data_page;
DROP INDEX IF EXISTS public.idx_gsc_data_position;

-- ---------------------------------------------------------------------------
-- 6. Dashboard series: one round trip returning up to p_days days ending at the
--    site's newest data date. Uses Search Console's daily totals where we have
--    them, otherwise aggregates query x page rows (impression-weighted position).
--    Replaces paging tens of thousands of raw rows into JavaScript.
CREATE OR REPLACE FUNCTION public.site_daily_series(p_site_id UUID, p_days INT)
RETURNS TABLE (date DATE, clicks BIGINT, impressions BIGINT, avg_position NUMERIC, from_totals BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH latest AS (
    SELECT GREATEST(
      (SELECT max(t.date) FROM site_daily_totals t WHERE t.site_id = p_site_id),
      (SELECT max(g.date) FROM gsc_data g WHERE g.site_id = p_site_id)
    ) AS d
  ),
  totals AS (
    SELECT t.date, t.clicks::bigint AS clicks, t.impressions::bigint AS impressions, t.position
    FROM site_daily_totals t, latest
    WHERE t.site_id = p_site_id AND t.date > latest.d - p_days AND t.date <= latest.d
  ),
  summed AS (
    SELECT g.date,
      sum(g.clicks)::bigint AS clicks,
      sum(g.impressions)::bigint AS impressions,
      CASE WHEN sum(g.impressions) > 0
        THEN sum(g.position * g.impressions) / sum(g.impressions)
        ELSE avg(g.position) END AS position
    FROM gsc_data g, latest
    WHERE g.site_id = p_site_id AND g.date > latest.d - p_days AND g.date <= latest.d
      AND NOT EXISTS (SELECT 1 FROM totals WHERE totals.date = g.date)
    GROUP BY g.date
  )
  SELECT totals.date, totals.clicks, totals.impressions, totals.position, true FROM totals
  UNION ALL
  SELECT summed.date, summed.clicks, summed.impressions, summed.position, false FROM summed
  ORDER BY 1;
$$;

-- ---------------------------------------------------------------------------
-- 7. Today "movers": last 2 days vs the 7 days before, per site, anchored to each
--    site's newest data date, aggregated in SQL. The prior average is per
--    calendar day (it was per day-with-data, which biased sporadic keywords
--    toward "drops").
CREATE OR REPLACE FUNCTION public.today_movers(p_site_ids UUID[])
RETURNS TABLE (site_id UUID, query TEXT, page TEXT, recent_clicks BIGINT, prior_clicks BIGINT, prior_daily_avg NUMERIC, click_delta NUMERIC)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH latest AS (
    SELECT s.id AS site_id, l.d
    FROM unnest(p_site_ids) AS s(id)
    CROSS JOIN LATERAL (SELECT max(g.date) AS d FROM gsc_data g WHERE g.site_id = s.id) l
    WHERE l.d IS NOT NULL
  ),
  agg AS (
    SELECT g.site_id, g.query, g.page,
      COALESCE(sum(g.clicks) FILTER (WHERE g.date > l.d - 2), 0)::bigint AS recent_clicks,
      COALESCE(sum(g.clicks) FILTER (WHERE g.date <= l.d - 2), 0)::bigint AS prior_clicks,
      COALESCE(sum(g.impressions) FILTER (WHERE g.date <= l.d - 2), 0) AS prior_impressions,
      count(DISTINCT g.date) FILTER (WHERE g.date <= l.d - 2) AS prior_days
    FROM latest l
    JOIN gsc_data g ON g.site_id = l.site_id AND g.date > l.d - 9 AND g.date <= l.d
    GROUP BY g.site_id, g.query, g.page
  )
  SELECT agg.site_id, agg.query, agg.page, agg.recent_clicks, agg.prior_clicks,
    agg.prior_clicks / 7.0 AS prior_daily_avg,
    agg.recent_clicks - agg.prior_clicks / 7.0 * 2 AS click_delta
  FROM agg
  WHERE agg.prior_days >= 3
    AND agg.prior_impressions >= 50
    AND abs(agg.recent_clicks - agg.prior_clicks / 7.0 * 2) >= 3;
$$;

-- ---------------------------------------------------------------------------
-- 8. Distinct keywords a user has data for in the last 28 days (the trial emails
--    counted query x page x day rows, so ~300 keywords showed as ~23,000).
CREATE OR REPLACE FUNCTION public.count_user_keywords(p_user_id UUID)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT count(DISTINCT g.query)
  FROM sites s
  JOIN gsc_data g ON g.site_id = s.id AND g.date > CURRENT_DATE - 31
  WHERE s.user_id = p_user_id;
$$;

-- ---------------------------------------------------------------------------
-- 9. Striking-distance view: aggregate every row in each site's last 28 days of
--    data, THEN keep keywords whose weighted position is 5-20. Filtering daily
--    rows first forced every average into 5-20 and dropped the other days'
--    impressions (a keyword sitting at #3 could show up as #6). The window is
--    anchored to each site's newest data date and read per site through the
--    (site_id, date) index instead of scanning the whole table.
DROP MATERIALIZED VIEW IF EXISTS private.striking_distance_keywords;

CREATE MATERIALIZED VIEW private.striking_distance_keywords AS
WITH latest AS (
  SELECT s.id AS site_id, l.d
  FROM sites s
  CROSS JOIN LATERAL (SELECT max(g.date) AS d FROM gsc_data g WHERE g.site_id = s.id) l
  WHERE l.d IS NOT NULL
),
agg AS (
  SELECT
    g.site_id,
    g.query,
    g.page,
    SUM(g.impressions) AS total_impressions,
    SUM(g.clicks) AS total_clicks,
    CASE WHEN SUM(g.impressions) > 0
      THEN SUM(g.position * g.impressions) / SUM(g.impressions)
      ELSE AVG(g.position) END AS avg_position,
    CASE WHEN SUM(g.impressions) > 0
      THEN SUM(g.clicks)::numeric / SUM(g.impressions)
      ELSE 0 END AS avg_ctr,
    MAX(g.date) AS last_seen
  FROM latest l
  JOIN gsc_data g ON g.site_id = l.site_id AND g.date > l.d - 28 AND g.date <= l.d
  GROUP BY g.site_id, g.query, g.page
  HAVING SUM(g.impressions) >= 5
)
SELECT
  site_id, query, page, avg_position, total_impressions, total_clicks, avg_ctr,
  total_impressions * (21 - avg_position) / 16 AS opportunity_score,
  last_seen
FROM agg
WHERE avg_position >= 5 AND avg_position <= 20
ORDER BY opportunity_score DESC;

CREATE UNIQUE INDEX idx_sdk_site_query_page
  ON private.striking_distance_keywords(site_id, query, page);

REFRESH MATERIALIZED VIEW private.striking_distance_keywords;

-- ---------------------------------------------------------------------------
-- 10. get_striking_distance: total via count(*) OVER () in the same scan instead
--     of a separate COUNT(*) pass; page/limit clamped so bad input can't error.
CREATE OR REPLACE FUNCTION public.get_striking_distance(
  p_site_id UUID,
  p_sort_by TEXT DEFAULT 'opportunity_score',
  p_sort_order TEXT DEFAULT 'desc',
  p_page INT DEFAULT 1,
  p_limit INT DEFAULT 25,
  p_search TEXT DEFAULT NULL,
  p_min_impressions INT DEFAULT NULL,
  p_min_position NUMERIC DEFAULT NULL,
  p_max_position NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  query TEXT,
  page TEXT,
  avg_position NUMERIC,
  total_impressions BIGINT,
  total_clicks BIGINT,
  avg_ctr NUMERIC,
  opportunity_score NUMERIC,
  last_seen DATE,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_limit INT := LEAST(GREATEST(COALESCE(p_limit, 25), 1), 1000);
  v_offset INT := (GREATEST(COALESCE(p_page, 1), 1) - 1) * LEAST(GREATEST(COALESCE(p_limit, 25), 1), 1000);
BEGIN
  RETURN QUERY
  SELECT
    sdk.query,
    sdk.page,
    sdk.avg_position,
    sdk.total_impressions,
    sdk.total_clicks,
    sdk.avg_ctr,
    sdk.opportunity_score,
    sdk.last_seen,
    count(*) OVER () AS total_count
  FROM private.striking_distance_keywords sdk
  WHERE sdk.site_id = p_site_id
    AND (p_search IS NULL OR (sdk.query ILIKE '%' || p_search || '%' OR sdk.page ILIKE '%' || p_search || '%'))
    AND (p_min_impressions IS NULL OR sdk.total_impressions >= p_min_impressions)
    AND (p_min_position IS NULL OR sdk.avg_position >= p_min_position)
    AND (p_max_position IS NULL OR sdk.avg_position <= p_max_position)
  ORDER BY
    CASE WHEN p_sort_by = 'opportunity_score' AND p_sort_order = 'desc' THEN sdk.opportunity_score END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'opportunity_score' AND p_sort_order = 'asc' THEN sdk.opportunity_score END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'total_impressions' AND p_sort_order = 'desc' THEN sdk.total_impressions END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'total_impressions' AND p_sort_order = 'asc' THEN sdk.total_impressions END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'total_clicks' AND p_sort_order = 'desc' THEN sdk.total_clicks END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'total_clicks' AND p_sort_order = 'asc' THEN sdk.total_clicks END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'avg_position' AND p_sort_order = 'desc' THEN sdk.avg_position END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'avg_position' AND p_sort_order = 'asc' THEN sdk.avg_position END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'avg_ctr' AND p_sort_order = 'desc' THEN sdk.avg_ctr END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'avg_ctr' AND p_sort_order = 'asc' THEN sdk.avg_ctr END ASC NULLS LAST,
    sdk.opportunity_score DESC
  LIMIT v_limit
  OFFSET v_offset;
END;
$$;

-- ---------------------------------------------------------------------------
-- Service role only for every new function (app code calls them with the admin
-- client; the anon key must not reach them).
REVOKE ALL ON FUNCTION public.site_daily_series(UUID, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.site_daily_series(UUID, INT) TO service_role;
REVOKE ALL ON FUNCTION public.today_movers(UUID[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.today_movers(UUID[]) TO service_role;
REVOKE ALL ON FUNCTION public.count_user_keywords(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_user_keywords(UUID) TO service_role;
REVOKE ALL ON FUNCTION public.get_striking_distance(UUID, TEXT, TEXT, INT, INT, TEXT, INT, NUMERIC, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_striking_distance(UUID, TEXT, TEXT, INT, INT, TEXT, INT, NUMERIC, NUMERIC) TO service_role;
