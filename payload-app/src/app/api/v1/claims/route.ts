import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  const { flight_id, passenger_id, delay_minutes } = (await req.json()) as {
    flight_id: string
    passenger_id: string
    delay_minutes: number
  }

  if (!flight_id || !passenger_id || delay_minutes == null) {
    return NextResponse.json(
      { error: 'flight_id, passenger_id, and delay_minutes are required' },
      { status: 400 },
    )
  }

  if (delay_minutes < 60) {
    return NextResponse.json({ error: 'Delay must be at least 60 minutes to qualify' }, { status: 422 })
  }

  const payoutAmount = delay_minutes >= 240 ? 600 : 250

  const payload = await getPayload({ config })

  const claim = await payload.create({
    collection: 'claims',
    data: {
      flightId: flight_id,
      passengerId: passenger_id,
      delayMinutes: delay_minutes,
      payoutAmount,
      status: 'processing',
      claimLetter: `Compensation claim for flight ${flight_id} delayed by ${delay_minutes} minutes.`,
    },
  })

  return NextResponse.json(claim, { status: 201 })
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'claims',
    where: userId
      ? {
          passengerId: { equals: userId },
        }
      : {},
    limit: 50,
    sort: '-createdAt',
  })

  return NextResponse.json(result)
}
