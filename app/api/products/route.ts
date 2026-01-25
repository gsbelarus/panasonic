import { NextResponse } from 'next/server';
import { getProductsCollection, initializeDatabase } from '@/lib/db';
import { parseProducts, ProductsApiResponseSchema, ErrorResponseSchema } from '@/lib/db/schemas';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    const success = await initializeDatabase();
    dbInitialized = success;
  }
}

/**
 * GET /api/products
 * 
 * Fetch all products with optional filtering by:
 * - categoryCode: Filter by category
 * - subcategoryCode: Filter by subcategory
 * - regionCode: Filter by market region
 * - countryName: Filter by country name
 * - isActive: Filter by active status (default: true)
 * - modelCode: Filter by specific model code
 * - slug: Filter by product slug
 */
export async function GET(request: Request) {
  try {
    await ensureDbInitialized();

    const { searchParams } = new URL(request.url);
    const categoryCode = searchParams.get('categoryCode');
    const subcategoryCode = searchParams.get('subcategoryCode');
    const regionCode = searchParams.get('regionCode');
    const countryName = searchParams.get('countryName');
    const isActive = searchParams.get('isActive');
    const modelCode = searchParams.get('modelCode');
    const slug = searchParams.get('slug');

    // Build query filter
    const filter: Record<string, unknown> = {};

    if (categoryCode) {
      filter.categoryCode = categoryCode;
    }

    if (subcategoryCode) {
      filter.subcategoryCode = subcategoryCode;
    }

    if (regionCode && countryName) {
      filter.marketSpecs = {
        $elemMatch: {
          regionCode,
          countryName,
        },
      };
    } else {
      if (regionCode) {
        filter['marketSpecs.regionCode'] = regionCode;
      }

      if (countryName) {
        filter['marketSpecs.countryName'] = countryName;
      }
    }

    if (isActive !== null && isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else {
      // Default to active products only
      filter.isActive = true;
    }

    if (modelCode) {
      filter.modelCode = modelCode;
    }

    if (slug) {
      filter.slug = slug;
    }

    const collection = await getProductsCollection();
    const products = await collection.find(filter).toArray();

    // Parse and validate the response
    const validatedProducts = parseProducts(products);

    const response = ProductsApiResponseSchema.parse({
      success: true,
      data: validatedProducts,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching products:', error);

    const errorResponse = ErrorResponseSchema.parse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
