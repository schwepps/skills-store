import { RepoConfig } from '@/lib/types';

/**
 * Registered repositories for skill fetching
 */
export const registeredRepos: RepoConfig[] = [
  {
    owner: 'anthropics',
    repo: 'skills',
    branch: 'main',
    displayName: 'Anthropic Official',
    description: 'Official Anthropic skills (PDF, DOCX, PPTX...)',
    website: 'https://github.com/anthropics/skills',
    featured: true,
    config: {
      skillsPath: 'skills',
      categoryOverrides: {
        pdf: 'document',
        docx: 'document',
        pptx: 'document',
        xlsx: 'document',
        'skill-creator': 'development',
        'mcp-builder': 'development',
        'frontend-design': 'design',
        'brand-guidelines': 'design',
      },
    },
  },
  {
    owner: 'schwepps',
    repo: 'skills',
    branch: 'main',
    displayName: 'Schwepps',
    description: 'Community skills by Schwepps',
    website: 'https://github.com/schwepps/skills',
    featured: false,
  },
];

/**
 * Get a specific repo config by owner/repo
 */
export function getRepoConfig(
  owner: string,
  repo: string
): RepoConfig | undefined {
  return registeredRepos.find((r) => r.owner === owner && r.repo === repo);
}

/**
 * Get all featured repos
 */
export function getFeaturedRepos(): RepoConfig[] {
  return registeredRepos.filter((r) => r.featured);
}
