import { NextRequest, NextResponse } from 'next/server';
import { getRepoConfig } from '@/config/repos';
import { buildDownloadUrl } from '@/lib/github/urls';

interface RouteParams {
  params: Promise<{
    params: string[]; // [owner, repo, skill]
  }>;
}

/**
 * GET /api/download/[owner]/[repo]/[skill]
 * Redirects to download-directory.github.io for folder download
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

  const branch = repoConfig.branch || 'main';
  const downloadUrl = buildDownloadUrl(owner, repo, skill, branch);

  // Redirect to download-directory.github.io
  return NextResponse.redirect(downloadUrl);
}
