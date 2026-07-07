import { type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  try {
    const claim = await payload.findByID({ collection: 'claims', id })
    return Response.json(claim)
  } catch {
    return Response.json({ error: 'Claim not found' }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await req.json()) as Record<string, unknown>
  const payload = await getPayload({ config })

  try {
    const updated = await payload.update({ collection: 'claims', id, data: body })
    return Response.json(updated)
  } catch {
    return Response.json({ error: 'Claim not found' }, { status: 404 })
  }
}
