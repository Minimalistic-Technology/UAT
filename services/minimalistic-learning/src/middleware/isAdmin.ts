import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError';

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Admin access required'));
  }

  next();
};

export default isAdmin;
