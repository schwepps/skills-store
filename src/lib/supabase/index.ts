// Client exports
export {
  createClient,
  createServerComponentClient,
  createServerActionClient,
  createAdminClient,
} from './client';

// Query exports
export {
  getAllSkills,
  getSkillsByRepo,
  getSkillByName,
  getRepositories,
  getRepository,
  searchSkills,
  getSyncStatus,
} from './queries';

// Mutation exports
export {
  upsertRepository,
  getRepositoryId,
  upsertSkills,
  deleteRemovedSkills,
  updateSyncStatus,
  createSyncLog,
  getStats,
} from './mutations';

// Type exports
export type {
  Database,
  Repository,
  RepositoryInsert,
  RepositoryUpdate,
  DbSkill,
  DbSkillInsert,
  DbSkillUpdate,
  SyncLog,
  SyncLogInsert,
} from './types';
