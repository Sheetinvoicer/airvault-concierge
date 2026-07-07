import { Request, Response } from '/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: Request) {
  const flightId = req.Url.searchParams.get('flight_id')

  const payload = await getPayload({ config })

  // Return all available meals (in production, filter by flight's catering contract)
  const result = await payload.find({
    collection: 'meals',
    where: { available: { equals: true } },
    limit: 100,
  })

  return Response.json({ flight_id: flightId, meals: result.docs })
}
