import { APIError, type CollectionConfig } from 'payload'
import { isAuthenticated } from '../access'
import { revalidateHome } from '../lib/revalidate-home'

const MAX_BYTES = 500 * 1024
const ALLOWED = ['image/svg+xml', 'image/png', 'image/webp']

/** Public client logos. Kept SEPARATE from the private `media` collection (CVs). */
export const LogoMedia: CollectionConfig = {
  slug: 'logo-media',
  labels: { singular: 'Logo (fichier)', plural: 'Logos (fichiers)' },
  admin: { group: 'Site', description: 'Fichiers des logos clients. Public.' },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  upload: {
    mimeTypes: ALLOWED,
    // one 2x version, 64px high (PNG/WebP only; SVG is never resized)
    imageSizes: [{ name: 'retina', height: 64, width: undefined, withoutEnlargement: true }],
    adminThumbnail: ({ doc }) => (doc as { url?: string }).url ?? null,
  },
  hooks: {
    // beforeOperation runs before Payload's own (English) upload validation, so HR gets French messages
    beforeOperation: [
      async ({ req, operation }) => {
        if (operation !== 'create' && operation !== 'update') return
        const file = req.file
        if (file) {
          if (!ALLOWED.includes(file.mimetype)) {
            throw new APIError('Format non accepté. Utilisez un fichier SVG, PNG ou WebP.', 400, undefined, true)
          }
          if (file.size > MAX_BYTES) {
            throw new APIError('Fichier trop volumineux (500 Ko maximum).', 400, undefined, true)
          }
          if (file.mimetype === 'image/svg+xml') {
            const text = file.data.toString('utf8')
            if (/<script|\son[a-z]+\s*=|javascript:|<foreignObject/i.test(text)) {
              throw new APIError('Ce fichier SVG contient du code non autorisé.', 400, undefined, true)
            }
          }
        }
      },
    ],
    afterChange: [({ doc }) => { revalidateHome(); return doc }],
    afterDelete: [({ doc }) => { revalidateHome(); return doc }],
  },
  fields: [],
}
