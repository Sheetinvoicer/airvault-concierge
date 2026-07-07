import { type NextRequest } from 'next/server'
import { getRedis } from '@/lib/redis/client'

const CONCIERGE_FEE = 1.07

interface RapidFlightItem {
  id: string
  airline: string
  departure_time: string
  arrival_time: string
  price: number
  currency: string
}

function applyConcierge(price: number): number {
  return Math.round(price * CONCIERGE_FEE * 100) / 100
}

export async function POST(req: NextRequest) {
  const { origin, destination, departure_date } = (await req.json()) as {
    origin: string
    destination: string
    departure_date: string
  }

  if (!origin || !destination || !departure_date) {
    return Response.json({ error: 'origin, destination, departure_date are required' }, { status: 400 })
  }

  const cacheKey = `flights:search:${origin}:${destination}:${departure_date}`
  const redis = getRedis()

  // Check Redis cache (TTL 60s)
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return Response.json({ flights: JSON.parse(cached), cached: true })
    }
  } catch (_) {
    // Redis down — continue without cache
  }

  // Call RapidAPI (Skyscanner)
  const url = new URL('https://skyscanner-api.p.rapidapi.com/flights/search')
  url.searchParams.set('from', origin)
  url.searchParams.set('to', destination)
  url.searchParams.set('date', departure_date)
  url.searchParams.set('adults', '1')

  let flights: object[]
  try {
    const resp = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY ?? '',
        'x-rapidapi-host': 'skyscanner-api.p.rapidapi.com',
      },
      next: { revalidate: 60 },
    })

    if (!resp.ok) throw new Error(`RapidAPI responded ${resp.status}`)
    const data = (await resp.json()) as { flights?: RapidFlightItem[] }

    flights = (data.flights ?? []).map((f) => ({
      id: f.id,
      airline: f.airline,
      departure: f.departure_time,
      arrival: f.arrival_time,
      price: applyConcierge(f.price),
      currency: f.currency,
    }))
  } catch (err) {
    // Return mock data when RapidAPI key is absent (dev)
    console.warn('[flights/search] RapidAPI call failed, returning mock data:', err)
    flights = [
      {
        id: 'MOCK-001',
        airline: 'Mock Airlines',
        departure: `${departure_date}T08:00:00Z`,
        arrival: `${departure_date}T12:00:00Z`,
        price: applyConcierge(199.99),
        currency: 'USD',
      },
    ]
  }

  try {
    await redis.setex(cacheKey, 60, JSON.stringify(flights))
  } catch (_) {
    // Redis down — ignore
  }

  return Response.json({ flights })
}
