'use client';

import { Check, Loader2, XCircle, GitBranch, FileSearch, Database, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SyncStep = 'fetching' | 'parsing' | 'saving' | 'complete' | 'error';

interface SyncProgressProps {
  /** Current sync status */
  status: 'pending' | 'syncing' | 'success' | 'error';
  /** Number of skills found during validation */
  skillsFound?: number;
  /** Error message if sync failed */
  error?: string;
  /** Current step in the sync process */
  currentStep?: SyncStep;
}

interface StepConfig {
  id: SyncStep;
  label: string;
  icon: typeof Loader2;
}

const STEPS: StepConfig[] = [
  { id: 'fetching', label: 'Fetching repository...', icon: GitBranch },
  { id: 'parsing', label: 'Parsing skills...', icon: FileSearch },
  { id: 'saving', label: 'Saving to database...', icon: Database },
  { id: 'complete', label: 'Complete!', icon: PartyPopper },
];

function getStepState(
  stepId: SyncStep,
  currentStep: SyncStep,
  status: SyncProgressProps['status']
): 'pending' | 'active' | 'complete' | 'error' {
  const stepIndex = STEPS.findIndex((s) => s.id === stepId);
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  if (status === 'error' && stepId === currentStep) {
    return 'error';
  }

  if (status === 'success') {
    if (stepIndex <= currentIndex) return 'complete';
  }

  if (stepIndex < currentIndex) return 'complete';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

function mapStatusToStep(status: SyncProgressProps['status']): SyncStep {
  switch (status) {
    case 'pending':
      return 'fetching';
    case 'syncing':
      return 'parsing';
    case 'success':
      return 'complete';
    case 'error':
      return 'fetching';
    default:
      return 'fetching';
  }
}

export function SyncProgress({
  status,
  skillsFound,
  error,
  currentStep,
}: SyncProgressProps) {
  const activeStep = currentStep || mapStatusToStep(status);

  return (
    <div className="py-6">
      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const state = getStepState(step.id, activeStep, status);
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex items-center gap-4">
              {/* Step indicator */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  state === 'complete' &&
                    'border-green-500 bg-green-500 text-white',
                  state === 'active' &&
                    'border-primary bg-primary/10 text-primary',
                  state === 'pending' &&
                    'border-muted-foreground/30 text-muted-foreground/50',
                  state === 'error' &&
                    'border-destructive bg-destructive text-white'
                )}
              >
                {state === 'complete' ? (
                  <Check className="h-5 w-5" />
                ) : state === 'active' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : state === 'error' ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1">
                <p
                  className={cn(
                    'font-medium transition-colors',
                    state === 'complete' && 'text-green-600 dark:text-green-400',
                    state === 'active' && 'text-foreground',
                    state === 'pending' && 'text-muted-foreground/50',
                    state === 'error' && 'text-destructive'
                  )}
                >
                  {step.label}
                </p>

                {/* Show skill count on parsing step */}
                {step.id === 'parsing' && state === 'active' && skillsFound && (
                  <p className="text-sm text-muted-foreground">
                    Processing {skillsFound} skill{skillsFound !== 1 ? 's' : ''}...
                  </p>
                )}

                {/* Show success message on complete */}
                {step.id === 'complete' && state === 'complete' && skillsFound && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {skillsFound} skill{skillsFound !== 1 ? 's' : ''} added successfully
                  </p>
                )}

                {/* Show error message */}
                {state === 'error' && error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              {/* Connection line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'absolute left-5 ml-px h-8 w-0.5 translate-y-10',
                    state === 'complete'
                      ? 'bg-green-500'
                      : 'bg-muted-foreground/20'
                  )}
                  style={{ display: 'none' }} // Hidden for now, can be enabled for vertical layout
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
