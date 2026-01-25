import { connectToDatabase, COLLECTIONS } from './connection';
import type { CreateRegion, CreateCountry, CreateCategory, CreateSubcategory } from './schemas';
import { validateCreateRegion, validateCreateCountry, validateCreateCategory, validateCreateSubcategory } from './schemas';
import { createProductsIndexes } from './products/indexes';
import { bootstrapProducts } from './products/seed';

// ============================================================================
// Seed Data - Extracted from existing hardcoded values
// ============================================================================

/**
 * Initial regions data matching the existing regionCountries keys
 */
const SEED_REGIONS: CreateRegion[] = [
  { code: 'africa', name: 'Africa' },
  { code: 'middle-east', name: 'Middle East' },
];

/**
 * Initial countries data matching the existing regionCountries and countryDefaults
 */
const SEED_COUNTRIES: CreateCountry[] = [
  // Africa
  { iso2: 'EG', name: 'Egypt', regionCode: 'africa', voltage: '220V', frequency: '50Hz' },
  { iso2: 'KE', name: 'Kenya', regionCode: 'africa', voltage: '240V', frequency: '50Hz' },
  { iso2: 'NG', name: 'Nigeria', regionCode: 'africa', voltage: '230V', frequency: '50Hz' },
  { iso2: 'ZA', name: 'South Africa', regionCode: 'africa', voltage: '230V', frequency: '50Hz' },
  { iso2: 'MA', name: 'Morocco', regionCode: 'africa', voltage: '220V', frequency: '50Hz' },
  { iso2: 'TZ', name: 'Tanzania', regionCode: 'africa', voltage: '230V', frequency: '50Hz' },
  { iso2: 'GH', name: 'Ghana', regionCode: 'africa', voltage: '230V', frequency: '50Hz' },

  // Middle East
  { iso2: 'AE', name: 'United Arab Emirates', regionCode: 'middle-east', voltage: '220V', frequency: '50Hz' },
  { iso2: 'SA', name: 'Saudi Arabia', regionCode: 'middle-east', voltage: '220V', frequency: '60Hz' },
  { iso2: 'QA', name: 'Qatar', regionCode: 'middle-east', voltage: '240V', frequency: '50Hz' },
  { iso2: 'KW', name: 'Kuwait', regionCode: 'middle-east', voltage: '240V', frequency: '50Hz' },
  { iso2: 'BH', name: 'Bahrain', regionCode: 'middle-east', voltage: '230V', frequency: '50Hz' },
  { iso2: 'OM', name: 'Oman', regionCode: 'middle-east', voltage: '240V', frequency: '50Hz' },
  { iso2: 'JO', name: 'Jordan', regionCode: 'middle-east', voltage: '230V', frequency: '50Hz' },
];

/**
 * Initial categories data matching the existing categories array
 */
