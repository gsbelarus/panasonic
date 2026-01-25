import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { normalizeMongoDocument } from './normalizeMongoDocument';

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

// ============================================================================
// Re-export Products Schemas and Types
// ============================================================================

export * from './products/schema';
