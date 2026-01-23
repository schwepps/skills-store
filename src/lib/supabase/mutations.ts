import { createAdminClient } from './client';
import type { DbSkillInsert, RepositoryInsert, SyncLogInsert } from './types';

/**
 * Upsert a repository
 * Returns the repository ID
 */
export async function upsertRepository(
  repo: RepositoryInsert
): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('repositories')
    .upsert(repo, {
      onConflict: 'owner,repo',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Supabase] Error upserting repository:', error);
    throw error;
  }

  return data.id;
}

/**
 * Get repository ID by owner and repo name
 */
export async function getRepositoryId(
  owner: string,
  repo: string
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('repositories')
    .select('id')
    .eq('owner', owner)
    .eq('repo', repo)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data?.id || null;
}

/**
 * Upsert multiple skills for a repository
 * Returns count of upserted skills
 */
export async function upsertSkills(
  repoId: string,
  skills: Omit<DbSkillInsert, 'repo_id'>[]
): Promise<number> {
  const supabase = createAdminClient();

  const skillsWithRepoId = skills.map((skill) => ({
    ...skill,
    repo_id: repoId,
  }));

  const { data, error } = await supabase
    .from('skills')
    .upsert(skillsWithRepoId, {
      onConflict: 'repo_id,skill_name',
    })
    .select('id');

  if (error) {
    console.error('[Supabase] Error upserting skills:', error);
    throw error;
  }

  return data?.length || 0;
}

/**
 * Delete skills that are no longer in the repository
 * Returns count of deleted skills
 */
export async function deleteRemovedSkills(
  repoId: string,
  currentSkillNames: string[]
): Promise<number> {
  const supabase = createAdminClient();

  // If no skills, delete all for this repo
  if (currentSkillNames.length === 0) {
    const { data, error } = await supabase
      .from('skills')
      .delete()
      .eq('repo_id', repoId)
      .select('id');

    if (error) {
      console.error('[Supabase] Error deleting skills:', error);
      throw error;
    }

    return data?.length || 0;
  }

  // Delete skills not in the current list
  const { data, error } = await supabase
    .from('skills')
    .delete()
    .eq('repo_id', repoId)
    .not('skill_name', 'in', `(${currentSkillNames.map((n) => `"${n}"`).join(',')})`)
    .select('id');

  if (error) {
    console.error('[Supabase] Error deleting removed skills:', error);
    throw error;
  }

  return data?.length || 0;
}

/**
 * Update repository sync status
 */
export async function updateSyncStatus(
  repoId: string,
  status: 'pending' | 'syncing' | 'success' | 'error',
  error?: string
): Promise<void> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {
    sync_status: status,
    sync_error: error || null,
  };

  if (status === 'success') {
    updateData.last_synced_at = new Date().toISOString();
    updateData.sync_error = null;
  }

  const { error: updateError } = await supabase
    .from('repositories')
    .update(updateData)
    .eq('id', repoId);

  if (updateError) {
    console.error('[Supabase] Error updating sync status:', updateError);
    throw updateError;
  }
}

/**
 * Create a sync log entry
 */
export async function createSyncLog(log: SyncLogInsert): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from('sync_logs').insert(log);

  if (error) {
    console.error('[Supabase] Error creating sync log:', error);
    throw error;
  }
}

/**
 * Get repository count and skill count
 */
export async function getStats(): Promise<{
  repoCount: number;
  skillCount: number;
  lastSync: string | null;
}> {
  const supabase = createAdminClient();

  const [repoResult, skillResult, syncResult] = await Promise.all([
    supabase.from('repositories').select('id', { count: 'exact', head: true }),
    supabase.from('skills').select('id', { count: 'exact', head: true }),
    supabase
      .from('repositories')
      .select('last_synced_at')
      .not('last_synced_at', 'is', null)
      .order('last_synced_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  return {
    repoCount: repoResult.count || 0,
    skillCount: skillResult.count || 0,
    lastSync: syncResult.data?.last_synced_at || null,
  };
}
