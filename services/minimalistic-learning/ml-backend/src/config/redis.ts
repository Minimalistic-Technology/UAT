import Redis from 'ioredis';
import { env } from './env';

// env.REDIS_URL available hai (Zod schema mein add kar diya) — fallback local Redis
const redisUrl = env.REDIS_URL ?? 'redis://localhost:6379';

// Upstash jaise cloud providers ke liye `rediss://` = TLS. ioredis ko explicitly batana padta hai.
const isTlsRedis = redisUrl.startsWith('rediss://');

export let isRedisConnected = false;

const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    lazyConnect: true, // Startup pe crash nahi hogi agar Redis na mile
    ...(isTlsRedis && { tls: { rejectUnauthorized: false } }), // ✅ Upstash (rediss://) ke liye TLS required
    retryStrategy(times) {
        if (times >= 3) {
            console.warn('[Cache] Redis not reachable. Falling back to in-memory Map cache.');
            isRedisConnected = false;
            return null; // retry band karo
        }
        return Math.min(times * 1000, 3000);
    },
});

redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('[Cache] Connected to External Redis successfully ⚡');
});

redisClient.on('error', (err) => {
    if (isRedisConnected) {
        console.error('[Cache] Redis Connection Error:', err.message);
        isRedisConnected = false;
    }
});

// lazyConnect hone ki wajah se manually connect karte hain — error aayi to silently ignore
redisClient.connect().catch(() => {
    console.warn('[Cache] Redis connect() failed — using in-memory Map fallback.');
});

// ────────────────────────────────────────────────────────
// IN-MEMORY MAP FALLBACK (jab Redis offline ho)
// ────────────────────────────────────────────────────────
interface MapCacheItem {
    data: string;
    expiryTs: number;
}
const memoryCache = new Map<string, MapCacheItem>();

export const CacheService = {
    async get(key: string): Promise<string | null> {
        if (isRedisConnected) {
            try { return await redisClient.get(key); }
            catch { return null; }
        }
        const item = memoryCache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiryTs) {
            memoryCache.delete(key);
            return null;
        }
        return item.data;
    },

    async setex(key: string, seconds: number, data: string): Promise<void> {
        if (isRedisConnected) {
            try { await redisClient.setex(key, seconds, data); }
            catch { /* silently fallthrough */ }
        } else {
            memoryCache.set(key, { data, expiryTs: Date.now() + seconds * 1000 });
        }
    },

    async deletePattern(pattern: string): Promise<void> {
        if (isRedisConnected) {
            try {
                const keys = await redisClient.keys(pattern);
                if (keys.length > 0) await redisClient.del(keys);
            } catch { /* silently fail */ }
        } else {
            const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
            for (const key of memoryCache.keys()) {
                if (regex.test(key)) memoryCache.delete(key);
            }
        }
    },

    async deleteExact(key: string): Promise<void> {
        if (isRedisConnected) {
            try { await redisClient.del(key); } catch { }
        } else {
            memoryCache.delete(key);
        }
    },
};

export default CacheService;
