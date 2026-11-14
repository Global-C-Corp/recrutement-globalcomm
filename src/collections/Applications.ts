import type { CollectionConfig } from 'payload'
import { isAuthenticated } from '../access'

export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: { singular: 'Candidature', plural: 'Candidatures' },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'type', 'job', 'status', 'createdAt'],
    listSearchableFields: ['fullName', 'email'],
    group: 'Candidatures',
  },
  defaultSort: '-createdAt',
  // No public create/read: submissions go only through POST /api/apply (Local API).
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    { name: 'fullName', type: 'text', label: 'Nom complet', required: true },
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'phone', type: 'text', label: 'Téléphone', required: true },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      required: true,
      options: [
        { label: 'Emploi', value: 'emploi' },
        { label: 'Stage', value: 'stage' },
        { label: 'Spontanée', value: 'spontanee' },
      ],
    },
    {
      name: 'job',
      type: 'relationship',
      relationTo: 'jobs',
      label: 'Offre',
      required: false,
      admin: { description: 'Vide pour une candidature spontanée.' },
    },
    { name: 'targetRole', type: 'text', label: 'Poste visé (spontanée)' },
    { name: 'cv', type: 'upload', relationTo: 'media', label: 'CV', required: true },
    { name: 'portfolioUrl', type: 'text', label: 'Portfolio / LinkedIn (lien)' },
    { name: 'portfolioFile', type: 'upload', relationTo: 'media', label: 'Portfolio (PDF)' },
    { name: 'consent', type: 'checkbox', label: 'Consentement (loi 09-08)', required: true },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'Nouvelle', value: 'new' },
        { label: 'En étude', value: 'reviewing' },
        { label: 'Entretien', value: 'interview' },
        { label: 'Acceptée', value: 'accepted' },
        { label: 'Refusée', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'notes', type: 'textarea', label: 'Notes internes', admin: { position: 'sidebar' } },
  ],
}
