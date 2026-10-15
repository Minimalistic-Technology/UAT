import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Uses express-rate-limit's default in-memory store — fine for a single backend instance.
// If this ever runs as multiple instances behind a load balancer, swap the store for a
// shared one (e.g. rate-limit-redis against a dedicated ioredis client — the existing
// `redisClient` export in config/redis.ts is a hand-wrapped helper, not a raw client, so a
// fresh ioredis instance would be needed for that store).

const jsonLimitHandler = (req: Request, res: Response) => {
    res.status(429).json({ msg: 'Too many requests. Please try again later.' });
};

// Applied to every request. Generous — this is a safety net against blunt-force scripted
// abuse/scraping, not meant to bother normal usage.
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonLimitHandler,
    // The Cashfree payment webhook is a server-to-server call authenticated by HMAC
    // signature, not a user — it must never be throttled alongside browser traffic.
    skip: (req) => req.path === '/orders/payment/cashfree/webhook'
});

// Login/register/google-auth/check-user: brute-force & account-enumeration protection.
// Login already has its own Redis-based exponential backoff per IP+identifier in
// auth.controller.ts; this is a second, simpler layer that also covers the other
// credential-adjacent endpoints that don't have that bespoke logic.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonLimitHandler
});

// OTP send/verify: prevents SMS/email bombing a phone/email and brute-forcing a 4-6 digit
// code via raw request volume (on top of the existing per-identifier lockout in the
// controller, which only kicks in after wrong guesses — this caps attempts regardless).
export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonLimitHandler
});

// Public contact form: no auth, no existing abuse protection at all (see investigation) —
// caps spam submissions (and, by extension, the notification emails each one triggers).
export const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonLimitHandler
});

// Public coupon-code validation: without a cap, an attacker can script-guess coupon codes.
export const couponValidateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonLimitHandler
});

// Authenticated but sensitive account-mutation endpoints (change password, admin
// create-user) — light caps as defense-in-depth against a compromised/leaked session
// token being used to hammer the account or mass-create users.
export const sensitiveAccountActionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonLimitHandler
});
