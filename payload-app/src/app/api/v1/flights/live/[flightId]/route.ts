import { Request, Response } from '/server'
import { getRedis } from '@/lib/redis/client'

export async function GET(_req: Request, { params }: { params: Promise<{ flightId: string }> }) {
  const { flightId } = await params

  const redis = getRedis()
  const cacheKey = `flight_status_${flightId}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return Response.json(JSON.parse(cached))
    }
  } catch (_) {
    // Redis down — continue
  }

  // In production: call AeroDataBox / AviationStack API here.
  // Mock response for development:
  const status = {
    flight_id: flightId,
    status: 'On time',
    delay: 0,
    gate: 'B12',
    terminal: '2',
    updated_at: new Date().toISOString(),
  }

  try {
    await redis.setex(cacheKey, 30, JSON.stringify(status))
  } catch (_) {
    // Redis down — ignore
  }

  return Response.json(status)
}
