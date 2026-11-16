import Image from 'next/image'
import Link from 'next/link'
import { Marquee } from '@/components/Marquee'
import { AccordionGallery } from '@/components/AccordionGallery'
import { VariableProximity } from '@/components/VariableProximity'
import { Ember } from '@/components/Ember'
import { getOpenJobs } from '@/lib/payload'
import { typeLabel } from '@/lib/utils'

export const revalidate = 60

export default async function HomePage() {
  const jobs = await getOpenJobs()
  return (
    <>
      <section className="hero">
        <div className="wrap main">
          <div className="hero-left">
            <div>
              <span className="eyebrow">Global Communication Corporate</span>
              <h1>Rejoignez Global Comm</h1>
              <p className="lead">Nous accompagnons les marques de grande consommation au Maroc. Découvrez nos offres, ou envoyez-nous votre candidature.</p>
              <a className="btn" href="#jobs">Voir les offres</a>
            </div>
          </div>
          <div className="hero-visual">
            <Image src="/images/hero.avif" alt="Deux jeunes professionnels souriants, bras croisés" fill priority sizes="(max-width: 720px) 100vw, 480px" />
          </div>
        </div>
        <Marquee />
      </section>

      <div className="wrap">
        <section className="sec" id="jobs">
          <div className="sec-head">
            <span className="kicker">Offres ouvertes</span>
            <h2>Des postes qui se voient en rayon</h2>
            <p>Chez Global Comm, chaque rôle touche de vraies campagnes pour de vraies marques. Dès la première semaine, vous travaillez sur des briefs réels, avec une équipe qui vous fait confiance. Voici ce que nous recherchons aujourd’hui.</p>
          </div>
          <div className="grid3">
            {jobs.length === 0 ? (
              <p className="empty">Aucune offre ouverte pour le moment. Vous pouvez tout de même nous envoyer une candidature spontanée.</p>
            ) : (
              jobs.map((j) => (
                <Link className="jcard" href={`/offres/${j.slug}`} key={j.id}>
                  <div><span className={`badge ${j.type}`}>{typeLabel(j.type)}</span></div>
                  <h3>{j.title}</h3>
                  <p>{j.summary}</p>
                  <span className="go">Postuler →</span>
                </Link>
              ))
            )}
          </div>
          <div className="card spont dark">
            <div>
              <h3>Votre poste n’est pas dans la liste ?</h3>
              <p>Les meilleurs profils nous écrivent parfois avant l’offre. Envoyez-nous votre CV.</p>
            </div>
            <Link className="btn ghost" href="/candidature-spontanee">Candidature spontanée</Link>
          </div>
        </section>

        <section className="sec sec-end">
          <div className="sec-head">
            <span className="kicker">Notre processus</span>
            <h2>Comment ça se passe</h2>
            <p>Un processus court, clair et humain. Pas de tests interminables, pas de silence radio : à chaque étape, vous savez où en est votre dossier et qui est votre interlocuteur. Quatre étapes, du premier clic à la réponse.</p>
          </div>
          <AccordionGallery />
        </section>
      </div>

      <section className="pos" id="pos">
        <Ember />
        <div className="pos-ov" />
        <div className="pos-in">
          <span className="kick">Qui sommes-nous</span>
          <VariableProximity className="pos-t" label="Nous faisons vendre les marques de grande consommation." />
          <p className="pos-p">Global Comm est une agence de communication intégrée, spécialiste du FMCG au Maroc. Stratégie, création et production sous le même toit, avec l’exigence et la transparence comme règles.</p>
        </div>
        <div className="pos-foot">
          <span>© {new Date().getFullYear()} Global Communication Corporate</span>
          <a href="https://globalcomm.ma">globalcomm.ma</a>
        </div>
      </section>
    </>
  )
}
