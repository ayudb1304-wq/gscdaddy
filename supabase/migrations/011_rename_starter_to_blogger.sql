-- Rename 'starter' plan to 'blogger' in users and subscriptions tables.
-- Drop the old CHECK constraints before updating rows: updating to 'blogger'
-- while the old constraint (which doesn't allow it) is in place fails.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

UPDATE users SET plan = 'blogger' WHERE plan = 'starter';
UPDATE subscriptions SET plan = 'blogger' WHERE plan = 'starter';

ALTER TABLE users ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'blogger', 'pro', 'agency'));
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('blogger', 'pro', 'agency'));
