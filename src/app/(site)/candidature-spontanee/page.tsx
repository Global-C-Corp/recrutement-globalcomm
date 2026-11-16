import type { Metadata } from 'next'
import Link from 'next/link'
import { ApplyForm } from '@/components/ApplyForm'
import { ContactCard } from '@/components/ContactCard'
import { TAG_ICONS } from '@/components/icons'
import { getOpenJobs } from '@/lib/payload'
import { OG_IMAGE } from '@/lib/seo'

export const revalidate = 60
const SPONT_DESC = 'Envoyez-nous votre CV : nous vous recontactons si un poste correspond à votre profil.'
export const metadata: Metadata = {
  title: 'Candidature spontanée',
  description: SPONT_DESC,
  alternates: { canonical: '/candidature-spontanee' },
  openGraph: { type: 'website', locale: 'fr_FR', siteName: 'Global Comm Recrutement', title: 'Candidature spontanée', description: SPONT_DESC, url: '/candidature-spontanee', images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image', title: 'Candidature spontanée', description: SPONT_DESC, images: [OG_IMAGE] },
}

export default async function SpontaneousPage() {
  const jobs = await getOpenJobs()
  return (
    <>
      <div className="jhw">
        <div className="jh" />
        <div className="wrap">
          <Link className="crumb" href="/">← Retour aux offres</Link>
          <div className="co">
            <div className="logo-sq">GC</div>
            <div><b>Global Communication Corporate</b><span className="meta-l">Toujours ouverte</span></div>
          </div>
          <h1>Candidature spontanée</h1>
          <div className="tags">
            <span className="tag">{TAG_ICONS.other}<span className="k">Poste</span><span className="v">À définir ensemble</span></span>
          </div>
        </div>
      </div>
      <div className="wrap">
        <div className="jbody">
          <div className="jmain">
            <section className="sec">
              <h2>Écrivez-nous, même sans offre</h2>
              <p className="lead2">Les meilleurs profils nous écrivent parfois avant l’offre. Présentez-vous et joignez votre CV : nous vous recontactons si un poste correspond.</p>
            </section>
            <section className="sec">
              <h2>Ce qui se passe ensuite</h2>
              <ol className="proc">
                <li><b>1</b>Nous lisons votre dossier</li>
                <li><b>2</b>Nous le gardons en vue pour les postes à venir</li>
                <li><b>3</b>Premier échange si un poste correspond</li>
              </ol>
            </section>
          </div>
          <ApplyForm title="Votre candidature" job={null} openJobs={jobs.map((j) => ({ slug: j.slug!, title: j.title }))} />
        </div>
        <ContactCard />
      </div>
    </>
  )
}
