import Redis from 'ioredis';

const REDIS_URI = process.env.REDIS_URI;

// If REDIS_URI is missing, ioredis defaults to 127.0.0.1:6379. 
// We set 'lazyConnect' or 'maxRetriesPerRequest' if needed, but defaults are fine.
const redisClient = REDIS_URI ? new Redis(REDIS_URI, {
    maxRetriesPerRequest: 1,
    commandTimeout: 2000,
}) : new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: 1,
    commandTimeout: 2000,
});

redisClient.on('connect', () => {
    console.log('✅ Redis Connected Successfully!');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err.message);
});

export default redisClient;
