import { describe, it, expect } from 'vitest';
import { extractCategories, getCategoryConfig, getAllCategoryIds } from '@/lib/categories';
import type { Skill } from '@/lib/types';

// Helper to create a mock skill with minimal required fields
function createMockSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: 'test/repo/skill',
    owner: 'test',
    repo: 'repo',
    skillName: 'skill',
    metadata: {
      name: 'Test Skill',
      description: 'A test skill',
      category: 'development',
      ...overrides.metadata,
    },
    githubUrl: 'https://github.com/test/repo',
    downloadUrl: 'https://download.com',
    rawSkillMdUrl: 'https://raw.githubusercontent.com/test/repo/main/SKILL.md',
    detailUrl: '/skill/test/repo/skill',
    displayName: 'Test Skill',
    shortDescription: 'A test skill',
    repoDisplayName: 'Test Repo',
    branch: 'main',
    downloadCount: 0,
    ...overrides,
  };
}

describe('extractCategories', () => {
  describe('Basic functionality', () => {
    it('returns only "all" category for empty skills array', () => {
      const result = extractCategories([]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('all');
      expect(result[0].count).toBe(0);
    });

    it('extracts single category from skills', () => {
      const skills = [
        createMockSkill({ metadata: { name: 'Skill 1', description: '', category: 'seo' } }),
        createMockSkill({ metadata: { name: 'Skill 2', description: '', category: 'seo' } }),
      ];

      const result = extractCategories(skills);

      expect(result).toHaveLength(2); // 'all' + 'seo'
      expect(result[0].id).toBe('all');
      expect(result[0].count).toBe(2);
      expect(result[1].id).toBe('seo');
      expect(result[1].count).toBe(2);
    });

    it('extracts multiple categories from skills', () => {
      const skills = [
        createMockSkill({ metadata: { name: 'Skill 1', description: '', category: 'seo' } }),
        createMockSkill({ metadata: { name: 'Skill 2', description: '', category: 'marketing' } }),
        createMockSkill({
          metadata: { name: 'Skill 3', description: '', category: 'development' },
        }),
      ];

      const result = extractCategories(skills);

      expect(result).toHaveLength(4); // 'all' + 3 categories
      expect(result[0].id).toBe('all');
      expect(result[0].count).toBe(3);

      // Find each category
      const seo = result.find((c) => c.id === 'seo');
      const marketing = result.find((c) => c.id === 'marketing');
      const development = result.find((c) => c.id === 'development');

      expect(seo?.count).toBe(1);
      expect(marketing?.count).toBe(1);
      expect(development?.count).toBe(1);
    });
  });

  describe('Category sorting', () => {
    it('sorts categories by count in descending order', () => {
      const skills = [
        createMockSkill({ metadata: { name: 'S1', description: '', category: 'seo' } }),
        createMockSkill({ metadata: { name: 'S2', description: '', category: 'seo' } }),
        createMockSkill({ metadata: { name: 'S3', description: '', category: 'seo' } }),
        createMockSkill({ metadata: { name: 'S4', description: '', category: 'marketing' } }),
        createMockSkill({ metadata: { name: 'S5', description: '', category: 'marketing' } }),
        createMockSkill({ metadata: { name: 'S6', description: '', category: 'development' } }),
      ];

      const result = extractCategories(skills);

      // After 'all', categories should be sorted by count
      expect(result[1].id).toBe('seo'); // 3 skills
      expect(result[2].id).toBe('marketing'); // 2 skills
      expect(result[3].id).toBe('development'); // 1 skill
    });
  });

  describe('Edge cases', () => {
    it('handles skills without category (defaults to "other")', () => {
      const skills = [
        createMockSkill({
          metadata: { name: 'No Category', description: '', category: undefined },
        }),
      ];

      const result = extractCategories(skills);

      const other = result.find((c) => c.id === 'other');
      expect(other).toBeDefined();
      expect(other?.count).toBe(1);
    });

    it('handles unknown categories', () => {
      const skills = [
        createMockSkill({
          metadata: { name: 'Custom', description: '', category: 'custom-category' },
        }),
      ];

      const result = extractCategories(skills);

      const custom = result.find((c) => c.id === 'custom-category');
      expect(custom).toBeDefined();
      expect(custom?.count).toBe(1);
      // Unknown categories should still have a label (the id as fallback)
      expect(custom?.label).toBe('custom-category');
    });

    it('handles large number of skills', () => {
      const skills = Array.from({ length: 100 }, (_, i) =>
        createMockSkill({
          id: `test/repo/skill-${i}`,
          metadata: {
            name: `Skill ${i}`,
            description: '',
            category: i % 2 === 0 ? 'seo' : 'marketing',
          },
        })
      );

      const result = extractCategories(skills);

      expect(result[0].id).toBe('all');
      expect(result[0].count).toBe(100);

      const seo = result.find((c) => c.id === 'seo');
      const marketing = result.find((c) => c.id === 'marketing');

      expect(seo?.count).toBe(50);
      expect(marketing?.count).toBe(50);
    });
  });

  describe('Category labels and icons', () => {
    it('includes correct labels for known categories', () => {
      const skills = [
        createMockSkill({ metadata: { name: 'S1', description: '', category: 'seo' } }),
        createMockSkill({ metadata: { name: 'S2', description: '', category: 'development' } }),
      ];

      const result = extractCategories(skills);

      const seo = result.find((c) => c.id === 'seo');
      const dev = result.find((c) => c.id === 'development');

      expect(seo?.label).toBe('SEO & AI Search');
      expect(dev?.label).toBe('Development');
    });

    it('includes icons for categories', () => {
      const skills = [
        createMockSkill({ metadata: { name: 'S1', description: '', category: 'seo' } }),
      ];

      const result = extractCategories(skills);

      const seo = result.find((c) => c.id === 'seo');
      expect(seo?.icon).toBe('Search');
    });
  });
});

describe('getCategoryConfig', () => {
  it('returns config for known categories', () => {
    expect(getCategoryConfig('seo').label).toBe('SEO & AI Search');
    expect(getCategoryConfig('seo').icon).toBe('Search');

    expect(getCategoryConfig('marketing').label).toBe('Marketing');
    expect(getCategoryConfig('marketing').icon).toBe('Megaphone');

    expect(getCategoryConfig('development').label).toBe('Development');
    expect(getCategoryConfig('development').icon).toBe('Code');
  });

  it('returns fallback for unknown categories', () => {
    const config = getCategoryConfig('unknown-category');

    expect(config.label).toBe('unknown-category');
    expect(config.icon).toBe('Folder');
  });

  it('returns config for all predefined categories', () => {
    const knownCategories = [
      'all',
      'seo',
      'marketing',
      'music',
      'security',
      'development',
      'design',
      'productivity',
      'data',
      'document',
      'other',
    ];

    for (const category of knownCategories) {
      const config = getCategoryConfig(category);
      expect(config.label).toBeTruthy();
      expect(config.icon).toBeTruthy();
    }
  });
});

describe('getAllCategoryIds', () => {
  it('returns array of category IDs', () => {
    const ids = getAllCategoryIds();

    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBeGreaterThan(0);
  });

  it('includes all predefined categories', () => {
    const ids = getAllCategoryIds();

    expect(ids).toContain('all');
    expect(ids).toContain('seo');
    expect(ids).toContain('marketing');
    expect(ids).toContain('development');
    expect(ids).toContain('other');
  });
});
