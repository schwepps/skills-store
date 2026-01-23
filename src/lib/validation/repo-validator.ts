/**
 * Repository validation module
 *
 * Validates GitHub repository URLs and discovers skills.
 * Used by both the URL submission form and sync service.
 */

import { githubFetch } from '@/lib/github/client';
import { fetchSkillFolders, fetchSkillMetadata } from '@/lib/github/fetchers';

/**
 * Validation step identifier
 */
export type ValidationStep =
  | 'url_parse'
  | 'repo_exists'
  | 'repo_public'
  | 'skills_found'
  | 'skills_valid';

/**
 * Discovered skill information
 */
export interface DiscoveredSkill {
  folder: string;
  name: string;
  description: string;
  category?: string;
  valid: boolean;
  error?: string;
}

/**
 * Repository validation result
 */
export interface ValidationResult {
  success: boolean;
  step: ValidationStep;
  error?: string;
  data?: {
    owner: string;
    repo: string;
    branch: string;
    skills: DiscoveredSkill[];
  };
}

/**
 * GitHub repository API response type
 */
interface GitHubRepoResponse {
  private: boolean;
  default_branch: string;
}

/**
 * Parse a GitHub URL to extract owner, repo, and branch
 *
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/tree/branch
 * - github.com/owner/repo
 */
export function parseGitHubUrl(
  url: string
): { owner: string; repo: string; branch: string } | null {
  // Clean the URL
  const cleanUrl = url.trim();

  // Match GitHub URL patterns
  const match = cleanUrl.match(
    /(?:https?:\/\/)?github\.com\/([^\/]+)\/([^\/\s]+)(?:\/tree\/([^\/\s]+))?/
  );

  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
    branch: match[3] || 'main', // Default to main, will be verified against actual default branch
  };
}

/**
 * Validate a GitHub repository URL
 *
 * Performs multi-step validation:
 * 1. Parse URL format
 * 2. Check repository exists
 * 3. Verify repository is public
 * 4. Discover SKILL.md files
 * 5. Validate at least one skill parses correctly
 */
export async function validateRepository(url: string): Promise<ValidationResult> {
  // Step 1: Parse URL
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return {
      success: false,
      step: 'url_parse',
      error: 'Invalid GitHub URL. Expected format: https://github.com/owner/repo',
    };
  }

  const { owner, repo } = parsed;
  let branch = parsed.branch;

  // Step 2 & 3: Check repository exists and is public
  try {
    const repoData = await githubFetch<GitHubRepoResponse>(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    // Step 3: Check if public
    if (repoData.private) {
      return {
        success: false,
        step: 'repo_public',
        error: 'Repository must be public. Private repositories are not supported.',
      };
    }

    // Use the actual default branch if user didn't specify one
    if (parsed.branch === 'main' && repoData.default_branch !== 'main') {
      branch = repoData.default_branch;
    }
  } catch {
    return {
      success: false,
      step: 'repo_exists',
      error: 'Repository not found. Please check the URL and ensure the repository exists.',
    };
  }

  // Step 4: Discover skills
  let skillFolders: string[];
  try {
    skillFolders = await fetchSkillFolders(owner, repo, branch);
  } catch {
    return {
      success: false,
      step: 'skills_found',
      error: 'Failed to scan repository. Please ensure the repository is accessible.',
    };
  }

  if (skillFolders.length === 0) {
    return {
      success: false,
      step: 'skills_found',
      error:
        'No SKILL.md files found. Each skill needs a folder containing a SKILL.md file.',
    };
  }

  // Step 5: Validate each skill
  const skills: DiscoveredSkill[] = await Promise.all(
    skillFolders.map(async (folder) => {
      try {
        const metadata = await fetchSkillMetadata(owner, repo, folder, branch);

        if (!metadata) {
          return {
            folder,
            name: folder,
            description: '',
            valid: false,
            error: 'Could not parse SKILL.md',
          };
        }

        if (!metadata.name || !metadata.description) {
          return {
            folder,
            name: metadata.name || folder,
            description: metadata.description || '',
            valid: false,
            error: 'SKILL.md must have both name and description',
          };
        }

        return {
          folder,
          name: metadata.name,
          description: metadata.description,
          category: metadata.category,
          valid: true,
        };
      } catch (error) {
        return {
          folder,
          name: folder,
          description: '',
          valid: false,
          error: error instanceof Error ? error.message : 'Failed to parse SKILL.md',
        };
      }
    })
  );

  const validSkills = skills.filter((s) => s.valid);

  if (validSkills.length === 0) {
    return {
      success: false,
      step: 'skills_valid',
      error:
        'No valid skills found. Each SKILL.md must have a name and description in the frontmatter.',
    };
  }

  return {
    success: true,
    step: 'skills_valid',
    data: {
      owner,
      repo,
      branch,
      skills,
    },
  };
}
