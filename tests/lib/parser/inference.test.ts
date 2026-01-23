import { describe, it, expect } from 'vitest';
import { inferCategory, inferTagsFromDescription } from '@/lib/parser/inference';

describe('inferCategory', () => {
  describe('SEO category', () => {
    it('detects SEO from keyword "seo"', () => {
      expect(inferCategory('Improve your SEO rankings', {})).toBe('seo');
    });

    it('detects SEO from keyword "search engine"', () => {
      expect(inferCategory('Optimize for search engine visibility', {})).toBe('seo');
    });

    it('detects SEO from keyword "crawl"', () => {
      expect(inferCategory('Help Googlebot crawl your site', {})).toBe('seo');
    });

    it('detects SEO from keyword "serp"', () => {
      expect(inferCategory('Improve SERP positions', {})).toBe('seo');
    });

    it('detects SEO from keyword "structured data"', () => {
      expect(inferCategory('Add structured data markup', {})).toBe('seo');
    });
  });

  describe('Marketing category', () => {
    it('detects marketing from keyword "marketing"', () => {
      expect(inferCategory('Digital marketing automation', {})).toBe('marketing');
    });

    it('detects marketing from keyword "linkedin"', () => {
      expect(inferCategory('Generate LinkedIn posts', {})).toBe('marketing');
    });

    it('detects marketing from keyword "copywriting"', () => {
      expect(inferCategory('Professional copywriting assistant', {})).toBe('marketing');
    });

    it('detects marketing from keyword "campaign"', () => {
      expect(inferCategory('Create ad campaign strategies', {})).toBe('marketing');
    });
  });

  describe('Security category', () => {
    it('detects security from keyword "security"', () => {
      expect(inferCategory('Web application security audit', {})).toBe('security');
    });

    it('detects security from keyword "vulnerability"', () => {
      expect(inferCategory('Find vulnerability in code', {})).toBe('security');
    });

    it('detects security from keyword "solidity"', () => {
      expect(inferCategory('Solidity smart contract review', {})).toBe('security');
    });

    it('detects security from keyword "smart contract"', () => {
      expect(inferCategory('Audit smart contract logic', {})).toBe('security');
    });

    it('detects security from keyword "owasp"', () => {
      expect(inferCategory('Check for OWASP top 10', {})).toBe('security');
    });
  });

  describe('Development category', () => {
    it('detects development from keyword "code"', () => {
      expect(inferCategory('Write clean code', {})).toBe('development');
    });

    it('detects development from keyword "api"', () => {
      expect(inferCategory('Build REST API endpoints', {})).toBe('development');
    });

    it('detects development from keyword "typescript"', () => {
      expect(inferCategory('TypeScript type definitions', {})).toBe('development');
    });

    it('detects development from keyword "react"', () => {
      expect(inferCategory('React component library', {})).toBe('development');
    });

    it('detects development from keyword "debugging"', () => {
      expect(inferCategory('Advanced debugging techniques', {})).toBe('development');
    });
  });

  describe('Design category', () => {
    it('detects design from keyword "design"', () => {
      expect(inferCategory('UI design system', {})).toBe('design');
    });

    it('detects design from keyword "figma"', () => {
      expect(inferCategory('Export Figma designs to images', {})).toBe('design');
    });

    it('detects design from keyword "ux"', () => {
      expect(inferCategory('Improve UX patterns', {})).toBe('design');
    });

    it('detects design from keyword "wireframe"', () => {
      expect(inferCategory('Create wireframe mockups', {})).toBe('design');
    });
  });

  describe('Music category', () => {
    it('detects music from keyword "music"', () => {
      expect(inferCategory('Generate music compositions', {})).toBe('music');
    });

    it('detects music from keyword "suno"', () => {
      expect(inferCategory('Create Suno prompts', {})).toBe('music');
    });

    it('detects music from keyword "lyrics"', () => {
      expect(inferCategory('Write song lyrics', {})).toBe('music');
    });
  });

  describe('Productivity category', () => {
    it('detects productivity from keyword "productivity"', () => {
      expect(inferCategory('Boost productivity workflows', {})).toBe('productivity');
    });

    it('detects productivity from keyword "automation"', () => {
      expect(inferCategory('Task automation helper', {})).toBe('productivity');
    });

    it('detects productivity from keyword "notion"', () => {
      expect(inferCategory('Notion template generator', {})).toBe('productivity');
    });
  });

  describe('Data category', () => {
    it('detects data from keyword "analytics"', () => {
      expect(inferCategory('Data analytics dashboard', {})).toBe('data');
    });

    it('detects data from keyword "csv"', () => {
      expect(inferCategory('Parse CSV files', {})).toBe('data');
    });

    it('detects data from keyword "metrics"', () => {
      expect(inferCategory('Monitor metrics and KPIs', {})).toBe('data');
    });

    it('detects data from keyword "sql"', () => {
      expect(inferCategory('Write SQL queries', {})).toBe('data');
    });
  });

  describe('Document category', () => {
    it('detects document from keyword "pdf"', () => {
      expect(inferCategory('Extract text from PDF', {})).toBe('document');
    });

    it('detects document from keyword "powerpoint"', () => {
      expect(inferCategory('Create PowerPoint presentations', {})).toBe('document');
    });

    it('detects document from keyword "xlsx"', () => {
      expect(inferCategory('Convert files to xlsx format', {})).toBe('document');
    });
  });

  describe('Fallback to other', () => {
    it('returns other for generic description', () => {
      expect(inferCategory('A helpful assistant', {})).toBe('other');
    });

    it('returns other for empty description', () => {
      expect(inferCategory('', {})).toBe('other');
    });

    it('returns other for random words', () => {
      expect(inferCategory('lorem ipsum dolor sit amet', {})).toBe('other');
    });
  });

  describe('Case insensitivity', () => {
    it('matches uppercase keywords', () => {
      expect(inferCategory('SEO OPTIMIZATION TOOL', {})).toBe('seo');
    });

    it('matches mixed case keywords', () => {
      expect(inferCategory('TypeScript Developer Tools', {})).toBe('development');
    });
  });

  describe('Tags field consideration', () => {
    it('considers tags field in inference', () => {
      const result = inferCategory('Generic description', { tags: 'seo, marketing' });
      expect(result).toBe('seo');
    });

    it('matches from tags even with generic description', () => {
      const result = inferCategory('A simple tool', { tags: 'react, typescript' });
      expect(result).toBe('development');
    });
  });

  describe('Priority order', () => {
    it('returns first matching category (SEO before marketing)', () => {
      // Both "seo" and "marketing" keywords present, SEO should win due to order
      const result = inferCategory('SEO marketing tool', {});
      expect(result).toBe('seo');
    });
  });
});

