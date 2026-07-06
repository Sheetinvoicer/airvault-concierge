import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
      read: () => true,
      create: () => true,
      update: () => true,
      delete: () => true,
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
