import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import User, { GlobalRole } from "../models/User.model.js";
import { ApiError } from "../utils/apiError.js";
import CompanyMember from "../models/CompanyMember.model.js";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token;

    // Check for token in headers or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ApiError(401, "Not authorized to access this route"));
    }

    // Verify token
    const decoded: any = jwt.verify(token, config.jwtSecret);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ApiError(401, "User not found"));
    }

    if (!req.user.isActive) {
      return next(new ApiError(403, "User account is deactivated"));
    }

    next();
  } catch (error: any) {
    return next(
      new ApiError(401, error.message ?? "Not authorized to access this route"),
    );
  }
};

// Optional auth middleware: Populates req.user if token exists, but doesn't block if not
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(); // Proceed without req.user
    }

    const decoded: any = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Just ignore token errors and proceed as unauthenticated
    next();
  }
};

export const authorize = (...roles: GlobalRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role '${req.user.role}' is not authorized to access this route`,
        ),
      );
    }
    next();
  };
};
