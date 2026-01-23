import { MetadataRoute } from 'next';
import { getAllRepositories } from '@/lib/data/repositories';
import { getAllSkills } from '@/lib/data';
import { SITE_URL } from '@/lib/config/urls';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Repo pages from database
  let repoPages: MetadataRoute.Sitemap = [];
  try {
    const repos = await getAllRepositories();
    repoPages = repos.map((repo) => ({
      url: `${baseUrl}/repo/${repo.owner}/${repo.repo}`,
      lastModified: repo.updated_at ? new Date(repo.updated_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating sitemap repos:', error);
  }

  // Skill pages from database
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
