import rateLimit from 'express-rate-limit';
import { env } from './env';

const standardHeaders = true;
const legacyHeaders = false;

// 1. Strict Auth Limiter (For Login, OTP, Password Resets)
// Prevents brute-force attacks and OTP guessing
export const authStrictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 100 : 10,
  standardHeaders,
  legacyHeaders,
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

// 2. Signup Limiter
// Prevents mass account creation spam
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.NODE_ENV === 'development' ? 100 : 15,
  standardHeaders,
  legacyHeaders,
  message: { message: 'Too many accounts created from this IP. Please try again later.' }
});

// 3. Global Default Limiter
// Basic DDoS / Spam protection for general API endpoints
export const defaultLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders,
  legacyHeaders,
  message: { message: 'Too many requests. Please slow down and try again.' }
});

// Generic in-memory user hit counter (for manual checks like Comments)
const userCounters = new Map<string, { count: number; time: number }>();

export const commentRateLimit = (userId: string) => {
  const now = Date.now();
  const windowMs = 60_000;

  const entry = userCounters.get(userId) || { count: 0, time: now };

  if (now - entry.time > windowMs) {
    userCounters.set(userId, { count: 1, time: now });
    return true;
  }

  if (entry.count >= 5) return false;

  entry.count++;
  userCounters.set(userId, entry);
  return true;
};

