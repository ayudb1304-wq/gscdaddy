CREATE OR REPLACE FUNCTION get_striking_distance(
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
SECURITY DEFINER
AS $$
DECLARE
  v_offset INT;
  v_total BIGINT;
BEGIN
  v_offset := (p_page - 1) * p_limit;

  -- Get total count with filters
  SELECT COUNT(*)
  INTO v_total
  FROM private.striking_distance_keywords sdk
  WHERE sdk.site_id = p_site_id
    AND (p_search IS NULL OR (sdk.query ILIKE '%' || p_search || '%' OR sdk.page ILIKE '%' || p_search || '%'))
    AND (p_min_impressions IS NULL OR sdk.total_impressions >= p_min_impressions)
    AND (p_min_position IS NULL OR sdk.avg_position >= p_min_position)
    AND (p_max_position IS NULL OR sdk.avg_position <= p_max_position);

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
    v_total AS total_count
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
  LIMIT p_limit
  OFFSET v_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_striking_distance(UUID, TEXT, TEXT, INT, INT, TEXT, INT, NUMERIC, NUMERIC) TO anon, authenticated, service_role;
