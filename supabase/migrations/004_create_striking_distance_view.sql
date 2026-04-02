-- Create the materialized view in a private schema so it's NOT exposed via PostgREST API
CREATE SCHEMA IF NOT EXISTS private;

CREATE MATERIALIZED VIEW private.striking_distance_keywords AS
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
  ON private.striking_distance_keywords(site_id, query, page);

CREATE OR REPLACE FUNCTION refresh_striking_distance()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.striking_distance_keywords;
END;
$$ LANGUAGE plpgsql;
