import { NextRequest, NextResponse } from 'next/server';
import { syncAllRepositories, syncSingleRepository } from '@/lib/sync/sync-service';
import { isAdminConfigured } from '@/lib/config/features';
import { logger } from '@/lib/utils/logger';

// No caching for sync endpoint
export const dynamic = 'force-dynamic';

/**
 * Verify authorization for sync operations
 *
 * Supports:
 * - Vercel cron jobs (CRON_SECRET)
 * - Manual sync (SYNC_SECRET)
 * - Development mode (no secret required)
 */
function isAuthorized(request: NextRequest): boolean {
  const syncSecret = process.env.SYNC_SECRET;
  const cronSecret = process.env.CRON_SECRET;

  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    // Check for Vercel cron secret (auto-set by Vercel)
    if (cronSecret && token === cronSecret) {
      logger.log('[Sync API] Authorized via CRON_SECRET');
      return true;
    }

    // Check for manual sync secret
    if (syncSecret && token === syncSecret) {
      logger.log('[Sync API] Authorized via SYNC_SECRET');
      return true;
    }
  }

  // Check X-Sync-Secret header (alternative for manual sync)
  const secretHeader = request.headers.get('X-Sync-Secret');
  if (syncSecret && secretHeader === syncSecret) {
    logger.log('[Sync API] Authorized via X-Sync-Secret header');
    return true;
  }

  // Allow in development mode if no secrets configured
  if (!syncSecret && !cronSecret && process.env.NODE_ENV === 'development') {
    logger.warn('[Sync API] No secrets configured - allowing request in dev mode');
    return true;
  }

  return false;
}

/**
 * POST /api/sync
 * Triggers a full sync of all repositories from GitHub to Supabase
 *
 * Query params:
 * - owner: (optional) Sync only this owner's repo
 * - repo: (optional) Sync only this repo (requires owner)
 *
 * Headers:
 * - Authorization: Bearer <SYNC_SECRET>
 * - OR X-Sync-Secret: <SYNC_SECRET>
 */
export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing authorization' },
      { status: 401 }
    );
  }

  // Check if Supabase is configured
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error: 'Not configured',
        message: 'Supabase admin credentials not configured',
      },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    // Single repo sync
    if (owner && repo) {
      console.log(`[Sync API] Starting single repo sync for ${owner}/${repo}`);
      const result = await syncSingleRepository(owner, repo);

      return NextResponse.json({
        message: `Sync ${result.status} for ${owner}/${repo}`,
        result,
      });
    }

    // Full sync
    logger.log('[Sync API] Starting full sync...');
    const report = await syncAllRepositories();

    return NextResponse.json({
      message: 'Sync completed',
      report,
    });
  } catch (error) {
    logger.error('[Sync API] Error:', error);

    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync
 * Returns sync configuration status (no auth required)
 */
export async function GET() {
  const isConfigured = isAdminConfigured();
  const hasSyncSecret = !!process.env.SYNC_SECRET;

  return NextResponse.json({
    configured: isConfigured,
    hasSyncSecret,
    message: isConfigured
      ? 'Sync is ready. POST to this endpoint to trigger sync.'
      : 'Supabase admin credentials not configured.',
  });
}
