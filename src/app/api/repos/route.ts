import { NextResponse } from 'next/server';
import { getAllRepositories } from '@/lib/data/repositories';

// ISR: Revalidate every hour
export const revalidate = 3600;

/**
 * GET /api/repos
 * Returns list of repositories from database
 */
export async function GET() {
  const repos = await getAllRepositories();
  const featured = repos.filter((r) => r.featured);

  return NextResponse.json({
    repos,
    featured,
    count: repos.length,
  });
}
