/**
 * Available categories for skill requests
 * Shared between server actions and client components
 */
export const SKILL_CATEGORIES = [
  'Development',
  'Productivity',
  'Marketing',
  'SEO',
  'Writing',
  'Other',
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
