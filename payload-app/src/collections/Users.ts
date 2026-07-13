import type { CollectionConfig } from 'payload'

type AnyUser = { id: string | number; role?: string } | null

export const isAdmin = ({ req: { user } }: { req: { user: AnyUser } }): boolean =>
  (user as AnyUser)?.role === 'admin'

const isSelf = ({ req: { user }, id }: { req: { user: AnyUser }; id?: number | string }) =>
  Boolean(user && String((user as NonNullable<AnyUser>).id) === String(id))

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'AirVault Concierge user accounts.',
  },
  access: {
    create: () => true,
    read: ({ req: { user }, id }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      if (id) return isSelf({ req: { user: user as AnyUser }, id })
      return { id: { equals: (user as NonNullable<AnyUser>).id } }
    },
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      return isSelf({ req: { user: user as AnyUser }, id })
    },
    delete: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      access: {
        create: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
        update: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
      },
      admin: {
        description: 'Controls admin panel access and data permissions.',
      },
    },
  ],
}
