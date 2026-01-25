import { NextRequest, NextResponse } from 'next/server';
import {
  getSubcategoriesCollection,
  parseSubcategories,
  initializeDatabase,
  type SubcategoriesApiResponse,
  type ErrorResponse,
} from '@/lib/db';

// Initialize database on first request (server-side only)
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    const success = await initializeDatabase();
    initialized = success;
  }
}

/**
 * GET /api/subcategories
 * Fetch subcategories from the database
 * 
 * Query Parameters:
 * - categoryCode: Filter subcategories by category code (optional)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<SubcategoriesApiResponse | ErrorResponse>> {
  try {
    // Ensure database is initialized and seeded
    await ensureInitialized();

    // Get optional categoryCode filter from query params
    const { searchParams } = new URL(request.url);
    const categoryCode = searchParams.get('categoryCode');

    const collection = await getSubcategoriesCollection();

    // Build query
    const query = categoryCode ? { categoryCode } : {};

    const documents = await collection
      .find(query)
      .sort({ sortOrder: 1, name: 1 })
      .toArray();

    // Parse and validate documents using Zod
    const subcategories = parseSubcategories(documents);

    return NextResponse.json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    console.error('[API] Error fetching subcategories:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch subcategories';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
