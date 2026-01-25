import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getProductsCollection,
  getCategoriesCollection,
  getSubcategoriesCollection,
  parseProducts,
  initializeDatabase,
  type ErrorResponse,
} from '@/lib/db';
import type { ProductResponse } from '@/lib/db/products/schema';

// Initialize database on first request (server-side only)
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    const success = await initializeDatabase();
    initialized = success;
  }
}

// ============================================================================
// Query Parameter Schema
// ============================================================================

const ProductsQuerySchema = z.object({
  regionCode: z.string().optional(),
  countryKey: z.string().optional(),
  categoryCode: z.string().optional(),
  subcategoryCode: z.string().optional(),
  voltage: z.string().optional(), // Comma-separated values for multiple voltages
  q: z.string().optional(), // Search query
  limit: z.coerce.number().int().min(1).max(100).default(12),
  skip: z.coerce.number().int().min(0).default(0),
});

// ============================================================================
// Response Types
// ============================================================================

export interface ProductsApiResponse {
  success: true;
  data: ProductResponse[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

// ============================================================================
// GET /api/products
// ============================================================================

/**
 * GET /api/products
 * Fetch products from the database with filtering and pagination
 *
 * Query Parameters:
 * - regionCode: Filter by region code
 * - countryKey: Filter by country key (ISO2 code)
 * - categoryCode: Filter by category code
 * - subcategoryCode: Filter by subcategory code
 * - voltage: Filter by voltage (comma-separated for multiple)
 * - q: Search query (searches model code and category)
 * - limit: Number of items per page (default: 12, max: 100)
 * - skip: Number of items to skip (for pagination)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ProductsApiResponse | ErrorResponse>> {
  try {
    // Ensure database is initialized and seeded
    await ensureInitialized();

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      regionCode: searchParams.get('regionCode') || undefined,
      countryKey: searchParams.get('countryKey') || undefined,
      categoryCode: searchParams.get('categoryCode') || undefined,
      subcategoryCode: searchParams.get('subcategoryCode') || undefined,
      voltage: searchParams.get('voltage') || undefined,
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') || undefined,
      skip: searchParams.get('skip') || undefined,
    };

    const parsed = ProductsQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid query parameters: ${parsed.error.message}`,
        },
        { status: 400 }
      );
    }

    const { regionCode, countryKey, categoryCode, subcategoryCode, voltage, q, limit, skip } =
      parsed.data;

    // Validate referential integrity
    const validCategoryCodes = await getValidCategoryCodes();
    const validSubcategoryCodes = await getValidSubcategoryCodes();

    // Build MongoDB query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {
      isActive: true,
    };

    // Filter by market specs (region and country)
    // Products with matching marketSpecs OR products with empty marketSpecs (universal products)
    if (regionCode || countryKey) {
      const marketConditions = [];

      // Condition 1: Products with matching marketSpecs
      const matchingMarketSpec: Record<string, string> = {};
      if (regionCode) {
        matchingMarketSpec['marketSpecs.regionCode'] = regionCode;
      }
      if (countryKey) {
        matchingMarketSpec['marketSpecs.countryKey'] = countryKey;
      }
      marketConditions.push(matchingMarketSpec);

      // Condition 2: Products with empty marketSpecs (universal products available everywhere)
      marketConditions.push({ marketSpecs: { $size: 0 } });

      query.$or = marketConditions;
    }

    // Filter by category (only if valid)
    if (categoryCode) {
      if (validCategoryCodes.has(categoryCode)) {
        query.categoryCode = categoryCode;
      } else {
        // Invalid category code - return empty results
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            limit,
            skip,
            hasMore: false,
          },
        });
      }
    }

    // Filter by subcategory (only if valid)
    if (subcategoryCode) {
      if (validSubcategoryCodes.has(subcategoryCode)) {
        query.subcategoryCode = subcategoryCode;
      } else {
        // Invalid subcategory code - return empty results
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            limit,
            skip,
            hasMore: false,
          },
        });
      }
    }

    // Filter by voltage (from marketSpecs.electrical.voltage)
    if (voltage) {
      const voltages = voltage.split(',').map((v) => v.trim());
      // Create regex patterns to match voltage values like "220V", "230V", etc.
      const voltagePatterns = voltages.map((v) => new RegExp(`^${v}V?$`, 'i'));
      query['marketSpecs.electrical.voltage'] = { $in: voltagePatterns };
    }

    // Search by model code or category name
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      const searchCondition = [{ modelCode: searchRegex }, { categoryCode: searchRegex }];

      // If we already have $or from market spec filtering, we need to use $and
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchCondition },
        ];
        delete query.$or;
      } else {
        query.$or = searchCondition;
      }
    }

    // Exclude products with invalid category/subcategory codes
    query.categoryCode = query.categoryCode || { $in: Array.from(validCategoryCodes) };
    query.subcategoryCode = query.subcategoryCode || { $in: Array.from(validSubcategoryCodes) };

    const collection = await getProductsCollection();

    // Get total count for pagination
    const total = await collection.countDocuments(query);

    // Fetch products with pagination
    const documents = await collection
      .find(query)
      .sort({ modelCode: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Parse and validate documents using Zod
    const products = parseProducts(documents);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + products.length < total,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching products:', error);

    const message = error instanceof Error ? error.message : 'Failed to fetch products';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions for Referential Integrity
// ============================================================================

async function getValidCategoryCodes(): Promise<Set<string>> {
  const collection = await getCategoriesCollection();
  const categories = await collection.find({}, { projection: { code: 1 } }).toArray();
  return new Set(categories.map((c) => c.code));
}

async function getValidSubcategoryCodes(): Promise<Set<string>> {
  const collection = await getSubcategoriesCollection();
  const subcategories = await collection.find({}, { projection: { code: 1 } }).toArray();
  return new Set(subcategories.map((s) => s.code));
}
