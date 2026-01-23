import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, Tag, Terminal } from 'lucide-react';
import { getSkillByName } from '@/lib/data';
import { getRepoConfig } from '@/config/repos';
import { formatCount } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillUsageTriggers } from '@/components/skill/skill-usage-triggers';
import { SkillExamples } from '@/components/skill/skill-examples';
import { InstallCommand } from '@/components/skill/install-command';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    owner: string;
    repo: string;
    skill: string;
  }>;
}

// Generate dynamic metadata based on skill content
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner, repo, skill } = await params;
  const skillData = await getSkillByName(owner, repo, skill);

  if (!skillData) {
    return {
      title: 'Skill not found',
      description: 'The requested skill could not be found.',
    };
  }

  const { metadata, githubUrl, detailUrl, displayName } = skillData;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://skills-store.vercel.app';
  const canonicalUrl = `${baseUrl}${detailUrl}`;

  // Build keywords from tags + category
  const keywords = [
    'Claude',
    'AI skill',
    metadata.category,
    ...(metadata.tags || []),
  ].filter(Boolean) as string[];

  return {
    title: displayName,
    description: metadata.description,
    keywords,
    authors: metadata.author ? [{ name: metadata.author }] : undefined,

    openGraph: {
      title: `${displayName} - Claude Skill`,
      description: metadata.description,
      url: canonicalUrl,
      type: 'article',
      siteName: 'Skills Store',
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: `${displayName} - Claude AI Skill`,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${displayName} - Claude Skill`,
      description: metadata.description,
      images: ['/images/og-image.png'],
    },

    alternates: {
      canonical: canonicalUrl,
    },

    other: {
      'skill:category': metadata.category || 'general',
      'skill:version': metadata.version || '',
      'skill:source': githubUrl,
    },
  };
}

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function SkillPage({ params }: PageProps) {
  const { owner, repo, skill } = await params;
  const repoConfig = getRepoConfig(owner, repo);

  if (!repoConfig) {
    notFound();
  }

  const skillData = await getSkillByName(owner, repo, skill);

  if (!skillData) {
    notFound();
  }

  const { metadata, downloadUrl, githubUrl, downloadCount } = skillData;

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* Back link */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to store
        </Link>
      </Button>

      {/* Skill Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4 flex-wrap mb-4">
          <h1 className="text-3xl font-bold">{metadata.name}</h1>
          {metadata.category && (
            <Badge variant="secondary">{metadata.category}</Badge>
          )}
        </div>

        <p className="text-lg text-muted-foreground">{metadata.description}</p>

        <p className="text-sm text-muted-foreground mt-2">
          by {repoConfig.displayName}
          {metadata.author && ` • ${metadata.author}`}
          {metadata.version && ` • v${metadata.version}`}
          {downloadCount > 0 && ` • ${formatCount(downloadCount)} installs`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <Button asChild size="lg">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <Download className="w-5 h-5 mr-2" />
            Download
          </a>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <a href={githubUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-5 h-5 mr-2" />
            View on GitHub
          </a>
        </Button>
      </div>

      {/* Tags */}
      {metadata.tags && metadata.tags.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Triggers */}
      {metadata.content?.usageTriggers &&
        metadata.content.usageTriggers.length > 0 && (
          <div className="mb-8">
            <SkillUsageTriggers triggers={metadata.content.usageTriggers} />
          </div>
        )}

      {/* Example Prompts */}
      {metadata.content?.examplePrompts &&
        metadata.content.examplePrompts.length > 0 && (
          <div className="mb-8">
            <SkillExamples prompts={metadata.content.examplePrompts} />
          </div>
        )}

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Installation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary: skills.sh command */}
          <InstallCommand owner={owner} repo={repo} skillName={skill} />

          {/* Alternative: Manual download */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">
              Alternative: Manual Download
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click &quot;Download&quot; above</li>
              <li>Extract the ZIP file</li>
              <li>
                Copy the{' '}
                <code className="bg-muted px-1 rounded">{skill}</code> folder to
                your Claude commands
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
