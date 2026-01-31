import { SITE_URL } from '@/lib/config/urls';
import type { SoftwareApplicationSchema } from './types';

export interface SkillSchemaInput {
  name: string;
  description: string;
  url: string;
  author?: string;
  version?: string;
  downloadCount?: number;
  tags?: string[];
  category?: string;
}

/**
 * Generate SoftwareApplication schema for individual skill pages
 * Helps AI crawlers understand this is a software/tool product
 */
export function generateSoftwareApplicationSchema(
  skill: SkillSchemaInput
): SoftwareApplicationSchema {
  const schema: SoftwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: skill.name,
    description: skill.description,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any (Claude AI compatible)',
    url: `${SITE_URL}${skill.url}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    softwareRequirements: 'Claude AI (Anthropic)',
  };

  // Add author if available
  if (skill.author) {
    schema.author = {
      '@type': 'Person',
      name: skill.author,
    };
  }

  // Add version if available
  if (skill.version) {
    schema.version = skill.version;
  }

  // Add aggregate rating based on download count
  if (skill.downloadCount && skill.downloadCount > 0) {
    // Convert downloads to a rating-like metric (for visibility)
    const ratingValue = Math.min(5, Math.max(1, Math.log10(skill.downloadCount + 1) + 3));
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Math.round(ratingValue * 10) / 10,
      ratingCount: skill.downloadCount,
    };
  }

  // Add keywords from tags and category
  const keywords: string[] = [];
  if (skill.category) keywords.push(skill.category);
  if (skill.tags) keywords.push(...skill.tags);
  if (keywords.length > 0) {
    schema.keywords = keywords.join(', ');
  }

  return schema;
}
