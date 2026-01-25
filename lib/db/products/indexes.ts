import { Db, IndexDescription } from 'mongodb';

// ============================================================================
// Products Collection Index Definitions
// ============================================================================

/**
 * Index definitions for the products collection.
 * These indexes ensure data integrity and optimize query performance.
 */
export const PRODUCTS_INDEXES: IndexDescription[] = [
  // Unique index on modelCode (natural key)
  {
    key: { modelCode: 1 },
    unique: true,
    name: 'idx_products_model_code_unique',
  },

  // Unique index on slug for URL lookups
  {
    key: { slug: 1 },
    unique: true,
    name: 'idx_products_slug_unique',
  },

  // Compound index on category and subcategory for filtering
  {
    key: { categoryCode: 1, subcategoryCode: 1 },
    name: 'idx_products_category_subcategory',
  },

  // Compound index on market specs for region/country filtering
  {
    key: { 'marketSpecs.regionCode': 1, 'marketSpecs.countryKey': 1 },
    name: 'idx_products_market_specs',
  },

  // Index on isActive for filtering active/inactive products
  {
    key: { isActive: 1 },
    name: 'idx_products_is_active',
  },
];

// ============================================================================
// Index Creation Function
// ============================================================================

/**
 * Create all required indexes for the products collection.
 * This operation is idempotent - indexes that already exist will not be recreated.
 *
 * @param db - MongoDB database instance
 * @param collectionName - Name of the products collection
 */
export async function createProductsIndexes(
  db: Db,
  collectionName: string
): Promise<void> {
  const collection = db.collection(collectionName);

  // Create indexes using createIndexes (more efficient than multiple createIndex calls)
  await collection.createIndexes(PRODUCTS_INDEXES);

  console.log(`[Products] Created ${PRODUCTS_INDEXES.length} indexes on ${collectionName}`);
}

/**
 * Verify that all required indexes exist on the products collection.
 *
 * @param db - MongoDB database instance
 * @param collectionName - Name of the products collection
 * @returns Object with index verification results
 */
export async function verifyProductsIndexes(
  db: Db,
  collectionName: string
): Promise<{ valid: boolean; missing: string[]; existing: string[] }> {
  const collection = db.collection(collectionName);
  const existingIndexes = await collection.indexes();

  const existingIndexNames = new Set(
    existingIndexes.map((idx) => idx.name).filter(Boolean)
  );

  const requiredIndexNames = PRODUCTS_INDEXES.map((idx) => idx.name).filter(
    (name): name is string => name !== undefined
  );

  const missing = requiredIndexNames.filter(
    (name) => !existingIndexNames.has(name)
  );

  const existing = requiredIndexNames.filter((name) =>
    existingIndexNames.has(name)
  );

  return {
    valid: missing.length === 0,
    missing,
    existing,
  };
}
