import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/data/repositories';
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

  // Validate repo exists in database
  const repository = await getRepository(owner, repo);

  if (!repository) {
    return NextResponse.json(
      {
        error: 'Repository not found',
        message: `${owner}/${repo} is not in the skills store`,
      },
      { status: 404 }
    );
  }

  // Increment download count (fire and forget - don't block redirect)
  // Type assertion needed: custom RPC function not in generated Supabase types
  const supabase = createAdminClient();
  type RpcFn = (
    name: string,
    params: Record<string, string>
  ) => Promise<{ error: Error | null }>;
  (supabase.rpc as unknown as RpcFn)('increment_download_count', {
    p_owner: owner,
    p_repo: repo,
    p_skill_name: skill,
  }).then(({ error }) => {
    if (error) {
      console.error('Failed to increment download count:', error);
    }
  });

  const branch = repository.branch || 'main';
  const skillsPath = repository.skills_path || '';
  const fullPath = skillsPath ? `${skillsPath}/${skill}` : skill;
  const downloadUrl = buildDirectDownloadUrl(owner, repo, fullPath, branch);

  // Redirect to download-directory.github.io
  return NextResponse.redirect(downloadUrl);
}
