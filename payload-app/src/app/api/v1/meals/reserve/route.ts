import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { flight_id, meal_id, seat_number } = (await req.json()) as {
    flight_id: string
    meal_id: string
    seat_number: string
  }

  if (!flight_id || !meal_id || !seat_number) {
    return NextResponse.json(
      { error: 'flight_id, meal_id, and seat_number are required' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })

  // Verify meal exists and is available
  try {
    const meal = await payload.findByID({ collection: 'meals', id: meal_id })
    if (!meal.available) {
      return NextResponse.json({ error: 'Meal is not available' }, { status: 409 })
    }
  } catch {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 })
  }

  const bookingRef = `BK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

  return NextResponse.json({
    booking_ref: bookingRef,
    flight_id,
    meal_id,
    seat_number,
    confirmed: true,
  })
}