const SEED_CATEGORIES: CreateCategory[] = [
  { code: 'cabinet-fan', name: 'Cabinet Fan', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', sortOrder: 0 },
  { code: 'ceiling-mount', name: 'Ceiling Mount', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', sortOrder: 1 },
  { code: 'in-line-centrifugal-fan', name: 'In-line Centrifugal Fan', icon: 'M13 10V3L4 14h7v7l9-11h-7z', sortOrder: 2 },
  { code: 'industrial-fan', name: 'Industrial Fan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', sortOrder: 3 },
  { code: 'mini-sirocco', name: 'Mini Sirocco', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', sortOrder: 4 },
  { code: 'thermo-vent', name: 'Thermo Vent', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', sortOrder: 5 },
  { code: 'wall-mount', name: 'Wall Mount', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2', sortOrder: 6 },
  { code: 'window-mount', name: 'Window Mount', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', sortOrder: 7 },
  { code: 'accessories', name: 'Accessories', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', sortOrder: 8 },
];

/**
 * Initial subcategories data matching the existing categorySubcategories
 */
const SEED_SUBCATEGORIES: CreateSubcategory[] = [
  // Cabinet Fan
  { code: 'standard', name: 'Standard', categoryCode: 'cabinet-fan', sortOrder: 0 },
  { code: 'heavy-duty', name: 'Heavy Duty', categoryCode: 'cabinet-fan', sortOrder: 1 },
  { code: 'compact', name: 'Compact', categoryCode: 'cabinet-fan', sortOrder: 2 },

  // Ceiling Mount
  { code: 'flush-mount', name: 'Flush Mount', categoryCode: 'ceiling-mount', sortOrder: 0 },
  { code: 'duct-connect', name: 'Duct Connect', categoryCode: 'ceiling-mount', sortOrder: 1 },
  { code: 'decorative', name: 'Decorative', categoryCode: 'ceiling-mount', sortOrder: 2 },

  // In-line Centrifugal Fan
  { code: 'low-profile', name: 'Low Profile', categoryCode: 'in-line-centrifugal-fan', sortOrder: 0 },
  { code: 'high-pressure', name: 'High Pressure', categoryCode: 'in-line-centrifugal-fan', sortOrder: 1 },
  { code: 'mixed-flow', name: 'Mixed Flow', categoryCode: 'in-line-centrifugal-fan', sortOrder: 2 },

  // Industrial Fan
  { code: 'axial', name: 'Axial', categoryCode: 'industrial-fan', sortOrder: 0 },
  { code: 'centrifugal', name: 'Centrifugal', categoryCode: 'industrial-fan', sortOrder: 1 },
  { code: 'propeller', name: 'Propeller', categoryCode: 'industrial-fan', sortOrder: 2 },

  // Mini Sirocco
  { code: 'mini-standard', name: 'Standard', categoryCode: 'mini-sirocco', sortOrder: 0 },
  { code: 'low-noise', name: 'Low Noise', categoryCode: 'mini-sirocco', sortOrder: 1 },
  { code: 'high-flow', name: 'High Flow', categoryCode: 'mini-sirocco', sortOrder: 2 },

  // Thermo Vent
  { code: 'basic', name: 'Basic', categoryCode: 'thermo-vent', sortOrder: 0 },
  { code: 'with-timer', name: 'With Timer', categoryCode: 'thermo-vent', sortOrder: 1 },
  { code: 'with-humidity-sensor', name: 'With Humidity Sensor', categoryCode: 'thermo-vent', sortOrder: 2 },

  // Wall Mount
  { code: 'wall-standard', name: 'Standard', categoryCode: 'wall-mount', sortOrder: 0 },
  { code: 'with-shutter', name: 'With Shutter', categoryCode: 'wall-mount', sortOrder: 1 },
  { code: 'with-light', name: 'With Light', categoryCode: 'wall-mount', sortOrder: 2 },

  // Window Mount
  { code: 'reversible', name: 'Reversible', categoryCode: 'window-mount', sortOrder: 0 },
  { code: 'exhaust-only', name: 'Exhaust Only', categoryCode: 'window-mount', sortOrder: 1 },
  { code: 'with-remote', name: 'With Remote', categoryCode: 'window-mount', sortOrder: 2 },

  // Accessories
  { code: 'grilles', name: 'Grilles', categoryCode: 'accessories', sortOrder: 0 },
  { code: 'ducting', name: 'Ducting', categoryCode: 'accessories', sortOrder: 1 },
  { code: 'controls', name: 'Controls', categoryCode: 'accessories', sortOrder: 2 },
];

// ============================================================================
// Index Creation
// ============================================================================

/**
 * Create unique indexes to enforce data integrity and idempotency
 */
async function createIndexes(): Promise<void> {
  const { db } = await connectToDatabase();

  // Create unique index on regions.code
  await db.collection(COLLECTIONS.REGIONS).createIndex(
    { code: 1 },
    { unique: true, name: 'idx_regions_code_unique' }
  );

  // Create unique index on countries.iso2
  await db.collection(COLLECTIONS.COUNTRIES).createIndex(
    { iso2: 1 },
    { unique: true, name: 'idx_countries_iso2_unique' }
  );

  // Create index on countries.regionCode for efficient lookups
  await db.collection(COLLECTIONS.COUNTRIES).createIndex(
    { regionCode: 1 },
    { name: 'idx_countries_region_code' }
  );

  // Create unique index on categories.code
  await db.collection(COLLECTIONS.CATEGORIES).createIndex(
    { code: 1 },
    { unique: true, name: 'idx_categories_code_unique' }
  );

  // Create index on categories.sortOrder for stable ordering
  await db.collection(COLLECTIONS.CATEGORIES).createIndex(
    { sortOrder: 1 },
    { name: 'idx_categories_sort_order' }
  );

  // Create compound unique index on subcategories (categoryCode + code)
  await db.collection(COLLECTIONS.SUBCATEGORIES).createIndex(
    { categoryCode: 1, code: 1 },
    { unique: true, name: 'idx_subcategories_category_code_unique' }
  );

  // Create index on subcategories.categoryCode for efficient lookups
  await db.collection(COLLECTIONS.SUBCATEGORIES).createIndex(
    { categoryCode: 1 },
    { name: 'idx_subcategories_category_code' }
  );

  // Create index on subcategories.sortOrder for stable ordering
  await db.collection(COLLECTIONS.SUBCATEGORIES).createIndex(
    { categoryCode: 1, sortOrder: 1 },
    { name: 'idx_subcategories_sort_order' }
  );

  console.log('[Seed] Indexes created successfully');
}

// ============================================================================
// Seeding Logic
// ============================================================================

/**
 * Check if a collection needs seeding (doesn't exist or is empty)
 */
async function needsSeeding(collectionName: string): Promise<boolean> {
  const { db } = await connectToDatabase();

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
 * Seed regions collection with initial data
 * Uses upsert to ensure idempotency
 */
async function seedRegions(): Promise<number> {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.REGIONS);

  let insertedCount = 0;
  const now = new Date();

  for (const regionData of SEED_REGIONS) {
    // Validate the data using Zod
    const validatedData = validateCreateRegion(regionData);

    // Upsert to ensure idempotency
    const result = await collection.updateOne(
      { code: validatedData.code },
      {
        $setOnInsert: {
          ...validatedData,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

/**
 * Seed countries collection with initial data
 * Uses upsert to ensure idempotency
 */
async function seedCountries(): Promise<number> {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.COUNTRIES);

  let insertedCount = 0;
  const now = new Date();

  for (const countryData of SEED_COUNTRIES) {
    // Validate the data using Zod
    const validatedData = validateCreateCountry(countryData);

    // Upsert to ensure idempotency
    const result = await collection.updateOne(
      { iso2: validatedData.iso2 },
      {
        $setOnInsert: {
          ...validatedData,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

/**
 * Seed categories collection with initial data
 * Uses upsert to ensure idempotency
 */
async function seedCategories(): Promise<number> {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.CATEGORIES);

  let insertedCount = 0;
  const now = new Date();

  for (const categoryData of SEED_CATEGORIES) {
    // Validate the data using Zod
    const validatedData = validateCreateCategory(categoryData);

    // Upsert to ensure idempotency
    const result = await collection.updateOne(
      { code: validatedData.code },
      {
        $setOnInsert: {
          ...validatedData,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

/**
 * Seed subcategories collection with initial data
 * Uses upsert to ensure idempotency
 */
async function seedSubcategories(): Promise<number> {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTIONS.SUBCATEGORIES);

  let insertedCount = 0;
  const now = new Date();

  for (const subcategoryData of SEED_SUBCATEGORIES) {
    // Validate the data using Zod
    const validatedData = validateCreateSubcategory(subcategoryData);

    // Upsert to ensure idempotency (using compound key: categoryCode + code)
    const result = await collection.updateOne(
      { categoryCode: validatedData.categoryCode, code: validatedData.code },
      {
        $setOnInsert: {
          ...validatedData,
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      insertedCount++;
    }
  }

  return insertedCount;
}

// ============================================================================
// Main Seeding Function
// ============================================================================

export interface SeedResult {
  regionsSeeded: number;
  countriesSeeded: number;
  categoriesSeeded: number;
  subcategoriesSeeded: number;
  productsSeeded: number;
  indexesCreated: boolean;
  skipped: boolean;
}

/**
 * Run the database seeding process.
 * This is idempotent and safe to run multiple times.
 * 
 * @param force - If true, seed even if collections have data
 */
export async function seedDatabase(force = false): Promise<SeedResult> {
  const result: SeedResult = {
    regionsSeeded: 0,
    countriesSeeded: 0,
    categoriesSeeded: 0,
    subcategoriesSeeded: 0,
    productsSeeded: 0,
    indexesCreated: false,
    skipped: false,
  };

  try {
    // Create indexes first (idempotent operation)
    await createIndexes();
    result.indexesCreated = true;

    // Check if seeding is needed
    const regionsNeedSeeding = force || await needsSeeding(COLLECTIONS.REGIONS);
    const countriesNeedSeeding = force || await needsSeeding(COLLECTIONS.COUNTRIES);
    const categoriesNeedSeeding = force || await needsSeeding(COLLECTIONS.CATEGORIES);
    const subcategoriesNeedSeeding = force || await needsSeeding(COLLECTIONS.SUBCATEGORIES);

    if (!regionsNeedSeeding && !countriesNeedSeeding && !categoriesNeedSeeding && !subcategoriesNeedSeeding) {
      console.log('[Seed] Database already seeded, skipping...');
      result.skipped = true;
    } else {
      // Seed regions if needed
      if (regionsNeedSeeding) {
        result.regionsSeeded = await seedRegions();
        console.log(`[Seed] Seeded ${result.regionsSeeded} regions`);
      }

      // Seed countries if needed
      if (countriesNeedSeeding) {
        result.countriesSeeded = await seedCountries();
        console.log(`[Seed] Seeded ${result.countriesSeeded} countries`);
      }

      // Seed categories if needed
      if (categoriesNeedSeeding) {
        result.categoriesSeeded = await seedCategories();
        console.log(`[Seed] Seeded ${result.categoriesSeeded} categories`);
      }

      // Seed subcategories if needed
      if (subcategoriesNeedSeeding) {
        result.subcategoriesSeeded = await seedSubcategories();
        console.log(`[Seed] Seeded ${result.subcategoriesSeeded} subcategories`);
      }
    }

    // Bootstrap products collection AFTER all references are seeded
    // Products may reference regions, countries, categories, and subcategories
    const { db } = await connectToDatabase();
    const productsResult = await bootstrapProducts(
      db,
      COLLECTIONS.PRODUCTS,
      createProductsIndexes,
      force
    );
    result.productsSeeded = productsResult.inserted;

    console.log('[Seed] Database seeding completed successfully');
    return result;
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
    throw error;
  }
}

/**
 * Initialize the database on application startup.
 * This ensures indexes and seed data are in place.
 */
export async function initializeDatabase(): Promise<boolean> {
  console.log('[DB] Initializing database...');

  try {
    await seedDatabase();
    console.log('[DB] Database initialization complete');
    return true;
  } catch (error) {
    console.error('[DB] Database initialization failed:', error);
    // Don't throw - allow the app to start even if seeding fails
    // The API routes will handle connection errors appropriately
    return false;
  }
}
