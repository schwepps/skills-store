import { NextResponse } from 'next/server';
import { getSyncStatus, getStats } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/config/features';

// Cache for 5 minutes
export const revalidate = 300;

/**
 * GET /api/sync/status
 * Returns sync status for all repositories
 */
export async function GET() {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      message: 'Supabase not configured - using GitHub API directly',
    });
  }

  try {
    // Get sync status for all repos
    const [syncStatus, stats] = await Promise.all([
      getSyncStatus(),
      getStats(),
    ]);

    return NextResponse.json({
      configured: true,
      stats: {
        repoCount: stats.repoCount,
        skillCount: stats.skillCount,
        lastSync: stats.lastSync,
      },
      repositories: syncStatus.map((repo) => ({
        owner: repo.owner,
        repo: repo.repo,
        status: repo.syncStatus,
        lastSyncedAt: repo.lastSyncedAt,
        error: repo.syncError,
      })),
    });
  } catch (error) {
    console.error('[Sync Status API] Error:', error);

    return NextResponse.json(
      {
        configured: true,
        error: 'Failed to fetch sync status',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
