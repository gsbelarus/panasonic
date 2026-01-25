import { connectToDatabase, COLLECTIONS } from './connection';
import type { CreateRegion, CreateCountry } from './schemas';
import { validateCreateRegion, validateCreateCountry } from './schemas';

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

// ============================================================================
// Main Seeding Function
// ============================================================================

export interface SeedResult {
  regionsSeeded: number;
  countriesSeeded: number;
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

    if (!regionsNeedSeeding && !countriesNeedSeeding) {
      console.log('[Seed] Database already seeded, skipping...');
      result.skipped = true;
      return result;
    }

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
export async function initializeDatabase(): Promise<void> {
  console.log('[DB] Initializing database...');

  try {
    await seedDatabase();
    console.log('[DB] Database initialization complete');
  } catch (error) {
    console.error('[DB] Database initialization failed:', error);
    // Don't throw - allow the app to start even if seeding fails
    // The API routes will handle connection errors appropriately
  }
}
