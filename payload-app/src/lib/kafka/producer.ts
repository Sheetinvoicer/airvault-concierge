import { Kafka, type Producer } from 'kafkajs'

const CLAIM_TOPIC = process.env.KAFKA_CLAIM_TOPIC ?? 'claim-processed'

let producer: Producer | null = null

function getKafka(): Kafka {
  return new Kafka({
    clientId: 'airvault-payload',
    brokers: (process.env.KAFKA_BOOTSTRAP_SERVERS ?? 'kafka:9092').split(','),
  })
}

async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = getKafka().producer()
    await producer.connect()
  }
  return producer
}

export async function publishClaimEvent(claim: Record<string, unknown>): Promise<void> {
  const p = await getProducer()
  await p.send({
    topic: CLAIM_TOPIC,
    messages: [
      {
        key: String(claim.id ?? 'unknown'),
        value: JSON.stringify(claim),
      },
    ],
  })
}

export async function disconnectProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect()
    producer = null
  }
}
