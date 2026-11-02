-- Impression-weighted position and CTR in the striking-distance view.
--
-- The view averaged position and CTR across every (query, page, day) row with
-- a plain AVG(), so a day with 2 impressions counted as much as a day with
-- 2,000. That is not how Search Console reports them and it skewed both the
-- displayed position and the opportunity score. Now:
--   avg_position = SUM(position * impressions) / SUM(impressions)
--   avg_ctr      = SUM(clicks) / SUM(impressions)
-- Thresholds and the opportunity formula are unchanged (see 011); only the
-- averages feeding them are weighted. Same columns, so get_striking_distance
-- and the app read it unchanged.

DROP MATERIALIZED VIEW IF EXISTS private.striking_distance_keywords;

CREATE MATERIALIZED VIEW private.striking_distance_keywords AS
WITH agg AS (
  SELECT
    gsc.site_id,
    gsc.query,
    gsc.page,
    SUM(gsc.impressions) AS total_impressions,
    SUM(gsc.clicks) AS total_clicks,
    CASE
      WHEN SUM(gsc.impressions) > 0
        THEN SUM(gsc.position * gsc.impressions) / SUM(gsc.impressions)
      ELSE AVG(gsc.position)
    END AS avg_position,
    CASE
      WHEN SUM(gsc.impressions) > 0
        THEN SUM(gsc.clicks)::numeric / SUM(gsc.impressions)
      ELSE 0
    END AS avg_ctr,
    MAX(gsc.date) AS last_seen
  FROM gsc_data gsc
  WHERE
    gsc.date >= CURRENT_DATE - INTERVAL '28 days'
    AND gsc.position >= 5
    AND gsc.position <= 20
  GROUP BY gsc.site_id, gsc.query, gsc.page
  HAVING SUM(gsc.impressions) >= 5
)
SELECT
  site_id,
  query,
  page,
  avg_position,
  total_impressions,
  total_clicks,
  avg_ctr,
  total_impressions * (21 - avg_position) / 16 AS opportunity_score,
  last_seen
FROM agg
ORDER BY opportunity_score DESC;

-- Unique index is required for REFRESH MATERIALIZED VIEW CONCURRENTLY.
CREATE UNIQUE INDEX idx_sdk_site_query_page
  ON private.striking_distance_keywords(site_id, query, page);

-- Fill it now so reports update immediately.
REFRESH MATERIALIZED VIEW private.striking_distance_keywords;

-- ---------------------------------------------------------------------------
-- Shared rate limiting for the public endpoints (health check crawl, report
-- email). The in-memory limiter is per serverless instance, so its limits
-- multiplied with every instance Vercel started. Fixed one-minute-style
-- windows, counted atomically in Postgres; only the service role can call it.

CREATE TABLE IF NOT EXISTS private.rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key TEXT, p_window_seconds INTEGER, p_max INTEGER)
RETURNS TABLE (allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_window TIMESTAMPTZ := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  v_count INTEGER;
BEGIN
  INSERT INTO private.rate_limits AS rl (key, window_start, count)
  VALUES (p_key, v_window, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET count = rl.count + 1
  RETURNING rl.count INTO v_count;

  -- Occasionally drop old windows so the table stays small.
  IF random() < 0.01 THEN
    DELETE FROM private.rate_limits WHERE window_start < now() - INTERVAL '1 day';
  END IF;

  RETURN QUERY SELECT v_count <= p_max, GREATEST(p_max - v_count, 0), v_window + make_interval(secs => p_window_seconds);
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_hit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(TEXT, INTEGER, INTEGER) TO service_role;
