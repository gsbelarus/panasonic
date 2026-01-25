import { z } from 'zod';
import { ObjectId } from 'mongodb';

// ============================================================================
// Custom Zod Schema for MongoDB ObjectId
// ============================================================================

const objectIdSchema = z.union([
  z.string().refine((val) => ObjectId.isValid(val), {
    message: 'Invalid ObjectId string',
  }),
  z.instanceof(ObjectId),
]);

// ============================================================================
// Slug Validation Pattern
// ============================================================================

const slugPattern = /^[a-z0-9-]+$/;

// ============================================================================
// PQ Curve Point Schema (Air Volume / Static Pressure)
// ============================================================================

export const ProductPQPointSchema = z.object({
  airVolume: z.number().nonnegative('Air volume must be non-negative'),
  staticPressure: z.number().nonnegative('Static pressure must be non-negative'),
});

// ============================================================================
// PQ Curve Series Schema
// ============================================================================

export const ProductPQSeriesSchema = z.object({
  label: z.string().optional(),
  unit: z.object({
    airVolume: z.string().default('m³/min'),
    staticPressure: z.string().default('Pa'),
  }).optional(),
  points: z
    .array(ProductPQPointSchema)
    .min(1, 'PQ curve must have at least one point'),
});

// ============================================================================
// Electrical Specification Schema
// ============================================================================

export const ElectricalSpecSchema = z.object({
  voltage: z.string().optional(),
  frequency: z.string().optional(),
  phase: z.enum(['single', 'three']).optional(),
  powerInput: z.number().nonnegative().optional(),
  powerInputUnit: z.string().default('W'),
  current: z.number().nonnegative().optional(),
  currentUnit: z.string().default('A'),
});

// ============================================================================
// Fan Specification Schema
// ============================================================================

export const FanSpecSchema = z.object({
  airVolume: z
    .object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
      unit: z.string().default('m³/min'),
    })
    .refine((data) => data.min <= data.max, {
      message: 'airVolume.min must be less than or equal to airVolume.max',
    })
    .optional(),
  staticPressure: z
    .object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
      unit: z.string().default('Pa'),
    })
    .refine((data) => data.min <= data.max, {
      message: 'staticPressure.min must be less than or equal to staticPressure.max',
    })
    .optional(),
  noiseLevel: z.number().nonnegative().optional(),
  noiseLevelUnit: z.string().default('dB(A)'),
  rpm: z.number().int().positive().optional(),
  bladeCount: z.number().int().positive().optional(),
  bladeDiameter: z.number().positive().optional(),
  bladeDiameterUnit: z.string().default('mm'),
});

// ============================================================================
// Construction Specification Schema
// ============================================================================

export const ConstructionSpecSchema = z.object({
  material: z.string().optional(),
  color: z.string().optional(),
  dimensions: z
    .object({
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      depth: z.number().positive().optional(),
      unit: z.string().default('mm'),
    })
    .optional(),
  weight: z.number().positive().optional(),
  weightUnit: z.string().default('kg'),
  mountingType: z.string().optional(),
  ductSize: z.number().positive().optional(),
  ductSizeUnit: z.string().default('mm'),
  ipRating: z.string().optional(),
  insulationClass: z.string().optional(),
});

// ============================================================================
// Working Point Schema
// ============================================================================

export const WorkingPointSchema = z.object({
  airVolume: z.number().nonnegative().optional(),
  airVolumeUnit: z.string().default('m³/min'),
  staticPressure: z.number().nonnegative().optional(),
  staticPressureUnit: z.string().default('Pa'),
  description: z.string().optional(),
});

// ============================================================================
// Product Market Specification Schema
// ============================================================================

export const ProductMarketSpecSchema = z.object({
  regionCode: z.string().min(1, 'Region code is required'),
  countryKey: z.string().min(1, 'Country key is required'),
  // Optional resolved references (populated after lookup)
  regionId: objectIdSchema.optional(),
  countryId: objectIdSchema.optional(),
  // Optional specification blocks
  electrical: ElectricalSpecSchema.optional(),
  fanSpec: FanSpecSchema.optional(),
  construction: ConstructionSpecSchema.optional(),
  workingPoint: WorkingPointSchema.optional(),
  pqCurves: z.array(ProductPQSeriesSchema).optional(),
});

