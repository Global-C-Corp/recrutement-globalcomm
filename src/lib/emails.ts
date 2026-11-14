import type { Payload } from 'payload'

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

type Info = { id: number | string; fullName: string; email: string; phone: string; typeLabel: string; target: string; portfolioUrl?: string }

/** Never throws: an email failure must not lose an application. */
export async function sendApplicationEmails(payload: Payload, a: Info) {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  const adminLink = `${base}/admin/collections/applications/${a.id}`
  const hr = process.env.HR_NOTIFY_EMAIL

  if (hr) {
    try {
      await payload.sendEmail({
        to: hr,
        replyTo: a.email,
        subject: `Nouvelle candidature — ${a.fullName} (${a.target})`,
        html: `<p>Nouvelle candidature reçue.</p>
<ul>
<li><b>Nom :</b> ${esc(a.fullName)}</li>
<li><b>Email :</b> ${esc(a.email)}</li>
<li><b>Téléphone :</b> ${esc(a.phone)}</li>
<li><b>Type :</b> ${esc(a.typeLabel)}</li>
<li><b>Poste :</b> ${esc(a.target)}</li>
${a.portfolioUrl ? `<li><b>Portfolio / LinkedIn :</b> ${esc(a.portfolioUrl)}</li>` : ''}
</ul>
<p><a href="${esc(adminLink)}">Ouvrir la candidature dans l’administration</a></p>`,
      })
    } catch (err) {
      payload.logger.error({ err, msg: 'Échec de l’email de notification RH (candidature conservée)' })
    }
  }

  try {
    await payload.sendEmail({
      to: a.email,
      subject: 'Nous avons bien reçu votre candidature — Global Comm',
      html: `<p>Bonjour ${esc(a.fullName)},</p>
<p>Nous avons bien reçu votre candidature (${esc(a.target)}). Notre équipe RH va l’étudier.</p>
<p>Cordialement,<br>L’équipe RH — Global Communication Corporate</p>`,
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'Échec de l’email de confirmation candidat (candidature conservée)' })
  }
}
