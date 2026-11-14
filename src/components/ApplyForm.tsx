'use client'

import { useRef, useState, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'

type OpenJob = { slug: string; title: string }
type Props = {
  title: string
  /** Offer being applied to; null = spontaneous application */
  job: OpenJob | null
  openJobs?: OpenJob[]
}

const MB = 1048576
const fmt = (n: number) => (n > MB ? (n / MB).toFixed(1) + ' Mo' : Math.round(n / 1024) + ' Ko')

function FileDrop({
  id, file, onFile, max, exts, idle, error, onError, compact,
}: {
  id: string; file: File | null; onFile: (f: File | null) => void; max: number; exts: string[]
  idle: React.ReactNode; error?: boolean; onError?: (m: string) => void; compact?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const take = (f: File | null) => {
    if (f) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
      if (!exts.includes(ext)) return onError?.(`Format non accepté (${exts.map((e) => e.toUpperCase()).join(', ')}).`)
      if (f.size > max) return onError?.(`Fichier trop volumineux (${max / MB} Mo max).`)
    }
    onFile(f)
  }
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0] ?? null) }
  return (
    <>
      <div
        className={`drop${file ? ' has' : ''}${over ? ' over' : ''}`}
        id={id}
        tabIndex={0}
        role="button"
        style={compact ? { padding: 12 } : undefined}
        onClick={() => { if (!file) input.current?.click() }}
        onKeyDown={(e) => { if (e.key === 'Enter' && !file) input.current?.click() }}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        {file ? (
          <>
            <span>📄 {file.name} · {fmt(file.size)}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); if (input.current) input.current.value = ''; take(null) }}>Retirer</button>
          </>
        ) : idle}
      </div>
      <input ref={input} type="file" hidden accept={exts.map((e) => '.' + e).join(',')} onChange={(e) => take(e.target.files?.[0] ?? null)} />
    </>
  )
}

export function ApplyForm({ title, job, openJobs = [] }: Props) {
  const router = useRouter()
  const [v, setV] = useState({ nom: '', email: '', tel: '', portfolio: '', consent: false, poste: '' })
  const [cv, setCv] = useState<File | null>(null)
  const [pf, setPf] = useState<File | null>(null)
  const [bad, setBad] = useState<Record<string, boolean>>({})
  const [cvMsg, setCvMsg] = useState('Ajoutez votre CV.')
  const [sending, setSending] = useState(false)
  const [formErr, setFormErr] = useState('')
  const honey = useRef<HTMLInputElement>(null)

  const done = [v.nom.trim(), v.email.trim(), v.tel.trim(), cv, v.portfolio.trim() || pf, v.consent].filter(Boolean).length
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormErr('')
    const errs = {
      nom: v.nom.trim().length < 2,
      email: !/^\S+@\S+\.\S+$/.test(v.email.trim()),
      tel: v.tel.replace(/\D/g, '').length < 9,
      cv: !cv,
      consent: !v.consent,
    }
    if (!cv) setCvMsg('Ajoutez votre CV.')
    setBad(errs)
    if (Object.values(errs).some(Boolean)) {
      setTimeout(() => document.querySelector('.field.bad')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
      return
    }
    setSending(true)
    const fd = new FormData()
    fd.set('fullName', v.nom.trim())
    fd.set('email', v.email.trim())
    fd.set('phone', v.tel.trim())
    fd.set('portfolioUrl', v.portfolio.trim())
    fd.set('consent', 'on')
    fd.set('website', honey.current?.value ?? '')
    if (job) fd.set('job', job.slug)
    else fd.set('target', v.poste || 'open')
    if (cv) fd.set('cv', cv)
    if (pf) fd.set('portfolioFile', pf)
    try {
      const res = await fetch('/api/apply', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSending(false)
        if (data?.fields) setBad(Object.fromEntries(Object.keys(data.fields).map((k) => [k, true])))
        setFormErr(data?.error || 'Une erreur est survenue. Veuillez réessayer.')
        return
      }
      router.push('/merci')
    } catch {
      setSending(false)
      setFormErr('Connexion impossible. Veuillez réessayer.')
    }
  }

  const cls = (k: string) => `field${bad[k] ? ' bad' : ''}`

  return (
    <aside className="card fcard" id="apply">
      <div className="prog"><i style={{ width: `${(done / 6) * 100}%` }} /></div>
      <h3>{title}</h3>
      <p className="sub">Deux minutes, sans création de compte.</p>
      <div className="prog-l"><span>Votre dossier</span><b aria-live="polite">{done} / 6</b></div>
      <form noValidate onSubmit={submit}>
        {job ? null : (
          <div className="field">
            <label>Poste visé
              <select name="poste" value={v.poste} onChange={set('poste')}>
                <option value="">Candidature ouverte</option>
                {openJobs.map((j) => <option key={j.slug} value={j.slug}>{j.title}</option>)}
              </select>
            </label>
          </div>
        )}
        <div className={(bad.nom || bad.fullName ? 'field bad' : 'field')}>
          <label>Nom complet<input type="text" name="nom" autoComplete="name" value={v.nom} onChange={set('nom')} /></label>
          <div className="err">Indiquez votre nom complet.</div>
        </div>
        <div className="row">
          <div className={cls('email')}>
            <label>Email<input type="email" name="email" autoComplete="email" value={v.email} onChange={set('email')} /></label>
            <div className="err">Indiquez un email valide.</div>
          </div>
          <div className={cls('tel')}>
            <label>Téléphone<input type="tel" name="tel" autoComplete="tel" placeholder="06 00 00 00 00" value={v.tel} onChange={set('tel')} /></label>
            <div className="err">Indiquez un numéro valide.</div>
          </div>
        </div>
        <div className={cls('cv')}>
          <label>CV <span className="opt">(PDF, DOC ou DOCX — 5 Mo max)</span></label>
          <FileDrop
            id="dropCv" file={cv} max={5 * MB} exts={['pdf', 'doc', 'docx']}
            onFile={(f) => { setCv(f); setBad((b) => ({ ...b, cv: false })) }}
            onError={(m) => { setCvMsg(m); setBad((b) => ({ ...b, cv: true })) }}
            idle={<>Glissez votre CV ici ou <u>parcourez vos fichiers</u></>}
          />
          <div className="err">{cvMsg}</div>
        </div>
        <div className="field">
          <label>Portfolio / LinkedIn <span className="opt">(facultatif)</span>
            <input type="url" name="portfolio" placeholder="Lien : https://…" value={v.portfolio} onChange={set('portfolio')} />
          </label>
          <FileDrop id="dropPf" file={pf} onFile={setPf} max={10 * MB} exts={['pdf']} compact idle="ou ajoutez un fichier PDF (10 Mo max)" />
        </div>
        <div className={cls('consent')}>
          <label className="check">
            <input type="checkbox" name="consent" checked={v.consent} onChange={set('consent')} />
            <span>J’accepte que Global Comm conserve mes données pour traiter ma candidature (loi 09-08).</span>
          </label>
          <div className="err">Votre accord est nécessaire pour envoyer la candidature.</div>
        </div>
        <div className="hp" aria-hidden="true">
          <label>Ne pas remplir<input ref={honey} type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
        </div>
        {formErr ? <p className="form-err" role="alert">{formErr}</p> : null}
        <div><button className="btn blue" type="submit" disabled={sending}>{sending ? 'Envoi…' : 'Envoyer ma candidature'}</button></div>
      </form>
      <p className="trust">Vos données servent uniquement à traiter votre candidature.</p>
    </aside>
  )
}
