'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RepoInfo } from '@/lib/types';

interface RepoSelectorProps {
  repos: RepoInfo[];
  selected: string;
  onSelect: (value: string) => void;
}

export function RepoSelector({ repos, selected, onSelect }: RepoSelectorProps) {
  // Handle empty repos (database not set up yet)
  if (repos.length === 0) {
    return (
      <Select disabled value="all">
        <SelectTrigger className="w-50" aria-label="Filter by source">
          <SelectValue placeholder="No sources yet" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">No sources yet</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger className="w-50" aria-label="Filter by source">
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
