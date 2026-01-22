import { SkillCard } from './skill-card';
import type { Skill } from '@/lib/types';

interface SkillGridProps {
  skills: Skill[];
  emptyMessage?: string;
}

export function SkillGrid({
  skills,
  emptyMessage = 'No skills found',
}: SkillGridProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
