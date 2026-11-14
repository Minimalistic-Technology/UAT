/**
 * Thin caching helpers around the Redis client (with in-memory fallback).
 * All operations are best-effort: any failure is swallowed so a cache
 * outage never breaks a request.
 */

import redisClient from '../config/redis';
import { compress as zstdCompress, decompress as zstdDecompress } from '@mongodb-js/zstd';

const ZSTD_PREFIX = '__zstd__:';
const ZSTD_THRESHOLD = 512; // Compress payloads >= 512 bytes

export const CACHE_TTL = {
    SETTINGS: 300,      // 5 min
    ROUTES: 300,        // 5 min
    PRODUCTS: 1800,     // 30 min
};

export const CACHE_KEYS = {
    SETTINGS: 'settings:global',
    ROUTES: 'routes:all',
};

/** Read + JSON.parse a cached value (transparently decompressing Zstandard if compressed). Returns null on miss or error. */
export async function getCache<T = any>(key: string): Promise<T | null> {
    try {
        const raw = await redisClient.get(key);
        if (!raw) return null;

        if (raw.startsWith(ZSTD_PREFIX)) {
            const compressedBuffer = Buffer.from(raw.slice(ZSTD_PREFIX.length), 'base64');
            const decompressedBuffer = await zstdDecompress(compressedBuffer);
            return JSON.parse(decompressedBuffer.toString('utf-8')) as T;
        }

        return JSON.parse(raw) as T;
    } catch (err) {
        console.error(`[CACHE] get failed for "${key}":`, (err as Error).message);
        return null;
    }
}

/** JSON.stringify + write a value with a TTL (seconds), with transparent Zstandard compression for large payloads. */
export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
        const jsonStr = JSON.stringify(value);
        let payloadToStore = jsonStr;

        if (jsonStr.length >= ZSTD_THRESHOLD) {
            try {
                const compressed = await zstdCompress(Buffer.from(jsonStr, 'utf-8'), 3);
                payloadToStore = `${ZSTD_PREFIX}${compressed.toString('base64')}`;
            } catch (compErr) {
                // Fall back to uncompressed if compression fails
                payloadToStore = jsonStr;
            }
        }

        await redisClient.set(key, payloadToStore, 'EX', ttlSeconds);
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
