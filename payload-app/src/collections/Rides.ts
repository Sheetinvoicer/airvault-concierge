import type { CollectionConfig } from 'payload'

// Minimal shape used for access-control checks (avoids depending on generated payload-types)
type AnyUser = { id: string | number; role?: string } | null

// Ownership check: scopes list queries to the requesting user's rides
const ownedByUser = (user: NonNullable<AnyUser>) => ({ passenger: { equals: user.id } })

export const Rides: CollectionConfig = {
  slug: 'rides',
  admin: {
    useAsTitle: 'vehicle',
    description: 'Airport ride-hailing bookings.',
  },
  access: {
    // Must be logged in to request a ride
    create: ({ req: { user } }) => Boolean(user),
    // Admins see all rides; users see only their own
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      return ownedByUser(user as NonNullable<AnyUser>)
    },
    // Owner or admin may update a ride record
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      return ownedByUser(user as NonNullable<AnyUser>)
    },
    // Only admins may delete ride records
    delete: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
  },
  fields: [
    {
      name: 'vehicle',
      type: 'text',
      required: true,
    },
    {
      name: 'totalFee',
      type: 'number',
      required: true,
    },
    {
      name: 'pickup',
      type: 'text',
      required: true,
    },
    {
      name: 'dropoff',
      type: 'text',
      required: true,
    },
    {
      // Relationship to Users — replaces the old plain-text passengerId
      name: 'passenger',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The passenger who booked this ride.',
      },
    },
  ],
}
