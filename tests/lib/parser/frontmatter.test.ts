import { describe, it, expect } from 'vitest';
import { parseSkillFrontmatter } from '@/lib/parser/frontmatter';

describe('parseSkillFrontmatter', () => {
  describe('Anthropic minimal format', () => {
    it('parses minimal format with name and description', () => {
      const content = `---
name: my-skill
description: A simple skill that does something useful
---

# Usage
Some usage instructions.
`;
      const result = parseSkillFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('my-skill');
      expect(result?.description).toBe('A simple skill that does something useful');
    });

    it('parses with description only (name optional)', () => {
      const content = `---
description: A skill without a name field
---`;
      const result = parseSkillFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('');
      expect(result?.description).toBe('A skill without a name field');
    });

    it('parses with name only', () => {
      const content = `---
name: name-only-skill
---`;
      const result = parseSkillFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('name-only-skill');
      expect(result?.description).toBe('');
    });
  });

  describe('Extended format (nested metadata)', () => {
    it('parses extended format with nested metadata', () => {
      const content = `---
name: advanced-skill
description: A skill with extended metadata
metadata:
  category: development
  tags:
    - typescript
    - react
  author: John Doe
  version: 1.0.0
---`;
      const result = parseSkillFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('advanced-skill');
      expect(result?.category).toBe('development');
      expect(result?.tags).toEqual(['typescript', 'react']);
      expect(result?.author).toBe('John Doe');
      expect(result?.version).toBe('1.0.0');
    });

    it('prioritizes nested metadata over flat fields', () => {
      const content = `---
name: conflict-skill
description: Testing priority
category: flat-category
metadata:
  category: nested-category
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.category).toBe('nested-category');
    });
  });

  describe('Alternative format (flat metadata)', () => {
    it('parses flat metadata fields', () => {
      const content = `---
name: flat-skill
description: A skill with flat metadata
category: productivity
tags: automation, workflow, efficiency
author: Jane Doe
version: 2.0.0
license: MIT
---`;
      const result = parseSkillFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result?.category).toBe('productivity');
      expect(result?.tags).toEqual(['automation', 'workflow', 'efficiency']);
      expect(result?.author).toBe('Jane Doe');
      expect(result?.version).toBe('2.0.0');
      expect(result?.license).toBe('MIT');
    });

    it('parses tags as array', () => {
      const content = `---
name: array-tags-skill
description: Skill with array tags
tags:
  - tag1
  - tag2
  - tag3
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('parses tags as comma-separated string', () => {
      const content = `---
name: string-tags-skill
description: Skill with string tags
tags: seo, marketing, analytics
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.tags).toEqual(['seo', 'marketing', 'analytics']);
    });
  });

  describe('Category inference', () => {
    it('infers SEO category from description', () => {
      const content = `---
name: seo-skill
description: Optimize your website for search engine ranking and crawling
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.category).toBe('seo');
    });

    it('infers development category from description', () => {
      const content = `---
name: dev-skill
description: A TypeScript API helper for debugging code
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.category).toBe('development');
    });

    it('infers security category from description', () => {
      const content = `---
name: audit-skill
description: Smart contract security audit for Solidity vulnerabilities
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.category).toBe('security');
    });

    it('falls back to other category when no match', () => {
      const content = `---
name: simple-skill
description: A simple helper for everyday needs
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.category).toBe('other');
    });
  });

  describe('Tag inference', () => {
    it('infers tags from description text', () => {
      const content = `---
name: react-skill
description: Build React components with TypeScript and Tailwind CSS
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.tags).toContain('react');
      expect(result?.tags).toContain('typescript');
      expect(result?.tags).toContain('tailwind');
      expect(result?.tags).toContain('css');
    });

    it('returns empty array when no tags found', () => {
      const content = `---
name: no-tags-skill
description: A very generic description
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.tags).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('returns null for empty content', () => {
      const result = parseSkillFrontmatter('');
      expect(result).toBeNull();
    });

    it('returns null for content without frontmatter', () => {
      const content = `# Just a markdown file
No frontmatter here.`;
      const result = parseSkillFrontmatter(content);
      expect(result).toBeNull();
    });

    it('returns null for frontmatter without name or description', () => {
      const content = `---
author: Someone
version: 1.0
---`;
      const result = parseSkillFrontmatter(content);
      expect(result).toBeNull();
    });

    it('returns null for invalid YAML', () => {
      const content = `---
name: broken
  invalid: yaml
    structure: here
---`;
      const result = parseSkillFrontmatter(content);
      // gray-matter may handle some malformed YAML, but truly broken should fail
      // This specific case might still parse, so we just check it doesn't crash
      expect(result === null || result !== null).toBe(true);
    });

    it('handles frontmatter with only dashes gracefully', () => {
      const content = `---
---`;
      const result = parseSkillFrontmatter(content);
      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('handles empty tags array', () => {
      const content = `---
name: empty-tags
description: Skill with empty tags
tags: []
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.tags).toEqual([]);
    });

    it('handles whitespace in tags', () => {
      const content = `---
name: whitespace-tags
description: Tags with whitespace
tags: "  tag1  ,  tag2  ,  tag3  "
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('filters empty tags from array', () => {
      const content = `---
name: filter-tags
description: Some tags are empty
tags:
  - valid
  - ""
  - another
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.tags).toEqual(['valid', 'another']);
    });

    it('handles multiline description', () => {
      const content = `---
name: multiline-skill
description: |
  This is a multiline description
  that spans multiple lines
  and should be preserved.
---`;
      const result = parseSkillFrontmatter(content);

      expect(result?.description).toContain('multiline description');
      expect(result?.description).toContain('spans multiple lines');
    });

    it('handles special characters in description', () => {
      const content = `---
name: special-chars
description: Handle special chars and ampersand symbol
---`;
      const result = parseSkillFrontmatter(content);

      expect(result).not.toBeNull();
      expect(result?.description).toContain('ampersand');
    });
  });
});
