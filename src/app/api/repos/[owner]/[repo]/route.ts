import { NextRequest, NextResponse } from 'next/server';
import { getSkillsByRepo } from '@/lib/data';
import { getRepository } from '@/lib/data/repositories';
import { handleApiError } from '@/lib/api/errors';

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
 * Returns skills from a specific repository
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { owner, repo } = await params;

  try {
    // Find repo in database
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

    const skills = await getSkillsByRepo(owner, repo);

    return NextResponse.json({
      repo: repository,
      skills,
      count: skills.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
