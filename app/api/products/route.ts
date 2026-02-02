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

// Initialize database on first request using Promise singleton for thread-safety
let initializationPromise: Promise<boolean> | null = null;

async function ensureInitialized(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase();
  }
  await initializationPromise;
}

// ============================================================================
// Query Parameter Schema
// ============================================================================

const ProductsQuerySchema = z.object({
  regionCode: z.string().optional(),
  countryKey: z.string().optional(),
  categoryCode: z.string().optional(),
  subcategoryCode: z.string().optional(),
  modelCodes: z.string().optional(),
  voltage: z.string().optional(), // Comma-separated values for multiple voltages
  q: z.string().optional(), // Search query
  airVolumeValue: z.coerce.number().nonnegative().optional(),
  airVolumeUnit: z.string().optional(), // CMH, CFM, m³/min, etc.
  staticPressureValue: z.coerce.number().nonnegative().optional(),
  staticPressureUnit: z.string().optional(), // Pa, mmH2O, inH2O, etc.
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

type MongoQuery = Record<string, unknown> & {
  $and?: Array<Record<string, unknown>>;
  $or?: Array<Record<string, unknown>>;
};

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
      modelCodes: searchParams.get('modelCodes') || undefined,
      voltage: searchParams.get('voltage') || undefined,
      q: searchParams.get('q') || undefined,
      airVolumeValue: searchParams.get('airVolumeValue') || undefined,
      airVolumeUnit: searchParams.get('airVolumeUnit') || undefined,
      staticPressureValue: searchParams.get('staticPressureValue') || undefined,
      staticPressureUnit: searchParams.get('staticPressureUnit') || undefined,
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

    const {
      regionCode,
      countryKey,
      categoryCode,
      subcategoryCode,
      modelCodes,
      voltage,
      q,
      airVolumeValue,
      airVolumeUnit,
      staticPressureValue,
      staticPressureUnit,
      limit,
      skip,
    } =
      parsed.data;

    // Validate referential integrity
    const validCategoryCodes = await getValidCategoryCodes();
    const validSubcategoryCodes = await getValidSubcategoryCodes();

    // Build MongoDB query
    const query: MongoQuery = {
      isActive: true,
    };

    // Filter by market specs (region and country)
    // Products with matching marketSpecs OR products with empty marketSpecs (universal products)
    if (regionCode || countryKey) {
      const elemMatch: Record<string, unknown> = {};
      if (regionCode) {
        elemMatch.regionCode = regionCode;
      }
      if (countryKey) {
        elemMatch.countryKey = countryKey;
      }

      const marketConditions = [
        { marketSpecs: { $elemMatch: elemMatch } },
        { marketSpecs: { $size: 0 } },
      ];

      query.$or = marketConditions;
    }

    // Filter by category (only if valid)
    if (categoryCode) {
      const categoryCodes = splitParamList(categoryCode);
      const hasInvalidCategory = categoryCodes.some((code) => !validCategoryCodes.has(code));

      if (hasInvalidCategory) {
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

      if (categoryCodes.length > 0) {
        query.categoryCode = { $in: categoryCodes };
      }
    }

    // Filter by explicit model codes
    if (modelCodes) {
      const codes = splitParamList(modelCodes);
      if (codes.length > 0) {
        query.modelCode = { $in: codes };
      }
    }

    // Filter by subcategory (only if valid)
    if (subcategoryCode) {
      const subcategoryCodes = splitParamList(subcategoryCode);
      const hasInvalidSubcategory = subcategoryCodes.some(
        (code) => !validSubcategoryCodes.has(code)
      );

      if (hasInvalidSubcategory) {
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

      if (subcategoryCodes.length > 0) {
        query.subcategoryCode = { $in: subcategoryCodes };
      }
    }

    // Filter by voltage (from marketSpecs.electrical.voltage)
    if (voltage) {
      const voltages = splitParamList(voltage);
      if (voltages.length > 0) {
        const voltageOr = voltages.map((v) => ({
          marketSpecs: {
            $elemMatch: {
              'electrical.voltage': {
                $regex: `^${escapeRegExp(v)}V?$`,
                $options: 'i',
              },
            },
          },
        }));

        addAndCondition(query, { $or: voltageOr });
      }
    }

    // Search by model code or category name
    if (q && q.trim()) {
      const safeQuery = escapeRegExp(q.trim());
      const searchCondition: Array<Record<string, unknown>> = [
        { modelCode: { $regex: safeQuery, $options: 'i' } },
      ];

      const categoriesCollection = await getCategoriesCollection();
      const matchingCategories = await categoriesCollection
        .find({ name: { $regex: safeQuery, $options: 'i' } }, { projection: { code: 1 } })
        .toArray();

      const matchingCategoryCodes = matchingCategories.map((category) => category.code);
      if (matchingCategoryCodes.length > 0) {
        searchCondition.push({ categoryCode: { $in: matchingCategoryCodes } });
      }

      addAndCondition(query, { $or: searchCondition });
    }

    // Filter by air volume - products whose max air volume >= requested value
    if (airVolumeValue !== undefined && airVolumeValue > 0) {
      // Convert value to the database unit (m³/min) if needed
      const normalizedAirVolume = convertAirVolumeToDbUnit(airVolumeValue, airVolumeUnit || 'CMH');
      addAndCondition(query, {
        'fanSpec.airVolume.max': { $gte: normalizedAirVolume },
      });
    }

    // Filter by static pressure - products whose max static pressure >= requested value
    if (staticPressureValue !== undefined && staticPressureValue > 0) {
      // Convert value to the database unit (Pa) if needed
      const normalizedStaticPressure = convertStaticPressureToDbUnit(staticPressureValue, staticPressureUnit || 'Pa');
      addAndCondition(query, {
        'fanSpec.staticPressure.max': { $gte: normalizedStaticPressure },
      });
    }

    // Exclude products with invalid category/subcategory codes
    if (!categoryCode && !query.categoryCode) {
      query.categoryCode = { $in: Array.from(validCategoryCodes) };
    }
    if (!subcategoryCode && !query.subcategoryCode) {
      query.subcategoryCode = { $in: Array.from(validSubcategoryCodes) };
    }

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitParamList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function addAndCondition(query: MongoQuery, condition: MongoQuery): void {
  if (query.$and) {
    query.$and.push(condition);
    return;
  }

  if (query.$or) {
    query.$and = [{ $or: query.$or }, condition];
    delete query.$or;
    return;
  }

  Object.assign(query, condition);
}

// ============================================================================
// Unit Conversion Helpers
// ============================================================================

/**
 * Convert air volume to database unit (m³/min)
 * Supported input units: CMH (m³/h), CFM (ft³/min), m³/min
 */
function convertAirVolumeToDbUnit(value: number, unit: string): number {
  const normalizedUnit = unit.toUpperCase().replace(/[³\/]/g, '');

  switch (normalizedUnit) {
    case 'CMH':
    case 'M3H':
    case 'M3HR':
      // m³/h to m³/min: divide by 60
      return value / 60;
    case 'CFM':
    case 'FT3MIN':
      // ft³/min to m³/min: multiply by 0.0283168
      return value * 0.0283168;
    case 'M3MIN':
    case 'CMM':
    default:
      // Already in m³/min or assume m³/min as default
      return value;
  }
}

/**
 * Convert static pressure to database unit (Pa)
 * Supported input units: Pa, mmH2O (mmAq), inH2O (inWG)
 */
function convertStaticPressureToDbUnit(value: number, unit: string): number {
  const normalizedUnit = unit.toUpperCase().replace(/[²]/g, '');

  switch (normalizedUnit) {
    case 'MMH2O':
    case 'MMAQ':
    case 'MMWC':
      // mmH2O to Pa: multiply by 9.80665
      return value * 9.80665;
    case 'INH2O':
    case 'INWG':
    case 'INWC':
      // inH2O to Pa: multiply by 249.089
      return value * 249.089;
    case 'PA':
    default:
      // Already in Pa or assume Pa as default
      return value;
  }
}
