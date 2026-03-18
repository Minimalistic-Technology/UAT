import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";

export const requireAdminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; sessionId?: string };
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Strict Session Check
    // Admin MUST have a currentSessionId in DB to be considered logged in.
    // If not (e.g. explicitly logged out), deny access.
    if (!admin.currentSessionId) {
      res.status(401).json({ message: "Session expired." }); // or "Unauthorized"
      return;
    }

    // Token MUST session ID match the DB session ID
    if (!decoded.sessionId || decoded.sessionId !== admin.currentSessionId) {
      res.status(401).json({ message: "Session expired. Logged in from another device." });
      return;
    }

    (req as any).admin = admin;
    next();
  } catch (err) {
    next(err);
  }
};