describe('inferTagsFromDescription', () => {
  describe('Single tag extraction', () => {
    it('extracts react tag', () => {
      expect(inferTagsFromDescription('Build React components')).toContain('react');
    });

    it('extracts typescript tag', () => {
      expect(inferTagsFromDescription('TypeScript helper')).toContain('typescript');
    });

    it('extracts python tag', () => {
      expect(inferTagsFromDescription('Python script generator')).toContain('python');
    });
  });

  describe('Multiple tag extraction', () => {
    it('extracts multiple tags from description', () => {
      const tags = inferTagsFromDescription('Build React and TypeScript apps with Tailwind CSS');
      expect(tags).toContain('react');
      expect(tags).toContain('typescript');
      expect(tags).toContain('tailwind');
      expect(tags).toContain('css');
    });

    it('extracts API and database tags', () => {
      const tags = inferTagsFromDescription('REST API with database integration');
      expect(tags).toContain('api');
      expect(tags).toContain('database');
    });
  });

  describe('AI/LLM related tags', () => {
    it('extracts ai tag', () => {
      expect(inferTagsFromDescription('AI assistant helper')).toContain('ai');
    });

    it('extracts llm tag', () => {
      expect(inferTagsFromDescription('LLM prompt engineering')).toContain('llm');
    });

    it('extracts claude tag', () => {
      expect(inferTagsFromDescription('Claude integration tool')).toContain('claude');
    });
  });

  describe('Platform tags', () => {
    it('extracts github tag', () => {
      expect(inferTagsFromDescription('GitHub repository manager')).toContain('github');
    });

    it('extracts linkedin tag', () => {
      expect(inferTagsFromDescription('LinkedIn post generator')).toContain('linkedin');
    });

    it('extracts notion tag', () => {
      expect(inferTagsFromDescription('Notion workspace helper')).toContain('notion');
    });

    it('extracts figma tag', () => {
      expect(inferTagsFromDescription('Figma design export')).toContain('figma');
    });
  });

  describe('Web3 tags', () => {
    it('extracts web3 tag', () => {
      expect(inferTagsFromDescription('Web3 dApp builder')).toContain('web3');
    });

    it('extracts solidity tag', () => {
      expect(inferTagsFromDescription('Solidity contract auditor')).toContain('solidity');
    });

    it('extracts blockchain tag', () => {
      expect(inferTagsFromDescription('Blockchain analysis tool')).toContain('blockchain');
    });
  });

  describe('Empty results', () => {
    it('returns empty array for generic text', () => {
      const tags = inferTagsFromDescription('A simple tool for everyday tasks');
      expect(tags).toEqual([]);
    });

    it('returns empty array for empty string', () => {
      const tags = inferTagsFromDescription('');
      expect(tags).toEqual([]);
    });
  });

  describe('Case insensitivity', () => {
    it('matches uppercase terms', () => {
      expect(inferTagsFromDescription('REACT TYPESCRIPT APP')).toContain('react');
      expect(inferTagsFromDescription('REACT TYPESCRIPT APP')).toContain('typescript');
    });

    it('matches mixed case terms', () => {
      expect(inferTagsFromDescription('React TypeScript NextJS')).toContain('react');
      expect(inferTagsFromDescription('React TypeScript NextJS')).toContain('typescript');
      expect(inferTagsFromDescription('React TypeScript NextJS')).toContain('nextjs');
    });
  });

  describe('Partial word matching', () => {
    it('matches embedded terms', () => {
      // "react" inside "reactive" should match since it's substring matching
      expect(inferTagsFromDescription('A reactive framework')).toContain('react');
    });
  });
});
