'use client'

// Last-resort boundary (replaces the root layout): keep it self-contained, no site CSS available.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, textAlign: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>Une erreur est survenue</h1>
          <p style={{ color: '#666', margin: '0 0 24px' }}>Veuillez réessayer dans un instant.</p>
          <button type="button" onClick={() => reset()} style={{ height: 40, padding: '0 16px', border: 0, borderRadius: 6, background: '#0000ff', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
