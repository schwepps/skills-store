import { SITE_URL } from '@/lib/config/urls';
import type { WebSiteSchema } from './types';

/**
 * Generate WebSite schema with SearchAction
 * Enables site search integration in search engines
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Skills Store',
    url: SITE_URL,
    description:
      'Browse and install Claude AI skills. Find productivity tools, writing assistants, coding helpers, and more.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
