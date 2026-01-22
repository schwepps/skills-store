import { fetchAllSkills } from '@/lib/github';
import { extractCategories } from '@/lib/categories';
import { registeredRepos } from '@/config/repos';
import { SkillsFilterClient } from '@/components/skill/skills-filter-client';
import { InstallTutorial } from '@/components/shared';

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  const skills = await fetchAllSkills();
  const categories = extractCategories(skills);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Skills Store</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Installe des super-pouvoirs dans Claude en 3 clics.
          <br />
          Pas besoin d&apos;être développeur.
        </p>
      </div>

      {/* Skills with Client-Side Filtering */}
      <SkillsFilterClient
        skills={skills}
        categories={categories}
        repos={registeredRepos}
      />

      {/* Install Tutorial */}
      <InstallTutorial />

      {/* Call to Action */}
      <div className="mt-16 text-center p-8 bg-muted rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Tu as créé des skills ?</h2>
        <p className="text-muted-foreground mb-4">
          Ajoute ton repo au store pour les partager avec la communauté.
        </p>
        <a
          href="https://github.com/schwepps/skills-store/issues/new?template=add-repo.md"
          className="text-primary hover:underline font-medium"
        >
          Proposer un repo →
        </a>
      </div>
    </div>
  );
}
