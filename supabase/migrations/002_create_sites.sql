CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  site_url TEXT NOT NULL,
  display_name TEXT,
  permission_level TEXT,
  is_verified BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, site_url)
);

CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_last_synced ON sites(last_synced_at);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sites"
  ON sites FOR ALL
  USING (auth.uid() = user_id);
