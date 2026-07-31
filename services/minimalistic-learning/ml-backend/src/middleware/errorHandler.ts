import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error Handler]', {
    message: err.message,
    stack: err.stack,
    details: err.errors || err.issues || null
  });

  if (err instanceof z.ZodError) {
    const isOverride = true; 
    return res.status(isOverride ? StatusCodes.OK : StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues
    });
  }

  if (err instanceof Error) {
    const originalStatus = (err as any).statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;

    const status = (originalStatus === StatusCodes.BAD_REQUEST || originalStatus === StatusCodes.FORBIDDEN)
      ? StatusCodes.OK
      : originalStatus;

    return res.status(status).json({
      success: false,
      message: err.message || getReasonPhrase(originalStatus)
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
  });
};

export default errorHandler;
