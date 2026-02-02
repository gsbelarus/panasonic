import { NextResponse } from 'next/server';
import {
  getRegionsCollection,
  parseRegions,
  initializeDatabase,
  type RegionsApiResponse,
  type ErrorResponse,
} from '@/lib/db';

// Initialize database on first request using Promise singleton for thread-safety
let initializationPromise: Promise<boolean> | null = null;

async function ensureInitialized(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase();
  }
  await initializationPromise;
}

/**
 * GET /api/regions
 * Fetch all regions from the database
 */
export async function GET(): Promise<NextResponse<RegionsApiResponse | ErrorResponse>> {
  try {
    // Ensure database is initialized and seeded
    await ensureInitialized();

    const collection = await getRegionsCollection();
    const documents = await collection.find().sort({ name: 1 }).toArray();

    // Parse and validate documents using Zod
    const regions = parseRegions(documents);

    return NextResponse.json({
      success: true,
      data: regions,
    });
  } catch (error) {
    console.error('[API] Error fetching regions:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch regions';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
