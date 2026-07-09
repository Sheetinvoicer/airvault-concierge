import type { CollectionConfig } from 'payload'

// Minimal shape used for access-control checks (avoids depending on generated payload-types)
type AnyUser = { id: string | number; role?: string } | null

export const Flights: CollectionConfig = {
  slug: 'flights',
  admin: {
    useAsTitle: 'flightNumber',
    description: 'Flight records — populated by the flight tracker service.',
  },
  access: {
    // Anyone (including unauthenticated visitors) can browse flights
    read: () => true,
    // Only admins / service accounts may create flight records
    create: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
    // Only admins may update flight records
    update: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
    // Only admins may delete flight records
    delete: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
  },
  fields: [
    {
      name: 'flightNumber',
      type: 'text',
      required: true,
      admin: {
        description: 'Airline flight number, e.g. AA1423.',
      },
    },
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
