import { Skill, Category } from '@/lib/types';

/**
 * Category display configuration
 */
const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  all: { label: 'Toutes', icon: 'LayoutGrid' },
  seo: { label: 'SEO & AI Search', icon: 'Search' },
  marketing: { label: 'Marketing', icon: 'Megaphone' },
  music: { label: 'Musique', icon: 'Music' },
  security: { label: 'Sécurité', icon: 'Shield' },
  development: { label: 'Développement', icon: 'Code' },
  design: { label: 'Design', icon: 'Palette' },
  productivity: { label: 'Productivité', icon: 'Zap' },
  data: { label: 'Data & Analytics', icon: 'BarChart3' },
  document: { label: 'Documents', icon: 'FileText' },
  other: { label: 'Autres', icon: 'Folder' },
};

/**
 * Get category configuration
 */
export function getCategoryConfig(
  categoryId: string
): { label: string; icon: string } {
  return CATEGORY_CONFIG[categoryId] || { label: categoryId, icon: 'Folder' };
}

/**
 * Extract unique categories from skills with counts
 */
export function extractCategories(skills: Skill[]): Category[] {
  const categoryCounts = new Map<string, number>();

  // Count skills per category
  for (const skill of skills) {
    const category = skill.metadata.category || 'other';
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  }

  // Build category list with "all" first
  const categories: Category[] = [
    {
      id: 'all',
      label: CATEGORY_CONFIG.all.label,
      icon: CATEGORY_CONFIG.all.icon,
      count: skills.length,
    },
  ];

  // Add other categories sorted by count
  const sortedCategories = Array.from(categoryCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  for (const [id, count] of sortedCategories) {
    const config = getCategoryConfig(id);
    categories.push({
      id,
      label: config.label,
      icon: config.icon,
      count,
    });
  }

  return categories;
}

/**
 * Get all available category IDs
 */
export function getAllCategoryIds(): string[] {
  return Object.keys(CATEGORY_CONFIG);
}
