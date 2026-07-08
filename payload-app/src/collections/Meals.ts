import type { CollectionConfig } from 'payload'

// Minimal shape used for access-control checks (avoids depending on generated payload-types)
type AnyUser = { id: string | number; role?: string } | null

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
    create: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
    update: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
    delete: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
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
