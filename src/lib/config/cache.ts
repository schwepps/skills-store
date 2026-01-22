/**
 * Caching configuration for ISR
 */
export const CACHE_CONFIG = {
  /** Skills data cache duration (1 hour) */
  SKILLS: 3600,
  /** Categories cache duration (1 hour) */
  CATEGORIES: 3600,
  /** Repo data cache duration (1 hour) */
  REPOS: 3600,
  /** Static pages (4 hours) */
  PAGES: 14400,
} as const;

/**
 * GitHub API rate limit info
 */
export const RATE_LIMIT = {
  /** Requests per hour without token */
  UNAUTHENTICATED: 60,
  /** Requests per hour with token */
  AUTHENTICATED: 5000,
  /** Reserve buffer for safety */
  BUFFER: 10,
} as const;
