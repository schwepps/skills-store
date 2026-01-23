/**
 * Example prompt that can be copied and used
 */
export interface ExamplePrompt {
  /** Short title/description of the example */
  title?: string;
  /** The actual prompt text */
  prompt: string;
  /** Expected outcome description */
  expectedOutcome?: string;
}

/**
 * Workflow phase with steps
 */
export interface WorkflowPhase {
  /** Phase name (e.g., "1. Analysis") */
  name: string;
  /** Phase description */
  description: string;
  /** Sub-steps if any */
  steps?: string[];
}

/**
 * Extended content extracted from SKILL.md body
 * Separate from frontmatter metadata
 */
export interface SkillContent {
  /** Usage scenarios - "When to use this skill" bullets */
  usageTriggers?: string[];
  /** Example prompts users can copy */
  examplePrompts?: ExamplePrompt[];
  /** Workflow phases/steps if present */
  workflowPhases?: WorkflowPhase[];
}

/**
 * Metadata extracted from SKILL.md frontmatter
 * Supports 3 formats: Anthropic minimal, extended, and alternative
 */
export interface SkillMetadata {
  /** Skill name (required) */
  name: string;
  /** Skill description (required) */
  description: string;
  /** Category for filtering (optional, can be inferred) */
  category?: string;
  /** Tags for search and filtering */
  tags?: string[];
  /** Skill author */
  author?: string;
  /** Skill version */
  version?: string;
  /** License */
  license?: string;
  /** Extended content from markdown body */
  content?: SkillContent;
}

/**
 * Complete skill representation with all computed fields
 */
export interface Skill {
  // Identifiers
  /** Unique ID: "{owner}/{repo}/{skillName}" */
  id: string;
  /** GitHub repository owner */
  owner: string;
  /** GitHub repository name */
  repo: string;
  /** Skill folder name in the repo */
  skillName: string;

  // Metadata from SKILL.md
  metadata: SkillMetadata;

  // URLs
  /** Link to the skill folder on GitHub */
  githubUrl: string;
  /** Download URL via download-directory.github.io */
  downloadUrl: string;
  /** Raw URL to SKILL.md content */
  rawSkillMdUrl: string;
  /** Internal URL to skill detail page */
  detailUrl: string;

  // Display
  /** Human-readable name (metadata.name or formatted skillName) */
  displayName: string;
  /** First line of description, truncated */
  shortDescription: string;

  // Source
  /** Repository display name for UI */
  repoDisplayName: string;
  /** Repository branch */
  branch: string;

  // Stats
  /** Installation count from skills.sh */
  downloadCount: number;
}

/**
 * Repository configuration for the registry
 */
export interface RepoConfig {
  /** GitHub username or organization */
  owner: string;
  /** Repository name */
  repo: string;
  /** Branch to fetch from (default: 'main') */
  branch?: string;
  /** Human-readable name for UI */
  displayName: string;
  /** Short description of the repo */
  description: string;
  /** Repository website or homepage */
  website?: string;
  /** Whether to feature on homepage */
  featured?: boolean;

  /** Optional configuration overrides */
  config?: RepoConfigOptions;
}

/**
 * Optional configuration for repository processing
 */
export interface RepoConfigOptions {
  /** Subdirectory containing skills (e.g., "skills" for anthropics/skills) */
  skillsPath?: string;
  /** Force category for all skills in this repo */
  defaultCategory?: string;
  /** Category overrides by skill folder name */
  categoryOverrides?: Record<string, string>;
  /** Folders to exclude from scanning */
  excludeFolders?: string[];
}

/**
 * Repository with its fetched skills
 */
export interface RepoWithSkills {
  /** Repository configuration */
  config: RepoConfig;
  /** Fetched skills */
  skills: Skill[];
  /** ISO date of last fetch */
  lastFetched: string;
  /** Error message if fetch failed */
  error?: string;
}

/**
 * Simplified repository info for filtering UI
 * Used when we don't need full RepoConfig details
 */
export interface RepoInfo {
  /** GitHub username or organization */
  owner: string;
  /** Repository name */
  repo: string;
  /** Human-readable name for UI */
  displayName: string;
}

/**
 * Category for filtering UI
 */
export interface Category {
  /** Category ID (lowercase, no spaces) */
  id: string;
  /** Display label */
  label: string;
  /** Lucide icon name */
  icon: string;
  /** Number of skills in this category */
  count?: number;
}

/**
 * API response for skills endpoint
 */
export interface SkillsApiResponse {
  skills: Skill[];
  count: number;
  lastUpdated: string;
}

/**
 * API response for repo endpoint
 */
export interface RepoApiResponse {
  repo: RepoConfig;
  skills: Skill[];
  count: number;
}

/**
 * Filter state for the UI
 */
export interface SkillFilters {
  /** Search query */
  search: string;
  /** Selected category ID */
  category: string;
  /** Selected repo "{owner}/{repo}" or "all" */
  repo: string;
}

/**
 * Fetch state for async operations
 */
export type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
