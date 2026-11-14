import { Ember } from './Ember'
import { MailIcon, PhoneIcon } from './icons'

export function ContactCard() {
  return (
    <section className="contact" id="contact">
      <Ember />
      <div className="pos-ov" style={{ background: 'radial-gradient(ellipse at 50% 50%,rgba(0,0,28,.92),rgba(0,0,28,.55) 55%,rgba(0,0,28,0) 85%)' }} />
      <div className="c-in">
        <div className="logo-ph">Logo</div>
        <h3>Une question sur le poste ?</h3>
        <p>Notre équipe RH vous répond avec plaisir.</p>
        <div className="lines">
          <a href="mailto:rh@globalcomm.ma"><MailIcon />rh@globalcomm.ma</a>
          <a href="tel:+212668490907"><PhoneIcon />(+212) 668 49 09 07</a>
        </div>
      </div>
    </section>
  )
}
