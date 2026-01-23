import { NextResponse } from 'next/server';
import { getAllSkills } from '@/lib/data';
import { extractCategories } from '@/lib/categories';
import { handleApiError } from '@/lib/api/errors';

// ISR: Revalidate every hour
export const revalidate = 3600;

/**
 * GET /api/categories
 * Returns all categories with skill counts
 */
export async function GET() {
  try {
    const skills = await getAllSkills();
    const categories = extractCategories(skills);

    return NextResponse.json({
      categories,
      count: categories.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
