import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

export const Meals: CollectionConfig = {
  slug: 'meals',
  admin: {
    useAsTitle: 'name',
    description: 'In-flight meal options, accessible via GraphQL.',
  },
  access: {
    // Anyone can browse the meal catalogue
    read: () => true,
    // Only admins may add or modify meal options
    create: ({ req: { user } }) => (user as User | null)?.role === 'admin',
    update: ({ req: { user } }) => (user as User | null)?.role === 'admin',
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
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
