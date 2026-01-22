import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { fetchRepoSkills } from '@/lib/github';
import { getRepoConfig, registeredRepos } from '@/config/repos';
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

// Generate static params for all registered repos
export async function generateStaticParams() {
  return registeredRepos.map((repo) => ({
    owner: repo.owner,
    repo: repo.repo,
  }));
}

// Generate metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  const repoConfig = getRepoConfig(owner, repo);

  if (!repoConfig) {
    return { title: 'Repo not found' };
  }

  return {
    title: `${repoConfig.displayName} - Skills Store`,
    description: repoConfig.description,
  };
}

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function RepoPage({ params }: PageProps) {
  const { owner, repo } = await params;
  const repoConfig = getRepoConfig(owner, repo);

  if (!repoConfig) {
    notFound();
  }

  const skills = await fetchRepoSkills(repoConfig);

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
          <h1 className="text-3xl font-bold">{repoConfig.displayName}</h1>
          {repoConfig.featured && (
            <Badge className="gap-1">
              <Star className="w-3 h-3" />
              Featured
            </Badge>
          )}
        </div>
        <p className="text-lg text-muted-foreground mt-2">
          {repoConfig.description}
        </p>
        {repoConfig.website && (
          <a
            href={repoConfig.website}
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
      <SkillsFilterClient skills={skills} repos={[repoConfig]} />
    </div>
  );
}
