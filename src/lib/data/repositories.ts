/**
 * Data layer for repositories
 *
 * All data is fetched from Supabase. The GitHub API is only used
 * during sync operations (see lib/sync/sync-service.ts).
 */

import {
  getRepositories as supabaseGetRepositories,
  getRepository as supabaseGetRepository,
} from '@/lib/supabase/queries';
import type { Repository } from '@/lib/supabase/types';

/**
 * Get all repositories
 */
export async function getAllRepositories(): Promise<Repository[]> {
  console.log('[Data] Fetching repositories from Supabase');
  try {
    return await supabaseGetRepositories();
  } catch (error) {
    console.warn('[Data] Failed to fetch repositories, returning empty array:', error);
    return [];
  }
}

/**
 * Get a single repository by owner and repo name
 */
export async function getRepository(
  owner: string,
  repo: string
): Promise<Repository | null> {
  console.log(`[Data] Fetching repository ${owner}/${repo} from Supabase`);
  try {
    return await supabaseGetRepository(owner, repo);
  } catch (error) {
    console.warn(`[Data] Failed to fetch repository ${owner}/${repo}, returning null:`, error);
    return null;
  }
}
