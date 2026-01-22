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
  const excludedFolders = [
    '.github',
    'scripts',
    'dist',
    'node_modules',
    '.claude',
  ];

  return contents
    .filter((item) => item.type === 'dir')
    .filter((item) => !item.name.startsWith('.'))
    .filter((item) => !excludedFolders.includes(item.name))
    .map((item) => item.name);
}

/**
 * Find directories that contain a SKILL.md file
 */
export async function fetchSkillFolders(
  owner: string,
  repo: string,
  branch: string = 'main',
  basePath: string = ''
): Promise<string[]> {
  const directories = await fetchRepoDirectories(owner, repo, branch, basePath);
  const skillFolders: string[] = [];

  // Check each directory for SKILL.md
  for (const folder of directories) {
    const fullPath = basePath ? `${basePath}/${folder}` : folder;
    const skillMdUrl = buildContentsUrl(
      owner,
      repo,
      `${fullPath}/SKILL.md`,
      branch
    );
    const hasSkillMd = await checkFileExists(skillMdUrl);

    if (hasSkillMd) {
      skillFolders.push(folder);
    }
  }

  return skillFolders;
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
    downloadUrl: buildDownloadUrl(owner, repo, fullPath, branch),
    rawSkillMdUrl: buildSkillMdUrl(owner, repo, fullPath, branch),
    displayName: metadata.name || formatSkillName(folder),
    shortDescription: getShortDescription(metadata.description),
    repoDisplayName,
    branch,
  };
}

/**
 * Fetch all skills from a repository
 */
export async function fetchRepoSkills(config: RepoConfig): Promise<Skill[]> {
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

  const skills: Skill[] = [];

  for (const folder of filteredFolders) {
    const metadata = await fetchSkillMetadata(
      owner,
      repo,
      folder,
      branch,
      skillsPath
    );

    if (metadata) {
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

  return skills;
}

/**
 * Fetch skills from all registered repositories
 */
export async function fetchAllSkills(): Promise<Skill[]> {
  const { registeredRepos } = await import('@/config/repos');

  const allSkills: Skill[] = [];

  for (const repoConfig of registeredRepos) {
    try {
      const skills = await fetchRepoSkills(repoConfig);
      allSkills.push(...skills);
    } catch (error) {
      console.error(
        `Error fetching ${repoConfig.owner}/${repoConfig.repo}:`,
        error
      );
      // Continue with other repos on failure
    }
  }

  return allSkills;
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
  return firstLine.length > 120 ? firstLine.slice(0, 117) + '...' : firstLine;
}
