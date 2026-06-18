import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    contactNumber: z.string().refine((val) => isValidPhoneNumber(val), {
      message: "Invalid phone number",
    }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    recaptchaToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
