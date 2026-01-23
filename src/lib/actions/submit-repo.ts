'use server';

import { revalidatePath } from 'next/cache';
import {
  validateRepository,
  parseGitHubUrl,
  type ValidationResult,
} from '@/lib/validation/repo-validator';
import { upsertRepository } from '@/lib/supabase/mutations';
import { syncDynamicRepository } from '@/lib/sync/sync-service';

/**
 * State for repository submission actions
 */
export interface SubmitRepoState {
  status: 'idle' | 'validating' | 'submitting' | 'success' | 'error';
  validation?: ValidationResult;
  error?: string;
}

/**
 * Server Action to validate a repository URL
 *
 * Returns validation results with discovered skills for preview
 */
export async function validateRepoAction(
  _prevState: SubmitRepoState,
  formData: FormData
): Promise<SubmitRepoState> {
  const url = formData.get('url') as string;

  if (!url?.trim()) {
    return { status: 'error', error: 'Please enter a repository URL' };
  }

  try {
    const validation = await validateRepository(url);

    if (!validation.success) {
      return { status: 'error', validation, error: validation.error };
    }

    return { status: 'idle', validation };
  } catch (error) {
    console.error('[Action] Error validating repository:', error);
    return {
      status: 'error',
      error: 'Failed to validate repository. Please try again.',
    };
  }
}

/**
 * Server Action to submit a validated repository
 *
 * Adds the repository to the database and triggers a sync
 */
export async function submitRepoAction(
  _prevState: SubmitRepoState,
  formData: FormData
): Promise<SubmitRepoState> {
  const url = formData.get('url') as string;
  const displayName = formData.get('displayName') as string;

  if (!url?.trim()) {
    return { status: 'error', error: 'Repository URL is required' };
  }

  // Re-validate before submission to ensure data is still valid
  const validation = await validateRepository(url);
  if (!validation.success || !validation.data) {
    return { status: 'error', validation, error: validation.error };
  }

  const { owner, repo, branch } = validation.data;

  try {
    // Add repository to database
    await upsertRepository({
      owner,
      repo,
      branch,
      display_name: displayName?.trim() || `${owner}/${repo}`,
      featured: false,
      sync_status: 'pending',
    });

    // Trigger sync to populate skills
    const syncResult = await syncDynamicRepository(owner, repo, branch, displayName);

    if (syncResult.status === 'error') {
      console.error('[Action] Sync failed:', syncResult.error);
      // Don't fail the submission, the repo is added and can be synced later
    }

    // Revalidate pages
    revalidatePath('/');
    revalidatePath(`/repo/${owner}/${repo}`);

    return {
      status: 'success',
      validation,
    };
  } catch (error) {
    console.error('[Action] Error submitting repository:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to add repository',
    };
  }
}
