import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code').regex(/^\d+$/, 'Digits only'),
});
export type OtpInput = z.infer<typeof otpSchema>;

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'At least 3 characters')
    .max(20, 'At most 20 characters')
    .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, and underscores only'),
});
export type UsernameInput = z.infer<typeof usernameSchema>;

export const linkSchema = z.object({
  type: z.enum(['link', 'pdf']).default('link'),
  title: z.string().trim().min(1, 'Title is required').max(100),
  url: z.string().trim().url('Enter a valid URL'),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal('')),
});
export type LinkInput = z.infer<typeof linkSchema>;
