import { createServerComponentClient } from './client';
import type { Repository, DbSkill } from './types';
import type { Skill, SkillContent } from '@/lib/types';

/**
 * Handle Supabase query errors consistently
 */
function handleSupabaseError(
  error: { code?: string; message?: string },
  context: string
): never {
  console.error(`[Supabase] ${context}:`, error);
  throw error;
}

/**
 * Type for skill rows with joined repository data
 */
type SkillRowWithRepo = DbSkill & {
  repositories: Pick<Repository, 'owner' | 'repo' | 'branch' | 'display_name'>;
};

/**
 * Transform database skill to app Skill type
 */
function transformDbSkillToSkill(
  dbSkill: DbSkill,
  repo: Pick<Repository, 'owner' | 'repo' | 'branch' | 'display_name'>
): Skill {
  // Extract extended content if available
  const extendedContent = dbSkill.extended_content as SkillContent | null;

  return {
    id: `${repo.owner}/${repo.repo}/${dbSkill.skill_name}`,
    owner: repo.owner,
    repo: repo.repo,
    skillName: dbSkill.skill_name,
    metadata: {
      name: dbSkill.display_name,
      description: dbSkill.description,
      category: dbSkill.category || undefined,
      tags: dbSkill.tags || [],
      author: dbSkill.author || undefined,
      version: dbSkill.version || undefined,
      license: dbSkill.license || undefined,
      content: extendedContent || undefined,
    },
    githubUrl: dbSkill.github_url,
    downloadUrl: dbSkill.download_url,
    rawSkillMdUrl: '', // Can be reconstructed if needed
    detailUrl: dbSkill.detail_url,
    displayName: dbSkill.display_name,
    shortDescription: dbSkill.short_description || '',
    repoDisplayName: repo.display_name || `${repo.owner}/${repo.repo}`,
    branch: repo.branch || 'main',
    downloadCount: dbSkill.download_count || 0,
  };
}

/**
 * Transform skill rows with joined repository data to Skill array
 */
function transformSkillRows(rows: SkillRowWithRepo[]): Skill[] {
  return rows.map((row) => {
    const { repositories, ...skillData } = row;
    return transformDbSkillToSkill(skillData, repositories);
  });
}

/**
 * Shared select query for skills with repository join
 */
const SKILLS_WITH_REPO_SELECT = `
  *,
  repositories!inner (
    owner,
    repo,
    branch,
    display_name
  )
`;

/**
 * Get all skills with repository info
 */
export async function getAllSkills(): Promise<Skill[]> {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('skills')
    .select(SKILLS_WITH_REPO_SELECT)
    .order('display_name');

  if (error) {
    handleSupabaseError(error, 'Error fetching skills');
  }

  return data ? transformSkillRows(data as SkillRowWithRepo[]) : [];
}

/**
 * Get skills for a specific repository
 */
export async function getSkillsByRepo(
  owner: string,
  repo: string
): Promise<Skill[]> {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('skills')
    .select(SKILLS_WITH_REPO_SELECT)
    .eq('repositories.owner', owner)
    .eq('repositories.repo', repo)
    .order('display_name');

  if (error) {
    handleSupabaseError(error, `Error fetching skills for ${owner}/${repo}`);
  }

  return data ? transformSkillRows(data as SkillRowWithRepo[]) : [];
}

/**
 * Get a single skill by name
 */
export async function getSkillByName(
  owner: string,
  repo: string,
  skillName: string
): Promise<Skill | null> {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('skills')
    .select(SKILLS_WITH_REPO_SELECT)
    .eq('repositories.owner', owner)
    .eq('repositories.repo', repo)
    .eq('skill_name', skillName)
    .single();

  if (error) {
    // Not found is an expected case, not an error
    if (error.code === 'PGRST116') {
      return null;
    }
    handleSupabaseError(error, `Error fetching skill ${skillName}`);
  }

  if (!data) return null;

  const { repositories, ...skillData } = data as SkillRowWithRepo;
  return transformDbSkillToSkill(skillData, repositories);
}

/**
 * Get all repositories
 */
export async function getRepositories(): Promise<Repository[]> {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('repositories')
    .select('*')
    .order('featured', { ascending: false })
    .order('owner');

  if (error) {
    handleSupabaseError(error, 'Error fetching repositories');
  }

  return (data || []) as Repository[];
}

/**
 * Get a single repository
 */
export async function getRepository(
  owner: string,
  repo: string
): Promise<Repository | null> {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('repositories')
    .select('*')
    .eq('owner', owner)
    .eq('repo', repo)
    .single();

  if (error) {
    // Not found is an expected case, not an error
    if (error.code === 'PGRST116') {
      return null;
    }
    handleSupabaseError(error, `Error fetching repository ${owner}/${repo}`);
  }

  return data as Repository;
}

/**
 * Search skills using full-text search
 */
export async function searchSkills(
  query: string,
  options?: {
    category?: string;
    repoOwner?: string;
    repoName?: string;
    limit?: number;
  }
): Promise<Skill[]> {
  const supabase = await createServerComponentClient();

  let queryBuilder = supabase
    .from('skills')
    .select(SKILLS_WITH_REPO_SELECT);

  // Apply full-text search if query provided
  if (query && query.trim()) {
    queryBuilder = queryBuilder.textSearch('display_name', query, {
      type: 'websearch',
    });
  }

  // Apply category filter
  if (options?.category && options.category !== 'all') {
    queryBuilder = queryBuilder.eq('category', options.category);
  }

  // Apply repo filter
  if (options?.repoOwner && options?.repoName) {
    queryBuilder = queryBuilder
      .eq('repositories.owner', options.repoOwner)
      .eq('repositories.repo', options.repoName);
  }

  // Apply limit
  if (options?.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }

  const { data, error } = await queryBuilder.order('display_name');

  if (error) {
    handleSupabaseError(error, 'Error searching skills');
  }

  return data ? transformSkillRows(data as SkillRowWithRepo[]) : [];
}

/**
 * Get sync status for all repositories
 */
export async function getSyncStatus(): Promise<
  Array<{
    owner: string;
    repo: string;
    syncStatus: string;
    lastSyncedAt: string | null;
    syncError: string | null;
  }>
> {
  const supabase = await createServerComponentClient();

  const { data, error } = await supabase
    .from('repositories')
    .select('owner, repo, sync_status, last_synced_at, sync_error')
    .order('owner');

  if (error) {
    handleSupabaseError(error, 'Error fetching sync status');
  }

  return (data || []).map((row) => ({
    owner: row.owner,
    repo: row.repo,
    syncStatus: row.sync_status,
    lastSyncedAt: row.last_synced_at,
    syncError: row.sync_error,
  }));
}
