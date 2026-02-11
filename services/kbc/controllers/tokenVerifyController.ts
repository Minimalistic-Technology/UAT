import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import RegisteredUser from "../models/RegisteredUser";

const router = express.Router();

// handler that can be used directly as route or imported elsewhere
export const verifyMe = async (req: Request, res: Response): Promise<void> => {
  try {

    const token = req.cookies?.token;
    if (!token) {
      res.json({ role: null, user: null });
      return;
    }

    // Adjust type to match how you sign tokens (id or sub)
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id?: string;
      sub?: string;
      role?: "admin" | "user";
    };

    // If you sign with { id: ... } use payload.id
    // If you sign with { sub: ... } use payload.sub
    const id = payload.id ?? payload.sub;
    if (!id) {
      res.json({ role: null, user: null });
      return;
    }

    if (payload.role === "admin") {
      const admin = await Admin.findById(id).select("-passwordHash");
      if (!admin) {
        res.json({ role: null, user: null });
        return;
      }

      res.json({
        role: "admin",
        user: {
          id: admin._id,
          email: admin.email,
          verified: admin.verified,
        },
      });
      return;
    }

    if (payload.role === "user") {
      const user = await RegisteredUser.findById(id).select("-password");
      if (!user) {
        res.json({ role: null, user: null });
        return;
      }

      res.json({
        role: "user",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
      return;
    }

    // fallback
    res.json({ role: null, user: null });
  } catch (error) {
    // optionally log error
    console.error("verifyMe error:", error);
    res.json({ role: null, user: null });
  }
};


export default router;