/**
 * Timing constants for UI animations and feedback
 * Centralized to ensure consistency across the application
 */

export const TIMING = {
  /** Clipboard copy feedback duration */
  CLIPBOARD_FEEDBACK_MS: 2000,
  /** Step transition delay in multi-step dialogs */
  STEP_TRANSITION_MS: 800,
  /** Delay before showing completion state */
  STEP_COMPLETION_MS: 2000,
  /** Dialog reopen delay after close */
  DIALOG_REOPEN_DELAY_MS: 100,
} as const;
