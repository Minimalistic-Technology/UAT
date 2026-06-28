/**
 * Redis client with in-memory fallback.
 * If REDIS_URI is not set or Redis is unreachable, all operations
 * transparently fall back to a plain Map so the application keeps running.
 */

import Redis from 'ioredis';

// ─── In-Memory Fallback ──────────────────────────────────────────────────────

class MemoryCache {
    private store = new Map<string, { value: string; expiresAt: number | null }>();

    async get(key: string): Promise<string | null> {
        const record = this.store.get(key);
        if (!record) return null;
        if (record.expiresAt !== null && Date.now() > record.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return record.value;
    }

    async set(key: string, value: string, exMode?: string, exSeconds?: number): Promise<'OK'> {
        const expiresAt = (exMode === 'EX' && exSeconds) ? Date.now() + exSeconds * 1000 : null;
        this.store.set(key, { value, expiresAt });
        return 'OK';
    }

    async del(key: string): Promise<number> {
        return this.store.delete(key) ? 1 : 0;
    }

    // ioredis uses 'KEEPTTL' as the 5th argument; replicate for compatibility
    on(_event: string, _cb: any) { return this; }
}

// ─── Client Creation ─────────────────────────────────────────────────────────

let redisClient: any;

const REDIS_URI = process.env.REDIS_URI;

if (REDIS_URI) {
    const client = new Redis(REDIS_URI, {
        maxRetriesPerRequest: 1,
        commandTimeout: 3000,
        lazyConnect: true,
        retryStrategy(times) {
            return null; // Do not reconnect if it fails (silent fallback)
        }
    });

    let redisOk = false;

    client.on('connect', () => {
        redisOk = true;
        console.log('✅ Redis Connected Successfully!');
    });

    client.on('error', (err: Error) => {
        if (redisOk) {
            console.error('❌ Redis Connection Error:', err.message);
        }
        redisOk = false;
    });

    // Try to connect; if it fails fall back silently
    client.connect().catch(() => {
        console.warn('[REDIS] Could not connect to Redis URI. Switching to in-memory cache.');
    });

    // Wrap with fallback logic
    const fallback = new MemoryCache();
    redisClient = {
        async get(key: string) {
            try { return await client.get(key); } catch { return fallback.get(key); }
        },
        async set(key: string, value: string, exMode?: string, exSeconds?: number) {
            try {
                if (exMode === 'EX' && exSeconds) return await client.set(key, value, 'EX', exSeconds);
                if (exMode === 'KEEPTTL') return await client.set(key, value, 'KEEPTTL');
                return await client.set(key, value);
            } catch {
                return fallback.set(key, value, exMode, exSeconds);
            }
        },
        async del(key: string) {
            try { return await client.del(key); } catch { return fallback.del(key); }
        },
        on: client.on.bind(client),
    };
} else {
    // No Redis URI – use pure in-memory cache (perfect for Render free tier)
    console.warn('[REDIS] REDIS_URI not set. Using in-memory cache (resets on restart).');
    redisClient = new MemoryCache();
}

export default redisClient;
