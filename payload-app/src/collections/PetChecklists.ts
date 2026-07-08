import type { CollectionConfig } from 'payload'

// Minimal shape used for access-control checks (avoids depending on generated payload-types)
type AnyUser = { id: string | number; role?: string } | null

// Ownership check: scopes list queries to the requesting user's checklists
const ownedByUser = (user: NonNullable<AnyUser>) => ({ owner: { equals: user.id } })

export const PetChecklists: CollectionConfig = {
  slug: 'pet-checklists',
  admin: {
    useAsTitle: 'petName',
    description: 'Generated IATA/APHIS pet travel compliance checklists.',
  },
  access: {
    // Must be logged in to generate a checklist
    create: ({ req: { user } }) => Boolean(user),
    // Admins see all; users see only their own
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      return ownedByUser(user as NonNullable<AnyUser>)
    },
    // Owner or admin may update
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as AnyUser)?.role === 'admin') return true
      return ownedByUser(user as NonNullable<AnyUser>)
    },
    // Only admins may delete
    delete: ({ req: { user } }) => (user as AnyUser)?.role === 'admin',
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
      // Relationship to Users — replaces the old plain-text owner field
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The user who generated this checklist.',
      },
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
