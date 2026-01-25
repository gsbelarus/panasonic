import { Db, AnyBulkWriteOperation, MongoServerError } from 'mongodb';
import type { ProductInsert, Product } from './schema';
import { validateProductInsert } from './schema';

// ============================================================================
// Referential Integrity Error Classes
// ============================================================================

/**
 * Error thrown when a product references an invalid category or subcategory
 */
export class ReferentialIntegrityError extends Error {
  constructor(
    public readonly productModelCode: string,
    public readonly field: string,
    public readonly invalidValue: string,
    public readonly validValues: string[]
  ) {
    super(
      `Referential integrity violation in product '${productModelCode}': ` +
      `${field} '${invalidValue}' does not exist. ` +
      `Valid values are: [${validValues.join(', ')}]`
    );
    this.name = 'ReferentialIntegrityError';
  }
}

/**
 * Error thrown when a product's marketSpecs reference invalid region/country
 */
export class MarketSpecIntegrityError extends Error {
  constructor(
    public readonly productModelCode: string,
    public readonly regionCode: string,
    public readonly countryKey: string,
    public readonly issue: 'region' | 'country',
    public readonly validValues: string[]
  ) {
    super(
      `Market spec integrity violation in product '${productModelCode}': ` +
      `${issue === 'region' ? `regionCode '${regionCode}'` : `countryKey '${countryKey}' for region '${regionCode}'`} ` +
      `does not exist. Valid ${issue === 'region' ? 'regions' : 'countries for this region'} are: [${validValues.join(', ')}]`
    );
    this.name = 'MarketSpecIntegrityError';
  }
}

// ============================================================================
// Reference Data Loaders
// ============================================================================

/**
 * Load all valid category codes from the database
 */
export async function loadValidCategoryCodes(db: Db, collectionName: string): Promise<Set<string>> {
  const categories = await db.collection(collectionName).find({}, { projection: { code: 1 } }).toArray();
  return new Set(categories.map((c) => c.code as string));
}

/**
 * Load all valid subcategory codes from the database
 */
export async function loadValidSubcategoryCodes(db: Db, collectionName: string): Promise<Set<string>> {
  const subcategories = await db.collection(collectionName).find({}, { projection: { code: 1 } }).toArray();
  return new Set(subcategories.map((s) => s.code as string));
}

/**
 * Load all valid subcategory codes grouped by category from the database
 */
export async function loadValidSubcategoryCodesByCategory(
  db: Db,
  collectionName: string
): Promise<Map<string, Set<string>>> {
  const subcategories = await db
    .collection(collectionName)
    .find({}, { projection: { code: 1, categoryCode: 1 } })
    .toArray();

  const subcategoryMap = new Map<string, Set<string>>();
  for (const subcategory of subcategories) {
    const categoryCode = subcategory.categoryCode as string;
    const code = subcategory.code as string;
    if (!subcategoryMap.has(categoryCode)) {
      subcategoryMap.set(categoryCode, new Set());
    }
    subcategoryMap.get(categoryCode)!.add(code);
  }

  return subcategoryMap;
}

/**
 * Load all valid region codes from the database
 */
export async function loadValidRegionCodes(db: Db, collectionName: string): Promise<Set<string>> {
  const regions = await db.collection(collectionName).find({}, { projection: { code: 1 } }).toArray();
  return new Set(regions.map((r) => r.code as string));
}

/**
 * Load all valid country keys (iso2) grouped by region from the database
 */
export async function loadValidCountryKeysByRegion(
  db: Db,
  collectionName: string
): Promise<Map<string, Set<string>>> {
  const countries = await db
    .collection(collectionName)
    .find({}, { projection: { iso2: 1, regionCode: 1 } })
    .toArray();

  const countryMap = new Map<string, Set<string>>();
  for (const country of countries) {
    const regionCode = country.regionCode as string;
    const iso2 = country.iso2 as string;
    if (!countryMap.has(regionCode)) {
      countryMap.set(regionCode, new Set());
    }
    countryMap.get(regionCode)!.add(iso2);
  }
  return countryMap;
}

// ============================================================================
// Referential Integrity Validation
// ============================================================================

export interface ReferenceData {
  categoryCodes: Set<string>;
  subcategoryCodes: Set<string>;
  subcategoryCodesByCategory: Map<string, Set<string>>;
  regionCodes: Set<string>;
  countryKeysByRegion: Map<string, Set<string>>;
}

/**
 * Load all reference data needed for integrity validation
 */
export async function loadReferenceData(
  db: Db,
  collections: {
    categories: string;
    subcategories: string;
    regions: string;
    countries: string;
  }
): Promise<ReferenceData> {
  const [
    categoryCodes,
    subcategoryCodes,
    subcategoryCodesByCategory,
    regionCodes,
    countryKeysByRegion,
  ] = await Promise.all([
    loadValidCategoryCodes(db, collections.categories),
    loadValidSubcategoryCodes(db, collections.subcategories),
    loadValidSubcategoryCodesByCategory(db, collections.subcategories),
    loadValidRegionCodes(db, collections.regions),
    loadValidCountryKeysByRegion(db, collections.countries),
  ]);

  return {
    categoryCodes,
    subcategoryCodes,
    subcategoryCodesByCategory,
    regionCodes,
    countryKeysByRegion,
  };
}

