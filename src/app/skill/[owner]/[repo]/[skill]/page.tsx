import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, Tag } from 'lucide-react';
import { fetchSkillMetadata } from '@/lib/github';
import { getRepoConfig } from '@/config/repos';
import { buildDownloadUrl, buildGitHubUrl } from '@/lib/github/urls';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    owner: string;
    repo: string;
    skill: string;
  }>;
}

// Generate metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner, repo, skill } = await params;
  const repoConfig = getRepoConfig(owner, repo);

  if (!repoConfig) {
    return { title: 'Skill not found' };
  }

  const skillsPath = repoConfig.config?.skillsPath || '';
  const metadata = await fetchSkillMetadata(
    owner,
    repo,
    skill,
    repoConfig.branch,
    skillsPath
  );

  if (!metadata) {
    return { title: 'Skill not found' };
  }

  return {
    title: `${metadata.name} - Skills Store`,
    description: metadata.description,
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

  const branch = repoConfig.branch || 'main';
  const skillsPath = repoConfig.config?.skillsPath || '';
  const metadata = await fetchSkillMetadata(owner, repo, skill, branch, skillsPath);

  if (!metadata) {
    notFound();
  }

  const fullPath = skillsPath ? `${skillsPath}/${skill}` : skill;
  const downloadUrl = buildDownloadUrl(owner, repo, fullPath, branch);
  const githubUrl = buildGitHubUrl(owner, repo, fullPath, branch);

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

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Installation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Click &quot;Download&quot; above</li>
            <li>Extract the downloaded ZIP file</li>
            <li>
              Copy the{' '}
              <code className="bg-muted px-1 rounded">{skill}</code> folder into
              your Claude capabilities (commands folder)
            </li>
            <li>Restart Claude if needed</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
