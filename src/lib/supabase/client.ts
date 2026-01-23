import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Get Supabase URL from environment
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
        'Please configure Supabase credentials in .env.local'
    );
  }
  return url;
}

/**
 * Get publishable key with fallback support for legacy key name
 * New format: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sb_publishable_xxx)
 * Legacy format: NEXT_PUBLIC_SUPABASE_ANON_KEY (eyJ...)
 */
function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Missing Supabase publishable key. ' +
        'Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }
  return key;
}

/**
 * Get secret key with fallback support for legacy key name
 * New format: SUPABASE_SECRET_KEY (sb_secret_xxx)
 * Legacy format: SUPABASE_SERVICE_ROLE_KEY (eyJ...)
 */
function getSecretKey(): string {
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'Missing Supabase secret key. ' +
        'Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
  }
  return key;
}

/**
 * Create a Supabase client for browser/client components
 * Uses automatic cookie handling via document.cookie
 */
export function createClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getPublishableKey());
}

/**
 * Create a Supabase client for server components
 * Read-only cookie access (cannot mutate session)
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getPublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server components are read-only
        // Session refresh happens in middleware
      },
    },
  });
}

/**
 * Create a Supabase client for API routes/Server Actions
 * Full cookie access (can mutate session)
 */
export async function createServerActionClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getPublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Create a Supabase admin client for server-side operations
 * Uses secret/service role key - bypasses RLS
 * ONLY use for trusted server-side operations (sync, admin)
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
