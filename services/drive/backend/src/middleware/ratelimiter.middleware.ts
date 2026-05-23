import rateLimit, { type Options } from "express-rate-limit";

const createLimiter = (options: Partial<Options>) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });

// General API limiter
export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Strict limiter (for auth routes)
export const authLimiter = createLimiter({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 5, // max 5 attempts
  message: {
    success: false,
    message: "Too many login attempts, try again later.",
  },
});

// Very strict limiter (for sensitive actions like OTP/reset)
export const strictLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: "Too many attempts. Try again after an hour.",
  },
});