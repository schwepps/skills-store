/**
 * Supabase Database Types
 * These types match our database schema
 *
 * Note: In production, you can generate these automatically using:
 * npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts
 */

import type { SkillContent } from '@/lib/types';

export interface Database {
  public: {
    Tables: {
      repositories: {
        Row: {
          id: string;
          owner: string;
          repo: string;
          branch: string;
          display_name: string | null;
          description: string | null;
          website: string | null;
          featured: boolean;
          skills_path: string;
          category_overrides: Record<string, string>;
          exclude_folders: string[];
          last_synced_at: string | null;
          sync_status: 'pending' | 'syncing' | 'success' | 'error';
          sync_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner: string;
          repo: string;
          branch?: string;
          display_name?: string | null;
          description?: string | null;
          website?: string | null;
          featured?: boolean;
          skills_path?: string;
          category_overrides?: Record<string, string>;
          exclude_folders?: string[];
          last_synced_at?: string | null;
          sync_status?: 'pending' | 'syncing' | 'success' | 'error';
          sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner?: string;
          repo?: string;
          branch?: string;
          display_name?: string | null;
          description?: string | null;
          website?: string | null;
          featured?: boolean;
          skills_path?: string;
          category_overrides?: Record<string, string>;
          exclude_folders?: string[];
          last_synced_at?: string | null;
          sync_status?: 'pending' | 'syncing' | 'success' | 'error';
          sync_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          repo_id: string;
          skill_name: string;
          display_name: string;
          description: string;
          short_description: string | null;
          category: string | null;
          tags: string[];
          author: string | null;
          version: string | null;
          license: string | null;
          github_url: string;
          download_url: string;
          detail_url: string;
          raw_metadata: Record<string, unknown> | null;
          extended_content: SkillContent | null;
          synced_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          repo_id: string;
          skill_name: string;
          display_name: string;
          description: string;
          short_description?: string | null;
          category?: string | null;
          tags?: string[];
          author?: string | null;
          version?: string | null;
          license?: string | null;
          github_url: string;
          download_url: string;
          detail_url: string;
          raw_metadata?: Record<string, unknown> | null;
          extended_content?: SkillContent | null;
          synced_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          repo_id?: string;
          skill_name?: string;
          display_name?: string;
          description?: string;
          short_description?: string | null;
          category?: string | null;
          tags?: string[];
          author?: string | null;
          version?: string | null;
          license?: string | null;
          github_url?: string;
          download_url?: string;
          detail_url?: string;
          raw_metadata?: Record<string, unknown> | null;
          extended_content?: SkillContent | null;
          synced_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'skills_repo_id_fkey';
            columns: ['repo_id'];
            isOneToOne: false;
            referencedRelation: 'repositories';
            referencedColumns: ['id'];
          },
        ];
      };
      sync_logs: {
        Row: {
          id: string;
          repo_id: string;
          status: string;
          skills_added: number;
          skills_updated: number;
          skills_removed: number;
          duration_ms: number | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          repo_id: string;
          status: string;
          skills_added?: number;
          skills_updated?: number;
          skills_removed?: number;
          duration_ms?: number | null;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          repo_id?: string;
          status?: string;
          skills_added?: number;
          skills_updated?: number;
          skills_removed?: number;
          duration_ms?: number | null;
          error?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sync_logs_repo_id_fkey';
            columns: ['repo_id'];
            isOneToOne: false;
            referencedRelation: 'repositories';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types for common operations
export type Repository = Database['public']['Tables']['repositories']['Row'];
export type RepositoryInsert = Database['public']['Tables']['repositories']['Insert'];
export type RepositoryUpdate = Database['public']['Tables']['repositories']['Update'];

export type DbSkill = Database['public']['Tables']['skills']['Row'];
export type DbSkillInsert = Database['public']['Tables']['skills']['Insert'];
export type DbSkillUpdate = Database['public']['Tables']['skills']['Update'];

export type SyncLog = Database['public']['Tables']['sync_logs']['Row'];
export type SyncLogInsert = Database['public']['Tables']['sync_logs']['Insert'];
