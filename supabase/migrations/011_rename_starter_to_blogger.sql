-- Rename 'starter' plan to 'blogger' in users and subscriptions tables

-- Update existing data first
UPDATE users SET plan = 'blogger' WHERE plan = 'starter';
UPDATE subscriptions SET plan = 'blogger' WHERE plan = 'starter';

-- Drop and recreate CHECK constraints on users.plan
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'blogger', 'pro', 'agency'));

-- Drop and recreate CHECK constraints on subscriptions.plan
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('blogger', 'pro', 'agency'));
