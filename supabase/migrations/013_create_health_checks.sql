-- Health check results for the free SEO Health Score tool
CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  score INTEGER,
  results JSONB,
  email TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_checks_domain ON health_checks(domain);
CREATE INDEX idx_health_checks_created ON health_checks(created_at DESC);
CREATE INDEX idx_health_checks_email ON health_checks(email) WHERE email IS NOT NULL;

-- No RLS — health checks are public (no login required to run one)
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public tool)
CREATE POLICY "Anyone can create health checks"
  ON health_checks FOR INSERT
  WITH CHECK (true);

-- Anyone can read by domain (for cached results / programmatic SEO pages)
CREATE POLICY "Anyone can read health checks"
  ON health_checks FOR SELECT
  USING (true);
