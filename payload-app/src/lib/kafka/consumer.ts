/**
 * Kafka flight-delay consumer.
 *
 * Consumes messages from the `flight-delays` topic and auto-creates a Claim
 * via the PayloadCMS local API when a flight is delayed ≥ 60 minutes.
 *
 * Started once as a global singleton from the Next.js instrumentation hook
 * (`src/instrumentation.ts`) so it runs only in the Node.js server process.
 */
import type { BasePayload } from 'payload'
import { createKafkaClient } from './client'

const DELAY_TOPIC = process.env.KAFKA_DELAY_TOPIC ?? 'flight-delays'

export async function startDelayConsumer(payload: BasePayload): Promise<void> {
  if (!process.env.KAFKA_BOOTSTRAP_SERVERS) {
    console.info('[Kafka consumer] KAFKA_BOOTSTRAP_SERVERS not set — skipping consumer startup.')
    return
  }

  const kafka = createKafkaClient('airvault-delay-consumer')

  const consumer = kafka.consumer({
    groupId: 'delay-processor',
    sessionTimeout: 45000,    // 45 s — wider window for Render ↔ Confluent Cloud latency
    heartbeatInterval: 5000, // 5 s — must be < sessionTimeout / 3 (45000/3 = 15000)
  })
  await consumer.connect()
  await consumer.subscribe({ topic: DELAY_TOPIC, fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const raw = message.value?.toString()
        if (!raw) return

        const event = JSON.parse(raw) as {
          flight_id: string
          passenger_id: string
          airline: string
          delay_minutes: number
        }

        if (event.delay_minutes < 60) return // below EU261 threshold

        // Calculate payout: €250 for <1500km, €400 otherwise (simplified)
        const payoutAmount = event.delay_minutes >= 240 ? 600 : 250

        await payload.create({
          collection: 'claims',
          data: {
            flightId: event.flight_id,
            passengerId: event.passenger_id,
            airline: event.airline,
            delayMinutes: event.delay_minutes,
            payoutAmount,
            status: 'processing',
            claimLetter: `Auto-generated claim for flight ${event.flight_id} delayed ${event.delay_minutes} min.`,
          },
        })

        console.info(`[Kafka consumer] Claim created for flight ${event.flight_id}`)
      } catch (err) {
        console.error('[Kafka consumer] Error processing message:', err)
      }
    },
  })

  console.info(`[Kafka consumer] Listening on topic "${DELAY_TOPIC}"`)
}