/**
 * Validate a single product's referential integrity.
 * Throws ReferentialIntegrityError or MarketSpecIntegrityError on violation.
 *
 * @param product - The product to validate
 * @param refData - Reference data containing valid codes
 */
export function validateProductIntegrity(
  product: ProductInsert,
  refData: ReferenceData
): void {
  // Validate categoryCode
  if (!refData.categoryCodes.has(product.categoryCode)) {
    throw new ReferentialIntegrityError(
      product.modelCode,
      'categoryCode',
      product.categoryCode,
      Array.from(refData.categoryCodes)
    );
  }

  // Validate subcategoryCode within category
  const subcategoriesForCategory = refData.subcategoryCodesByCategory.get(
    product.categoryCode
  );
  if (!subcategoriesForCategory || !subcategoriesForCategory.has(product.subcategoryCode)) {
    throw new ReferentialIntegrityError(
      product.modelCode,
      'subcategoryCode',
      product.subcategoryCode,
      subcategoriesForCategory ? Array.from(subcategoriesForCategory) : []
    );
  }

  // Validate marketSpecs references
  if (product.marketSpecs && product.marketSpecs.length > 0) {
    for (const marketSpec of product.marketSpecs) {
      // Validate regionCode
      if (!refData.regionCodes.has(marketSpec.regionCode)) {
        throw new MarketSpecIntegrityError(
          product.modelCode,
          marketSpec.regionCode,
          marketSpec.countryKey,
          'region',
          Array.from(refData.regionCodes)
        );
      }

      // Validate countryKey exists for the given region
      const countriesForRegion = refData.countryKeysByRegion.get(marketSpec.regionCode);
      if (!countriesForRegion || !countriesForRegion.has(marketSpec.countryKey)) {
        throw new MarketSpecIntegrityError(
          product.modelCode,
          marketSpec.regionCode,
          marketSpec.countryKey,
          'country',
          countriesForRegion ? Array.from(countriesForRegion) : []
        );
      }
    }
  }
}

/**
 * Validate all products' referential integrity.
 * Returns a list of all errors found (does not throw on first error).
 *
 * @param products - Array of products to validate
 * @param refData - Reference data containing valid codes
 * @returns Array of errors found
 */
export function validateAllProductsIntegrity(
  products: ProductInsert[],
  refData: ReferenceData
): Error[] {
  const errors: Error[] = [];

  for (const product of products) {
    try {
      validateProductIntegrity(product, refData);
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error);
      }
    }
  }

  return errors;
}

// ============================================================================
// Seed Data Array (MUST REMAIN EMPTY per requirements)
// ============================================================================

/**
 * Seed data for products collection.
 * This array MUST remain empty - no hardcoded product data is allowed.
 * The seeding logic is implemented and runnable, but expects external data sources.
 */
