import { NextResponse } from 'next/server';
import {
  getCategoriesCollection,
  parseCategories,
  initializeDatabase,
  type CategoriesApiResponse,
  type ErrorResponse,
} from '@/lib/db';

// Initialize database on first request using Promise singleton for thread-safety
let initializationPromise: Promise<boolean> | null = null;

async function ensureInitialized(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase();
  }
  const success = await initializationPromise;
  if (!success) {
    // Clear the cached promise so next request can retry
    initializationPromise = null;
    throw new Error('Database initialization failed');
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
