import { nanoid } from 'nanoid'
import Redis from 'ioredis'

if (!process.env.REDIS_URL) throw new Error('REDIS_URL is not set.')

const redis = new Redis(process.env.REDIS_URL)

export async function createShortLink(original: string, suggestion?: string) {
  const key = suggestion || nanoid(6)
  const originalUrl = new URL(original)

  // Check if the key already exists
  const exists = await redis.exists(key)
  if (exists) {
    throw new Error('Suggested ID already exists.')
  }

  // Set the short link
  const result = await redis.set(key, originalUrl.href)
  if (result !== 'OK') {
    throw new Error('Failed to create short link.')
  }

  return { key, value: originalUrl.href }
}

export async function getShortLinkValue(key: string) {
  const result = await redis.get(key)
  if (typeof result !== 'string') {
    throw new Error('Short link not found.')
  }

  return result
}