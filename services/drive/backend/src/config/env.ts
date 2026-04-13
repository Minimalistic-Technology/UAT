import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    PORT: z
      .string()
      .default("5000")
      .transform((val) => {
        const port = Number(val);
        if (isNaN(port)) throw new Error("PORT must be a number");
        return port;
      }),

    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

    COOKIE_SECRET: z.string().default("cookie-secret"),

    CORS_ORIGIN: z
      .string()
      .default("http://localhost:3000")
      .transform((val) =>
        val.split(",").map((origin) => {
          const trimmed = origin.trim();

          // validate each URL
          new URL(trimmed);

          return trimmed;
        }),
      ),

    ACCESS_TOKEN_SECRET: z
      .string()
      .min(10, "ACCESS_TOKEN_SECRET must be at least 10 characters"),

    REFRESH_TOKEN_SECRET: z
      .string()
      .min(10, "REFRESH_TOKEN_SECRET must be at least 10 characters"),

    ACCESS_TOKEN_EXPIRY: z
      .string()
      .regex(/^(\d+[smhd])$/, "ACCESS_TOKEN_EXPIRY must be like 15m, 7d, 24h")
      .default("15m"),

    REFRESH_TOKEN_EXPIRY: z
      .string()
      .regex(/^(\d+[smhd])$/, "REFRESH_TOKEN_EXPIRY must be like 15m, 7d, 24h")
      .default("7d"),

    // Email Config ( Dev )
    MAILTRAP_TOKEN: z.string().optional(),
    MAILTRAP_USER: z.string().optional(),
    MAILTRAP_PASS: z.string().optional(),

    // Email Config ( Production )
    RESEND_API_KEY: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    // 🔥 Production-specific checks
    if (env.NODE_ENV === "production") {
      if (env.ACCESS_TOKEN_SECRET === "dev-secret") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Do not use weak ACCESS_TOKEN_SECRET in production",
        });
      }

      if (env.REFRESH_TOKEN_SECRET === "dev-secret") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Do not use weak REFRESH_TOKEN_SECRET in production",
        });
      }

      if (env.COOKIE_SECRET === "cookie-secret") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Do not use weak COOKIE_SECRET in production",
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
