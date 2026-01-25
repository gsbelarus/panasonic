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
