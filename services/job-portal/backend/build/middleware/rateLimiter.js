import rateLimit from 'express-rate-limit';
const getClientIp = (req) => {
    let ipStr = 'unknown';
    const cfIp = req.headers['cf-connecting-ip'];
    if (cfIp) {
        ipStr = Array.isArray(cfIp) ? cfIp[0] : cfIp;
    }
    else {
        const xfFor = req.headers['x-forwarded-for'];
        if (xfFor) {
            const list = Array.isArray(xfFor) ? xfFor[0] : xfFor;
            if (list)
                ipStr = list.split(',')[0].trim();
        }
        else {
            ipStr = req.ip || req.socket?.remoteAddress || 'unknown';
        }
    }
    return typeof ipStr === 'string' ? ipStr.replace(/:/g, '_') : 'unknown';
};
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 1000 : 5000, // Generous limit to prevent 429 during dev
    message: { success: false, message: 'Too many requests from this IP, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    validate: false
});
const loginStore = new Map();
const otpStore = new Map();
const MAX_FAILED_ATTEMPTS = 3;
export const BLOCK_DURATION_MINUTES = 1; // Change this variable to globally update block time
export const createFixedTimeoutLimiter = (store) => {
    return (req, res, next) => {
        const ip = getClientIp(req);
        const now = Date.now();
        if (!store.has(ip)) {
            store.set(ip, { attempts: 0, blockedUntil: null });
        }
        const record = store.get(ip);
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
            // Unblock after time expires
            record.blockedUntil = null;
            record.attempts = 0;
        }
        res.on('finish', () => {
            // 2xx indicates success. 401, 400, 404 usually indicate bad credentials or failed OTP
            if (res.statusCode >= 200 && res.statusCode < 300) {
                store.delete(ip);
            }
            else if (res.statusCode === 401 || res.statusCode === 400 || res.statusCode === 404) {
                record.attempts += 1;
                if (record.attempts >= MAX_FAILED_ATTEMPTS) {
                    const delayMs = BLOCK_DURATION_MINUTES * 60 * 1000;
                    record.blockedUntil = Date.now() + delayMs;
                    // Prevent memory leaks in production by automatically clearing the ban map
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
export const loginLimiter = createFixedTimeoutLimiter(loginStore);
export const otpLimiter = createFixedTimeoutLimiter(otpStore);
export const applicationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 applications per hour
    message: { success: false, message: 'Too many applications submitted, please try again later' },
    keyGenerator: getClientIp,
    validate: false
});
export const otpRequestLimiter = rateLimit({
    windowMs: 60 * 1000, // 60 seconds
    max: 3, // 3 requests per minute
    message: { success: false, message: "Please wait before requesting another OTP. Too many requests." },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    validate: false
});
