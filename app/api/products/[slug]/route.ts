import { NextRequest, NextResponse } from 'next/server';
import {
  getProductsCollection,
  initializeDatabase,
  type ErrorResponse,
} from '@/lib/db';
import { parseProduct, type ProductResponse } from '@/lib/db/products/schema';

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
// Response Types
// ============================================================================

export interface ProductApiResponse {
  success: true;
  data: ProductResponse;
}

// ============================================================================
// GET /api/products/[slug]
// ============================================================================

// Slug validation: only allow lowercase alphanumeric and hyphens
const slugPattern = /^[a-z0-9-]+$/;
const MAX_SLUG_LENGTH = 100;

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

    // Validate slug format to prevent injection attacks
    const normalizedSlug = slug.toLowerCase().trim();
    if (!slugPattern.test(normalizedSlug) || normalizedSlug.length > MAX_SLUG_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product slug format',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Get the products collection
    const productsCollection = await getProductsCollection();

    // Find the product by slug
    const product = await productsCollection.findOne({ slug: normalizedSlug });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
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

    // Don't expose internal error details to clients
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
