CREATE TABLE gsc_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  query TEXT NOT NULL,
  page TEXT NOT NULL,
  country TEXT DEFAULT 'ALL',
  device TEXT DEFAULT 'ALL',
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  position DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, date, query, page, country, device)
);

CREATE INDEX idx_gsc_data_site_date ON gsc_data(site_id, date DESC);
CREATE INDEX idx_gsc_data_position ON gsc_data(position) WHERE position >= 5 AND position <= 15;
CREATE INDEX idx_gsc_data_query ON gsc_data(query);
CREATE INDEX idx_gsc_data_page ON gsc_data(page);

ALTER TABLE gsc_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own site data"
  ON gsc_data FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM sites WHERE user_id = auth.uid()
    )
  );
