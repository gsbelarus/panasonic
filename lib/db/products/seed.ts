import { Db, AnyBulkWriteOperation } from 'mongodb';
import type { ProductInsert, Product } from './schema';
import { validateProductInsert } from './schema';

// ============================================================================
// Seed Data Array (MUST REMAIN EMPTY per requirements)
// ============================================================================

/**
 * Seed data for products collection.
 * This array MUST remain empty - no hardcoded product data is allowed.
 * The seeding logic is implemented and runnable, but expects external data sources.
 */
export const seedProducts: ProductInsert[] = [];

// ============================================================================
// Seeding Functions
// ============================================================================

/**
 * Check if the products collection needs seeding.
 *
 * @param db - MongoDB database instance
 * @param collectionName - Name of the products collection
 * @returns true if the collection is empty or doesn't exist
 */
export async function needsProductsSeeding(
  db: Db,
  collectionName: string
): Promise<boolean> {
  // Check if collection exists
  const collections = await db.listCollections({ name: collectionName }).toArray();
  if (collections.length === 0) {
    return true;
  }

  // Check if collection has documents
  const count = await db.collection(collectionName).countDocuments();
  return count === 0;
}

/**
 * Seed the products collection using bulkWrite with upsert.
 * This ensures idempotency - running multiple times won't create duplicates.
 *
 * Uses `modelCode` as the upsert key.
 * - Sets `createdAt` only on insert
 * - Always updates `updatedAt`
 *
 * @param db - MongoDB database instance
 * @param collectionName - Name of the products collection
 * @param products - Array of products to seed (defaults to seedProducts)
 * @returns Number of products inserted/updated
 */
export async function seedProductsCollection(
  db: Db,
  collectionName: string,
  products: ProductInsert[] = seedProducts
): Promise<{ inserted: number; modified: number }> {
  // Early return if no products to seed
  if (products.length === 0) {
    console.log('[Products] No seed data to insert (seed array is empty as expected)');
    return { inserted: 0, modified: 0 };
  }

  const collection = db.collection<Product>(collectionName);
  const now = new Date();

  // Build bulk write operations
  const operations: AnyBulkWriteOperation<Product>[] = products.map((productData) => {
    // Validate each product using Zod schema
    const validatedData = validateProductInsert(productData);

    return {
      updateOne: {
        filter: { modelCode: validatedData.modelCode },
        update: {
          $setOnInsert: {
            ...validatedData,
            createdAt: now,
          },
          $set: {
            updatedAt: now,
          },
        },
        upsert: true,
      },
    };
  });

  // Execute bulk write
  const result = await collection.bulkWrite(operations, { ordered: false });

  const inserted = result.upsertedCount || 0;
  const modified = result.modifiedCount || 0;

  console.log(
    `[Products] Seeding complete: ${inserted} inserted, ${modified} modified`
  );

  return { inserted, modified };
}

/**
 * Bootstrap the products collection.
 * This function:
 * 1. Ensures the collection exists
 * 2. Creates required indexes
 * 3. Seeds data if the collection is empty
 *
 * @param db - MongoDB database instance
 * @param collectionName - Name of the products collection
 * @param createIndexes - Function to create indexes
 */
export async function bootstrapProducts(
  db: Db,
  collectionName: string,
  createIndexes: (db: Db, collectionName: string) => Promise<void>
): Promise<{
  indexesCreated: boolean;
  seeded: boolean;
  inserted: number;
  modified: number;
}> {
  console.log('[Products] Starting bootstrap...');

  // Ensure collection exists by creating it (no-op if exists)
  try {
    await db.createCollection(collectionName);
    console.log(`[Products] Collection '${collectionName}' created`);
  } catch (error: unknown) {
    // Collection already exists - this is fine
    if (error instanceof Error && 'codeName' in error && error.codeName === 'NamespaceExists') {
      console.log(`[Products] Collection '${collectionName}' already exists`);
    } else {
      throw error;
    }
  }

  // Create indexes (idempotent operation)
  await createIndexes(db, collectionName);

  // Check if seeding is needed
  const needsSeeding = await needsProductsSeeding(db, collectionName);

  if (!needsSeeding) {
    console.log('[Products] Collection already has data, skipping seed');
    return {
      indexesCreated: true,
      seeded: false,
      inserted: 0,
      modified: 0,
    };
  }

  // Run seeding
  const seedResult = await seedProductsCollection(db, collectionName);

  return {
    indexesCreated: true,
    seeded: true,
    ...seedResult,
  };
}
