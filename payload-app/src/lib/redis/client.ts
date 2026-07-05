import Redis from 'ioredis'

// Singleton Redis client — reused across Next.js API routes
let redisClient: Redis | null = null

export function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
    redisClient = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    })

    redisClient.on('error', (err) => {
      console.error('[Redis] connection error:', err.message)
    })
  }
  return redisClient
}
