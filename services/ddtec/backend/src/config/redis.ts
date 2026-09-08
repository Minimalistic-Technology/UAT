/**
 * Redis client with in-memory fallback.
 * If REDIS_URL / REDIS_URI is not set or Redis is unreachable, all operations
 * transparently fall back to a plain Map so the application keeps running.
 */

import Redis from 'ioredis';

// ─── In-Memory Fallback ──────────────────────────────────────────────────────

class MemoryCache {
    private store = new Map<string, { value: string; expiresAt: number | null }>();

    private isExpired(record: { expiresAt: number | null }): boolean {
        return record.expiresAt !== null && Date.now() > record.expiresAt;
    }

    async get(key: string): Promise<string | null> {
        const record = this.store.get(key);
        if (!record) return null;
        if (this.isExpired(record)) {
            this.store.delete(key);
            return null;
        }
        return record.value;
    }

    async set(key: string, value: string, exMode?: string, exSeconds?: number): Promise<'OK'> {
        const existing = this.store.get(key);
        let expiresAt: number | null = null;
        if (exMode === 'EX' && exSeconds) expiresAt = Date.now() + exSeconds * 1000;
        else if (exMode === 'PX' && exSeconds) expiresAt = Date.now() + exSeconds;
        else if (exMode === 'KEEPTTL') expiresAt = existing ? existing.expiresAt : null;
        this.store.set(key, { value, expiresAt });
        return 'OK';
    }

    async setex(key: string, seconds: number, value: string): Promise<'OK'> {
        return this.set(key, value, 'EX', seconds);
    }

    async del(...keys: string[]): Promise<number> {
        let count = 0;
        for (const key of keys.flat()) {
            if (this.store.delete(key)) count++;
        }
        return count;
    }

    async ttl(key: string): Promise<number> {
        const record = this.store.get(key);
        if (!record) return -2;
        if (record.expiresAt === null) return -1;
        const remaining = Math.ceil((record.expiresAt - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
    }

    async exists(...keys: string[]): Promise<number> {
        let count = 0;
        for (const key of keys.flat()) {
            const record = this.store.get(key);
            if (record && !this.isExpired(record)) count++;
        }
        return count;
    }

    async keys(pattern: string): Promise<string[]> {
        const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        return [...this.store.keys()].filter(k => regex.test(k));
    }

    on(_event: string, _cb: any) { return this; }
}

// ─── Client Creation ─────────────────────────────────────────────────────────

let redisClient: any;

const REDIS_URI = process.env.REDIS_URL || process.env.REDIS_URI;

if (REDIS_URI) {
    const client = new Redis(REDIS_URI, {
        maxRetriesPerRequest: 1,
        commandTimeout: 3000,
        lazyConnect: true,
        retryStrategy() {
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
                if ((exMode === 'EX' || exMode === 'PX') && exSeconds) return await client.set(key, value, exMode as any, exSeconds);
                if (exMode === 'KEEPTTL') return await client.set(key, value, 'KEEPTTL');
                return await client.set(key, value);
            } catch {
                return fallback.set(key, value, exMode, exSeconds);
            }
        },
        async setex(key: string, seconds: number, value: string) {
            try { return await client.setex(key, seconds, value); } catch { return fallback.setex(key, seconds, value); }
        },
        async del(...keys: string[]) {
            try { return await client.del(keys.flat()); } catch { return fallback.del(...keys); }
        },
        async ttl(key: string) {
            try { return await client.ttl(key); } catch { return fallback.ttl(key); }
        },
        async exists(...keys: string[]) {
            try { return await client.exists(keys.flat()); } catch { return fallback.exists(...keys); }
        },
        async keys(pattern: string) {
            try { return await client.keys(pattern); } catch { return fallback.keys(pattern); }
        },
        on: client.on.bind(client),
    };
} else {
    // No Redis URI – use pure in-memory cache (perfect for Render free tier)
    console.warn('[REDIS] REDIS_URL not set. Using in-memory cache (resets on restart).');
    redisClient = new MemoryCache();
}

export default redisClient;
