import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Validation failed',
      errors: err.issues
    });
  }

  if (err instanceof Error) {
    const status = (err as any).statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
    return res.status(status).json({
      message: err.message || getReasonPhrase(status)
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
  });
};

export default errorHandler;


