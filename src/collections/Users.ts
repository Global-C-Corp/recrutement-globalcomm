import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Administrateur RH', plural: 'Administrateurs RH' },
  auth: { tokenExpiration: 60 * 60 * 12 },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'createdAt'] },
  access: {
    // First admin is created via the "create first user" screen (Payload allows it only when empty).
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [],
}
