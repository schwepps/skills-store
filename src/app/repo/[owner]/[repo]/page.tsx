import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { getSkillsByRepo } from '@/lib/data';
import { getAllRepositories, getRepository } from '@/lib/data/repositories';
import { SkillsFilterClient } from '@/components/skill/skills-filter-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

// Generate static params for all repos in database
export async function generateStaticParams() {
  const repos = await getAllRepositories();
  return repos.map((repo) => ({
    owner: repo.owner,
    repo: repo.repo,
  }));
}

// Generate metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  const repository = await getRepository(owner, repo);

  if (!repository) {
    return { title: 'Repo not found' };
  }

  return {
    title: `${repository.display_name || `${owner}/${repo}`} - Skills Store`,
    description: repository.description || `Skills from ${owner}/${repo}`,
  };
}

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function RepoPage({ params }: PageProps) {
  const { owner, repo } = await params;
  const repository = await getRepository(owner, repo);

  if (!repository) {
    notFound();
  }

  const skills = await getSkillsByRepo(owner, repo);
  const displayName = repository.display_name || `${owner}/${repo}`;

  // Transform repository to match expected format for SkillsFilterClient
  const repoForFilter = {
    owner: repository.owner,
    repo: repository.repo,
    displayName,
    description: repository.description || '',
    featured: repository.featured || false,
    website: repository.website || undefined,
  };

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Back link */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to store
        </Link>
      </Button>

      {/* Repo Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 flex-wrap">
          <h1 className="text-3xl font-bold">{displayName}</h1>
          {repository.featured && (
            <Badge className="gap-1">
              <Star className="w-3 h-3" />
              Featured
            </Badge>
          )}
        </div>
        <p className="text-lg text-muted-foreground mt-2">
          {repository.description || `Skills from ${owner}/${repo}`}
        </p>
        {repository.website && (
          <a
            href={repository.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
          >
            View on GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Skills with Filtering */}
      <SkillsFilterClient skills={skills} repos={[repoForFilter]} />
    </div>
  );
}
