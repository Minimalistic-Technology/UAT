import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  contactNumber: z.string().refine((val) => isValidPhoneNumber(val), {
    message: "Invalid phone number",
  }),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(["user", "admin"]).optional().default("user"),
});

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
  role: z.enum(["user", "admin"]).optional().default("user"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const passwordResetInitSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const passwordResetCompleteSchema = z.object({
  email: z.string().email("Please provide your email address"),
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
