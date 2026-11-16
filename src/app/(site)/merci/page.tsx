import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Merci', robots: { index: false, follow: false } }

export default function ThanksPage() {
  return (
    <div className="wrap pad">
      <div className="thanks">
        <div className="tick" aria-hidden="true">✓</div>
        <h1>Merci pour votre candidature</h1>
        <p className="lead" style={{ margin: '0 auto 24px' }}>Nous l’avons bien reçue. Notre équipe RH l’étudie et vous répond dès que possible.</p>
        <p className="meta">Un email de confirmation vient de vous être envoyé.</p>
        <p style={{ marginTop: 24 }}><Link className="btn ghost" href="/">Retour aux offres</Link></p>
      </div>
    </div>
  )
}
