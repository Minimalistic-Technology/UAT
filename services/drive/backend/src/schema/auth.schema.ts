import z from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verifyEmailOtpSchema = z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().min(6, "OTP must be at least 6 digits"),
});