const GITHUB_API = 'https://api.github.com';
const GITHUB_RAW = 'https://raw.githubusercontent.com';
const DOWNLOAD_HELPER = 'https://download-directory.github.io';

/**
 * Build GitHub API URL for repository contents
 */
export function buildContentsUrl(
  owner: string,
  repo: string,
  path: string = '',
  branch: string = 'main'
): string {
  const cleanPath = path ? `/${path}` : '';
  return `${GITHUB_API}/repos/${owner}/${repo}/contents${cleanPath}?ref=${branch}`;
}

/**
 * Build raw.githubusercontent.com URL for file content
 */
export function buildRawUrl(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): string {
  return `${GITHUB_RAW}/${owner}/${repo}/${branch}/${path}`;
}

/**
 * Build GitHub web URL for browsing
 */
export function buildGitHubUrl(
  owner: string,
  repo: string,
  path: string = '',
  branch: string = 'main'
): string {
  const treePath = path ? `/tree/${branch}/${path}` : '';
  return `https://github.com/${owner}/${repo}${treePath}`;
}

/**
 * Build download URL via download-directory.github.io
 */
export function buildDownloadUrl(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): string {
  const githubUrl = `https://github.com/${owner}/${repo}/tree/${branch}/${path}`;
  return `${DOWNLOAD_HELPER}/?url=${encodeURIComponent(githubUrl)}`;
}

/**
 * Build SKILL.md raw URL
 */
export function buildSkillMdUrl(
  owner: string,
  repo: string,
  folder: string,
  branch: string = 'main'
): string {
  return buildRawUrl(owner, repo, `${folder}/SKILL.md`, branch);
}
