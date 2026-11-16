import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ApplyForm } from '@/components/ApplyForm'
import { ContactCard } from '@/components/ContactCard'
import { StickyApply } from '@/components/StickyApply'
import { ClockIcon, TAG_ICONS } from '@/components/icons'
import { getJobBySlug } from '@/lib/payload'
import { OG_IMAGE } from '@/lib/seo'
import { daysAgo, daysSince, typeLabel } from '@/lib/utils'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const job = await getJobBySlug(slug)
  return job
    ? {
        title: job.title,
        description: job.summary,
        alternates: { canonical: `/offres/${job.slug}` },
        openGraph: { type: 'website', locale: 'fr_FR', siteName: 'Global Comm Recrutement', title: job.title, description: job.summary, url: `/offres/${job.slug}`, images: [OG_IMAGE] },
        twitter: { card: 'summary_large_image', title: job.title, description: job.summary, images: [OG_IMAGE] },
      }
    : { title: 'Offre introuvable' }
}

const Bullets = ({ items }: { items?: { text: string }[] | null }) => (
  <ul className="blist">{(items ?? []).map((x, i) => <li key={i}>{x.text}</li>)}</ul>
)

export default async function JobPage({ params }: Props) {
  const { slug } = await params
  const job = await getJobBySlug(slug)
  if (!job) notFound()

  return (
    <div className="has-sticky">
      <div className="jhw">
        <div className="jh" />
        <div className="wrap">
          <Link className="crumb" href="/">← Toutes les offres</Link>
          <div className="co">
            <div className="logo-sq">GC</div>
            <div>
              <b>Global Communication Corporate</b>
              <span className="meta-l"><ClockIcon /> {daysAgo(daysSince(job.createdAt))} · <span className={`badge ${job.type}`}>{typeLabel(job.type)}</span></span>
            </div>
          </div>
          <h1>{job.title}</h1>
          <div className="tags">
            {(job.tags ?? []).map((t, i) => (
              <span className="tag" key={i}>{TAG_ICONS[t.icon] ?? TAG_ICONS.other}<span className="k">{t.label}</span><span className="v">{t.value}</span></span>
            ))}
          </div>
        </div>
      </div>
      <div className="wrap">
        <div className="jbody">
          <div className="jmain">
            <section className="sec"><h2>Présentation du poste</h2><p className="lead2">{job.summary}</p></section>
            <section className="sec"><h2>Vos missions</h2><Bullets items={job.missions} /></section>
            <section className="sec"><h2>Profil recherché</h2><Bullets items={job.profil} /></section>
            <section className="sec"><h2>Ce que nous offrons</h2><Bullets items={job.offre} /></section>
          </div>
          <ApplyForm title="Postuler à cette offre" job={{ slug: job.slug!, title: job.title }} />
        </div>
        <ContactCard />
      </div>
      <StickyApply />
    </div>
  )
}
