import type { CollectionConfig } from 'payload'
import { isAuthenticated } from '../access'

/** Private: CVs and portfolios. Only authenticated HR users can read; no public create. */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Fichier', plural: 'Fichiers (CV, portfolios)' },
  admin: { group: 'Candidatures' },
  access: {
    read: isAuthenticated,
    create: isAuthenticated, // server route uses the Local API (overrideAccess)
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  upload: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    // never expose files through the static URL: always go through Payload access control
    disableLocalStorage: false,
  },
  fields: [],
}
