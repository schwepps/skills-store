// Using Zod 4.x - https://zod.dev/v4

import { z } from 'zod';

/**
 * Schema for SKILL.md frontmatter validation
 * Supports minimal (name + description) and extended formats
 */
export const SkillMetadataSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  description: z.string().min(1, 'Skill description is required'),
  category: z.string().optional(),
  tags: z
    .union([
      z.array(z.string()),
      z
        .string()
        .transform((s) =>
          s
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        ),
    ])
    .optional(),
  author: z.string().optional(),
  version: z.string().optional(),
  license: z.string().optional(),
  // Extended format support: metadata nested object
  metadata: z
    .object({
      category: z.string().optional(),
      tags: z
        .union([
          z.array(z.string()),
          z
            .string()
            .transform((s) =>
              s
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            ),
        ])
        .optional(),
      author: z.string().optional(),
      version: z.string().optional(),
    })
    .optional(),
});

/**
 * Schema for RepoConfig validation
 */
export const RepoConfigSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().default('main'),
  displayName: z.string().min(1),
  description: z.string().min(1),
  website: z.url().optional(),
  featured: z.boolean().default(false),
  config: z
    .object({
      defaultCategory: z.string().optional(),
      categoryOverrides: z.record(z.string(), z.string()).optional(),
      excludeFolders: z.array(z.string()).optional(),
    })
    .optional(),
});

/**
 * Schema for filter query parameters
 */
export const FilterQuerySchema = z.object({
  search: z.string().default(''),
  category: z.string().default('all'),
  repo: z.string().default('all'),
});

/**
 * Type inference helpers
 */
export type SkillMetadataInput = z.input<typeof SkillMetadataSchema>;
export type SkillMetadataOutput = z.output<typeof SkillMetadataSchema>;
export type RepoConfigInput = z.input<typeof RepoConfigSchema>;
export type FilterQuery = z.infer<typeof FilterQuerySchema>;
