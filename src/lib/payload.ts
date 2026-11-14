import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import type { Job } from '@/payload-types'

export const getPayloadClient = () => getPayload({ config })

/** Open offers, sorted by manual order. Tagged "jobs" so admin changes revalidate within seconds. */
export const getOpenJobs = unstable_cache(
  async (): Promise<Job[]> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'jobs',
      where: { status: { equals: 'open' } },
      sort: ['order', '-createdAt'],
      limit: 100,
      depth: 0,
      overrideAccess: false,
    })
    return res.docs
  },
  ['open-jobs'],
  { tags: ['jobs'], revalidate: 60 },
)

export const getJobBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<Job | null> => {
      const payload = await getPayloadClient()
      const res = await payload.find({
        collection: 'jobs',
        where: { and: [{ slug: { equals: slug } }, { status: { equals: 'open' } }] },
        limit: 1,
        depth: 0,
        overrideAccess: false,
      })
      return res.docs[0] ?? null
    },
    ['job', slug],
    { tags: ['jobs'], revalidate: 60 },
  )()

export type ClientLogo = { id: string; name: string; url: string | null; src: string; width: number; isSvg: boolean }

/** Client logos for the hero marquee, in admin order. Tagged so saves revalidate within seconds. */
export const getClientLogos = unstable_cache(
  async (): Promise<ClientLogo[]> => {
    const payload = await getPayloadClient()
    const g = await payload.findGlobal({ slug: 'client-logos', depth: 1 })
    const out: ClientLogo[] = []
    for (const row of g.logos ?? []) {
      const img = row.image
      if (!img || typeof img !== 'object' || !img.url) continue
      const isSvg = img.mimeType === 'image/svg+xml'
      const w = img.width && img.height ? Math.round((img.width / img.height) * 24) : 96
      out.push({ id: row.id ?? String(out.length), name: row.name, url: row.url ?? null, src: img.url, width: Math.max(24, Math.min(w, 240)), isSvg })
    }
    return out
  },
  ['client-logos'],
  { tags: ['client-logos'], revalidate: 60 },
)
