import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validates req.body against a Zod schema and replaces req.body with the
 * parsed (and coerced/trimmed) result.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(400, 'Validation failed', details));
    }
    req.body = result.data;
    next();
  };
}
