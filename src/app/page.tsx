import { getAllSkills, getAllRepositories } from '@/lib/data';
import { SkillsFilterClient } from '@/components/skill/skills-filter-client';
import { InstallTutorial } from '@/components/shared';
import { SkillsHydrator } from '@/lib/context/skills-context';
import { JsonLd } from '@/components/shared/json-ld';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateItemListSchema,
} from '@/lib/schema';
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

  // Generate JSON-LD schemas for SEO/GEO
  const skillListItems = skills.slice(0, 20).map((skill) => ({
    name: skill.displayName,
    description: skill.metadata.description,
    url: skill.detailUrl,
  }));

  return (
    <div className="container-page py-8 sm:py-12">
      {/* JSON-LD Structured Data for AI crawlers */}
      <JsonLd
        schema={[
          generateOrganizationSchema(),
          generateWebSiteSchema(),
          generateItemListSchema(skillListItems, {
            name: 'Claude AI Skills Catalog',
            description: 'Browse and install skills to enhance Claude AI capabilities',
          }),
        ]}
      />

      {/* Hydrate context for client-side caching */}
      <SkillsHydrator skills={skills} repos={repos} />

      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Skills Store</h1>
        <p className="text-muted-foreground mx-auto mb-2 max-w-2xl text-xl">
          Install superpowers into Claude in 2 clicks.
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
