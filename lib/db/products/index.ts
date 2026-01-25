// ============================================================================
// Products Collection Module
// Re-exports all products-related database utilities
// ============================================================================

export * from './schema';
export * from './indexes';
export {
  // Seed data
  seedProducts,
  // Seeding functions
  needsProductsSeeding,
  seedProductsCollection,
  bootstrapProducts,
  // Referential integrity
  ReferentialIntegrityError,
  MarketSpecIntegrityError,
  loadReferenceData,
  validateProductIntegrity,
  validateAllProductsIntegrity,
  // Reference data loaders
  loadValidCategoryCodes,
  loadValidSubcategoryCodes,
  loadValidRegionCodes,
  loadValidCountryKeysByRegion,
  // Types
  type ReferenceData,
} from './seed';
