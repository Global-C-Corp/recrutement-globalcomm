'use client'

import Link from 'next/link'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap pad">
      <div className="thanks">
        <h1>Une erreur est survenue</h1>
        <p className="lead" style={{ margin: '0 auto 24px' }}>Veuillez réessayer dans un instant.</p>
        <p style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn blue" type="button" onClick={() => reset()}>Réessayer</button>
          <Link className="btn ghost" href="/">Retour aux offres</Link>
        </p>
      </div>
    </div>
  )
}
