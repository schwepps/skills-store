-- Skills Store Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- ===========================================
-- TABLES
-- ===========================================

-- Repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  display_name TEXT,
  description TEXT,
  website TEXT,
  featured BOOLEAN DEFAULT false,
  skills_path TEXT DEFAULT '',
  category_overrides JSONB DEFAULT '{}',
  exclude_folders TEXT[] DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner, repo)
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  version TEXT,
  license TEXT,
  github_url TEXT NOT NULL,
  download_url TEXT NOT NULL,
  detail_url TEXT NOT NULL,
  raw_metadata JSONB,
  extended_content JSONB,  -- Extended content: usage triggers, example prompts, workflow phases
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_id, skill_name)
);

-- Sync logs table (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  skills_added INT DEFAULT 0,
  skills_updated INT DEFAULT 0,
  skills_removed INT DEFAULT 0,
  duration_ms INT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Fast category filtering
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- Fast repo lookups
CREATE INDEX IF NOT EXISTS idx_skills_repo ON skills(repo_id);

-- Full-text search on display_name, description, and extended content
CREATE INDEX IF NOT EXISTS idx_skills_search ON skills
  USING gin(to_tsvector('english',
    display_name || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(extended_content->>'usageTriggers', '')
  ));

-- Tags search (GIN index for array contains queries)
CREATE INDEX IF NOT EXISTS idx_skills_tags ON skills USING gin(tags);

-- Repository lookups by owner/repo
CREATE INDEX IF NOT EXISTS idx_repos_owner_repo ON repositories(owner, repo);

-- Sync logs by repo and date
CREATE INDEX IF NOT EXISTS idx_sync_logs_repo ON sync_logs(repo_id, created_at DESC);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Public read access (no authentication required)
CREATE POLICY "Public read repositories"
  ON repositories FOR SELECT
  USING (true);

CREATE POLICY "Public read skills"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "Public read sync_logs"
  ON sync_logs FOR SELECT
  USING (true);

-- Service role can do everything (for sync operations)
-- Note: Service role bypasses RLS by default, but these are here for documentation
CREATE POLICY "Service write repositories"
  ON repositories FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service write skills"
  ON skills FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service write sync_logs"
  ON sync_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for repositories updated_at
DROP TRIGGER IF EXISTS update_repositories_updated_at ON repositories;
CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SEED DATA (Optional - Initial Repositories)
-- ===========================================

-- Insert the two initial repos if they don't exist
INSERT INTO repositories (owner, repo, display_name, description, featured, skills_path)
VALUES
  ('anthropics', 'skills', 'Anthropic Official Skills', 'Official Claude skills from Anthropic', true, 'skills'),
  ('schwepps', 'skills', 'Schwepps Skills', 'Community skills collection', false, '')
ON CONFLICT (owner, repo) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  skills_path = EXCLUDED.skills_path;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Run these to verify the schema was created correctly:
-- SELECT * FROM repositories;
-- SELECT * FROM skills LIMIT 5;
-- SELECT COUNT(*) FROM skills;
