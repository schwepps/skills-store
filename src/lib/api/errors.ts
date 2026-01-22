import { NextResponse } from 'next/server';
import { GitHubRateLimitError, GitHubApiError } from '@/lib/errors';

/**
 * Handle errors in API routes consistently
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof GitHubRateLimitError) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `GitHub API rate limit exceeded. Resets at ${error.resetTime.toISOString()}`,
        resetAt: error.resetTime.toISOString(),
      },
      { status: 429 }
    );
  }

  if (error instanceof GitHubApiError) {
    return NextResponse.json(
      {
        error: 'GitHub API error',
        message: error.message,
        status: error.status,
      },
      { status: error.status >= 500 ? 502 : error.status }
    );
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    },
    { status: 500 }
  );
}
