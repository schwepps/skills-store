/**
 * Keyword mappings for category inference
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  seo: [
    'seo',
    'search engine',
    'crawl',
    'indexation',
    'serp',
    'ranking',
    'e-e-a-t',
    'core web vitals',
    'sitemap',
    'structured data',
    'schema',
  ],
  marketing: [
    'marketing',
    'linkedin',
    'branding',
    'content',
    'social media',
    'copywriting',
    'ads',
    'campaign',
    'growth',
    'conversion',
  ],
  music: [
    'music',
    'audio',
    'song',
    'suno',
    'melody',
    'track',
    'composition',
    'playlist',
    'lyrics',
    'beat',
  ],
  security: [
    'security',
    'audit',
    'vulnerability',
    'solidity',
    'smart contract',
    'penetration',
    'owasp',
    'web3',
    'blockchain',
    'exploit',
    'threat',
  ],
  development: [
    'code',
    'programming',
    'api',
    'typescript',
    'python',
    'react',
    'nextjs',
    'database',
    'debugging',
    'testing',
    'developer',
    'sdk',
  ],
  design: [
    'design',
    'ui',
    'ux',
    'figma',
    'css',
    'tailwind',
    'visual',
    'layout',
    'brand',
    'wireframe',
    'prototype',
    'aesthetic',
  ],
  productivity: [
    'productivity',
    'automation',
    'workflow',
    'task',
    'organization',
    'efficiency',
    'planning',
    'time management',
    'notion',
    'template',
  ],
  data: [
    'data',
    'analytics',
    'csv',
    'chart',
    'visualization',
    'statistics',
    'metrics',
    'dashboard',
    'report',
    'sql',
    'excel',
  ],
  document: [
    'document',
    'pdf',
    'docx',
    'pptx',
    'xlsx',
    'word',
    'powerpoint',
    'excel',
    'slides',
    'presentation',
    'spreadsheet',
  ],
};

/**
 * Infer category from description and other fields
 */
export function inferCategory(
  description: string,
  data: Record<string, unknown>
): string {
  const text = `${description} ${data.tags || ''}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

/**
 * Common terms to extract as tags from descriptions
 */
const COMMON_TAGS = [
  'react',
  'nextjs',
  'typescript',
  'python',
  'api',
  'database',
  'seo',
  'marketing',
  'analytics',
  'security',
  'design',
  'ui',
  'ux',
  'pdf',
  'document',
  'automation',
  'workflow',
  'ai',
  'llm',
  'claude',
  'web3',
  'solidity',
  'blockchain',
  'music',
  'audio',
  'linkedin',
  'github',
  'notion',
  'figma',
  'tailwind',
  'css',
  'html',
];

/**
 * Extract tags from description text
 */
export function inferTagsFromDescription(description: string): string[] {
  const lowerDesc = description.toLowerCase();
  return COMMON_TAGS.filter((term) => lowerDesc.includes(term));
}
