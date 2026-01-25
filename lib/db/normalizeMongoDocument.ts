import { ObjectId } from 'mongodb';

/**
 * Normalize MongoDB document for API response
 * - Converts ObjectId to string
 * - Converts Date objects to ISO strings
 * - Recursively normalizes nested objects and arrays
 */
export function normalizeMongoDocument(doc: unknown): Record<string, unknown> {
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
