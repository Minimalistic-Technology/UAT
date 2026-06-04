import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

import { Request, Response, NextFunction } from 'express';

interface RateLimitData {
  attempts: number;
  blockedUntil: number | null;
}

const loginStore = new Map<string, RateLimitData>();
const otpStore = new Map<string, RateLimitData>();

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MINUTES = 1;

export const createExponentialBackoffLimiter = (store: Map<string, RateLimitData>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // In deployment behind proxies (Render/Heroku/Nginx), req.ip is perfectly parsed
    // because app.set("trust proxy", 1) is enabled in index.ts. 
    // Manual x-forwarded-for parsing is dangerous as it can be a comma-separated list.
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store.has(ip)) {
      store.set(ip, { attempts: 0, blockedUntil: null });
    }

    const record = store.get(ip)!;

    if (record.blockedUntil && now < record.blockedUntil) {
      const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      res.status(429).json({
        success: false,
        message: `Too many failed attempts, please try again in ${remainingSeconds} seconds.`,
        remainingSeconds
      });
      return;
    }

    if (record.blockedUntil && now >= record.blockedUntil) {
      record.blockedUntil = null;
    }

    res.on('finish', () => {
      // 2xx indicates success. 401, 400, 404 usually indicate bad credentials or failed OTP
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.delete(ip);
      } else if (res.statusCode === 401 || res.statusCode === 400 || res.statusCode === 404) {
        record.attempts += 1;
        if (record.attempts >= MAX_ATTEMPTS) {
          const exponent = record.attempts - MAX_ATTEMPTS;
          const delayMs = Math.pow(2, exponent) * BASE_BACKOFF_MINUTES * 60 * 1000;
          record.blockedUntil = Date.now() + delayMs;

          // Prevent memory leaks in production by automatically clearing the ban map 
          // when the blocked period expires, if they haven't tried again.
          setTimeout(() => {
            const currentRec = store.get(ip);
            if (currentRec && currentRec.blockedUntil && Date.now() >= currentRec.blockedUntil) {
              store.delete(ip);
            }
          }, delayMs).unref();
        }
      }
    });

    next();
  };
};

export const loginLimiter = createExponentialBackoffLimiter(loginStore);
export const otpLimiter = createExponentialBackoffLimiter(otpStore);

export const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 applications per hour
  message: 'Too many applications submitted, please try again later',
});