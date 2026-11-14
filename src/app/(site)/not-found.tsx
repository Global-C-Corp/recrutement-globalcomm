import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap pad">
      <div className="thanks">
        <h1>Page introuvable</h1>
        <p className="lead" style={{ margin: '0 auto 24px' }}>Cette offre n’existe pas ou n’est plus ouverte.</p>
        <Link className="btn blue" href="/">Voir les offres ouvertes</Link>
      </div>
    </div>
  )
}
