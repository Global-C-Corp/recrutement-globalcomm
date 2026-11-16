import Image from 'next/image'
import { getClientLogos, type ClientLogo } from '@/lib/payload'

const Logo = ({ l }: { l: ClientLogo }) => {
  const img = <Image src={l.src} alt={l.name} width={l.width} height={30} unoptimized={l.isSvg} className="logo-img" />
  return l.url ? (
    <a className="logo" href={l.url} target="_blank" rel="noopener noreferrer">{img}</a>
  ) : (
    <span className="logo">{img}</span>
  )
}

/** Hero marquee fed by the "Logos clients" global. Renders nothing when there are no logos. */
export async function Marquee() {
  const logos = await getClientLogos()
  if (logos.length === 0) return null
  // enough items per set that the track is always wider than the viewport (no visible gap)
  const reps = Math.max(1, Math.ceil(16 / logos.length))
  const set = (copy: string) =>
    Array.from({ length: reps }, (_, r) => logos.map((l) => <Logo key={`${copy}-${r}-${l.id}`} l={l} />))
  return (
    <div className="marq-wrap">
      <div className="wrap">
        <div className="marq">
          <span className="marq-label">Ils nous font confiance</span>
          <div className="marq-view">
            <div className="marq-track">
              {set('a')}
              <span style={{ display: 'contents' }} aria-hidden="true">{set('b')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
