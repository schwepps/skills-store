/**
 * Generate a unique ID for accessibility purposes
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announce a message to screen readers
 */
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
