import { MetadataRoute } from 'next';
import { registeredRepos } from '@/config/repos';
import { getAllSkills } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://skills-store.vercel.app';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Repo pages
  const repoPages: MetadataRoute.Sitemap = registeredRepos.map((repo) => ({
    url: `${baseUrl}/repo/${repo.owner}/${repo.repo}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Skill pages
  let skillPages: MetadataRoute.Sitemap = [];
  try {
    const skills = await getAllSkills();
    skillPages = skills.map((skill) => ({
      url: `${baseUrl}/skill/${skill.owner}/${skill.repo}/${skill.skillName}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error generating sitemap skills:', error);
  }

  return [...staticPages, ...repoPages, ...skillPages];
}
