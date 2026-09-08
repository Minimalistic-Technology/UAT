/**
 * Thin caching helpers around the Redis client (with in-memory fallback).
 * All operations are best-effort: any failure is swallowed so a cache
 * outage never breaks a request.
 */

import redisClient from '../config/redis';

export const CACHE_TTL = {
    SETTINGS: 300,      // 5 min
    ROUTES: 300,        // 5 min
    PRODUCTS: 1800,     // 30 min
};

export const CACHE_KEYS = {
    SETTINGS: 'settings:global',
    ROUTES: 'routes:all',
};

/** Read + JSON.parse a cached value. Returns null on miss or error. */
export async function getCache<T = any>(key: string): Promise<T | null> {
    try {
        const raw = await redisClient.get(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
        console.error(`[CACHE] get failed for "${key}":`, (err as Error).message);
        return null;
    }
}

/** JSON.stringify + write a value with a TTL (seconds). */
export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
        console.error(`[CACHE] set failed for "${key}":`, (err as Error).message);
    }
}

/** Delete one or more keys. */
export async function delCache(...keys: string[]): Promise<void> {
    try {
        if (keys.length) await redisClient.del(...keys);
    } catch (err) {
        console.error(`[CACHE] del failed for "${keys.join(', ')}":`, (err as Error).message);
    }
}

export default { getCache, setCache, delCache, CACHE_TTL, CACHE_KEYS };
