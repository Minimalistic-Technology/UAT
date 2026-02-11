import rateLimit from 'express-rate-limit';

const standardHeaders = true;
const legacyHeaders = false;

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders,
  legacyHeaders,
  message: 'Too many login attempts. Please try again later.'
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders,
  legacyHeaders,
  message: 'Too many signup attempts. Please try again later.'
});

export const defaultLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders,
  legacyHeaders
});

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
