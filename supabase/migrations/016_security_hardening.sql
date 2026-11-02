-- Security hardening from the Nov 2026 audit.
--
-- Every write the app makes goes through the service-role (admin) client, and every
-- read of these tables / this RPC from app code also uses the admin client. These
-- changes only remove what the public anon key + a user's session token could do
-- by calling PostgREST directly.

-- 1. users: a user could PATCH their own row and set trial_ends_at / plan / sites_limit
--    (free Pro forever) or overwrite their encrypted Google tokens. Keep SELECT only.
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- 2. sites: FOR ALL let users INSERT sites directly, skipping the plan site limit
--    enforced in POST /api/sites. Read-only for users.
DROP POLICY IF EXISTS "Users can manage own sites" ON public.sites;
DROP POLICY IF EXISTS "Users can view own sites" ON public.sites;
CREATE POLICY "Users can view own sites"
  ON public.sites FOR SELECT
  USING (auth.uid() = user_id);

-- 3. recommendations: same FOR ALL problem (users could insert/edit their own recs).
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.recommendations;
CREATE POLICY "Users can view own recommendations"
  ON public.recommendations FOR SELECT
  USING (site_id IN (SELECT id FROM public.sites WHERE user_id = auth.uid()));

-- 4. get_striking_distance: SECURITY DEFINER, granted to anon, no ownership check.
--    Anyone with the anon key could read any site's keywords. App code calls it with
--    the service role only.
REVOKE ALL ON FUNCTION public.get_striking_distance(UUID, TEXT, TEXT, INT, INT, TEXT, INT, NUMERIC, NUMERIC)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_striking_distance(UUID, TEXT, TEXT, INT, INT, TEXT, INT, NUMERIC, NUMERIC)
  TO service_role;
ALTER FUNCTION public.get_striking_distance(UUID, TEXT, TEXT, INT, INT, TEXT, INT, NUMERIC, NUMERIC)
  SET search_path = public, private, pg_temp;

-- 5. health_checks: anon could SELECT every lead email and INSERT fake results that
--    are shown on public /seo-health-checker/[domain] pages. All app access is admin.
DROP POLICY IF EXISTS "Anyone can create health checks" ON public.health_checks;
DROP POLICY IF EXISTS "Anyone can read health checks" ON public.health_checks;

-- 6. users.email_unsubscribed exists in production but no migration created it, so a
--    fresh database breaks every email query. No-op on production.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN DEFAULT FALSE;
