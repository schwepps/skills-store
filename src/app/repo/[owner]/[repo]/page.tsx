import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { getSkillsByRepo } from '@/lib/data';
import { getAllRepositories, getRepository } from '@/lib/data/repositories';
import { SkillsFilterClient } from '@/components/skill/skills-filter-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/shared/json-ld';
import { generateRepoBreadcrumbs } from '@/lib/schema';
import { SITE_URL } from '@/lib/config/urls';
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

// Generate metadata with OG images and canonical URL
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  const repository = await getRepository(owner, repo);

  if (!repository) {
    return { title: 'Repo not found' };
  }

  const displayName = repository.display_name || `${owner}/${repo}`;
  const description =
    repository.description || `Browse and install Claude AI skills from ${displayName}`;
  const canonicalUrl = `${SITE_URL}/repo/${owner}/${repo}`;

  return {
    title: `${displayName} - Skills Store`,
    description,
    openGraph: {
      title: `${displayName} - Claude AI Skills`,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Skills Store',
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: `${displayName} - Claude AI Skills Collection`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} - Claude AI Skills`,
      description,
      images: ['/images/og-image.png'],
    },
    alternates: {
      canonical: canonicalUrl,
    },
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

  // Generate breadcrumb schema
  const breadcrumbSchema = generateRepoBreadcrumbs(displayName);

  return (
    <div className="container-page py-8 sm:py-12">
      {/* JSON-LD Structured Data */}
      <JsonLd schema={breadcrumbSchema} />

      {/* Back link */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to store
        </Link>
      </Button>

      {/* Repo Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start gap-4">
          <h1 className="text-3xl font-bold">{displayName}</h1>
          {repository.featured && (
            <Badge className="gap-1">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2 text-lg">
          {repository.description || `Skills from ${owner}/${repo}`}
        </p>
        {repository.website && (
          <a
            href={repository.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary mt-2 inline-flex items-center gap-1 hover:underline"
          >
            View on GitHub
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Skills with Filtering */}
      <SkillsFilterClient skills={skills} repos={[repoForFilter]} />
    </div>
  );
}
