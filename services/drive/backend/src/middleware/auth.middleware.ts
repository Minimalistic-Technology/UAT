import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Access token missing");
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken -__v",
    ).lean();

    if (!user) {
      throw new ApiError(401, "User not found for this token");
    }

    req.user = {
      _id: user._id,
      email: user.email
    };

    next();
  },
);
