-- ══════════════════════════════════════════════════════════════
-- Sprint Tea Party Dashboard - Supabase Schema
-- ══════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all tables needed for your dashboard.

-- ── Applications ────────────────────────────────────────────
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SAVED' CHECK (status IN ('SAVED', 'APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED')),
  applied_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Daily Practice ──────────────────────────────────────────
CREATE TABLE daily_practice (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  practice_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Roles (for Topics to Master) ────────────────────────────
CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Subcategories ───────────────────────────────────────────
CREATE TABLE subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Topics ──────────────────────────────────────────────────
CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Streak Tracking ─────────────────────────────────────────
CREATE TABLE streak_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Progress Log (daily stats snapshot) ─────────────────────
CREATE TABLE progress_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  applications_count INT DEFAULT 0,
  questions_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- Indexes for performance
-- ══════════════════════════════════════════════════════════════
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(applied_date);
CREATE INDEX idx_daily_practice_date ON daily_practice(practice_date);
CREATE INDEX idx_subcategories_role ON subcategories(role_id);
CREATE INDEX idx_topics_subcategory ON topics(subcategory_id);
CREATE INDEX idx_progress_log_date ON progress_log(log_date);
CREATE INDEX idx_streak_log_date ON streak_log(log_date);

-- ══════════════════════════════════════════════════════════════
-- Auto-update updated_at trigger
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- Row Level Security (RLS) - Open for single-user dashboard
-- ══════════════════════════════════════════════════════════════
-- Since this is a personal dashboard, we enable RLS but allow
-- all operations via the anon key. If you later add auth,
-- update these policies.

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_practice ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (single-user personal dashboard)
CREATE POLICY "Allow all" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON daily_practice FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON subcategories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON streak_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON progress_log FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- Seed Data (optional - gives you a starting point)
-- ══════════════════════════════════════════════════════════════
INSERT INTO roles (name, sort_order) VALUES
  ('Traditional', 0), ('Product', 1), ('Growth', 2), ('MLE', 3);

-- Get role IDs for subcategory seeding
DO $$
DECLARE
  r_trad UUID; r_prod UUID; r_grow UUID; r_mle UUID;
  sc_id UUID;
BEGIN
  SELECT id INTO r_trad FROM roles WHERE name = 'Traditional';
  SELECT id INTO r_prod FROM roles WHERE name = 'Product';
  SELECT id INTO r_grow FROM roles WHERE name = 'Growth';
  SELECT id INTO r_mle FROM roles WHERE name = 'MLE';

  -- Traditional subcategories
  INSERT INTO subcategories (role_id, name, sort_order) VALUES (r_trad, 'Statistics & Math', 0) RETURNING id INTO sc_id;
  INSERT INTO topics (subcategory_id, text, done) VALUES (sc_id, 'Hypothesis Testing', true), (sc_id, 'Bayesian Inference', false), (sc_id, 'A/B Test Design', true);

  INSERT INTO subcategories (role_id, name, sort_order) VALUES (r_trad, 'Machine Learning', 1) RETURNING id INTO sc_id;
  INSERT INTO topics (subcategory_id, text, done) VALUES (sc_id, 'Random Forests', true), (sc_id, 'Gradient Boosting', false), (sc_id, 'SVMs', false), (sc_id, 'Cross Validation', true);

  INSERT INTO subcategories (role_id, name, sort_order) VALUES (r_trad, 'Feature Engineering', 2) RETURNING id INTO sc_id;
  INSERT INTO topics (subcategory_id, text, done) VALUES (sc_id, 'Encoding Categoricals', false), (sc_id, 'Handling Missing Data', true);

  -- Product
  INSERT INTO subcategories (role_id, name, sort_order) VALUES (r_prod, 'Metrics & KPIs', 0) RETURNING id INTO sc_id;
  INSERT INTO topics (subcategory_id, text, done) VALUES (sc_id, 'North Star Metrics', false), (sc_id, 'Funnel Analysis', true);

  INSERT INTO subcategories (role_id, name, sort_order) VALUES (r_prod, 'Experimentation', 1) RETURNING id INTO sc_id;
  INSERT INTO topics (subcategory_id, text, done) VALUES (sc_id, 'Multi-armed Bandits', false);

  -- Growth
  INSERT INTO subcategories (role_id, name, sort_order) VALUES (r_grow, 'Retention', 0) RETURNING id INTO sc_id;
  INSERT INTO topics (subcategory_id, text, done) VALUES (sc_id, 'Cohort Analysis', false), (sc_id, 'Churn Prediction', true);

  -- MLE
  INSERT INTO subcategories (role_id, name, sort_order) VALUES (r_mle, 'Model Serving', 0) RETURNING id INTO sc_id;
  INSERT INTO topics (subcategory_id, text, done) VALUES (sc_id, 'REST vs gRPC', false), (sc_id, 'Model Versioning', false);

  INSERT INTO subcategories (role_id, name, sort_order) VALUES (r_mle, 'MLOps', 1) RETURNING id INTO sc_id;
  INSERT INTO topics (subcategory_id, text, done) VALUES (sc_id, 'CI/CD for ML', false);
END $$;
