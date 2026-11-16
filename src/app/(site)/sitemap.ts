import type { MetadataRoute } from 'next'
import { getOpenJobs } from '@/lib/payload'

export const revalidate = 60

const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getOpenJobs().catch(() => [])
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/candidature-spontanee`, changeFrequency: 'monthly', priority: 0.5 },
    ...jobs.map((j) => ({
      url: `${base}/offres/${j.slug}`,
      lastModified: new Date(j.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
