import { NextResponse } from 'next/server';
import {
  getCategoriesCollection,
  parseCategories,
  initializeDatabase,
  type CategoriesApiResponse,
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
 * GET /api/categories
 * Fetch all categories from the database, sorted by sortOrder
 */
export async function GET(): Promise<NextResponse<CategoriesApiResponse | ErrorResponse>> {
  try {
    // Ensure database is initialized and seeded
    await ensureInitialized();

    const collection = await getCategoriesCollection();
    const documents = await collection.find().sort({ sortOrder: 1, name: 1 }).toArray();

    // Parse and validate documents using Zod
    const categories = parseCategories(documents);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('[API] Error fetching categories:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch categories';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
