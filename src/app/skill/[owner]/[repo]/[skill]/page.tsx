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

  const metadata = await fetchSkillMetadata(
    owner,
    repo,
    skill,
    repoConfig.branch
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
  const metadata = await fetchSkillMetadata(owner, repo, skill, branch);

  if (!metadata) {
    notFound();
  }

  const downloadUrl = buildDownloadUrl(owner, repo, skill, branch);
  const githubUrl = buildGitHubUrl(owner, repo, skill, branch);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back link */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au store
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
          par {repoConfig.displayName}
          {metadata.author && ` • ${metadata.author}`}
          {metadata.version && ` • v${metadata.version}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <Button asChild size="lg">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <Download className="w-5 h-5 mr-2" />
            Télécharger
          </a>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <a href={githubUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-5 h-5 mr-2" />
            Voir sur GitHub
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
            <li>Clique sur &quot;Télécharger&quot; ci-dessus</li>
            <li>Extrait le fichier ZIP téléchargé</li>
            <li>
              Copie le dossier{' '}
              <code className="bg-muted px-1 rounded">{skill}</code> dans :
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>
                  Mac/Linux :{' '}
                  <code className="bg-muted px-1 rounded">
                    ~/.claude/commands/
                  </code>
                </li>
                <li>
                  Windows :{' '}
                  <code className="bg-muted px-1 rounded">
                    %APPDATA%\claude\commands\
                  </code>
                </li>
              </ul>
            </li>
            <li>Redémarre Claude si nécessaire</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
