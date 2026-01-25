import { NextRequest, NextResponse } from 'next/server';
import {
  getCountriesCollection,
  parseCountries,
  initializeDatabase,
  type CountriesApiResponse,
  type ErrorResponse,
} from '@/lib/db';

// Initialize database on first request (server-side only)
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}

/**
 * GET /api/countries
 * Fetch countries from the database
 * 
 * Query Parameters:
 * - regionCode: Filter countries by region code (optional)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<CountriesApiResponse | ErrorResponse>> {
  try {
    // Ensure database is initialized and seeded
    await ensureInitialized();

    // Get optional regionCode filter from query params
    const { searchParams } = new URL(request.url);
    const regionCode = searchParams.get('regionCode');

    const collection = await getCountriesCollection();

    // Build query
    const query = regionCode ? { regionCode } : {};

    const documents = await collection
      .find(query)
      .sort({ name: 1 })
      .toArray();

    // Parse and validate documents using Zod
    const countries = parseCountries(documents);

    return NextResponse.json({
      success: true,
      data: countries,
    });
  } catch (error) {
    console.error('[API] Error fetching countries:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch countries';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
