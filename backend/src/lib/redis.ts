// backend/src/lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

redis.on('error', (err) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Redis error (non-fatal):', err.message);
  }
});

redis.on('connect', () => console.log('✅ Redis connected'));
