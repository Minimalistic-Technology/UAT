import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  ACCESS_TOKEN_EXPIRE: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRE: z.string().default('7d'),
  COOKIE_SECRET: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  PASSWORD_RESET_EXPIRE: z.string().default('1h')
});

const parsed = envSchema.parse(process.env);

const corsOrigins = parsed.CORS_ORIGIN
  ? parsed.CORS_ORIGIN.split(',').map((origin: string) => origin.trim()).filter(Boolean)
  : ['http://localhost:3000'];

export const env = {
  ...parsed,
  corsOrigins,
  isProduction: parsed.NODE_ENV === 'production'
};


