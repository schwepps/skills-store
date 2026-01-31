import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, Tag, Terminal } from 'lucide-react';
import { getSkillByName } from '@/lib/data';
import { getRepository } from '@/lib/data/repositories';
import { formatCount } from '@/lib/utils';
import { SITE_URL } from '@/lib/config/urls';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillUsageTriggers } from '@/components/skill/skill-usage-triggers';
import { SkillExamples } from '@/components/skill/skill-examples';
import { InstallCommand } from '@/components/skill/install-command';
import { JsonLd } from '@/components/shared/json-ld';
import { generateSoftwareApplicationSchema, generateSkillBreadcrumbs } from '@/lib/schema';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    owner: string;
    repo: string;
    skill: string;
  }>;
}

// Generate dynamic metadata based on skill content
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { owner, repo, skill } = await params;
  const skillData = await getSkillByName(owner, repo, skill);

  if (!skillData) {
    return {
      title: 'Skill not found',
      description: 'The requested skill could not be found.',
    };
  }

  const { metadata, githubUrl, detailUrl, displayName } = skillData;
  const canonicalUrl = `${SITE_URL}${detailUrl}`;

  // Build keywords from tags + category
  const keywords = ['Claude', 'AI skill', metadata.category, ...(metadata.tags || [])].filter(
    Boolean
  ) as string[];

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
  const repository = await getRepository(owner, repo);

  if (!repository) {
    notFound();
  }

  const skillData = await getSkillByName(owner, repo, skill);

  if (!skillData) {
    notFound();
  }

  const { metadata, downloadUrl, githubUrl, downloadCount, detailUrl } = skillData;
  const repoDisplayName = repository.display_name || `${owner}/${repo}`;
  const repoUrl = `/repo/${owner}/${repo}`;

  // Generate JSON-LD schemas
  const softwareSchema = generateSoftwareApplicationSchema({
    name: metadata.name,
    description: metadata.description,
    url: detailUrl,
    author: metadata.author,
    version: metadata.version,
    downloadCount,
    tags: metadata.tags,
    category: metadata.category,
  });
  const breadcrumbSchema = generateSkillBreadcrumbs(repoDisplayName, repoUrl, metadata.name);

  return (
    <div className="container-narrow py-8 sm:py-12">
      {/* JSON-LD Structured Data */}
      <JsonLd schema={[softwareSchema, breadcrumbSchema]} />

      {/* Back link */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to store
        </Link>
      </Button>

      {/* Skill Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-start gap-4">
          <h1 className="text-3xl font-bold">{metadata.name}</h1>
          {metadata.category && <Badge variant="secondary">{metadata.category}</Badge>}
        </div>

        <p className="text-muted-foreground text-lg" itemProp="description">
          {metadata.description}
        </p>

        {/* Semantic metadata for AI crawlers */}
        <dl className="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <div className="flex items-center gap-1">
            <dt className="sr-only">Repository</dt>
            <dd itemProp="isPartOf">by {repoDisplayName}</dd>
          </div>
          {metadata.author && (
            <div className="flex items-center gap-1">
              <dt className="sr-only">Author</dt>
              <dd itemProp="author">• {metadata.author}</dd>
            </div>
          )}
          {metadata.version && (
            <div className="flex items-center gap-1">
              <dt className="sr-only">Version</dt>
              <dd itemProp="version">• v{metadata.version}</dd>
            </div>
          )}
          <div className="flex items-center gap-1">
            <dt className="sr-only">Downloads</dt>
            <dd itemProp="interactionCount">• {formatCount(downloadCount)} downloads</dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="mb-8 flex gap-4">
        <Button asChild size="lg">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-5 w-5" />
            Download
          </a>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <a href={githubUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-5 w-5" />
            View on GitHub
          </a>
        </Button>
      </div>

      {/* Tags */}
      {metadata.tags && metadata.tags.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5" />
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
      {metadata.content?.usageTriggers && metadata.content.usageTriggers.length > 0 && (
        <div className="mb-8">
          <SkillUsageTriggers triggers={metadata.content.usageTriggers} />
        </div>
      )}

      {/* Example Prompts */}
      {metadata.content?.examplePrompts && metadata.content.examplePrompts.length > 0 && (
        <div className="mb-8">
          <SkillExamples prompts={metadata.content.examplePrompts} />
        </div>
      )}

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Terminal className="h-5 w-5" />
            Installation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary: skills.sh command */}
          <InstallCommand owner={owner} repo={repo} skillName={skill} />

          {/* Alternative: Manual download */}
          <div className="border-t pt-4">
            <p className="mb-2 text-sm font-medium">Alternative: Manual Download</p>
            <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
              <li>Click &quot;Download&quot; above</li>
              <li>Extract the ZIP file</li>
              <li>
                Copy the <code className="bg-muted rounded px-1">{skill}</code> folder to your
                Claude commands
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
