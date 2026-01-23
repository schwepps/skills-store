import { Skill, RepoConfig, SkillMetadata } from '@/lib/types';
import { githubFetch, checkFileExists, fetchRawContent } from './client';
import {
  buildContentsUrl,
  buildSkillMdUrl,
  buildGitHubUrl,
  buildDownloadUrl,
  buildRawUrl,
} from './urls';
import { parseSkillFrontmatter } from '@/lib/parser/frontmatter';
import {
  DEFAULT_EXCLUDED_FOLDERS,
  MAX_SHORT_DESCRIPTION_LENGTH,
} from '@/lib/config/constants';

interface GitHubContent {
  name: string;
  type: 'file' | 'dir';
  path: string;
}

/**
 * Fetch list of directories in a repository path
 */
export async function fetchRepoDirectories(
  owner: string,
  repo: string,
  branch: string = 'main',
  basePath: string = ''
): Promise<string[]> {
  const url = buildContentsUrl(owner, repo, basePath, branch);
  const contents = await githubFetch<GitHubContent[]>(url);

  // Filter to directories only, exclude hidden and system folders
  return contents
    .filter((item) => item.type === 'dir')
    .filter((item) => !item.name.startsWith('.'))
    .filter(
      (item) => !DEFAULT_EXCLUDED_FOLDERS.includes(item.name as typeof DEFAULT_EXCLUDED_FOLDERS[number])
    )
    .map((item) => item.name);
}

/**
 * Find directories that contain a SKILL.md file
 * Uses parallel checking for better performance
 */
export async function fetchSkillFolders(
  owner: string,
  repo: string,
  branch: string = 'main',
  basePath: string = ''
): Promise<string[]> {
  const directories = await fetchRepoDirectories(owner, repo, branch, basePath);

  // Check all directories in parallel
  const checkResults = await Promise.allSettled(
    directories.map(async (folder) => {
      const fullPath = basePath ? `${basePath}/${folder}` : folder;
      const skillMdUrl = buildContentsUrl(
        owner,
        repo,
        `${fullPath}/SKILL.md`,
        branch
      );
      const hasSkillMd = await checkFileExists(skillMdUrl);
      return { folder, hasSkillMd };
    })
  );

  // Filter to folders that have SKILL.md
  return checkResults
    .filter(
      (result): result is PromiseFulfilledResult<{ folder: string; hasSkillMd: boolean }> =>
        result.status === 'fulfilled' && result.value.hasSkillMd
    )
    .map((result) => result.value.folder);
}

/**
 * Fetch and parse SKILL.md metadata
 */
export async function fetchSkillMetadata(
  owner: string,
  repo: string,
  folder: string,
  branch: string = 'main',
  skillsPath: string = ''
): Promise<SkillMetadata | null> {
  const fullPath = skillsPath ? `${skillsPath}/${folder}` : folder;
  const rawUrl = buildRawUrl(owner, repo, `${fullPath}/SKILL.md`, branch);

  try {
    const content = await fetchRawContent(rawUrl);
    return parseSkillFrontmatter(content);
  } catch {
    return null;
  }
}

/**
 * Build a complete Skill object from metadata
 */
function buildSkill(
  owner: string,
  repo: string,
  folder: string,
  branch: string,
  metadata: SkillMetadata,
  repoDisplayName: string,
  skillsPath: string = '',
  categoryOverride?: string
): Skill {
  const finalCategory = categoryOverride || metadata.category;
  const fullPath = skillsPath ? `${skillsPath}/${folder}` : folder;

  return {
    id: `${owner}/${repo}/${folder}`,
    owner,
    repo,
    skillName: folder,
    metadata: {
      ...metadata,
      category: finalCategory,
    },
    githubUrl: buildGitHubUrl(owner, repo, fullPath, branch),
    downloadUrl: buildDownloadUrl(owner, repo, folder),
    rawSkillMdUrl: buildSkillMdUrl(owner, repo, fullPath, branch),
    detailUrl: `/skill/${owner}/${repo}/${folder}`,
    displayName: metadata.name || formatSkillName(folder),
    shortDescription: getShortDescription(metadata.description),
    repoDisplayName,
    branch,
    downloadCount: 0, // Stats come from skills.sh, default to 0
  };
}

/**
 * Fetch all skills from a repository
 * Uses parallel fetching for better performance
 */
export async function fetchRepoSkills(config: RepoConfig): Promise<Skill[]> {
  const startTime = performance.now();
  const {
    owner,
    repo,
    branch = 'main',
    displayName,
    config: repoOptions,
  } = config;

  const skillsPath = repoOptions?.skillsPath || '';
  const skillFolders = await fetchSkillFolders(owner, repo, branch, skillsPath);

  // Apply folder exclusions
  const excludeFolders = repoOptions?.excludeFolders || [];
  const filteredFolders = skillFolders.filter(
    (f) => !excludeFolders.includes(f)
  );

  // Fetch all metadata in parallel
  const metadataResults = await Promise.allSettled(
    filteredFolders.map(async (folder) => {
      const metadata = await fetchSkillMetadata(
        owner,
        repo,
        folder,
        branch,
        skillsPath
      );
      return { folder, metadata };
    })
  );

  // Build skills from successful metadata fetches
  const skills: Skill[] = [];

  for (const result of metadataResults) {
    if (result.status === 'fulfilled' && result.value.metadata) {
      const { folder, metadata } = result.value;

      // Determine category override
      let categoryOverride: string | undefined;
      if (repoOptions?.categoryOverrides?.[folder]) {
        categoryOverride = repoOptions.categoryOverrides[folder];
      } else if (repoOptions?.defaultCategory) {
        categoryOverride = repoOptions.defaultCategory;
      }

      skills.push(
        buildSkill(
          owner,
          repo,
          folder,
          branch,
          metadata,
          displayName,
          skillsPath,
          categoryOverride
        )
      );
    }
  }

  const duration = Math.round(performance.now() - startTime);
  console.log(`[Fetchers] ${owner}/${repo}: ${skills.length} skills in ${duration}ms`);

  return skills;
}

// Helper functions
function formatSkillName(folder: string): string {
  return folder
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getShortDescription(description: string): string {
  const firstLine = description.split('\n')[0];
  if (firstLine.length > MAX_SHORT_DESCRIPTION_LENGTH) {
    return firstLine.slice(0, MAX_SHORT_DESCRIPTION_LENGTH - 3) + '...';
  }
  return firstLine;
}
