import { SkillCard } from './skill-card';
import { Button } from '@/components/ui/button';
import type { Skill } from '@/lib/types';

interface SkillGridProps {
  skills: Skill[];
  emptyMessage?: string;
  /** Whether there are more skills to load */
  hasMore?: boolean;
  /** Number of remaining skills not yet displayed */
  remainingCount?: number;
  /** Callback to load more skills */
  onLoadMore?: () => void;
}

export function SkillGrid({
  skills,
  emptyMessage = 'No skills found',
  hasMore = false,
  remainingCount = 0,
  onLoadMore,
}: SkillGridProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={onLoadMore}>
            Load More ({remainingCount} remaining)
          </Button>
        </div>
      )}
    </>
  );
}
