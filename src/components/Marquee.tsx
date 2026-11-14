import { BRAND_ICONS } from './icons'

const Logos = () => (
  <>
    {Array.from({ length: 8 }, (_, i) => (
      <span className="logo" key={i}>
        {BRAND_ICONS[i % BRAND_ICONS.length]}LOGO {String(i + 1).padStart(2, '0')}
      </span>
    ))}
  </>
)

/** Placeholder logo marquee: replace with real client logos when supplied. */
export function Marquee() {
  return (
    <div className="marq">
      <span className="marq-label">Ils nous font confiance</span>
      <div className="marq-view">
        <div className="marq-track" aria-hidden="true">
          <Logos />
          <Logos />
        </div>
      </div>
    </div>
  )
}
