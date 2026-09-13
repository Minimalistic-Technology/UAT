import { getRedisClient } from './redis';

const DEFAULT_TTL = Number(process.env.REDIS_CACHE_TTL || 300); // seconds
const PREFIX = 'blog-cms:cache';

function buildKey(namespace: string, suffix: string): string {
  return `${PREFIX}:${namespace}:${suffix}`;
}

// Caching is best-effort: any Redis failure is swallowed so the API always
// falls back to serving the request straight from the database.

export async function getCache<T = unknown>(namespace: string, suffix: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const raw = await redis.get(buildKey(namespace, suffix));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setCache(
  namespace: string,
  suffix: string,
  value: unknown,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.set(buildKey(namespace, suffix), JSON.stringify(value), 'EX', ttl);
  } catch {
    // ignore
  }
}

export async function invalidateNamespace(namespace: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  const pattern = buildKey(namespace, '*');

  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch {
    // ignore
  }
}
