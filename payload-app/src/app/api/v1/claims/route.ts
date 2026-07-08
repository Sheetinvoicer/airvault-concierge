import { type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  // Resolve the authenticated user from the Payload-token cookie
  const authResult = await payload.auth({ headers: req.headers })
  if (!authResult.user) {
    return Response.json({ error: 'Unauthorized — please log in to file a claim' }, { status: 401 })
  }

  const { flight_id, delay_minutes } = (await req.json()) as {
    flight_id: string
    delay_minutes: number
  }

  if (!flight_id || delay_minutes == null) {
    return Response.json(
      { error: 'flight_id and delay_minutes are required' },
      { status: 400 },
    )
  }

  if (delay_minutes < 60) {
    return Response.json({ error: 'Delay must be at least 60 minutes to qualify' }, { status: 422 })
  }

  const payoutAmount = delay_minutes >= 240 ? 600 : 250

  const claim = await payload.create({
    collection: 'claims',
    data: {
      flightId: flight_id,
      // Link the claim to the authenticated user via the relationship field
      passenger: authResult.user.id,
      delayMinutes: delay_minutes,
      payoutAmount,
      status: 'processing',
      claimLetter: `Compensation claim for flight ${flight_id} delayed by ${delay_minutes} minutes.`,
    },
  })

  return Response.json(claim, { status: 201 })
}

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config })

  // Resolve the authenticated user — access control in the collection enforces ownership
  const authResult = await payload.auth({ headers: req.headers })
  if (!authResult.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // The Claims collection access.read already scopes results to the user's own claims
  const result = await payload.find({
    collection: 'claims',
    overrideAccess: false,
    user: authResult.user,
    limit: 50,
    sort: '-createdAt',
  })

  return Response.json(result)
}
