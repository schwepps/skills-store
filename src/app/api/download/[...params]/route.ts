import { NextRequest, NextResponse } from 'next/server';
import { getRepoConfig } from '@/config/repos';
import { buildDirectDownloadUrl } from '@/lib/github/urls';
import { createAdminClient } from '@/lib/supabase/client';

interface RouteParams {
  params: Promise<{
    params: string[]; // [owner, repo, skill]
  }>;
}

/**
 * GET /api/download/[owner]/[repo]/[skill]
 * Increments download count and redirects to download-directory.github.io
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const segments = (await params).params;

  // Validate URL structure
  if (segments.length !== 3) {
    return NextResponse.json(
      {
        error: 'Invalid download URL',
        message: 'Expected format: /api/download/[owner]/[repo]/[skill]',
      },
      { status: 400 }
    );
  }

  const [owner, repo, skill] = segments;

  // Validate repo is registered
  const repoConfig = getRepoConfig(owner, repo);

  if (!repoConfig) {
    return NextResponse.json(
      {
        error: 'Repository not registered',
        message: `${owner}/${repo} is not in the skills store registry`,
      },
      { status: 404 }
    );
  }

  // Increment download count (fire and forget - don't block redirect)
  // Uses RPC function defined in migration 002_add_download_count.sql
  const supabase = createAdminClient();
  (supabase.rpc as Function)('increment_download_count', {
    p_owner: owner,
    p_repo: repo,
    p_skill_name: skill,
  }).catch((error: Error) => {
    console.error('Failed to increment download count:', error);
  });

  const branch = repoConfig.branch || 'main';
  const skillsPath = repoConfig.config?.skillsPath || '';
  const fullPath = skillsPath ? `${skillsPath}/${skill}` : skill;
  const downloadUrl = buildDirectDownloadUrl(owner, repo, fullPath, branch);

  // Redirect to download-directory.github.io
  return NextResponse.redirect(downloadUrl);
}
