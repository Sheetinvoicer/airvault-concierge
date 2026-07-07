import { Request, Response } from '/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getRedis } from '@/lib/redis/client'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

interface PetRequirements {
  origin: string
  destination: string
  vaccineRequired: boolean
  microchipRequired: boolean
  quarantineDays: number
  allowedCarriers: string[]
  notes: string
}

async function fetchRequirements(origin: string, destination: string): Promise<PetRequirements> {
  const redis = getRedis()
  const cacheKey = `pet:${origin}:${destination}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch (_) {
    // Redis down — continue
  }

  // Mock IATA/APHIS requirements — replace with real web-scrape in production
  const requirements: PetRequirements = {
    origin,
    destination,
    vaccineRequired: true,
    microchipRequired: true,
    quarantineDays: destination === 'AU' || destination === 'NZ' ? 10 : 0,
    allowedCarriers: ['Delta', 'United', 'Lufthansa'],
    notes: `Pets travelling from ${origin} to ${destination} must meet all IATA container regulations.`,
  }

  try {
    await getRedis().setex(cacheKey, 3600, JSON.stringify(requirements))
  } catch (_) {
    // Redis down — ignore
  }

  return requirements
}

async function generatePdf(
  req: PetRequirements,
  ownerName: string,
  petName: string,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { height } = page.getSize()
  let y = height - 60

  const drawLine = (text: string, isBold = false, size = 12) => {
    page.drawText(text, { x: 50, y, font: isBold ? bold : font, size, color: rgb(0, 0, 0) })
    y -= size + 6
  }

  drawLine('AirVault Concierge — Pet Travel Compliance Checklist', true, 16)
  y -= 10
  drawLine(`Owner: ${ownerName}`)
  drawLine(`Pet: ${petName}`)
  drawLine(`Route: ${req.origin} → ${req.destination}`)
  y -= 10
  drawLine('Requirements:', true)
  drawLine(`  ✓ Rabies vaccination: ${req.vaccineRequired ? 'Required' : 'Not required'}`)
  drawLine(`  ✓ Microchip (ISO 11784/11785): ${req.microchipRequired ? 'Required' : 'Not required'}`)
  drawLine(`  ✓ Quarantine: ${req.quarantineDays > 0 ? `${req.quarantineDays} days` : 'Not required'}`)
  drawLine(`  ✓ Approved carriers: ${req.allowedCarriers.join(', ')}`)
  y -= 10
  drawLine('Notes:', true)
  drawLine(`  ${req.notes}`, false, 10)
  y -= 20
  drawLine(`Generated: ${new Date().toISOString()}`, false, 9)

  return pdfDoc.save()
}

export async function POST(req: Request) {
  const { origin, destination, owner_name, pet_name } = (await req.json()) as {
    origin: string
    destination: string
    owner_name: string
    pet_name: string
  }

  if (!origin || !destination || !owner_name || !pet_name) {
    return Response.json(
      { error: 'origin, destination, owner_name, pet_name are required' },
      { status: 400 },
    )
  }

  const requirements = await fetchRequirements(origin, destination)
  const pdfBytes = await generatePdf(requirements, owner_name, pet_name)

  const payload = await getPayload({ config })
  await payload.create({
    collection: 'pet-checklists',
    data: { origin, destination, owner: owner_name, petName: pet_name },
  })

  return new Response(pdfBytes as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=pet_checklist_${pet_name.replace(/\s/g, '_')}.pdf`,
    },
  })
}
