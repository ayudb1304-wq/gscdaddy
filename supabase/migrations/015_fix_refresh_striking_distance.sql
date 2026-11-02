-- refresh_striking_distance() ran as the caller. The cron scripts and API routes call it with
-- the service role, which doesn't own private.striking_distance_keywords, so every refresh
-- failed with "permission denied for materialized view striking_distance_keywords" and the
-- striking-distance report went stale after each sync.
--
-- Run it as the function owner instead, pin search_path, and let only the service role call it.

CREATE OR REPLACE FUNCTION public.refresh_striking_distance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.striking_distance_keywords;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_striking_distance() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_striking_distance() TO service_role;

-- Bring every site's report up to date now.
REFRESH MATERIALIZED VIEW private.striking_distance_keywords;
