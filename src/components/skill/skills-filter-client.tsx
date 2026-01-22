'use client';

import { useState, useMemo } from 'react';
import { SkillGrid } from './skill-grid';
import { SearchBar } from '@/components/shared';
import { CategoryFilter } from '@/components/shared';
import { RepoSelector } from '@/components/repo';
import type { Skill, Category, RepoConfig } from '@/lib/types';

interface SkillsFilterClientProps {
  skills: Skill[];
  categories: Category[];
  repos: RepoConfig[];
}

export function SkillsFilterClient({
  skills,
  categories,
  repos,
}: SkillsFilterClientProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [repo, setRepo] = useState('all');

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          skill.displayName.toLowerCase().includes(searchLower) ||
          skill.shortDescription.toLowerCase().includes(searchLower) ||
          skill.metadata.tags?.some((tag) =>
            tag.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Category filter
      if (category !== 'all') {
        if (skill.metadata.category !== category) return false;
      }

      // Repo filter
      if (repo !== 'all') {
        const skillRepo = `${skill.owner}/${skill.repo}`;
        if (skillRepo !== repo) return false;
      }

      return true;
    });
  }, [skills, search, category, repo]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar value={search} onChange={setSearch} className="flex-1" />
          <RepoSelector repos={repos} selected={repo} onSelect={setRepo} />
        </div>
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}{' '}
        trouvée{filteredSkills.length !== 1 ? 's' : ''}
      </p>

      {/* Skills Grid */}
      <SkillGrid
        skills={filteredSkills}
        emptyMessage="Aucune skill ne correspond à votre recherche."
      />
    </>
  );
}
