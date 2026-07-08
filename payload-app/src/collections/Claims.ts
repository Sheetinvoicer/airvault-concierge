import type { CollectionConfig } from 'payload'
import { publishClaimEvent } from '../lib/kafka/producer'

// Minimal shape used for access-control checks (avoids depending on generated payload-types)
type AnyUser = { id: string | number; role?: string } | null

// Ownership check: returns a Payload where-constraint scoping reads to the requesting user's claims
const ownedByUser = (user: NonNullable<AnyUser>) => ({ passenger: { equals: user.id } })

export const Claims: CollectionConfig = {
  slug: 'claims',
  admin: {
    useAsTitle: 'flightId',
    description: 'Flight-delay compensation claims.',
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
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
    // Must be logged in to file a claim
    create: ({ req: { user } }) => Boolean(user),
    // Admins see all claims; authenticated users see only their own
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      return ownedByUser(user as NonNullable<AnyUser>)
    },
    // Only the owner or an admin may update a claim
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      return ownedByUser(user as NonNullable<AnyUser>)
    },
    // Only admins may delete claims
    delete: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
  },
  fields: [
    {
      name: 'flightId',
      type: 'text',
      required: true,
    },
    {
      // Relationship to the Users collection — replaces the old plain-text passengerId
      name: 'passenger',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The user who filed this claim.',
      },
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
      // Only admins may change claim status
      access: {
        update: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
      },
    },
    {
      name: 'claimLetter',
      type: 'textarea',
    },
    {
      name: 'stripeTransferId',
      type: 'text',
      // Internal field — only admins should see/edit it
      access: {
        read: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
        update: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
      },
    },
  ],
}