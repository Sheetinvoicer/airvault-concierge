import { Response } from '/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({ status: 'ok', service: 'airvault-payload', timestamp: new Date().toISOString() })
}
