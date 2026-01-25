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
    result[key] = normalizeMongoValue(value);
  }

  return result;
}

function normalizeMongoValue(value: unknown): unknown {
  if (value instanceof ObjectId) {
    return value.toHexString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeMongoValue(item));
  }

  if (value && typeof value === 'object') {
    return normalizeMongoDocument(value);
  }

  return value;
}
