import Link from 'next/link';
import { ExternalLink, Star } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RepoConfig } from '@/lib/types';

interface RepoCardProps {
  repo: RepoConfig;
  skillCount?: number;
}

export function RepoCard({ repo, skillCount }: RepoCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{repo.displayName}</CardTitle>
          {repo.featured && (
            <Badge variant="default" className="shrink-0 gap-1">
              <Star className="w-3 h-3" aria-hidden="true" />
              Featured
            </Badge>
          )}
        </div>
        <CardDescription>{repo.description}</CardDescription>
        {skillCount !== undefined && (
          <p className="text-sm text-muted-foreground">
            {skillCount} skill{skillCount !== 1 ? 's' : ''}
          </p>
        )}
      </CardHeader>
      <CardFooter className="gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/repo/${repo.owner}/${repo.repo}`}>Voir les skills</Link>
        </Button>
        {repo.website && (
          <Button variant="ghost" size="icon" asChild>
            <a
              href={repo.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visiter le site de ${repo.displayName}`}
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
