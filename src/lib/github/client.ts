import { GitHubApiError, GitHubRateLimitError } from '@/lib/errors';

interface GitHubFetchOptions extends RequestInit {
  /** Cache duration for ISR (seconds) */
  revalidate?: number;
}

/**
 * Build GitHub API headers with optional authentication
 */
function buildGitHubHeaders(
  additionalHeaders?: HeadersInit
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge additional headers
  if (additionalHeaders) {
    const headerEntries =
      additionalHeaders instanceof Headers
        ? Array.from(additionalHeaders.entries())
        : Object.entries(additionalHeaders);

    for (const [key, value] of headerEntries) {
      headers[key] = value;
    }
  }

  return headers;
}

/**
 * GitHub API client with authentication and error handling
 */
export async function githubFetch<T>(
  url: string,
  options: GitHubFetchOptions = {}
): Promise<T> {
  const { revalidate = 3600, ...fetchOptions } = options;

  const headers = buildGitHubHeaders(fetchOptions.headers);

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    next: { revalidate },
  });

  // Handle rate limiting
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');

    if (rateLimitRemaining === '0' && rateLimitReset) {
      throw new GitHubRateLimitError(
        new Date(parseInt(rateLimitReset, 10) * 1000)
      );
    }
  }

  // Handle other errors
  if (!response.ok) {
    const message = await response.text();
    throw new GitHubApiError(response.status, message, url);
  }

  return response.json();
}

/**
 * Check if a file exists in a repository (HEAD request)
 */
export async function checkFileExists(url: string): Promise<boolean> {
  try {
    const headers = buildGitHubHeaders();

    const response = await fetch(url, {
      method: 'HEAD',
      headers,
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch raw file content (no JSON parsing)
 */
export async function fetchRawContent(
  url: string,
  revalidate: number = 3600
): Promise<string> {
  const response = await fetch(url, {
    next: { revalidate },
  });

  if (!response.ok) {
    throw new GitHubApiError(
      response.status,
      'Failed to fetch raw content',
      url
    );
  }

  return response.text();
}
