import { type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

interface Vehicle {
  id: string
  name: string
  cargo_volume: number
  cargo_weight: number
  base_fee: number
}

const AVAILABLE_VEHICLES: Vehicle[] = [
  { id: 'v1', name: 'UberXL', cargo_volume: 80, cargo_weight: 100, base_fee: 18 },
  { id: 'v2', name: 'Lyft SUV', cargo_volume: 60, cargo_weight: 80, base_fee: 15 },
  { id: 'v3', name: 'Sedan', cargo_volume: 30, cargo_weight: 50, base_fee: 10 },
]

function matchVehicle(volumeLiters: number, weightLbs: number): Vehicle | undefined {
  return AVAILABLE_VEHICLES.find(
    (v) => v.cargo_volume >= volumeLiters && v.cargo_weight >= weightLbs,
  )
}

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  // Resolve the authenticated user from the Payload-token cookie
  const authResult = await payload.auth({ headers: req.headers })
  if (!authResult.user) {
    return Response.json({ error: 'Unauthorized — please log in to book a ride' }, { status: 401 })
  }

  const { pickup, dropoff, luggage_volume, luggage_weight } = (await req.json()) as {
    pickup: string
    dropoff: string
    luggage_volume: number
    luggage_weight: number
  }

  if (!pickup || !dropoff || luggage_volume == null || luggage_weight == null) {
    return Response.json(
      { error: 'pickup, dropoff, luggage_volume, and luggage_weight are required' },
      { status: 400 },
    )
  }

  const matched = matchVehicle(luggage_volume, luggage_weight)
  if (!matched) {
    return Response.json({ error: 'No vehicle matches luggage requirements' }, { status: 400 })
  }

  // Add convenience fee: $0.50 per lb over 20 lbs
  const overweightFee = Math.max(0, (luggage_weight - 20) * 0.5)
  const totalFee = matched.base_fee + overweightFee

  const ride = await payload.create({
    collection: 'rides',
    data: {
      vehicle: matched.name,
      totalFee,
      pickup,
      dropoff,
      // Link the ride to the authenticated user via the relationship field
      passenger: authResult.user.id,
    },
  })

  return Response.json(
    {
      ride_id: ride.id,
      vehicle: matched.name,
      fee: totalFee,
      pickup,
      dropoff,
    },
    { status: 201 },
  )
}
