'use client';

import { useRouter } from 'next/navigation';
import { Download, ExternalLink } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Skill } from '@/lib/types';

interface SkillCardProps {
  skill: Skill;
  className?: string;
}

export function SkillCard({ skill, className }: SkillCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(skill.detailUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(skill.detailUrl);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      className="block group cursor-pointer"
    >
      <Card
        className={cn(
          'flex flex-col h-full hover:shadow-lg transition-all cursor-pointer',
          'hover:border-primary/50',
          className
        )}
      >
        <CardHeader className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
              {skill.displayName}
            </CardTitle>
            {skill.metadata.category && (
              <Badge variant="secondary" className="shrink-0">
                {skill.metadata.category}
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm text-muted-foreground line-clamp-3">
            {skill.shortDescription}
          </CardDescription>
          <p className="text-xs text-muted-foreground mt-2">
            by {skill.repoDisplayName}
          </p>
        </CardHeader>

        <CardFooter className="pt-4 gap-2">
          <Button
            asChild
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={skill.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Download ${skill.displayName}`}
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Download
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={skill.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${skill.displayName} on GitHub`}
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
