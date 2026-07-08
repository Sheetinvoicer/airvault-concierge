import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

// Ownership check: scopes list queries to the requesting user's checklists
const ownedByUser = (user: User) => ({ owner: { equals: user.id } })

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
      if ((user as User).role === 'admin') return true
      return ownedByUser(user as User)
    },
    // Owner or admin may update
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as User).role === 'admin') return true
      return ownedByUser(user as User)
    },
    // Only admins may delete
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
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
