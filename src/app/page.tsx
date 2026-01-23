import { getAllSkills, getAllRepositories } from '@/lib/data';
import { SkillsFilterClient } from '@/components/skill/skills-filter-client';
import { InstallTutorial } from '@/components/shared';
import { SkillsHydrator } from '@/lib/context/skills-context';
import type { RepoInfo } from '@/lib/types';

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  const skills = await getAllSkills();
  const repositories = await getAllRepositories();

  // Transform Repository[] to RepoInfo[] for the filter UI
  // Returns empty array if database is not set up yet
  const repos: RepoInfo[] = repositories.map((r) => ({
    owner: r.owner,
    repo: r.repo,
    displayName: r.display_name || `${r.owner}/${r.repo}`,
  }));

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Hydrate context for client-side caching */}
      <SkillsHydrator skills={skills} repos={repos} />

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Skills Store</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
          Install superpowers into Claude in 3 clicks.
          <br />
          No developer skills needed.
        </p>
      </div>

      {/* Skills with Client-Side Filtering */}
      <SkillsFilterClient skills={skills} repos={repos} />

      {/* Install Tutorial */}
      <InstallTutorial />
    </div>
  );
}
