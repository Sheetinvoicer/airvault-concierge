import type { CollectionConfig } from 'payload'

export const PetChecklists: CollectionConfig = {
  slug: 'pet-checklists',
  admin: {
    useAsTitle: 'petName',
    description: 'Generated IATA/APHIS pet travel compliance checklists.',
  },
  fields: [
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
      name: 'owner',
      type: 'text',
      required: true,
    },
    {
      name: 'petName',
      type: 'text',
      required: true,
    },
    {
      name: 'generatedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        return {
          ...data,
          generatedAt: new Date().toISOString(),
        }
      },
    ],
  },
}
