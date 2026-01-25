import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Shared Zod schema for MongoDB ObjectId.
 */
export const objectIdSchema = z.union([
  z.string().refine((val) => ObjectId.isValid(val), {
    message: 'Invalid ObjectId string',
  }),
  z.instanceof(ObjectId),
]);
