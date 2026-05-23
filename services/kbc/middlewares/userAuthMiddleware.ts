import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import RegisteredUser from "../models/RegisteredUser";

export const requireUserAuth = async ( req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    const user = await RegisteredUser.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "Unauthorized - Invalid user" });
      return;
    }
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
