-- Migration: Add download_count column to skills table
-- Description: Track download statistics for skills

ALTER TABLE skills ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Add index for sorting by popularity
CREATE INDEX IF NOT EXISTS idx_skills_download_count ON skills(download_count DESC);

-- Add comment for documentation
COMMENT ON COLUMN skills.download_count IS 'Download count tracked via API';
