/**
 * Skill Request Configuration
 *
 * Configuration for the "Request a Skill" feature which creates
 * GitHub issues on a target repository.
 *
 * Environment variables (all optional, with defaults):
 * - SKILL_REQUEST_REPO_OWNER: GitHub owner/org for skill requests (default: 'schwepps')
 * - SKILL_REQUEST_REPO_NAME: Repository name for skill requests (default: 'skills')
 */

/**
 * Get the target repository owner for skill requests
 * Defaults to 'schwepps' if not configured
 */
export function getSkillRequestRepoOwner(): string {
  return process.env.SKILL_REQUEST_REPO_OWNER || 'schwepps';
}

/**
 * Get the target repository name for skill requests
 * Defaults to 'skills' if not configured
 */
export function getSkillRequestRepoName(): string {
  return process.env.SKILL_REQUEST_REPO_NAME || 'skills';
}

/**
 * Check if skill request feature is properly configured
 * Requires GITHUB_TOKEN to create issues
 */
export function isSkillRequestConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

/**
 * Get the full GitHub URL for the skill request repository
 */
export function getSkillRequestRepoUrl(): string {
  const owner = getSkillRequestRepoOwner();
  const repo = getSkillRequestRepoName();
  return `https://github.com/${owner}/${repo}`;
}
