import { type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  // Resolve the authenticated user from the Payload-token cookie
  const authResult = await payload.auth({ headers: req.headers })
  if (!authResult.user) {
    return Response.json({ error: 'Unauthorized — please log in to reserve a meal' }, { status: 401 })
  }

  const { flight_id, meal_id, seat_number } = (await req.json()) as {
    flight_id: string
    meal_id: string
    seat_number: string
  }

  if (!flight_id || !meal_id || !seat_number) {
    return Response.json(
      { error: 'flight_id, meal_id, and seat_number are required' },
      { status: 400 },
    )
  }

  // Verify meal exists and is available
  try {
    const meal = await payload.findByID({ collection: 'meals', id: meal_id })
    if (!meal.available) {
      return Response.json({ error: 'Meal is not available' }, { status: 409 })
    }
  } catch {
    return Response.json({ error: 'Meal not found' }, { status: 404 })
  }

  const bookingRef = `BK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

  return Response.json({
    booking_ref: bookingRef,
    flight_id,
    meal_id,
    seat_number,
    confirmed: true,
  })
}
