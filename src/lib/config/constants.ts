/**
 * Application constants
 *
 * Centralized configuration values used across the application.
 */

/**
 * Default folders to exclude when scanning for skills in repositories
 *
 * These folders are typically system folders, build outputs, or
 * non-skill directories that should be ignored during sync operations.
 */
export const DEFAULT_EXCLUDED_FOLDERS = [
  '.github',
  'scripts',
  'dist',
  'node_modules',
  '.claude',
] as const;

/**
 * Cache durations in seconds
 */
export const CACHE_DURATIONS = {
  /** Default cache for API responses */
  DEFAULT: 3600, // 1 hour
  /** Short cache for frequently changing data */
  SHORT: 300, // 5 minutes
  /** Long cache for rarely changing data */
  LONG: 86400, // 24 hours
} as const;

/**
 * Maximum short description length before truncation
 */
export const MAX_SHORT_DESCRIPTION_LENGTH = 120;
