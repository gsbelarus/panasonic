import { NextRequest, NextResponse } from 'next/server';
import {
  getProductsCollection,
  initializeDatabase,
  type ErrorResponse,
} from '@/lib/db';
import { parseProduct, type ProductResponse } from '@/lib/db/products/schema';

// Initialize database on first request (server-side only)
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    const success = await initializeDatabase();
    initialized = success;
  }
}

// ============================================================================
// Response Types
// ============================================================================

export interface ProductApiResponse {
  success: true;
  data: ProductResponse;
}

// ============================================================================
// GET /api/products/[slug]
// ============================================================================

/**
 * GET /api/products/[slug]
 * Fetch a single product from the database by its slug
 *
 * Route Parameters:
 * - slug: The product slug (URL-safe identifier)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ProductApiResponse | ErrorResponse>> {
  try {
    // Ensure database is initialized and seeded
    await ensureInitialized();

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product slug is required',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Get the products collection
    const productsCollection = await getProductsCollection();

    // Find the product by slug
    const product = await productsCollection.findOne({ slug: slug.toLowerCase() });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: `Product with slug "${slug}" not found`,
        } as ErrorResponse,
        { status: 404 }
      );
    }

    // Parse and validate the product using Zod schema
    const validatedProduct = parseProduct(product);

    return NextResponse.json({
      success: true,
      data: validatedProduct,
    } as ProductApiResponse);
  } catch (error) {
    console.error('[API] Error fetching product:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
