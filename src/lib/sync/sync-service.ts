import { fetchRepoSkills } from '@/lib/github/fetchers';
import { getAllRepositories, getRepository } from '@/lib/data/repositories';
import {
  upsertRepository,
  upsertSkills,
  deleteRemovedSkills,
  updateSyncStatus,
  createSyncLog,
} from '@/lib/supabase/mutations';
import { logger } from '@/lib/utils/logger';
import type { Skill, RepoConfig } from '@/lib/types';
import type { DbSkillInsert, Repository } from '@/lib/supabase/types';

export interface SyncResult {
  owner: string;
  repo: string;
  status: 'success' | 'error';
  skillsAdded: number;
  skillsUpdated: number;
  skillsRemoved: number;
  durationMs: number;
  error?: string;
}

export interface SyncReport {
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  results: SyncResult[];
  summary: {
    totalRepos: number;
    successfulRepos: number;
    failedRepos: number;
    totalSkillsProcessed: number;
  };
}

/**
 * Convert database Repository to RepoConfig for sync operations
 */
function repositoryToConfig(repo: Repository): RepoConfig {
  return {
    owner: repo.owner,
    repo: repo.repo,
    branch: repo.branch || 'main',
    displayName: repo.display_name || `${repo.owner}/${repo.repo}`,
    description: repo.description || `Skills from ${repo.owner}/${repo.repo}`,
    website: repo.website || undefined,
    featured: repo.featured || false,
    config: {
      skillsPath: repo.skills_path || undefined,
      categoryOverrides: (repo.category_overrides as Record<string, string>) || undefined,
      excludeFolders: repo.exclude_folders || undefined,
    },
  };
}

/**
 * Transform app Skill type to database skill insert type
 */
function transformSkillToDbSkill(skill: Skill): Omit<DbSkillInsert, 'repo_id'> {
  return {
    skill_name: skill.skillName,
    display_name: skill.displayName,
    description: skill.metadata.description,
    short_description: skill.shortDescription || null,
    category: skill.metadata.category || null,
    tags: skill.metadata.tags || [],
    author: skill.metadata.author || null,
    version: skill.metadata.version || null,
    license: skill.metadata.license || null,
    github_url: skill.githubUrl,
    download_url: skill.downloadUrl,
    detail_url: skill.detailUrl,
    raw_metadata: skill.metadata as unknown as Record<string, unknown>,
    extended_content: skill.metadata.content || null,
  };
}

/**
 * Sync a single repository from GitHub to Supabase
 */
