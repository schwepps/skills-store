import { SITE_URL } from '@/lib/config/urls';
import type { OrganizationSchema } from './types';

/**
 * Generate Organization schema for Skills Store
 * Used on homepage to help AI crawlers understand the site
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Skills Store',
    description:
      'Discover and install Claude AI skills easily. Browse curated skills from the community and add superpowers to Claude in just a few clicks.',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    sameAs: ['https://github.com/schwepps/skills-store'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      url: 'https://github.com/schwepps/skills-store/discussions',
    },
  };
}
