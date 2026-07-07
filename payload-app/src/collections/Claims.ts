import type { CollectionConfig } from 'payload'
import { publishClaimEvent } from '../lib/kafka/producer'

export const Claims: CollectionConfig = {
  slug: 'claims',
  admin: {
    useAsTitle: 'flightId',
    description: 'Flight-delay compensation claims.',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Publish a Kafka event whenever a claim is created or updated
        if (process.env.KAFKA_BOOTSTRAP_SERVERS) {
          await publishClaimEvent(doc).catch((err: Error) =>
            console.error('[Claims hook] Kafka publish failed:', err.message),
          )
        }
      },
    ],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'flightId',
      type: 'text',
      required: true,
    },
    {
      name: 'passengerId',
      type: 'text',
      required: true,
    },
    {
      name: 'airline',
      type: 'text',
    },
    {
      name: 'delayMinutes',
      type: 'number',
      required: true,
    },
    {
      name: 'payoutAmount',
      type: 'number',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Disputed', value: 'disputed' },
      ],
    },
    {
      name: 'claimLetter',
      type: 'textarea',
    },
    {
      name: 'stripeTransferId',
      type: 'text',
    },
  ],
}