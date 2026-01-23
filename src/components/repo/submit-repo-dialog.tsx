'use client';

import { useState, useActionState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  validateRepoAction,
  submitRepoAction,
  type SubmitRepoState,
} from '@/lib/actions/submit-repo';
import { cn } from '@/lib/utils';
import { TIMING } from '@/lib/config/timing';
import { SyncProgress, type SyncStep } from '@/components/sync/sync-progress';

type DialogStep = 'input' | 'preview' | 'syncing' | 'success';

export function SubmitRepoDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [currentSyncStep, setCurrentSyncStep] = useState<SyncStep>('fetching');

  const [validateState, validateAction, isValidating] = useActionState<
    SubmitRepoState,
    FormData
  >(validateRepoAction, { status: 'idle' });

  const [submitState, submitAction, isSubmitting] = useActionState<
    SubmitRepoState,
    FormData
  >(submitRepoAction, { status: 'idle' });

  const validation = validateState.validation || submitState.validation;
  const skills = validation?.data?.skills || [];
  const validSkills = skills.filter((s) => s.valid);

  // Track submission start time for step progression
  const submissionStartRef = useRef<number | null>(null);

  // Update submission start time when submitting begins
  useEffect(() => {
    if (isSubmitting && !submissionStartRef.current) {
      submissionStartRef.current = Date.now();
    } else if (!isSubmitting) {
      submissionStartRef.current = null;
    }
  }, [isSubmitting]);

  // Simulate sync progress with timer-based progression
  useEffect(() => {
    if (!isSubmitting) return;

    const timers = [
      setTimeout(() => setCurrentSyncStep('parsing'), TIMING.STEP_TRANSITION_MS),
      setTimeout(() => setCurrentSyncStep('saving'), TIMING.STEP_COMPLETION_MS),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isSubmitting]);

  // Derive final sync step from submission result (runs after timers)
  const derivedSyncStep = useMemo<SyncStep>(() => {
    if (submitState.status === 'success') return 'complete';
    if (submitState.status === 'error') return 'error';
    return currentSyncStep;
  }, [submitState.status, currentSyncStep]);

  // Use derived step for display
  const displaySyncStep = derivedSyncStep;

  // Derive step from state
  const step = useMemo<DialogStep>(() => {
    if (submitState.status === 'success') {
      return 'success';
    }
    if (isSubmitting) {
      return 'syncing';
    }
    if (validateState.validation?.success) {
      return 'preview';
    }
    return 'input';
  }, [submitState.status, isSubmitting, validateState.validation?.success]);

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setUrl('');
      setCurrentSyncStep('fetching');
      // State resets automatically when dialog reopens because
      // the action states remain, but we could trigger a page refresh
      // or use a key to force remount if needed
    }
  };

  // Go back to input step (requires resetting validate state)
  const handleBack = () => {
    // We need to reload the page or use some reset mechanism
    // For now, close and reopen the dialog
    setOpen(false);
    setUrl('');
    setCurrentSyncStep('fetching');
    setTimeout(() => setOpen(true), TIMING.DIALOG_REOPEN_DELAY_MS);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Repository</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a Skill Repository</DialogTitle>
          <DialogDescription>
            Paste a public GitHub repository URL containing skills with SKILL.md
            files.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <form action={validateAction} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="url"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Repository URL
              </label>
              <Input
                id="url"
                name="url"
                placeholder="https://github.com/owner/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            {validateState.error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{validateState.error}</span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isValidating || !url.trim()}>
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Validate'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'preview' && validation?.data && (
          <form action={submitAction} className="space-y-4">
            <input
              type="hidden"
              name="url"
              value={`https://github.com/${validation.data.owner}/${validation.data.repo}`}
            />

            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="text-sm font-medium leading-none"
              >
                Display Name
              </label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={`${validation.data.owner}/${validation.data.repo}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Discovered Skills ({validSkills.length})
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border p-2">
                {skills.map((skill) => (
                  <div
                    key={skill.folder}
                    className={cn(
                      'p-2 rounded-md border text-sm',
                      skill.valid
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                        : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {skill.valid ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                      )}
                      <span className="font-medium">{skill.name}</span>
                    </div>
                    {skill.description && (
                      <p className="text-muted-foreground mt-1 pl-6 line-clamp-2">
                        {skill.description}
                      </p>
                    )}
                    {skill.error && (
                      <p className="text-red-600 dark:text-red-400 mt-1 pl-6 text-xs">
                        {skill.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {submitState.error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{submitState.error}</span>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  `Add ${validSkills.length} Skills`
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'syncing' && (
          <div className="py-2">
            <SyncProgress
              status={submitState.status === 'error' ? 'error' : 'syncing'}
              skillsFound={validSkills.length}
              error={submitState.error}
              currentStep={displaySyncStep}
            />
            {submitState.error && (
              <DialogFooter className="mt-4">
                <Button type="button" variant="ghost" onClick={handleBack}>
                  Try Again
                </Button>
              </DialogFooter>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium">Repository Added!</p>
            <p className="text-muted-foreground mt-2">
              {validSkills.length} skills have been added to the store.
            </p>
            <Button className="mt-4" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
