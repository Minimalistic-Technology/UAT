import Redis from 'ioredis';

// Redis is optional: when REDIS_URL/REDIS_HOST is not set, or the connection
// fails, caching is silently disabled and requests just hit the database.
let client: Redis | null = null;
let initialized = false;

export function getRedisClient(): Redis | null {
  if (initialized) return client;
  initialized = true;

  const url = process.env.REDIS_URL;
  const host = process.env.REDIS_HOST;

  if (!url && !host) {
    return null;
  }

  client = url
    ? new Redis(url, { maxRetriesPerRequest: 1, retryStrategy: () => null })
    : new Redis({
        host,
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB || 0),
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });

  client.on('error', (err) => {
    console.warn(`[blog-cms] redis error: ${err.message}`);
  });

  return client;
}
