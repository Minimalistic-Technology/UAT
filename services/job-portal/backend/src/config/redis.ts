import { createClient } from 'redis';

/**
 * Redis is an OPTIONAL cache layer for this backend. If `REDIS_URL` is not set
 * we skip the connection entirely and expose a no-op stub so callers don't need
 * to branch. All cache reads then simply miss and fall through to the database.
 */

type RedisClient = ReturnType<typeof createClient>;

interface CacheClient {
  readonly isOpen: boolean;
  get(key: string): Promise<string | null>;
  setEx(key: string, seconds: number, value: string): Promise<unknown>;
  ping(): Promise<string>;
}

const redisUrl = process.env.REDIS_URL;

let cacheClient: CacheClient;

if (!redisUrl) {
  console.log(
    'ℹ️  REDIS_URL not set — Redis cache is disabled. Requests will be served directly from the database.',
  );

  cacheClient = {
    get isOpen() {
      return false;
    },
    async get() {
      return null;
    },
    async setEx() {
      return undefined;
    },
    async ping(): Promise<string> {
      throw new Error('Redis is disabled (REDIS_URL not set)');
    },
  };
} else {
  const client: RedisClient = createClient({
    url: redisUrl,
    socket: {
      // Back off progressively; keep retrying so the cache recovers on its own
      // if Redis comes back. Errors are logged (throttled) via the handler below.
      reconnectStrategy: (retries) => Math.min(1000 + retries * 1000, 30_000),
    },
  });

  // Throttle the error log so a persistently-down Redis doesn't flood the logs.
  let lastErrorLog = 0;
  client.on('error', (err) => {
    const now = Date.now();
    if (now - lastErrorLog > 30_000) {
      lastErrorLog = now;
      console.error('Redis Client Error:', err instanceof Error ? err.message : err);
    }
  });

  client.on('connect', () => {
    console.log('Redis connected successfully');
  });

  // Connect in the background; a failure here must not crash the app.
  client.connect().catch((err) => {
    console.error('Redis: initial connection failed:', err instanceof Error ? err.message : err);
  });

  cacheClient = client;
}

export default cacheClient;
