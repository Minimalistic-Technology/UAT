import { NextFunction, Request, Response } from 'express';
import { ApiError, ApiErrorDetail } from '../utils/ApiError';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

interface MongoDuplicateKeyError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error | ApiError | MongoDuplicateKeyError, req: Request, res: Response, next: NextFunction) {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || 'Internal server error';
  const details: ApiErrorDetail[] | undefined = err instanceof ApiError ? err.details : undefined;

  const mongoErr = err as MongoDuplicateKeyError;
  if (mongoErr.code === 11000) {
    statusCode = 409;
    const field = Object.keys(mongoErr.keyPattern || {})[0] || 'field';
    message = `${field} is already in use`;
  }

  if (!statusCode) statusCode = 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}
