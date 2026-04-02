ALTER TABLE users ADD COLUMN persona TEXT CHECK (persona IN ('blogger', 'consultant', 'agency'));
