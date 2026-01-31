import { SITE_URL } from '@/lib/config/urls';
import type { BreadcrumbListSchema, BreadcrumbItem } from './types';

export interface BreadcrumbInput {
  name: string;
  url?: string;
}

/**
 * Generate BreadcrumbList schema for navigation context
 * Helps AI crawlers understand page hierarchy
 */
export function generateBreadcrumbSchema(items: BreadcrumbInput[]): BreadcrumbListSchema {
  const itemListElement: BreadcrumbItem[] = items.map((item, index) => {
    const breadcrumb: BreadcrumbItem = {
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
    };

    // Only add item URL if not the last item (current page)
    if (item.url && index < items.length - 1) {
      breadcrumb.item = item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`;
    }

    return breadcrumb;
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

/**
 * Generate breadcrumbs for skill detail page
 */
export function generateSkillBreadcrumbs(
  repoDisplayName: string,
  repoUrl: string,
  skillName: string
): BreadcrumbListSchema {
  return generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: repoDisplayName, url: repoUrl },
    { name: skillName },
  ]);
}

/**
 * Generate breadcrumbs for repo detail page
 */
export function generateRepoBreadcrumbs(repoDisplayName: string): BreadcrumbListSchema {
  return generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: repoDisplayName }]);
}
