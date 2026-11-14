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
