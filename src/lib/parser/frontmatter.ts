import matter from 'gray-matter';
import { SkillMetadata } from '@/lib/types';
import { inferCategory, inferTagsFromDescription } from './inference';

/**
 * Parse SKILL.md frontmatter supporting multiple formats:
 * - Anthropic minimal: { name, description }
 * - Extended: { name, description, metadata: { category, tags, author, version } }
 * - Alternative: { name, description, category, tags, author, version }
 */
export function parseSkillFrontmatter(content: string): SkillMetadata | null {
  try {
    const { data } = matter(content);

    // Require at least name or description
    if (!data.name && !data.description) {
      return null;
    }

    const description = data.description || '';

    // Extract from nested metadata if present (extended format)
    const nestedMetadata = data.metadata || {};

    // Build metadata with fallbacks across formats
    const metadata: SkillMetadata = {
      name: data.name || '',
      description: description,
      // Category: nested > flat > inferred
      category:
        nestedMetadata.category ||
        data.category ||
        inferCategory(description, data),
      // Tags: nested > flat > inferred
      tags:
        parseTags(nestedMetadata.tags) ||
        parseTags(data.tags) ||
        inferTagsFromDescription(description),
      // Author: nested > flat
      author: nestedMetadata.author || data.author,
      // Version: nested > flat
      version: nestedMetadata.version || data.version,
      // License: flat only
      license: data.license,
    };

    return metadata;
  } catch (error) {
    console.error('Error parsing SKILL.md frontmatter:', error);
    return null;
  }
}

/**
 * Parse tags from various input formats
 */
function parseTags(tags: unknown): string[] | undefined {
  if (!tags) return undefined;

  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return undefined;
}
