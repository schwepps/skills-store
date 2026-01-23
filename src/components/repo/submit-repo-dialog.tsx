'use client';

import { useState, useActionState, useMemo, useEffect } from 'react';
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

  // Simulate sync progress when submitting
  useEffect(() => {
    if (isSubmitting) {
      setCurrentSyncStep('fetching');

      // Simulate progression through sync steps
      const timers = [
        setTimeout(() => setCurrentSyncStep('parsing'), 800),
        setTimeout(() => setCurrentSyncStep('saving'), 2000),
      ];

      return () => timers.forEach(clearTimeout);
    }
  }, [isSubmitting]);

  // Update sync step when submission completes
  useEffect(() => {
    if (submitState.status === 'success') {
      setCurrentSyncStep('complete');
    } else if (submitState.status === 'error') {
      setCurrentSyncStep('error');
    }
  }, [submitState.status]);

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
    setTimeout(() => setOpen(true), 100);
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
              currentStep={currentSyncStep}
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
