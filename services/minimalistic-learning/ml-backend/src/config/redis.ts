import Redis from 'ioredis';
import { env } from './env';

const getRedisUrl = () => {
    // Check if REDIS_URL exists from docker-compose or environment
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    // Fallback to local default or remote connection based on how you test
    return 'redis://localhost:6379';
};

const redisUrl = getRedisUrl();

export let isRedisConnected = false;

export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        if (times >= 3) {
            console.warn("[Redis] Database not found. Skipping cache and running without Redis.");
            isRedisConnected = false;
            return null; // Stops retrying and prevents endless loop
        }
        console.warn(`[Redis] Retrying connection attempt ${times} (Please start Docker or Redis)...`);
        return Math.min(times * 1000, 3000);
    },
});

redis.on('connect', () => {
    isRedisConnected = true;
    console.log('[Redis] Connected to cache successfully ⚡');
});

redis.on('error', (err) => {
    console.error('[Redis] Connection Error:', err.message);
});

export default redis;
