import { NextResponse } from 'next/server';
import { registeredRepos, getFeaturedRepos } from '@/config/repos';

/**
 * GET /api/repos
 * Returns list of registered repositories
 */
export async function GET() {
  return NextResponse.json({
    repos: registeredRepos,
    featured: getFeaturedRepos(),
    count: registeredRepos.length,
  });
}
