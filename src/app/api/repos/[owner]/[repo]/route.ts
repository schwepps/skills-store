import { NextRequest, NextResponse } from 'next/server';
import { fetchRepoSkills } from '@/lib/github';
import { getRepoConfig } from '@/config/repos';
import { handleApiError } from '@/lib/api/errors';
import type { RepoApiResponse } from '@/lib/types';

// ISR: Revalidate every hour
export const revalidate = 3600;

interface RouteParams {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

/**
 * GET /api/repos/[owner]/[repo]
 * Returns skills from a specific registered repository
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { owner, repo } = await params;

  // Find repo in registry
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

  try {
    const skills = await fetchRepoSkills(repoConfig);

    const response: RepoApiResponse = {
      repo: repoConfig,
      skills,
      count: skills.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
