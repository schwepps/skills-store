import { fetchAllSkills } from '@/lib/github';
import { registeredRepos } from '@/config/repos';
import { SkillsFilterClient } from '@/components/skill/skills-filter-client';
import { InstallTutorial } from '@/components/shared';
import { SkillsHydrator } from '@/lib/context/skills-context';

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  const skills = await fetchAllSkills();

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Hydrate context for client-side caching */}
      <SkillsHydrator skills={skills} repos={registeredRepos} />

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Skills Store</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Install superpowers into Claude in 3 clicks.
          <br />
          No developer skills needed.
        </p>
      </div>

      {/* Skills with Client-Side Filtering */}
      <SkillsFilterClient skills={skills} repos={registeredRepos} />

      {/* Install Tutorial */}
      <InstallTutorial />

      {/* Call to Action */}
      <div className="mt-16 text-center p-8 bg-muted rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Created some skills?</h2>
        <p className="text-muted-foreground mb-4">
          Add your repo to the store and share with the community.
        </p>
        <a
          href="https://github.com/schwepps/skills-store/issues/new?template=add-repo.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          Submit a repo →
        </a>
      </div>
    </div>
  );
}
