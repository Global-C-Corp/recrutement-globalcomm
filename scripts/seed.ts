// DEV ONLY: creates the 3 sample offers from the design demo.
// Refuses to run unless ALLOW_SEED=true (set only in your local .env, which points to the Neon dev branch).
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

if (process.env.ALLOW_SEED !== 'true' || process.env.NODE_ENV === 'production') {
  console.error('Seed refusé : définissez ALLOW_SEED=true dans votre .env local (branche Neon de dev uniquement).')
  process.exit(1)
}

const t = (arr: string[]) => arr.map((text) => ({ text }))
const tag = (icon: string, label: string, value: string) => ({ icon, label, value })

const JOBS = [
  { title: 'Chef(fe) de projet communication', slug: 'chef-de-projet-communication', type: 'emploi', order: 1,
    summary: 'Pilotez les campagnes de nos clients FMCG, de la stratégie à la production.',
    tags: [tag('contract', 'Type de contrat', 'CDI'), tag('mode', 'Lieu de travail', 'Sur site'), tag('experience', 'Expérience', '2 - 5 ans'), tag('languages', 'Langues', 'Français'), tag('education', 'Niveau d’étude', 'BAC +3 et plus')],
    missions: t(['Piloter les campagnes de bout en bout', 'Coordonner créa, production et clients', 'Suivre budgets et délais']),
    profil: t(['Bac+3 minimum, 2 ans d’expérience en agence', 'Excellente expression en français', 'Rigueur et sens du relationnel']),
    offre: t(['CDI, poste à Nador', 'Marques FMCG nationales', 'Équipe jeune et exigeante']) },
  { title: 'Stage — Community manager', slug: 'stage-community-manager', type: 'stage', order: 2,
    summary: 'Animez les réseaux sociaux de nos marques et apprenez le métier en agence.',
    tags: [tag('contract', 'Type de contrat', 'Stage (3 à 6 mois)'), tag('mode', 'Lieu de travail', 'Sur site'), tag('experience', 'Expérience', 'Débutant accepté'), tag('languages', 'Langues', 'Français'), tag('education', 'Niveau d’étude', 'BAC +2 et plus')],
    missions: t(['Créer et programmer des contenus', 'Suivre les statistiques', 'Assister l’équipe lors des tournages']),
    profil: t(['Étudiant(e) en communication ou marketing', 'Créatif(ve) et organisé(e)', 'Maîtrise des réseaux sociaux']),
    offre: t(['Stage de 3 à 6 mois', 'Encadrement par un senior', 'Possibilité d’embauche']) },
  { title: 'Designer graphique', slug: 'designer-graphique', type: 'emploi', order: 3,
    summary: 'Concevez des identités et supports pour des marques de grande consommation.',
    tags: [tag('contract', 'Type de contrat', 'CDI ou CDD'), tag('mode', 'Lieu de travail', 'Sur site'), tag('experience', 'Expérience', '1 - 3 ans'), tag('languages', 'Langues', 'Français'), tag('education', 'Niveau d’étude', 'BAC +2 et plus')],
    missions: t(['Concevoir des visuels et packagings', 'Décliner les chartes graphiques', 'Préparer les fichiers pour l’impression']),
    profil: t(['Portfolio solide', 'Maîtrise de la suite Adobe ou Figma', 'Sens du détail']),
    offre: t(['CDI ou CDD', 'Projets variés', 'Matériel professionnel']) },
] as const

const payload = await getPayload({ config })
for (const j of JOBS) {
  const existing = await payload.find({ collection: 'jobs', where: { slug: { equals: j.slug } }, limit: 1 })
  if (existing.docs[0]) { console.log('déjà présent :', j.slug); continue }
  await payload.create({ collection: 'jobs', data: { ...j, status: 'open', tags: [...j.tags], missions: [...j.missions], profil: [...j.profil], offre: [...j.offre] } as never })
  console.log('créé :', j.slug)
}
// PLACEHOLDER client logos (generated SVG wordmarks): dev only, replace with real logos in /admin.
const gl = await payload.findGlobal({ slug: 'client-logos', depth: 0 })
if ((gl.logos ?? []).length === 0) {
  const rows: { image: number; name: string }[] = []
  for (let i = 1; i <= 6; i++) {
    const name = `Client ${String(i).padStart(2, '0')}`
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="32" viewBox="0 0 140 32"><rect x="0" y="6" width="20" height="20" rx="4" fill="#fff"/><text x="28" y="23" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#fff">${name}</text></svg>`
    const buf = Buffer.from(svg)
    const doc = await payload.create({ collection: 'logo-media', data: {}, file: { data: buf, mimetype: 'image/svg+xml', name: `placeholder-client-${i}.svg`, size: buf.length } })
    rows.push({ image: doc.id, name })
  }
  await payload.updateGlobal({ slug: 'client-logos', data: { logos: rows } })
  console.log('logos de remplacement créés (placeholders)')
}
process.exit(0)
