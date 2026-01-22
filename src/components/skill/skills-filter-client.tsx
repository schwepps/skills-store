'use client';

import { useState, useMemo, useEffect } from 'react';
import { SkillGrid } from './skill-grid';
import { SearchBar } from '@/components/shared';
import { CategoryFilter } from '@/components/shared';
import { RepoSelector } from '@/components/repo';
import { extractCategories } from '@/lib/categories';
import { useDebounce } from '@/lib/hooks';
import type { Skill, RepoConfig } from '@/lib/types';

interface SkillsFilterClientProps {
  skills: Skill[];
  repos: RepoConfig[];
}

export function SkillsFilterClient({
  skills,
  repos,
}: SkillsFilterClientProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [repo, setRepo] = useState('all');

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

  // Reset category to 'all' when repo changes and category no longer exists
  useEffect(() => {
    if (category !== 'all') {
      const categoryExists = dynamicCategories.some((c) => c.id === category);
      if (!categoryExists) {
        setCategory('all');
      }
    }
  }, [repo, dynamicCategories, category]);

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
          <SearchBar value={search} onChange={setSearch} className="flex-1" />
          <RepoSelector repos={repos} selected={repo} onSelect={setRepo} />
        </div>
        <CategoryFilter
          categories={dynamicCategories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''} found
      </p>

      {/* Skills Grid */}
      <SkillGrid
        skills={filteredSkills}
        emptyMessage="No skills match your search."
      />
    </>
  );
}
