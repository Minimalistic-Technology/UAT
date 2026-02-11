import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../utils/jwt';
import * as userService from '../services/userService';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bearer = req.headers.authorization;
    const tokenFromCookie = req.cookies?.access_token as string | undefined;

    const token =
      tokenFromCookie ||
      (bearer && bearer.startsWith('Bearer ') ? bearer.substring('Bearer '.length) : undefined);

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
    }

    const payload = verifyAccessToken(token);
    const user = await userService.findById(payload.sub);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
  }
};

export default requireAuth;

