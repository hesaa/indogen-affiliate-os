import { Redis } from 'ioredis'

let redisClient: Redis | null = null

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required')
    }

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      lazyConnect: true,
      enableReadyCheck: true,
    })

    // Handle connection errors
    redisClient.on('error', (err: Error) => {
      console.error('Redis client error:', err)
    })

    redisClient.on('connect', () => {
      console.log('Redis client connected')
    })

    redisClient.on('ready', () => {
      console.log('Redis client ready')
    })

    redisClient.on('close', () => {
      console.log('Redis client disconnected')
    })

    redisClient.on('reconnecting', () => {
      console.log('Redis client reconnecting...')
    })
  }

  return redisClient
}

export const closeRedisClient = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

export const flushRedis = async (): Promise<void> => {
  const client = getRedisClient()
  await client.flushdb()
}