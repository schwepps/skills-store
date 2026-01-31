/**
 * URL configuration for consistent URL handling across the application
 */

/** Production site URL */
export const PRODUCTION_URL = 'https://skills-store.xyz';

/** Development site URL */
export const DEVELOPMENT_URL = 'http://localhost:3000';

/**
 * Get the site base URL from environment or fallback
 * Uses localhost in development, production URL otherwise
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === 'development' ? DEVELOPMENT_URL : PRODUCTION_URL);

/**
 * Create an absolute URL from a relative path
 * @param path - Relative path (should start with /)
 * @returns Absolute URL
 */
export function getAbsoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
