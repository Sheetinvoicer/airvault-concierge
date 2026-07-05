import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'isPremium',
      type: 'checkbox',
      defaultValue: false,
      label: 'Premium Member',
    },
  ],
}
