import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { User } from "../../generated/prisma/client.js";

export interface MyContext {
  req: Request;
  res: Response;
  user?: User | null;
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
      const foundUser = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (foundUser && foundUser.isActive) {
        user = foundUser;
      }
    } catch (error) {
      console.error("JWT verification error:", error);
    }
  }

  return { req, res, user };
};
