import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

export const Flights: CollectionConfig = {
  slug: 'flights',
  admin: {
    useAsTitle: 'id',
    description: 'Flight records — populated by the flight tracker service.',
  },
  access: {
    // Anyone (including unauthenticated visitors) can browse flights
    read: () => true,
    // Only admins / service accounts may create flight records
    create: ({ req: { user } }) => (user as User | null)?.role === 'admin',
    // Only admins may update flight records
    update: ({ req: { user } }) => (user as User | null)?.role === 'admin',
    // Only admins may delete flight records
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
  },
  fields: [
    {
      name: 'airline',
      type: 'text',
      required: true,
    },
    {
      name: 'origin',
      type: 'text',
      required: true,
    },
    {
      name: 'destination',
      type: 'text',
      required: true,
    },
    {
      name: 'departure',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'arrival',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
  ],
}
