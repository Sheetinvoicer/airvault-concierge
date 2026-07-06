import type { CollectionConfig } from 'payload'

export const Flights: CollectionConfig = {
  slug: 'flights',
  admin: {
    useAsTitle: 'id',
    description: 'Flight records — populated by the flight tracker service.',
  },

  access: {
      read: () => true,
      create: () => true,
      update: () => true,
      delete: () => true,
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
