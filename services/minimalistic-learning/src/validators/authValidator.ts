import { z } from "zod";

export const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  contactNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const passwordResetInitSchema = z.object({
  email: z.string().email(),
});

export const passwordResetCompleteSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(8),
});
