import type { GlobalConfig } from 'payload'
import { isAuthenticated } from '../access'
import { revalidateHome } from '../lib/revalidate-home'

export const ClientLogos: GlobalConfig = {
  slug: 'client-logos',
  label: 'Logos clients',
  admin: { group: 'Site' },
  access: { read: () => true, update: isAuthenticated },
  hooks: { afterChange: [({ doc }) => { revalidateHome(); return doc }] },
  fields: [
    {
      name: 'logos',
      type: 'array',
      label: 'Logos',
      minRows: 0,
      maxRows: 24,
      labels: { singular: 'Logo', plural: 'Logos' },
      admin: {
        description:
          'Ajoutez les logos des clients affichés dans l\'en-tête de la page d\'accueil. Format conseillé : SVG ou PNG avec fond transparent, logo horizontal.',
        initCollapsed: false,
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'logo-media', label: 'Image (SVG, PNG ou WebP, 500 Ko max)', required: true },
        { name: 'name', type: 'text', label: 'Nom du client', required: true },
        { name: 'url', type: 'text', label: 'Lien (facultatif)', admin: { description: 'Si renseigné, le logo ouvre ce lien dans un nouvel onglet.' },
          validate: (v: string | null | undefined) => !v || /^https?:\/\/\S+$/i.test(v) || 'Indiquez une adresse complète commençant par https://' },
      ],
    },
  ],
}
