/**
 * Supabase configuration checks
 *
 * The app requires Supabase to be configured. These functions check for
 * proper configuration and support both new and legacy key formats.
 *
 * New format: sb_publishable_xxx / sb_secret_xxx
 * Legacy format: eyJ... (JWT-based anon/service_role keys)
 */

/**
 * Check if Supabase is properly configured for read operations
 * Returns true if URL and publishable key are set
 * Supports both new (PUBLISHABLE_KEY) and legacy (ANON_KEY) formats
 */
export function isSupabaseConfigured(): boolean {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return hasUrl && hasKey;
}

/**
 * Check if admin/write operations are available
 * Returns true if URL and secret key are set
 * Supports both new (SECRET_KEY) and legacy (SERVICE_ROLE_KEY) formats
 */
export function isAdminConfigured(): boolean {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!(
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  return hasUrl && hasKey;
}

/**
 * Validate Supabase configuration at startup
 * Throws descriptive error if not configured
 */
export function validateSupabaseConfig(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Please set the following environment variables:\n' +
        '  - NEXT_PUBLIC_SUPABASE_URL\n' +
        '  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy: NEXT_PUBLIC_SUPABASE_ANON_KEY)\n' +
        '\nSee README.md for setup instructions.'
    );
  }
}
