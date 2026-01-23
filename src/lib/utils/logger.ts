/**
 * Development-aware logging utility
 * Suppresses non-error logs in production to keep output clean
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /** Log info messages (development only) */
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },

  /** Log warning messages (development only) */
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },

  /** Log error messages (always - needed for production debugging) */
  error: (...args: unknown[]) => {
    console.error(...args);
  },

  /** Log debug messages (development only) */
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
};
