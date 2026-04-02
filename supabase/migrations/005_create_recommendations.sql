CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'title_optimization', 'content_expansion',
    'internal_linking', 'content_refresh',
    'cannibalization_fix', 'quick_win'
  )),
  query TEXT,
  page TEXT,
  current_position DECIMAL(5,2),
  potential_position DECIMAL(5,2),
  estimated_traffic_gain INTEGER,
  recommendation_text TEXT NOT NULL,
  action_items JSONB,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_recommendations_site_id ON recommendations(site_id);
CREATE INDEX idx_recommendations_priority ON recommendations(priority, is_completed);
CREATE INDEX idx_recommendations_created ON recommendations(created_at DESC);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR ALL
  USING (
    site_id IN (
      SELECT id FROM sites WHERE user_id = auth.uid()
    )
  );