async function syncRepository(repoConfig: RepoConfig): Promise<SyncResult> {
  const startTime = performance.now();
  const { owner, repo } = repoConfig;

  try {
    logger.log(`[Sync] Starting sync for ${owner}/${repo}...`);

    // 1. Upsert repository record
    const repoId = await upsertRepository({
      owner,
      repo,
      branch: repoConfig.branch || 'main',
      display_name: repoConfig.displayName || null,
      description: repoConfig.description || null,
      website: repoConfig.website || null,
      featured: repoConfig.featured || false,
      skills_path: repoConfig.config?.skillsPath || '',
      category_overrides: repoConfig.config?.categoryOverrides || {},
      exclude_folders: repoConfig.config?.excludeFolders || [],
    });

    // 2. Update status to syncing
    await updateSyncStatus(repoId, 'syncing');

    // 3. Fetch skills from GitHub
    const skills = await fetchRepoSkills(repoConfig);
    logger.log(`[Sync] Fetched ${skills.length} skills from ${owner}/${repo}`);

    // 4. Transform skills to database format
    const dbSkills = skills.map(transformSkillToDbSkill);

    // 5. Upsert skills
    const upsertedCount = await upsertSkills(repoId, dbSkills);
    logger.log(`[Sync] Upserted ${upsertedCount} skills for ${owner}/${repo}`);

    // 6. Delete removed skills
    const currentSkillNames = skills.map((s) => s.skillName);
    const deletedCount = await deleteRemovedSkills(repoId, currentSkillNames);
    if (deletedCount > 0) {
      logger.log(`[Sync] Deleted ${deletedCount} removed skills from ${owner}/${repo}`);
    }

    // 7. Update status to success
    await updateSyncStatus(repoId, 'success');

    const durationMs = Math.round(performance.now() - startTime);

    // 8. Create sync log
    await createSyncLog({
      repo_id: repoId,
      status: 'success',
      skills_added: upsertedCount,
      skills_updated: 0, // Upsert doesn't distinguish between add/update
      skills_removed: deletedCount,
      duration_ms: durationMs,
    });

    logger.log(`[Sync] Completed sync for ${owner}/${repo} in ${durationMs}ms`);

    return {
      owner,
      repo,
      status: 'success',
      skillsAdded: upsertedCount,
      skillsUpdated: 0,
      skillsRemoved: deletedCount,
      durationMs,
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error(`[Sync] Error syncing ${owner}/${repo}:`, errorMessage);

    // Try to update status and create log even on failure
    try {
      const repoId = await upsertRepository({
        owner,
        repo,
        branch: repoConfig.branch || 'main',
      });
      await updateSyncStatus(repoId, 'error', errorMessage);
      await createSyncLog({
        repo_id: repoId,
        status: 'error',
        error: errorMessage,
        duration_ms: durationMs,
      });
    } catch (logError) {
      logger.error(`[Sync] Failed to log error for ${owner}/${repo}:`, logError);
    }

    return {
      owner,
      repo,
      status: 'error',
      skillsAdded: 0,
      skillsUpdated: 0,
      skillsRemoved: 0,
      durationMs,
      error: errorMessage,
    };
  }
}

/**
 * Sync all repositories in the database from GitHub to Supabase
 */
export async function syncAllRepositories(): Promise<SyncReport> {
  const startedAt = new Date().toISOString();
  const startTime = performance.now();

  // Fetch all repos from database
  const repositories = await getAllRepositories();

  logger.log(`[Sync] Starting full sync for ${repositories.length} repositories...`);

  // Convert to configs and sync in parallel
  const repoConfigs = repositories.map(repositoryToConfig);
  const results = await Promise.all(
    repoConfigs.map((config) => syncRepository(config))
  );

  const completedAt = new Date().toISOString();
  const totalDurationMs = Math.round(performance.now() - startTime);

  const successfulRepos = results.filter((r) => r.status === 'success').length;
  const failedRepos = results.filter((r) => r.status === 'error').length;
  const totalSkillsProcessed = results.reduce(
    (sum, r) => sum + r.skillsAdded + r.skillsRemoved,
    0
  );

  console.log(
    `[Sync] Full sync completed in ${totalDurationMs}ms. ` +
      `Success: ${successfulRepos}/${repositories.length} repos, ` +
      `Skills processed: ${totalSkillsProcessed}`
  );

  return {
    startedAt,
    completedAt,
    totalDurationMs,
    results,
    summary: {
      totalRepos: repositories.length,
      successfulRepos,
      failedRepos,
      totalSkillsProcessed,
    },
  };
}

/**
 * Sync a single repository by owner/repo
 * Fetches config from database
 */
export async function syncSingleRepository(
  owner: string,
  repo: string
): Promise<SyncResult> {
  const repository = await getRepository(owner, repo);

  if (!repository) {
    return {
      owner,
      repo,
      status: 'error',
      skillsAdded: 0,
      skillsUpdated: 0,
      skillsRemoved: 0,
      durationMs: 0,
      error: `Repository ${owner}/${repo} not found in database`,
    };
  }

  return syncRepository(repositoryToConfig(repository));
}

/**
 * Sync a dynamically added repository (not yet in database)
 *
 * Used when users add repos via the URL submission form
 */
export async function syncDynamicRepository(
  owner: string,
  repo: string,
  branch: string = 'main',
  displayName?: string
): Promise<SyncResult> {
  // Create a minimal repo config for the sync
  const dynamicConfig: RepoConfig = {
    owner,
    repo,
    branch,
    displayName: displayName || `${owner}/${repo}`,
    description: `Skills from ${owner}/${repo}`,
  };

  return syncRepository(dynamicConfig);
}
