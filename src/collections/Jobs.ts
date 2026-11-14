import type { CollectionConfig, FieldHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { isAuthenticated, openOrAuthenticated } from '../access'

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const autoSlug: FieldHook = ({ value, data, operation }) => {
  if (typeof value === 'string' && value.trim()) return slugify(value)
  if (operation === 'create' && data?.title) return slugify(String(data.title))
  return value
}

const textItem = (name: string, label: string) =>
  ({
    name,
    type: 'array' as const,
    label,
    labels: { singular: 'Ligne', plural: 'Lignes' },
    fields: [{ name: 'text', type: 'text' as const, label: 'Texte', required: true }],
  })

function revalidate(slug?: string) {
  try {
    revalidateTag('jobs', { expire: 0 })
    revalidatePath('/')
    revalidatePath('/candidature-spontanee')
    if (slug) revalidatePath(`/offres/${slug}`)
  } catch {
    // outside a Next request context (seed script): ignore
  }
}

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: { singular: 'Offre', plural: 'Offres' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'status', 'order'],
    group: 'Recrutement',
  },
  defaultSort: 'order',
  access: {
    read: openOrAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidate(doc.slug)
        if (previousDoc?.slug && previousDoc.slug !== doc.slug) revalidate(previousDoc.slug)
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidate(doc.slug)
        return doc
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', label: 'Intitulé du poste', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Adresse (slug)',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Générée automatiquement depuis l’intitulé.' },
      hooks: { beforeValidate: [autoSlug] },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      required: true,
      defaultValue: 'emploi',
      options: [
        { label: 'Emploi', value: 'emploi' },
        { label: 'Stage', value: 'stage' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Ouverte', value: 'open' },
        { label: 'Fermée', value: 'closed' },
      ],
      admin: { position: 'sidebar', description: 'Préférez « Fermée » à la suppression.' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordre d’affichage',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Les plus petits numéros apparaissent en premier.' },
    },
    { name: 'summary', type: 'textarea', label: 'Présentation du poste', required: true },
    {
      name: 'tags',
      type: 'array',
      label: 'Étiquettes (contrat, expérience, etc.)',
      labels: { singular: 'Étiquette', plural: 'Étiquettes' },
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Icône',
          required: true,
          defaultValue: 'other',
          options: [
            { label: 'Contrat', value: 'contract' },
            { label: 'Lieu / mode de travail', value: 'mode' },
            { label: 'Expérience', value: 'experience' },
            { label: 'Langues', value: 'languages' },
            { label: 'Niveau d’étude', value: 'education' },
            { label: 'Autre', value: 'other' },
          ],
        },
        { name: 'label', type: 'text', label: 'Libellé (ex. Type de contrat)', required: true },
        { name: 'value', type: 'text', label: 'Valeur (ex. CDI)', required: true },
      ],
    },
    textItem('missions', 'Vos missions'),
    textItem('profil', 'Profil recherché'),
    textItem('offre', 'Ce que nous offrons'),
  ],
}
