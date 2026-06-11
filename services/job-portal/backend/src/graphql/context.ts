import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import User, { IUser } from "../models/User.model.js";

export interface MyContext {
  req: Request;
  res: Response;
  user?: IUser | null;
}

export const createContext = async ({ req, res }: { req: Request, res: Response }): Promise<MyContext> => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  let user = null;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, config.jwtSecret);
      const foundUser = await User.findById(decoded.id);

      if (foundUser && foundUser.isActive) {
        user = foundUser;
      }
    } catch (error) {
      // Invalid token, just proceed without user (or throw if we want all graphql to be strictly authenticated, but usually we handle auth at the resolver level)
      // console.warn("GraphQL Context Auth Error:", error);
    }
  }

  return { req, res, user };
};
