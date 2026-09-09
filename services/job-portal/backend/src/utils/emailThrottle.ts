import redisClient from "../config/redis.js";

/**
 * Rate limiting for transactional emails.
 *
 * Two layers:
 *  1. Per (recipient + event) de-duplication — a second identical notification
 *     inside the event's cooldown window is dropped. This stops retries, double
 *     clicks and webhook races from mailing the user twice.
 *  2. A global per-recipient hourly cap — no matter how many distinct events
 *     fire, a single address never receives more than `GLOBAL_MAX_PER_HOUR`
 *     mails an hour. Protects users from notification storms and protects our
 *     sender reputation.
 *
 * Backed by Redis when `REDIS_URL` is configured (works across cluster workers
 * and instances); otherwise falls back to a per-process in-memory store, which
 * still catches the common single-worker case.
 */

const GLOBAL_MAX_PER_HOUR = 20;
const GLOBAL_WINDOW_SECONDS = 60 * 60;

// ---------------------------------------------------------------------------
// In-memory fallback (used only when Redis is unavailable)
// ---------------------------------------------------------------------------

interface MemoryEntry {
  value: number;
  expiresAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();

const memoryGet = (key: string): number | null => {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
};

const memorySet = (key: string, value: number, ttlSeconds: number): void => {
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
};

// Opportunistic cleanup so the map can't grow without bound.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
      if (now > entry.expiresAt) memoryStore.delete(key);
    }
  },
  10 * 60 * 1000,
).unref();

// ---------------------------------------------------------------------------
// Storage helpers — Redis first, memory fallback
// ---------------------------------------------------------------------------

const useRedis = (): boolean => {
  try {
    return redisClient.isOpen;
  } catch {
    return false;
  }
};

const getInt = async (key: string): Promise<number | null> => {
  if (useRedis()) {
    try {
      const raw = await redisClient.get(key);
      return raw == null ? null : Number(raw) || 0;
    } catch {
      // fall through to memory
    }
  }
  return memoryGet(key);
};

const setInt = async (
  key: string,
  value: number,
  ttlSeconds: number,
): Promise<void> => {
  if (useRedis()) {
    try {
      await redisClient.setEx(key, ttlSeconds, String(value));
      return;
    } catch {
      // fall through to memory
    }
  }
  memorySet(key, value, ttlSeconds);
};

const normalizeRecipient = (email: string): string =>
  email.trim().toLowerCase();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ThrottleDecision {
  allowed: boolean;
  reason?: "duplicate" | "recipient-cap";
}

/**
 * Decide whether a transactional email may be sent right now, and record the
 * send if it may. Call this immediately before dispatching the email.
 *
 * @param email        Recipient address.
 * @param eventKey     Stable identifier for the notification, e.g.
 *                     `subscription-activated:<subscriptionId>`. Everything
 *                     after the first `:` is treated as the dedupe scope.
 * @param cooldownSeconds  Minimum gap between two emails sharing this eventKey.
 */
export const reserveEmailSend = async (
  email: string,
  eventKey: string,
  cooldownSeconds: number,
): Promise<ThrottleDecision> => {
  if (!email) return { allowed: false, reason: "duplicate" };

  const recipient = normalizeRecipient(email);
  const dedupeKey = `email:dedupe:${recipient}:${eventKey}`;
  const capKey = `email:cap:${recipient}`;

  // 1. Per-event de-duplication
  const alreadySent = await getInt(dedupeKey);
  if (alreadySent) {
    return { allowed: false, reason: "duplicate" };
  }

  // 2. Global per-recipient hourly cap
  const sentThisHour = (await getInt(capKey)) ?? 0;
  if (sentThisHour >= GLOBAL_MAX_PER_HOUR) {
    return { allowed: false, reason: "recipient-cap" };
  }

  // Reserve: mark this event as sent and bump the hourly counter.
  await setInt(dedupeKey, Date.now(), cooldownSeconds);
  await setInt(capKey, sentThisHour + 1, GLOBAL_WINDOW_SECONDS);

  return { allowed: true };
};
