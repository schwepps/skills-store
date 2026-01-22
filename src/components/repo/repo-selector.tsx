'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RepoConfig } from '@/lib/types';

interface RepoSelectorProps {
  repos: RepoConfig[];
  selected: string;
  onSelect: (value: string) => void;
}

export function RepoSelector({ repos, selected, onSelect }: RepoSelectorProps) {
  return (
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger className="w-[200px]" aria-label="Filter by source">
        <SelectValue placeholder="Filter by source" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All sources</SelectItem>
        {repos.map((repo) => (
          <SelectItem
            key={`${repo.owner}/${repo.repo}`}
            value={`${repo.owner}/${repo.repo}`}
          >
            {repo.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
