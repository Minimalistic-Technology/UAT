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
  recaptchaToken: z.string().min(1, "Captcha token is required for security"),
});

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1),
  role: z.enum(["user", "admin"]).optional().default("user"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});



export const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
