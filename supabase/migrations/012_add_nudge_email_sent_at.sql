-- Track when the "generate recommendations" nudge email was sent per site
-- so we only send it once per site.
ALTER TABLE sites ADD COLUMN nudge_email_sent_at TIMESTAMPTZ;
