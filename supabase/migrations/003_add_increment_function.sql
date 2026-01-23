-- Migration: Add increment_download_count function
-- Description: Atomic increment function for download tracking

CREATE OR REPLACE FUNCTION increment_download_count(
  p_owner TEXT,
  p_repo TEXT,
  p_skill_name TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE skills
  SET download_count = download_count + 1
  WHERE owner = p_owner
    AND repo = p_repo
    AND skill_name = p_skill_name;
END;
$$;
