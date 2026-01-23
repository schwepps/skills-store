'use client';

import { useState, useMemo, useCallback } from 'react';
import { SkillGrid } from './skill-grid';
import { SearchBar } from '@/components/shared';
import { CategoryFilter } from '@/components/shared';
import { RepoSelector } from '@/components/repo';
import { extractCategories } from '@/lib/categories';
import { useDebounce } from '@/lib/hooks';
import type { Skill, RepoInfo } from '@/lib/types';

// Pagination constants
const INITIAL_DISPLAY_COUNT = 12; // 3 rows of 4 on xl screens
const LOAD_MORE_COUNT = 12;

interface SkillsFilterClientProps {
  skills: Skill[];
  repos: RepoInfo[];
}

export function SkillsFilterClient({
  skills,
  repos,
}: SkillsFilterClientProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [repo, setRepo] = useState('all');
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  // Debounce search input to avoid filtering on every keystroke
  const debouncedSearch = useDebounce(search, 300);

  // Filter skills by repo first (for dynamic category computation)
  const repoFilteredSkills = useMemo(() => {
    if (repo === 'all') return skills;
    return skills.filter((skill) => `${skill.owner}/${skill.repo}` === repo);
  }, [skills, repo]);

  // Compute categories dynamically based on repo-filtered skills
  const dynamicCategories = useMemo(() => {
    return extractCategories(repoFilteredSkills);
  }, [repoFilteredSkills]);

  // Handler for search that also resets pagination
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  }, []);

  // Handler functions that reset pagination when filters change
  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  }, []);

  // Handle repo change - also reset category if it won't exist in the new repo
  const handleRepoChange = useCallback(
    (newRepo: string) => {
      // Get skills for the new repo to compute available categories
      const newRepoSkills =
        newRepo === 'all'
          ? skills
          : skills.filter((skill) => `${skill.owner}/${skill.repo}` === newRepo);
      const newCategories = extractCategories(newRepoSkills);

      // Reset category if current selection won't exist in new repo
      const categoryExists =
        category === 'all' || newCategories.some((c) => c.id === category);
      if (!categoryExists) {
        setCategory('all');
      }

      setRepo(newRepo);
      setDisplayCount(INITIAL_DISPLAY_COUNT);
    },
    [skills, category]
  );

  // Apply all filters (search + category) on repo-filtered skills
  const filteredSkills = useMemo(() => {
    return repoFilteredSkills.filter((skill) => {
      // Search filter (using debounced value for performance)
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchesSearch =
          // Primary fields
          skill.displayName.toLowerCase().includes(q) ||
          skill.shortDescription.toLowerCase().includes(q) ||
          skill.metadata.description.toLowerCase().includes(q) ||
          // Tags
          skill.metadata.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
          // Secondary fields
          skill.metadata.category?.toLowerCase().includes(q) ||
          skill.metadata.author?.toLowerCase().includes(q) ||
          skill.repoDisplayName.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (category !== 'all') {
        if (skill.metadata.category !== category) return false;
      }

      return true;
    });
  }, [repoFilteredSkills, debouncedSearch, category]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar value={search} onChange={handleSearchChange} className="flex-1" />
          <RepoSelector repos={repos} selected={repo} onSelect={handleRepoChange} />
        </div>
        <CategoryFilter
          categories={dynamicCategories}
          selected={category}
          onSelect={handleCategoryChange}
        />
      </div>

      {/* Results count - only show when we have data */}
      {skills.length > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Skills Grid with Load More pagination */}
      <SkillGrid
        skills={filteredSkills.slice(0, displayCount)}
        hasMore={displayCount < filteredSkills.length}
        remainingCount={filteredSkills.length - displayCount}
        onLoadMore={() => setDisplayCount((prev) => prev + LOAD_MORE_COUNT)}
        emptyMessage={
          skills.length === 0
            ? "No skills available yet. Set up the database and sync repositories to get started."
            : "No skills match your search."
        }
      />
    </>
  );
}
