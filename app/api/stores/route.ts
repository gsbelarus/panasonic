import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getStoresCollection,
  parseStores,
  initializeDatabase,
  type StoresApiResponse,
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

// ============================================================================
// Query Parameter Schema
// ============================================================================

const StoresQuerySchema = z.object({
  regionCode: z.string().min(1, 'regionCode is required'),
  countryIso2: z.string().length(2, 'countryIso2 must be exactly 2 characters'),
  sort: z.enum(['nearest', 'default']).optional().default('default'),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

// ============================================================================
// Haversine Distance Calculation
// ============================================================================

/**
 * Calculate distance between two points using Haversine formula
 * @returns distance in kilometers
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// GET /api/stores
// ============================================================================

/**
 * GET /api/stores
 * Fetch stores from the database with filtering and optional nearest sorting
 *
 * Query Parameters:
 * - regionCode: Filter by region code (required)
 * - countryIso2: Filter by country ISO2 code (required)
 * - sort: 'nearest' or 'default' (optional, default: 'default')
 * - lat: Latitude for nearest sorting (required if sort=nearest)
 * - lng: Longitude for nearest sorting (required if sort=nearest)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<StoresApiResponse | ErrorResponse>> {
  try {
    // Ensure database is initialized and seeded
    await ensureInitialized();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      regionCode: searchParams.get('regionCode') || '',
      countryIso2: searchParams.get('countryIso2') || '',
      sort: searchParams.get('sort') || 'default',
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined,
    };

    // Validate query parameters
    const validationResult = StoresQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid query parameters: ${validationResult.error.message}`,
        },
        { status: 400 }
      );
    }

    const { regionCode, countryIso2, sort, lat, lng } = validationResult.data;

    // Validate that lat/lng are provided when sort=nearest
    if (sort === 'nearest' && (lat === undefined || lng === undefined)) {
      return NextResponse.json(
        {
          success: false,
          error: 'lat and lng are required when sort=nearest',
        },
        { status: 400 }
      );
    }

    const collection = await getStoresCollection();

    // Build query - only active stores
    // Use type assertion to satisfy MongoDB's strict typing
    const query = {
      regionCode: regionCode as 'africa' | 'middle-east',
      countryIso2,
      isActive: true,
    };

    // Fetch stores
    let documents;

    if (sort === 'nearest' && lat !== undefined && lng !== undefined) {
      // Use $geoNear aggregation for nearest sorting
      const pipeline = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distance',
            query: query,
            spherical: true,
          },
        },
      ];
      documents = await collection.aggregate(pipeline).toArray();
    } else {
      // Default sorting by name
      documents = await collection.find(query).sort({ name: 1 }).toArray();
    }

    // Parse and validate documents using Zod
    const stores = parseStores(documents);

    // If sorting by nearest with client-side calculation (fallback if $geoNear not available)
    if (sort === 'nearest' && lat !== undefined && lng !== undefined && documents.length > 0 && !('distance' in documents[0])) {
      // Sort by distance using Haversine formula
      stores.sort((a, b) => {
        const distA = haversineDistance(lat, lng, a.location.lat, a.location.lng);
        const distB = haversineDistance(lat, lng, b.location.lat, b.location.lng);
        return distA - distB;
      });
    }

    return NextResponse.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    console.error('[API] Error fetching stores:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch stores';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
