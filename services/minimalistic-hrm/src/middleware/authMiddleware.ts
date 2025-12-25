import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AuthUserModel from "../models/authUser";


const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

interface DecodedToken extends JwtPayload {
  id: string;
  role: "user" | "admin" | "hr" | "super_admin";
}

export const isUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ message: "No token, authorization denied" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    console.log("Decoded ID:", decoded.id);
    const user = await AuthUserModel.findById(decoded.id);

    console.log("Decoded token:", decoded);
    console.log("Authenticated user:", user);

    if (!user) {
      res.status(401).json({ message: "Unauthorized: user not found" });
      return;
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      companyID: user.companyID,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};

/**
 * Admin only
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "super_admin")
  ) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

/**
 * Admin or HR
 */
export const isAdminOrHr = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.user &&
    ["admin", "hr", "super_admin"].includes(req.user.role)
  ) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin or HR" });
  }
};