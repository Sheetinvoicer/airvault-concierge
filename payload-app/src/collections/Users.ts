import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

// Helper: is the requesting user an admin?
export const isAdmin = ({ req: { user } }: { req: { user: User | null } }): boolean =>
  (user as User | null)?.role === 'admin'

// Helper: is the requesting user accessing their own document?
const isSelf = ({ req: { user }, id }: { req: { user: User | null }; id?: number | string }) =>
  Boolean(user && String(user.id) === String(id))

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
      if ((user as User).role === 'admin') return true
      if (id) return isSelf({ req: { user }, id })
      // For collection-level list queries restrict to own record via where clause
      return {
        id: { equals: user.id },
      }
    },
    // A user may update their own account; admins may update any account
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if ((user as User).role === 'admin') return true
      return isSelf({ req: { user }, id })
    },
    // Only admins may delete user accounts
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
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
        create: ({ req: { user } }) => (user as User | null)?.role === 'admin',
        update: ({ req: { user } }) => (user as User | null)?.role === 'admin',
      },
      admin: {
        description: 'Controls admin panel access and data permissions.',
      },
    },
  ],
}
