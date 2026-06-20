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
        contactNumber: z.string().transform((val) => {
            const digits = val.replace(/\D/g, '');
            let core = digits;
            if (core.startsWith('91') && core.length > 10) core = core.slice(2);
            return `+91${core}`;
        }).refine((val) => isValidPhoneNumber(val), {
            message: "Invalid 10-digit number",
        }),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        turnstileToken: z.string().min(1, "Please verify you are human"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
