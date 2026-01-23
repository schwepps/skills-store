/**
 * Data layer for skills
 *
 * All data is fetched from Supabase. The GitHub API is only used
 * during sync operations (see lib/sync/sync-service.ts).
 */

import {
  getAllSkills as supabaseGetAllSkills,
  getSkillsByRepo as supabaseGetSkillsByRepo,
  getSkillByName as supabaseGetSkillByName,
  searchSkills as supabaseSearchSkills,
} from '@/lib/supabase/queries';
import type { Skill } from '@/lib/types';

/**
 * Get all skills from all registered repositories
 */
export async function getAllSkills(): Promise<Skill[]> {
  console.log('[Data] Fetching all skills from Supabase');
  try {
    return await supabaseGetAllSkills();
  } catch (error) {
    console.warn('[Data] Failed to fetch skills, returning empty array:', error);
    return [];
  }
}

/**
 * Get skills for a specific repository
 */
export async function getSkillsByRepo(
  owner: string,
  repo: string
): Promise<Skill[]> {
  console.log(`[Data] Fetching skills for ${owner}/${repo} from Supabase`);
  try {
    return await supabaseGetSkillsByRepo(owner, repo);
  } catch (error) {
    console.warn(`[Data] Failed to fetch skills for ${owner}/${repo}, returning empty array:`, error);
    return [];
  }
}

/**
 * Get a single skill by name
 */
export async function getSkillByName(
  owner: string,
  repo: string,
  skillName: string
): Promise<Skill | null> {
  console.log(`[Data] Fetching skill ${skillName} from Supabase`);
  try {
    return await supabaseGetSkillByName(owner, repo, skillName);
  } catch (error) {
    console.warn(`[Data] Failed to fetch skill ${skillName}, returning null:`, error);
    return null;
  }
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
  console.log(`[Data] Searching skills: "${query}"`);
  try {
    return await supabaseSearchSkills(query, options);
  } catch (error) {
    console.warn(`[Data] Failed to search skills for "${query}", returning empty array:`, error);
    return [];
  }
}