// ============================================================================
// Product Assets Schema
// ============================================================================

export const ProductAssetsSchema = z.object({
  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        alt: z.string().optional(),
        type: z.enum(['primary', 'gallery', 'thumbnail', 'technical']).optional(),
        sortOrder: z.number().int().min(0).default(0),
      })
    )
    .optional(),
  documents: z
    .array(
      z.object({
        url: z.string().url('Invalid document URL'),
        title: z.string().optional(),
        type: z
          .enum(['datasheet', 'manual', 'cad', 'certificate', 'brochure', 'other'])
          .optional(),
        fileType: z.string().optional(),
        fileSize: z.number().int().positive().optional(),
      })
    )
    .optional(),
});

// ============================================================================
// Main Product Schema
// ============================================================================

export const ProductSchema = z.object({
  _id: objectIdSchema.optional(),

  // Identity & Classification
  modelCode: z.string().min(1, 'Model code is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(slugPattern, 'Slug must be URL-safe (lowercase alphanumeric and hyphens only)'),
  categoryCode: z.string().min(1, 'Category code is required'),
  subcategoryCode: z.string().min(1, 'Subcategory code is required'),

  // Marketing / Content
  highlights: z.array(z.string()).default([]),

  // Market-Specific Specifications
  marketSpecs: z.array(ProductMarketSpecSchema).default([]),

  // Relationships
  relatedModelCodes: z.array(z.string()).default([]),

  // Assets
  assets: ProductAssetsSchema.optional(),

  // Status
  isActive: z.boolean().default(true),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// ============================================================================
// Insert Schema (for creating new products)
// ============================================================================

export const ProductInsertSchema = ProductSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// Update Schema (for partial updates)
// ============================================================================

export const ProductUpdateSchema = ProductSchema.partial().omit({
  _id: true,
  createdAt: true,
});

// ============================================================================
// Response Schema (for API responses)
// ============================================================================

export const ProductResponseSchema = ProductSchema.extend({
  _id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  marketSpecs: z
    .array(
      ProductMarketSpecSchema.extend({
        regionId: z.string().optional(),
        countryId: z.string().optional(),
      })
    )
    .default([]),
});

// ============================================================================
// Inferred TypeScript Types
// ============================================================================

export type ProductPQPoint = z.infer<typeof ProductPQPointSchema>;
export type ProductPQSeries = z.infer<typeof ProductPQSeriesSchema>;
export type ElectricalSpec = z.infer<typeof ElectricalSpecSchema>;
export type FanSpec = z.infer<typeof FanSpecSchema>;
export type ConstructionSpec = z.infer<typeof ConstructionSpecSchema>;
export type WorkingPoint = z.infer<typeof WorkingPointSchema>;
export type ProductMarketSpec = z.infer<typeof ProductMarketSpecSchema>;
export type ProductAssets = z.infer<typeof ProductAssetsSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductInsert = z.infer<typeof ProductInsertSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

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
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item && typeof item === 'object' ? normalizeMongoDocument(item) : item
      );
    } else if (value && typeof value === 'object') {
      result[key] = normalizeMongoDocument(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Parse and validate a product document from MongoDB
 */
export function parseProduct(doc: unknown): ProductResponse {
  const normalized = normalizeMongoDocument(doc);
  return ProductResponseSchema.parse(normalized);
}

/**
 * Parse and validate an array of product documents
 */
export function parseProducts(docs: unknown[]): ProductResponse[] {
  return docs.map(parseProduct);
}

/**
 * Validate create/insert product payload
 */
export function validateProductInsert(data: unknown): ProductInsert {
  return ProductInsertSchema.parse(data);
}

/**
 * Validate update product payload
 */
export function validateProductUpdate(data: unknown): ProductUpdate {
  return ProductUpdateSchema.parse(data);
}

/**
 * Validate a complete product document (for reads)
 */
export function validateProduct(data: unknown): Product {
  return ProductSchema.parse(data);
}
