-- Relax the striking distance view so new sites get recommendations ASAP.
--
-- Background:
-- The view created in migration 004 intended to filter to "positions 5-15,
-- ≥50 impressions over 28 days". Materialized views do NOT support
-- CREATE OR REPLACE — so the original version without these thresholds
-- stayed deployed in production even after the migration file was updated.
-- This migration fixes that by explicitly DROPPing and recreating it.
--
-- While we're at it, the thresholds are being relaxed for new-site friendliness:
--
-- - position range: 5-15  →  5-20
--   Widens the net to include keywords that haven't quite broken into the
--   first page but are close. New sites rarely rank 5-15 in their first
--   weeks — they typically sit 15-25. This gives them actionable opportunities.
--
-- - impressions:    >= 50 →  >= 5
--   50 was calibrated for mature sites; new sites with a few days of GSC
--   data produce single-digit impression counts per keyword and were being
--   filtered to zero. 5 is low enough to unblock brand-new sites while
--   still excluding pure single-day flukes.
--
-- - opportunity_score formula:
--       (15 - avg_position) / 10    →    (21 - avg_position) / 16
--   The old formula goes negative for positions >15, so the widened range
--   needed a new curve. (21 - pos) / 16 stays positive across 5-20, still
--   rewards positions closer to the top, and gives position 20 a small
--   non-zero weight so high-impression laggards still surface.

DROP MATERIALIZED VIEW IF EXISTS private.striking_distance_keywords;

CREATE MATERIALIZED VIEW private.striking_distance_keywords AS
SELECT
  gsc.site_id,
  gsc.query,
  gsc.page,
  AVG(gsc.position) as avg_position,
  SUM(gsc.impressions) as total_impressions,
  SUM(gsc.clicks) as total_clicks,
  AVG(gsc.ctr) as avg_ctr,
  SUM(gsc.impressions) * (21 - AVG(gsc.position)) / 16 as opportunity_score,
  MAX(gsc.date) as last_seen
FROM gsc_data gsc
WHERE
  gsc.date >= CURRENT_DATE - INTERVAL '28 days'
  AND gsc.position >= 5
  AND gsc.position <= 20
GROUP BY gsc.site_id, gsc.query, gsc.page
HAVING SUM(gsc.impressions) >= 5
ORDER BY opportunity_score DESC;

-- Unique index is required for REFRESH MATERIALIZED VIEW CONCURRENTLY.
CREATE UNIQUE INDEX idx_sdk_site_query_page
  ON private.striking_distance_keywords(site_id, query, page);

-- The refresh function from migration 004 still works as-is — it just
-- re-runs whatever the current view definition evaluates to. Recreating
-- it here for idempotency in case someone applies 011 to an environment
-- that never had 004.
CREATE OR REPLACE FUNCTION refresh_striking_distance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.striking_distance_keywords;
END;
$$ LANGUAGE plpgsql;

-- Prime the view with fresh data immediately so users see the fix the
-- moment this migration is applied, without waiting for the daily cron.
REFRESH MATERIALIZED VIEW private.striking_distance_keywords;
