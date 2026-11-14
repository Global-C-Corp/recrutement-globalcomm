import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: { default: 'Recrutement — Global Communication Corporate', template: '%s — Global Comm Recrutement' },
  description: 'Rejoignez Global Communication Corporate : découvrez nos offres d’emploi et de stage, ou envoyez-nous une candidature spontanée.',
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={GeistSans.variable}>
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link className="brand" href="/">Global Comm <span>Recrutement</span></Link>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
