import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Custom Zod schema for MongoDB ObjectId
const objectIdSchema = z.union([
  z.string().refine((val) => ObjectId.isValid(val), {
    message: 'Invalid ObjectId string',
  }),
  z.instanceof(ObjectId),
]);

// ============================================================================
// Region Schema
// ============================================================================

export const RegionSchema = z.object({
  _id: objectIdSchema.optional(),
  code: z.string().min(1, 'Region code is required').max(50),
  name: z.string().min(1, 'Region name is required').max(100),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateRegionSchema = RegionSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const RegionResponseSchema = RegionSchema.extend({
  _id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ============================================================================
// Country Schema
// ============================================================================

export const CountrySchema = z.object({
  _id: objectIdSchema.optional(),
  iso2: z.string().length(2, 'ISO2 code must be exactly 2 characters'),
  name: z.string().min(1, 'Country name is required').max(100),
  regionCode: z.string().min(1, 'Region code is required'),
  voltage: z.string().regex(/^\d{3}V$/, 'Voltage must be in format like 220V'),
  frequency: z.string().regex(/^\d{2}Hz$/, 'Frequency must be in format like 50Hz'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateCountrySchema = CountrySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const CountryResponseSchema = CountrySchema.extend({
  _id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ============================================================================
// API Response Schemas
// ============================================================================

export const RegionsApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(RegionResponseSchema),
});

export const CountriesApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CountryResponseSchema),
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

// ============================================================================
// Category Schema
// ============================================================================

export const CategorySchema = z.object({
  _id: objectIdSchema.optional(),
  code: z.string().min(1, 'Category code is required').max(50),
  name: z.string().min(1, 'Category name is required').max(100),
  icon: z.string().optional(), // SVG path for the category icon
  sortOrder: z.number().int().min(0).default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateCategorySchema = CategorySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const CategoryResponseSchema = CategorySchema.extend({
  _id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ============================================================================
// Subcategory Schema
// ============================================================================

export const SubcategorySchema = z.object({
  _id: objectIdSchema.optional(),
  code: z.string().min(1, 'Subcategory code is required').max(50),
  name: z.string().min(1, 'Subcategory name is required').max(100),
  categoryCode: z.string().min(1, 'Category code is required'),
  sortOrder: z.number().int().min(0).default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateSubcategorySchema = SubcategorySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const SubcategoryResponseSchema = SubcategorySchema.extend({
  _id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ============================================================================
// Product Schemas
// ============================================================================

// PQ Curve Point Schema
const PQPointSchema = z.object({
  q: z.number(), // air volume (CMH)
  p: z.number(), // pressure (Pa)
});

// PQ Curve Series Schema
export const ProductPQSeriesSchema = z.object({
  speed: z.string(), // e.g. "hi", "low"
  dashStyle: z.string().optional(), // e.g. "Solid", "Dashed"
  highlight: z.boolean().optional(),
  highlightKey: z.string().optional(),
  points: z.array(PQPointSchema),
});

// Air Volume Range Schema
const AirVolumeRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  unit: z.literal('CMH'),
});

// Static Pressure Range Schema
const StaticPressureRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  unit: z.literal('Pa'),
});

// Noise Schema
const NoiseSchema = z.object({
  value: z.number(),
  unit: z.literal('dBA'),
});

// Fan Specification Schema
const FanSpecSchema = z.object({
  fanSubType: z.string().nullable().optional(),
  powerConsumptionW: z.number().nullable().optional(),
  fanSpeedRpm: z.number().nullable().optional(),
});

// Construction Schema
const ConstructionSchema = z.object({
  ductSizeMm: z.number().nullable().optional(),
  speedControl: z.enum(['Single', 'Double', 'Variable']).nullable().optional(),
});

// Working Point Schema
const WorkingPointSchema = z.object({
  speed: z.string().nullable().optional(), // e.g. "Hi", "Low"
  airVolume: AirVolumeRangeSchema,
  staticPressure: StaticPressureRangeSchema,
  noise: NoiseSchema,
});

// Product Market Spec Schema (region/country specific specifications)
export const ProductMarketSpecSchema = z.object({
  regionCode: z.string(),
  countryName: z.string(),
  // Optional resolved refs (populated after seeding)
  regionId: objectIdSchema.optional(),
  countryId: objectIdSchema.optional(),
  // Electrical specs
  voltageV: z.number().optional(),
  frequencyHz: z.number().optional(),
  // Specification blocks
  fanSpec: FanSpecSchema,
  construction: ConstructionSchema,
  workingPoint: WorkingPointSchema,
  // PQ curve data series (optional)
  pqCurves: z.array(ProductPQSeriesSchema).optional(),
});

// Asset Document Schema
const AssetDocumentSchema = z.object({
  label: z.string(),
  url: z.string(),
});

// Assets Schema
const AssetsSchema = z.object({
  imageUrls: z.array(z.string()),
  documents: z.array(AssetDocumentSchema),
});

// Product Schema (MongoDB document)
export const ProductSchema = z.object({
  _id: objectIdSchema.optional(),
  // Identity
  modelCode: z.string().min(1, 'Model code is required'),
  slug: z.string().min(1, 'Slug is required'),
  // Classification
  categoryCode: z.string().min(1, 'Category code is required'),
  subcategoryCode: z.string().min(1, 'Subcategory code is required'),
  categoryName: z.string().optional(),
  subcategoryName: z.string().optional(),
  // Optional resolved refs
  categoryId: objectIdSchema.optional(),
  subcategoryId: objectIdSchema.optional(),
  // Marketing
  highlights: z.array(z.string()),
  // Market-specific specs
  marketSpecs: z.array(ProductMarketSpecSchema),
  // Related products
  relatedModelCodes: z.array(z.string()),
  // Assets
  assets: AssetsSchema,
  // Status
  isActive: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create Product Schema (for API input)
export const CreateProductSchema = ProductSchema.omit({
  _id: true,
  categoryId: true,
  subcategoryId: true,
  createdAt: true,
  updatedAt: true,
});

// Update Product Schema (partial)
export const UpdateProductSchema = CreateProductSchema.partial();

// Product Response Schema (for API output)
export const ProductResponseSchema = ProductSchema.extend({
  _id: z.string(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  marketSpecs: z.array(ProductMarketSpecSchema.extend({
    regionId: z.string().optional(),
    countryId: z.string().optional(),
  })),
});

// ============================================================================
// API Response Schemas (Categories & Subcategories)
// ============================================================================

export const CategoriesApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CategoryResponseSchema),
});

export const SubcategoriesApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SubcategoryResponseSchema),
});

export const ProductsApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ProductResponseSchema),
});

export const ProductApiResponseSchema = z.object({
  success: z.boolean(),
  data: ProductResponseSchema,
});

// ============================================================================
// Inferred TypeScript Types
// ============================================================================

export type Region = z.infer<typeof RegionSchema>;
export type CreateRegion = z.infer<typeof CreateRegionSchema>;
export type RegionResponse = z.infer<typeof RegionResponseSchema>;

export type Country = z.infer<typeof CountrySchema>;
export type CreateCountry = z.infer<typeof CreateCountrySchema>;
export type CountryResponse = z.infer<typeof CountryResponseSchema>;

export type RegionsApiResponse = z.infer<typeof RegionsApiResponseSchema>;
export type CountriesApiResponse = z.infer<typeof CountriesApiResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

export type Subcategory = z.infer<typeof SubcategorySchema>;
export type CreateSubcategory = z.infer<typeof CreateSubcategorySchema>;
export type SubcategoryResponse = z.infer<typeof SubcategoryResponseSchema>;

export type CategoriesApiResponse = z.infer<typeof CategoriesApiResponseSchema>;
export type SubcategoriesApiResponse = z.infer<typeof SubcategoriesApiResponseSchema>;

// Product types
export type ProductPQSeries = z.infer<typeof ProductPQSeriesSchema>;
export type ProductMarketSpec = z.infer<typeof ProductMarketSpecSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductsApiResponse = z.infer<typeof ProductsApiResponseSchema>;
export type ProductApiResponse = z.infer<typeof ProductApiResponseSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Parse and validate a region document from MongoDB
 */
export function parseRegion(doc: unknown): RegionResponse {
  // Convert MongoDB document to response format
  const normalized = normalizeMongoDocument(doc);
  return RegionResponseSchema.parse(normalized);
}

/**
 * Parse and validate a country document from MongoDB
 */
export function parseCountry(doc: unknown): CountryResponse {
  const normalized = normalizeMongoDocument(doc);
  return CountryResponseSchema.parse(normalized);
}

/**
 * Parse and validate an array of region documents
 */
export function parseRegions(docs: unknown[]): RegionResponse[] {
  return docs.map(parseRegion);
}

/**
 * Parse and validate an array of country documents
 */
export function parseCountries(docs: unknown[]): CountryResponse[] {
  return docs.map(parseCountry);
}

/**
 * Validate create region payload
 */
export function validateCreateRegion(data: unknown): CreateRegion {
  return CreateRegionSchema.parse(data);
}

/**
 * Validate create country payload
 */
export function validateCreateCountry(data: unknown): CreateCountry {
  return CreateCountrySchema.parse(data);
}

/**
 * Parse and validate a category document from MongoDB
 */
export function parseCategory(doc: unknown): CategoryResponse {
  const normalized = normalizeMongoDocument(doc);
  return CategoryResponseSchema.parse(normalized);
}

/**
 * Parse and validate a subcategory document from MongoDB
 */
export function parseSubcategory(doc: unknown): SubcategoryResponse {
  const normalized = normalizeMongoDocument(doc);
  return SubcategoryResponseSchema.parse(normalized);
}

/**
 * Parse and validate an array of category documents
 */
export function parseCategories(docs: unknown[]): CategoryResponse[] {
  return docs.map(parseCategory);
}

/**
 * Parse and validate an array of subcategory documents
 */
export function parseSubcategories(docs: unknown[]): SubcategoryResponse[] {
  return docs.map(parseSubcategory);
}

/**
 * Validate create category payload
 */
export function validateCreateCategory(data: unknown): CreateCategory {
  return CreateCategorySchema.parse(data);
}

/**
 * Validate create subcategory payload
 */
export function validateCreateSubcategory(data: unknown): CreateSubcategory {
  return CreateSubcategorySchema.parse(data);
}

/**
 * Parse and validate a product document from MongoDB
 */
export function parseProduct(doc: unknown): ProductResponse {
  const normalized = normalizeMongoDocument(doc);
  // Deep normalize marketSpecs array for ObjectIds
  if (Array.isArray(normalized.marketSpecs)) {
    normalized.marketSpecs = normalized.marketSpecs.map((spec: unknown) => {
      if (spec && typeof spec === 'object') {
        return normalizeMongoDocument(spec);
      }
      return spec;
    });
  }
  return ProductResponseSchema.parse(normalized);
}

/**
 * Parse and validate an array of product documents
 */
export function parseProducts(docs: unknown[]): ProductResponse[] {
  return docs.map(parseProduct);
}

/**
 * Validate create product payload
 */
export function validateCreateProduct(data: unknown): CreateProduct {
  return CreateProductSchema.parse(data);
}

/**
 * Validate update product payload
 */
export function validateUpdateProduct(data: unknown): UpdateProduct {
  return UpdateProductSchema.parse(data);
}

/**
 * Normalize MongoDB document for API response
 * - Converts ObjectId to string
 * - Converts Date objects to ISO strings
 */
function normalizeMongoDocument(doc: unknown): Record<string, unknown> {
  if (!doc || typeof doc !== 'object') {
    throw new Error('Invalid document');
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(doc as Record<string, unknown>)) {
    if (value instanceof ObjectId) {
      result[key] = value.toHexString();
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else {
      result[key] = value;
    }
  }

  return result;
}
