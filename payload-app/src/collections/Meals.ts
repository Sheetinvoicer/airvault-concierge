import type { CollectionConfig } from 'payload'

export const Meals: CollectionConfig = {
  slug: 'meals',
  admin: {
    useAsTitle: 'name',
    description: 'In-flight meal options, accessible via GraphQL.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'available',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
