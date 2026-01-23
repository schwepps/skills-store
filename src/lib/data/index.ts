/**
 * Unified Data Layer
 *
 * This module provides a consistent interface for fetching data from Supabase.
 * The GitHub API is only used during sync operations (see lib/sync/).
 *
 * Usage:
 * ```typescript
 * import { getAllSkills, getSkillsByRepo, searchSkills } from '@/lib/data';
 * ```
 */

// Skills
export {
  getAllSkills,
  getSkillsByRepo,
  getSkillByName,
  searchSkills,
} from './skills';

// Repositories
export { getAllRepositories, getRepository } from './repositories';
