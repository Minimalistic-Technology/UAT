import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { generateToken, hashToken } from "../userUtils/token";
import { sendEmail } from "../userUtils/email";

const BCRYPT_SALT = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
      res.status(403).json({ message: "Email in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT);
    const verifyToken = generateToken();

    const admin = await Admin.create({
      email,
      passwordHash,
      verifyToken: hashToken(verifyToken),
      verifyTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
    });

    // const verifyUrl = `${req.protocol}://${req.get("host")}/auth/admins/verify?token=${verifyToken}`;
    // await sendEmail(email, "Verify your account", `<a href="${verifyUrl}">Verify</a>`);

    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verifyToken}`;
    await sendEmail(email, "Verify your account", `<a href="${verifyUrl}">Verify</a>`);

    res.status(201).json({ message: "Registered, check email", devVerifyToken: verifyToken });
    return;
  } catch (err: any) {
    console.log("error", err);
    res.status(500).json({ error: err.message });
    return;
  }
};

export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.query.token as string;
    console.log("Received token:", token);
    console.log("Hashed received token:", hashToken(token));
    const admin = await Admin.findOne({
      verifyToken: hashToken(token as string),
      verifyTokenExpires: { $gt: new Date() },
    });

    console.log("Stored token in DB:", admin?.verifyToken);
    if (!admin) {
      res.status(403).json({ message: "Invalid/expired token" });
      return;
    }

    admin.verified = true;
    admin.verifyToken = undefined;
    admin.verifyTokenExpires = undefined;
    await admin.save();

    res.json({ message: "Account verified" });
    return;
    // return res.redirect(307, `${process.env.FRONTEND_URL}/auth/login`);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(403).json({ message: "Invalid credentials" });
      return;
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      res.status(403).json({ message: "Invalid credentials" });
      return;
    }

    if (!admin.verified) {
      res.status(403).json({ message: "Verify account first" });
      return;
    }

    const token = jwt.sign({ id: admin._id , role: "admin" }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    admin.lastLogin = new Date();
    await admin.save();

   res.json({ status: "success", role: "admin", user: { id: admin._id, email: admin.email } });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(403).json({ message: "No account found" });
      return;
    }

    const resetToken = generateToken();
    admin.resetToken = hashToken(resetToken);
    admin.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save();

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await sendEmail(email, "Reset password", `<a href="${resetUrl}">Reset</a>`);

    res.json({ message: "Password reset email sent" });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    const admin = await Admin.findOne({
      resetToken: hashToken(token),
      resetTokenExpires: { $gt: new Date() },
    });
    if (!admin) {
      res.status(403).json({ message: "Invalid/expired token" });
      return;
    }

    admin.passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT);
    admin.resetToken = undefined;
    admin.resetTokenExpires = undefined;
    await admin.save();

    res.json({ message: "Password updated" });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = (req as any).admin;
    res.json({ id: admin._id, email: admin.email, verified: admin.verified });
    return;
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
    return;
  } catch (err) {
    next(err);
  }
};
