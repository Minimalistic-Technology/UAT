import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  MONGO_URI: z.string().optional(),
  ACCESS_TOKEN_EXPIRE: z.string().default('4h'),
  REFRESH_TOKEN_EXPIRE: z.string().default('7d'),
  COOKIE_SECRET: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  PASSWORD_RESET_EXPIRE: z.string().default('1h'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  EMAIL_USER: z.string().min(1, 'EMAIL_USER is required'),
  EMAIL_PASS: z.string().min(1, 'EMAIL_PASS is required'),
  BREVO_API_KEY: z.string().optional().default('xkeysib-example-key'),
  BREVO_FROM_EMAIL: z.string().optional().default('onboarding@minimalistic.com'),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
});

const parsed = envSchema.parse(process.env);
console.log('[env] Environment variables validated successfully');

const corsOrigins = parsed.CORS_ORIGIN
  ? parsed.CORS_ORIGIN.split(',').map((origin: string) => origin.trim()).filter(Boolean)
  : ['http://localhost:3000'];

export const env = {
  ...parsed,
  corsOrigins,
  isProduction: parsed.NODE_ENV === 'production'
};
