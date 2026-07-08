import type { CollectionConfig } from 'payload'

// Minimal shape used for access-control checks (avoids depending on generated payload-types)
type AnyUser = { id: string | number; role?: string } | null

// Helper: is the requesting user an admin?
export const isAdmin = ({ req: { user } }: { req: { user: AnyUser } }): boolean =>
  (user as AnyUser)?.role === 'admin'

// Helper: is the requesting user accessing their own document?
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
    // Any visitor can register a new account
    create: () => true,
    // Admins see all users; a logged-in user sees only their own record
    read: ({ req: { user }, id }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      if (id) return isSelf({ req: { user: user as AnyUser }, id })
      // For collection-level list queries restrict to own record via where clause
      return {
        id: { equals: (user as NonNullable<AnyUser>).id },
      }
    },
    // A user may update their own account; admins may update any account
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      return isSelf({ req: { user: user as AnyUser }, id })
    },
    // Only admins may delete user accounts
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
      // Only admins may change the role field
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
