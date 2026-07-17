import { createClient } from 'redis';

// Use REDIS_URL if provided, else default to localhost (useful for local dev)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Connect immediately, but handle errors gracefully so app doesn't crash if redis is down
redisClient.connect().catch(console.error);

export default redisClient;
