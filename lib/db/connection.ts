import dotenvFlow from 'dotenv-flow';
import { MongoClient, Db, Collection } from 'mongodb';
import type { Region, Country, Category, Subcategory, Store } from './schemas';
import type { Product } from './products/schema';

// Load environment variables using dotenv-flow
// This supports .env, .env.local, .env.development, etc.
dotenvFlow.config({
  silent: true, // Don't warn about missing files
});

// ============================================================================
// Environment Configuration
// ============================================================================

interface DbConfig {
  user: string;
  password: string;
  host: string;
  port: string;
  name: string;
}

function getDbConfig(): DbConfig {
  const config: DbConfig = {
    user: process.env.DB_SUPERADMIN_USER || '',
    password: process.env.DB_SUPERADMIN_PASSWORD || '',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || '27017',
    name: process.env.DB_NAME || 'panasonic',
  };

  return config;
}

function buildConnectionUri(config: DbConfig): string {
  // If credentials are provided, use authenticated connection
  if (config.user && config.password) {
    const encodedUser = encodeURIComponent(config.user);
    const encodedPassword = encodeURIComponent(config.password);
    return `mongodb://${encodedUser}:${encodedPassword}@${config.host}:${config.port}/${config.name}?authSource=admin`;
  }

  // Otherwise, use unauthenticated connection (for local development without auth)
  return `mongodb://${config.host}:${config.port}/${config.name}`;
}

// ============================================================================
// MongoDB Connection Singleton
// ============================================================================

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export interface DbConnection {
  client: MongoClient;
  db: Db;
}

/**
 * Get or create a MongoDB connection.
 * Uses connection pooling via cached client.
 */
export async function connectToDatabase(): Promise<DbConnection> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const config = getDbConfig();
  const uri = buildConnectionUri(config);

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  await client.connect();

  const db = client.db(config.name);

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  console.log(`[MongoDB] Connected to database: ${config.name}`);

  return { client, db };
}

/**
 * Close the MongoDB connection.
 * Useful for graceful shutdown.
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('[MongoDB] Connection closed');
  }
}

// ============================================================================
// Collection Helpers
// ============================================================================

export const COLLECTIONS = {
  REGIONS: 'regions',
  COUNTRIES: 'countries',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  PRODUCTS: 'products',
  STORES: 'stores',
} as const;

/**
 * Get the regions collection with proper typing
 */
export async function getRegionsCollection(): Promise<Collection<Region>> {
  const { db } = await connectToDatabase();
  return db.collection<Region>(COLLECTIONS.REGIONS);
}

/**
 * Get the countries collection with proper typing
 */
export async function getCountriesCollection(): Promise<Collection<Country>> {
  const { db } = await connectToDatabase();
  return db.collection<Country>(COLLECTIONS.COUNTRIES);
}

/**
 * Get the categories collection with proper typing
 */
export async function getCategoriesCollection(): Promise<Collection<Category>> {
  const { db } = await connectToDatabase();
  return db.collection<Category>(COLLECTIONS.CATEGORIES);
}

/**
 * Get the subcategories collection with proper typing
 */
export async function getSubcategoriesCollection(): Promise<Collection<Subcategory>> {
  const { db } = await connectToDatabase();
  return db.collection<Subcategory>(COLLECTIONS.SUBCATEGORIES);
}

/**
 * Get the products collection with proper typing
 */
export async function getProductsCollection(): Promise<Collection<Product>> {
  const { db } = await connectToDatabase();
  return db.collection<Product>(COLLECTIONS.PRODUCTS);
}

/**
 * Get the stores collection with proper typing
 */
export async function getStoresCollection(): Promise<Collection<Store>> {
  const { db } = await connectToDatabase();
  return db.collection<Store>(COLLECTIONS.STORES);
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * Check if the database connection is healthy
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('[MongoDB] Health check failed:', error);
    return false;
  }
}
