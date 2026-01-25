import { NextResponse } from 'next/server';
import { getProductsCollection, initializeDatabase } from '@/lib/db';
import { parseProduct, ProductApiResponseSchema, ErrorResponseSchema } from '@/lib/db/schemas';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    const success = await initializeDatabase();
    dbInitialized = success;
  }
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/products/[slug]
 * 
 * Fetch a single product by slug or modelCode
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await ensureDbInitialized();

    const { slug } = await params;

    if (!slug) {
      const errorResponse = ErrorResponseSchema.parse({
        success: false,
        error: 'Product slug is required',
      });
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const collection = await getProductsCollection();

    // Try to find by slug first, then by modelCode
    let product = await collection.findOne({ slug: slug, isActive: true });

    if (!product) {
      // Try finding by modelCode (case-insensitive)
      product = await collection.findOne({
        modelCode: { $regex: new RegExp(`^${escapeRegex(slug)}$`, 'i') },
        isActive: true
      });
    }

    if (!product) {
      const errorResponse = ErrorResponseSchema.parse({
        success: false,
        error: 'Product not found',
      });
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Parse and validate the response
    const validatedProduct = parseProduct(product);

    const response = ProductApiResponseSchema.parse({
      success: true,
      data: validatedProduct,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching product:', error);

    const errorResponse = ErrorResponseSchema.parse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product',
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
