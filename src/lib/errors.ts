/**
 * Error thrown when GitHub rate limit is exceeded
 */
export class GitHubRateLimitError extends Error {
  constructor(public resetTime: Date) {
    super(`GitHub rate limit exceeded. Resets at ${resetTime.toISOString()}`);
    this.name = 'GitHubRateLimitError';
  }
}

/**
 * Error thrown when SKILL.md parsing fails
 */
export class SkillParseError extends Error {
  constructor(
    public skillPath: string,
    message: string
  ) {
    super(`Failed to parse ${skillPath}: ${message}`);
    this.name = 'SkillParseError';
  }
}

/**
 * Error thrown when a repository is not found in registry
 */
export class RepoNotFoundError extends Error {
  constructor(owner: string, repo: string) {
    super(`Repository ${owner}/${repo} is not registered`);
    this.name = 'RepoNotFoundError';
  }
}

/**
 * Error thrown when GitHub API request fails
 */
export class GitHubApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public endpoint?: string
  ) {
    super(`GitHub API error (${status}): ${message}`);
    this.name = 'GitHubApiError';
  }
}

/**
 * Type guard for error handling
 */
export function isGitHubError(
  error: unknown
): error is GitHubApiError | GitHubRateLimitError {
  return error instanceof GitHubApiError || error instanceof GitHubRateLimitError;
}
