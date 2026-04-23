-- Baseline snapshot captured when a recommendation is marked complete,
-- used on the /today page to show before/after deltas for shipped recs.
CREATE TABLE recommendation_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID NOT NULL UNIQUE REFERENCES recommendations(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  page TEXT NOT NULL,
  baseline_start DATE NOT NULL,
  baseline_end DATE NOT NULL,
  baseline_clicks INTEGER NOT NULL DEFAULT 0,
  baseline_impressions INTEGER NOT NULL DEFAULT 0,
  baseline_avg_position DECIMAL(5,2) NOT NULL DEFAULT 0,
  baseline_avg_ctr DECIMAL(5,4) NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rec_baselines_site ON recommendation_baselines(site_id, completed_at DESC);

ALTER TABLE recommendation_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own baselines"
  ON recommendation_baselines FOR ALL
  USING (
    site_id IN (SELECT id FROM sites WHERE user_id = auth.uid())
  );

-- Backfill: for already-completed recs with query+page, snapshot their
-- pre-completion 28-day window from gsc_data so existing users see their
-- past wins on the /today page from day one.
INSERT INTO recommendation_baselines (
  recommendation_id, site_id, query, page,
  baseline_start, baseline_end,
  baseline_clicks, baseline_impressions,
  baseline_avg_position, baseline_avg_ctr,
  completed_at
)
SELECT
  r.id,
  r.site_id,
  r.query,
  r.page,
  (r.completed_at::date - INTERVAL '28 days')::date AS baseline_start,
  (r.completed_at::date - INTERVAL '1 day')::date  AS baseline_end,
  COALESCE(SUM(g.clicks), 0)::int,
  COALESCE(SUM(g.impressions), 0)::int,
  COALESCE(AVG(g.position), 0)::numeric(5,2),
  COALESCE(AVG(g.ctr), 0)::numeric(5,4),
  r.completed_at
FROM recommendations r
LEFT JOIN gsc_data g
  ON g.site_id = r.site_id
  AND g.query = r.query
  AND g.page  = r.page
  AND g.date >= (r.completed_at::date - INTERVAL '28 days')::date
  AND g.date <  r.completed_at::date
WHERE r.is_completed = true
  AND r.completed_at IS NOT NULL
  AND r.query IS NOT NULL
  AND r.page  IS NOT NULL
GROUP BY r.id, r.site_id, r.query, r.page, r.completed_at
ON CONFLICT (recommendation_id) DO NOTHING;
