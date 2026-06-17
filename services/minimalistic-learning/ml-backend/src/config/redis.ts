import Redis from 'ioredis';
import { env } from './env';

const getRedisUrl = () => {
    if (process.env.REDIS_URL) return process.env.REDIS_URL;
    return 'redis://localhost:6379';
};

const redisUrl = getRedisUrl();

export let isRedisConnected = false;

// The actual external Redis Instance
const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        if (times >= 3) {
            console.warn("[Cache] Redis not found. Switching to ultra-fast Local Memory Map() Fallback.");
            isRedisConnected = false;
            return null;
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

// -------------- THE MAGIC: IN-MEMORY MAP FALLBACK -------------- //
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
        } else {
            const item = memoryCache.get(key);
            if (!item) return null;
            if (Date.now() > item.expiryTs) {
                memoryCache.delete(key);
                return null;
            }
            return item.data;
        }
    },

    async setex(key: string, seconds: number, data: string): Promise<void> {
        if (isRedisConnected) {
            try { await redisClient.setex(key, seconds, data); }
            catch { /* fallback silently */ }
        } else {
            memoryCache.set(key, { data, expiryTs: Date.now() + (seconds * 1000) });
        }
    },

    async deletePattern(pattern: string): Promise<void> {
        if (isRedisConnected) {
            try {
                const keys = await redisClient.keys(pattern);
                if (keys.length > 0) await redisClient.del(keys);
            } catch { /* silently fail */ }
        } else {
            // Local fallback match and delete
            const regexStr = pattern.replace(/\*/g, '.*');
            const regex = new RegExp(`^${regexStr}$`);
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
    }
};

export default CacheService;
