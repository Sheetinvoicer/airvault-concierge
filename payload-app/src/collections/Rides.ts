import type { CollectionConfig } from 'payload'

export const Rides: CollectionConfig = {
  slug: 'rides',
  admin: {
    useAsTitle: 'vehicle',
    description: 'Airport ride-hailing bookings.',
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
      name: 'passengerId',
      type: 'text',
    },
  ],
}