export const seedProducts: ProductInsert[] = [
  // Wall Mount → mapped to your category/subcategory codes:
  // Website shows: Wall Mount / Automatic Shutter (mapped to: wall-mount / with-shutter)
  {
    modelCode: "15AAQ1",
    slug: "15aaq1",
    categoryCode: "wall-mount",
    subcategoryCode: "with-shutter",
    highlights: [
      "Condenser motor with thermal cutoff",
      "Lubricated sintered bush for long life operation",
      "High performance propeller fan adopted",
      "Automatic shutter with plastic cushions",
      "Orifice equipped with oil cup",
    ],
    marketSpecs: [],
    relatedModelCodes: ["20AUA", "25AUA", "30AUA"],
    isActive: true,
  },
  {
    modelCode: "20AUA",
    slug: "20aua",
    categoryCode: "wall-mount",
    subcategoryCode: "with-shutter",
    highlights: [],
    marketSpecs: [],
    relatedModelCodes: [],
    isActive: true,
  },
  {
    modelCode: "25AUA",
    slug: "25aua",
    categoryCode: "wall-mount",
    subcategoryCode: "with-shutter",
    highlights: [],
    marketSpecs: [],
    relatedModelCodes: [],
    isActive: true,
  },
  {
    modelCode: "30AUA",
    slug: "30aua",
    categoryCode: "wall-mount",
    subcategoryCode: "with-shutter",
    highlights: [],
    marketSpecs: [],
    relatedModelCodes: [],
    isActive: true,
  },

  // In-line Centrifugal Fan → mapped to your category/subcategory codes:
  // Website shows: In-line Centrifugal Fan / In-Line Centrifugal Fan (mapped to: in-line-centrifugal-fan / mixed-flow)
  {
    modelCode: "10MMA",
    slug: "10mma",
    categoryCode: "in-line-centrifugal-fan",
    subcategoryCode: "mixed-flow",
    highlights: [
      "Equipped with a high-performance external rotor motor",
      "Premium ball bearings",
      "Integrated thermal protector",
      "Long Operational Lifespan",
      "Low Noise & Vibration",
      "Optimized Airflow Design",
      "Motor Insulation Class F",
      "IP protection: IP44",
      "AMCA Certified – Specifications available",
    ],
    marketSpecs: [],
    relatedModelCodes: ["12MMA", "15MMA", "16MMA", "20MMA", "25MMA", "31MMA"],
    isActive: true,
  },
  {
    modelCode: "12MMA",
    slug: "12mma",
    categoryCode: "in-line-centrifugal-fan",
    subcategoryCode: "mixed-flow",
    highlights: [],
    marketSpecs: [],
    relatedModelCodes: [],
    isActive: true,
  },
  {
    modelCode: "15MMA",
    slug: "15mma",
    categoryCode: "in-line-centrifugal-fan",
    subcategoryCode: "mixed-flow",
    highlights: [],
    marketSpecs: [],
    relatedModelCodes: [],
    isActive: true,
  },
  {
    modelCode: "16MMA",
    slug: "16mma",
    categoryCode: "in-line-centrifugal-fan",
    subcategoryCode: "mixed-flow",
    highlights: [],
    marketSpecs: [],
    relatedModelCodes: [],
    isActive: true,
  },
  {
    modelCode: "20MMA",
    slug: "20mma",
    categoryCode: "in-line-centrifugal-fan",
    subcategoryCode: "mixed-flow",
    highlights: [],
    marketSpecs: [],
    relatedModelCodes: [],
    isActive: true,
  },
  {
    modelCode: "25MMA",
    slug: "25mma",
    categoryCode: "in-line-centrifugal-fan",
    subcategoryCode: "mixed-flow",
    highlights: [],
    marketSpecs: [],
    relatedModelCodes: [],
    isActive: true,
  },
  {
    modelCode: "31MMA",
    slug: "31mma",
    categoryCode: "in-line-centrifugal-fan",
    subcategoryCode: "mixed-flow",
    highlights: [],
    marketSpecs: [],
    relatedModelCodes: [],
    isActive: true,
  },
];

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
 * @param refData - Reference data for integrity validation (optional, will load if not provided)
 * @param refCollections - Collection names for loading reference data
 * @returns Number of products inserted/updated
 */
export async function seedProductsCollection(
  db: Db,
  collectionName: string,
  products: ProductInsert[] = seedProducts,
  refData?: ReferenceData,
  refCollections?: {
    categories: string;
    subcategories: string;
    regions: string;
    countries: string;
  }
): Promise<{ inserted: number; modified: number }> {
  // Early return if no products to seed
  if (products.length === 0) {
    console.log('[Products] No seed data to insert (seed array is empty as expected)');
    return { inserted: 0, modified: 0 };
  }

  // Load reference data if not provided
  if (!refData && refCollections) {
    console.log('[Products] Loading reference data for integrity validation...');
    refData = await loadReferenceData(db, refCollections);
  }

  // Validate referential integrity if we have reference data
  if (refData) {
    console.log('[Products] Validating referential integrity...');
    const errors = validateAllProductsIntegrity(products, refData);
    if (errors.length > 0) {
      console.error(`[Products] Referential integrity validation failed with ${errors.length} error(s):`);
      for (const error of errors) {
        console.error(`  - ${error.message}`);
      }
      throw new Error(
        `Referential integrity validation failed for ${errors.length} product(s). ` +
        `First error: ${errors[0].message}`
      );
    }
    console.log('[Products] Referential integrity validation passed');
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
 * 3. Validates referential integrity against categories, subcategories, regions, countries
 * 4. Seeds data if the collection is empty
 *
 * @param db - MongoDB database instance
 * @param collectionName - Name of the products collection
 * @param createIndexes - Function to create indexes
 * @param force - If true, seed even if collection has data
 * @param refCollections - Collection names for referential integrity validation
 */
export async function bootstrapProducts(
  db: Db,
  collectionName: string,
  createIndexes: (db: Db, collectionName: string) => Promise<void>,
  force = false,
  refCollections: {
    categories: string;
    subcategories: string;
    regions: string;
    countries: string;
  } = {
      categories: 'categories',
      subcategories: 'subcategories',
      regions: 'regions',
      countries: 'countries',
    }
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
    if (error instanceof MongoServerError && error.code === 48) {
      console.log(`[Products] Collection '${collectionName}' already exists`);
    } else {
      throw error;
    }
  }

  // Create indexes (idempotent operation)
  await createIndexes(db, collectionName);

  // Check if seeding is needed
  const needsSeeding = force || await needsProductsSeeding(db, collectionName);

  if (!needsSeeding) {
    console.log('[Products] Collection already has data, skipping seed');
    return {
      indexesCreated: true,
      seeded: false,
      inserted: 0,
      modified: 0,
    };
  }

  // Run seeding with referential integrity validation
  const seedResult = await seedProductsCollection(
    db,
    collectionName,
    seedProducts,
    undefined,
    refCollections
  );

  return {
    indexesCreated: true,
    seeded: true,
    ...seedResult,
  };
}
