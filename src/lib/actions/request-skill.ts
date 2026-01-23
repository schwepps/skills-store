'use server';

import { z } from 'zod';
import { SKILL_REQUEST_CATEGORIES } from '@/lib/categories';
import { SITE_URL } from '@/lib/config/urls';
import {
  getSkillRequestRepoOwner,
  getSkillRequestRepoName,
} from '@/lib/config/skill-request';

/**
 * Validation schema for skill request form
 */
const SkillRequestSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z.enum(SKILL_REQUEST_CATEGORIES),
  examplePrompts: z.string().max(1000).optional(),
});

/**
 * State for skill request action
 */
export interface RequestSkillState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  issueUrl?: string;
  error?: string;
  fieldErrors?: {
    name?: string;
    description?: string;
    category?: string;
    examplePrompts?: string;
  };
}


/**
 * Server Action to create a skill request as a GitHub issue
 *
 * Creates an issue on the skills repository with the user's request
 */
export async function requestSkillAction(
  _prevState: RequestSkillState,
  formData: FormData
): Promise<RequestSkillState> {
  // Parse and validate form data
  const parsed = SkillRequestSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    category: formData.get('category'),
    examplePrompts: formData.get('examplePrompts') || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: RequestSkillState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof typeof fieldErrors;
      fieldErrors[field] = issue.message;
    }
    return {
      status: 'error',
      error: 'Please fix the form errors',
      fieldErrors,
    };
  }

  const { name, description, category, examplePrompts } = parsed.data;

  // Check for GitHub token
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('[Action] GITHUB_TOKEN not configured');
    return {
      status: 'error',
      error: 'Service temporarily unavailable. Please try again later.',
    };
  }

  // Build issue body
  const body = buildIssueBody({ name, description, category, examplePrompts });

  try {
    const response = await fetch(
      `https://api.github.com/repos/${getSkillRequestRepoOwner()}/${getSkillRequestRepoName()}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Skills-Store-App',
        },
        body: JSON.stringify({
          title: `[Skill Request] ${name}`,
          body,
          labels: ['skill-request'],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Action] GitHub API error:', response.status, errorText);

      if (response.status === 401) {
        return {
          status: 'error',
          error: 'Authentication error. Please contact support.',
        };
      }

      if (response.status === 403) {
        return {
          status: 'error',
          error: 'Rate limit exceeded. Please try again later.',
        };
      }

      if (response.status === 404) {
        return {
          status: 'error',
          error: 'Skills repository not found. Please contact support.',
        };
      }

      return {
        status: 'error',
        error: 'Failed to create request. Please try again.',
      };
    }

    const issue = await response.json();

    return {
      status: 'success',
      issueUrl: issue.html_url,
    };
  } catch (error) {
    console.error('[Action] Error creating issue:', error);
    return {
      status: 'error',
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Build the markdown body for the GitHub issue
 */
function buildIssueBody(data: {
  name: string;
  description: string;
  category: string;
  examplePrompts?: string;
}): string {
  const { name, description, category, examplePrompts } = data;

  let body = `## Skill Request

**Name:** ${name}
**Category:** ${category}

### Description

${description}
`;

  if (examplePrompts?.trim()) {
    body += `
### Example Prompts

${examplePrompts}
`;
  }

  body += `
---
*Submitted via [Skills Store](${SITE_URL})*`;

  return body;
}
