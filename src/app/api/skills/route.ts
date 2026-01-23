import { NextResponse } from 'next/server';
import { getAllSkills } from '@/lib/data';
import { handleApiError } from '@/lib/api/errors';
import type { SkillsApiResponse } from '@/lib/types';

// ISR: Revalidate every hour
export const revalidate = 3600;

/**
 * GET /api/skills
 * Returns all skills from all registered repositories
 */
export async function GET() {
  try {
    const skills = await getAllSkills();

    const response: SkillsApiResponse = {
      skills,
      count: skills.length,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
