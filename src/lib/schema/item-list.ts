import { SITE_URL } from '@/lib/config/urls';
import type { ItemListSchema, ItemListElement } from './types';

export interface SkillListItem {
  name: string;
  description: string;
  url: string;
}

/**
 * Generate ItemList schema for skill catalogs
 * Helps AI crawlers understand the list of available skills
 */
export function generateItemListSchema(
  skills: SkillListItem[],
  options?: {
    name?: string;
    description?: string;
    maxItems?: number;
  }
): ItemListSchema {
  const { name, description, maxItems = 20 } = options ?? {};

  // Limit items for schema performance
  const limitedSkills = skills.slice(0, maxItems);

  const itemListElement: ItemListElement[] = limitedSkills.map((skill, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'SoftwareApplication',
      name: skill.name,
      description: skill.description,
      url: skill.url.startsWith('http') ? skill.url : `${SITE_URL}${skill.url}`,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: name ?? 'Claude AI Skills',
    description: description ?? 'Browse and install skills for Claude AI',
    numberOfItems: skills.length,
    itemListElement,
  };
}
